"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  name: string;
  clientId: string;
  avatar: string;
  email?: string;
  clinicId?: string;
  clinicName?: string;
  userCode?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUp: (email: string, password: string, name: string, nin?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUser: User = {
  name: "Mrs. Martin",
  clientId: "78910",
  email: "mrs.martin@example.com",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA_XeqSFDM6_sDXQjWs1Xms4SwAJ-LsKlcwXSQ-Hv4Yx62DFIP3mZ-aCOuHgtUmbLzs6dqNrZ76pwBEZiafV1eLsLi9nI5HkRtxmndMWkOLMufCGCVYuZos8QMzEdKeJ-QmQDLJmbTrGEIuGDiQTE20M74DLNW9vs4CpUKSLohSTc5CTQgAAdsp43ceP7AgdIsOJmWNFH3fFAo43XikT6ghS9lV8GgYw5-LCtkUXEpun66PXfEAVOJ979E0qsWv3Etwm0Xoae1e3jM",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Consolidate initialization to prioritize Supabase session but fallback to localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Try to get session from Supabase (most reliable source of truth)
        const { data: { session } } = await supabase.auth.getSession();
        
          if (session?.user) {
            // Fetch clinic details from public.users
            const { data: userData } = await supabase
              .from('users')
              .select('clinic_id, clinic_name, user_code, first_name, last_name')
              .eq('id', session.user.id)
              .single();

            let currentUserCode = userData?.user_code;

            // Backfill user_code if missing
            if (!currentUserCode) {
                console.log("Generating missing user_code for existing user...");
                const generateUserCode = () => {
                    const randomPart1 = Math.floor(100 + Math.random() * 900);
                    const randomPart2 = Math.floor(100 + Math.random() * 900);
                    return `OWN-${randomPart1}-${randomPart2}`;
                };
                const newCode = generateUserCode();
                
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ user_code: newCode })
                    .eq('id', session.user.id);
                
                if (!updateError) {
                    currentUserCode = newCode;
                } else {
                    console.error("Failed to backfill user_code", updateError);
                }
            }
  
            console.log("Supabase session found:", session.user.email);
            const fullName = userData 
                ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() 
                : session.user.user_metadata.full_name;

            const userInfo = {
              name: fullName || session.user.email || "",
              clientId: session.user.id,
              email: session.user.email, // Ensure this field is set!
              avatar: session.user.user_metadata.avatar_url || "",
              clinicId: userData?.clinic_id || undefined,
              clinicName: userData?.clinic_name || undefined,
              userCode: currentUserCode || undefined,
            };
            setUser(userInfo);
            setIsAuthenticated(true);
            // Sync to local storage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("user", JSON.stringify(userInfo));
            return;
          }
  
        // 2. Fallback to local storage if no active session (offline or persistent state)
        // Note: This might be stale, but better than nothing while loading.
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedUser = localStorage.getItem("user");
  
        if (storedAuth === "true" && storedUser) {
          console.log("Loading from localStorage fallback");
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
         console.log("Auth state changed: SIGNED_IN");
          // Fetch clinic details from public.users
          const { data: userData } = await supabase
            .from('users')
            .select('clinic_id, clinic_name, user_code')
            .eq('id', session.user.id)
            .single();

         let currentUserCode = userData?.user_code;

         if (!currentUserCode) {
             const generateUserCode = () => {
                 const randomPart1 = Math.floor(100 + Math.random() * 900);
                 const randomPart2 = Math.floor(100 + Math.random() * 900);
                 return `OWN-${randomPart1}-${randomPart2}`;
             };
             const newCode = generateUserCode();
             const { error: updateError } = await supabase
                 .from('users')
                 .update({ user_code: newCode })
                 .eq('id', session.user.id);
             
             if (!updateError) {
                 currentUserCode = newCode;
             }
         }

         const userInfo = {
          name: session.user.user_metadata.full_name || session.user.email || "",
          clientId: session.user.id,
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url || "",
          clinicId: userData?.clinic_id || undefined,
          clinicName: userData?.clinic_name || undefined,
          userCode: currentUserCode || undefined,
        };
        setUser(userInfo);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userInfo));
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Login error:', error.message);
        if (error.message.includes("Email not confirmed")) {
           console.warn("Please verify your email address.");
        }
        return false;
      }
      if (data?.user) {
        // Fetch detailed profile from public.users
        const { data: userProfile } = await supabase
            .from('users')
            .select('first_name, last_name, user_code, clinic_id, clinic_name')
            .eq('id', data.user.id)
            .single();

        const fullName = userProfile 
            ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
            : (data.user.user_metadata.full_name || data.user.email);
            
        const userInfo = {
          name: fullName || data.user.email || "",
          clientId: data.user.id,
          email: data.user.email,
          avatar: data.user.user_metadata.avatar_url || "",
          clinicId: userProfile?.clinic_id || undefined,
          clinicName: userProfile?.clinic_name || undefined,
          userCode: userProfile?.user_code || undefined,
        };
        setIsAuthenticated(true);
        setUser(userInfo);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userInfo));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Unexpected login error:', err);
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  const signUp = async (email: string, password: string, name: string, nin?: string): Promise<boolean> => {
    try {
      // 1. Validate NIN is provided and is 15 digits
      if (!nin || nin.trim().length !== 15) {
        console.error('Sign up error: NIN is required and must be 15 digits');
        return false;
      }

      // 2. Check if email already exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('Sign up error: Email already used');
        return false;
      }

      // 3. Check if NIN already exists in users table (ensure uniqueness)
      const { data: existingUserWithNIN } = await supabase
        .from('client')
        .select('nin')
        .eq('nin', nin.trim())
        .single();

      // 4. Check if NIN exists in client table
      let existingClient = null;
      if (existingUserWithNIN) {
        console.log('🔍 Checking for existing client with NIN:', nin);
        const { data: clientData, error: clientError } = await supabase
          .from('client')
          .select('*')
          .eq('nin', nin.trim())
          .single();

        if (!clientError && clientData) {
          existingClient = clientData;
          console.log('✅ Found existing client with matching NIN');
        }
      }

      // 5. Split full name into first and last name
      // If client exists, prefer their name from the client table
      let firstName, lastName;
      
      if (existingClient && existingClient.full_name) {
        // Use the name from the existing client record
        const clientNameParts = existingClient.full_name.trim().split(" ");
        firstName = clientNameParts[0];
        lastName = clientNameParts.slice(1).join(" ") || "";
        console.log(`📝 Using name from existing client: ${existingClient.full_name}`);
      } else {
        // Use the name provided during registration
        const nameParts = name.trim().split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ") || "";
      }

      // 6. Determine role: only 'client' if NIN matches existing client, otherwise 'worker'
      const userRole = existingClient ? 'client' : 'worker';
      console.log(`👤 Assigning role: ${userRole}`);

      // 7. Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName,
            last_name: lastName,
            full_name: name,
            role: userRole,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return false;
      }

      if (data?.user) {
         // 8. Wait a brief moment to allow any triggers to attempt first
         await new Promise((resolve) => setTimeout(resolve, 500));

         let personalClinicId = null;
         let clinicName = '';

         // 9. Handle clinic assignment
         if (existingClient && existingClient.clinic_id) {
           // Use the clinic from the existing client record (only if NIN matched)
           personalClinicId = existingClient.clinic_id;
           
           // Fetch clinic name
           const { data: clinicData } = await supabase
             .from('clinique')
             .select('name')
             .eq('id', personalClinicId)
             .single();
           
           clinicName = clinicData?.name || 'Unknown Clinic';
           console.log(`🏥 Using existing clinic: ${clinicName}`);
         } else {
           // Create a personal "clinic" for this user (NIN didn't match any client)
           const { data: clinicData, error: clinicError } = await supabase
             .from('clinique')
             .insert([
               {
                 owner: data.user.id,
                 name: `${firstName}'s Home`,
                 address: 'Personal',
                 region: 'Personal',
                 startDate: new Date().toISOString(),
                 endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString(),
               }
             ])
             .select()
             .single();

           if (clinicError) {
               console.error('Error creating personal clinic:', clinicError);
           } else {
             personalClinicId = clinicData?.id;
             clinicName = `${firstName}'s Home`;
             console.log('🏥 Created personal clinic (NIN did not match existing client)');
           }
         }

         // 10. Generate readable user code OWN-XXX-XXX
         const generateUserCode = () => {
             const randomPart1 = Math.floor(100 + Math.random() * 900);
             const randomPart2 = Math.floor(100 + Math.random() * 900);
             return `OWN-${randomPart1}-${randomPart2}`;
         };
         const user_code = generateUserCode();

         // 11. Upsert user data
         // Log all data being transferred from client to user
         if (existingClient) {
           console.log('📊 Transferring client data to user record:');
           console.log('  - Name:', `${firstName} ${lastName}`);
           console.log('  - Clinic ID:', personalClinicId);
           console.log('  - Clinic Name:', clinicName);
           console.log('  - Role:', userRole);
         }

         const { error: upsertError } = await supabase
           .from('users')
           .upsert([
             {
               id: data.user.id,
               first_name: firstName,
               last_name: lastName,
               email: email,
               role: userRole,
               status: true,
               clinic_id: personalClinicId,
               clinic_name: clinicName,
               user_code: user_code,
             },
           ], {
             onConflict: 'id'
           });
         
         if (upsertError) {
           console.error('Error upserting user data:', upsertError);
         }

         // 12. Only create client record if NIN did NOT match existing client
         if (!existingClient) {
           console.log('📝 Creating new client record with NIN (no existing client found)');
           const { error: clientCreateError } = await supabase
             .from('client')
             .insert([
               {
                 full_name: name,
                 email: email,
                 nin: nin.trim(),
                 clinic_id: personalClinicId,
                 telephone: '', // Can be updated later
                 address: '',
                 region: '',
               }
             ]);

           if (clientCreateError) {
             console.error('Error creating client record:', clientCreateError);
             // Check if it's a unique constraint violation
             if (clientCreateError.code === '23505') {
               console.error('NIN already exists in database');
             }
           } else {
             console.log('✅ Created new client record');
           }
         }

         console.log(`✅ User registration complete with role: ${userRole}`);
      }

      // After sign up, redirect to login
      return true;
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

