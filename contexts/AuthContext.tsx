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
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
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

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // 1. Check if email already exists in public.users (optional but good for UX)
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('Sign up error: Email already used');
        return false;
      }

      // 2. Split full name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      // 3. Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName,
            last_name: lastName,
            full_name: name,
            role: 'worker', // Default role for now, as schema requires valid enum
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return false;
      }

      if (data?.user) {
         // 4. Manuall upsert to ensure data in public.users (Mirroring CRM logic)
         // Wait a brief moment to allow any triggers to attempt first
         await new Promise((resolve) => setTimeout(resolve, 500));

         // 4a. Create a personal "clinic" for this user to satisfy RLS policies
         // This allows the user to have a "clinic_id" which is required to view/add patients
         const { data: clinicData, error: clinicError } = await supabase
           .from('clinique')
           .insert([
             {
               owner: data.user.id,
               name: `${firstName}'s Home`,
               address: 'Personal',
               region: 'Personal',
               startDate: new Date().toISOString(),
               endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString(), // Long expiry
             }
           ])
           .select()
           .single();

         if (clinicError) {
             console.error('Error creating personal clinic:', clinicError);
         }

         const personalClinicId = clinicData?.id;

         // Generate readable user code OWN-XXX-XXX
         const generateUserCode = () => {
             const randomPart1 = Math.floor(100 + Math.random() * 900);
             const randomPart2 = Math.floor(100 + Math.random() * 900);
             return `OWN-${randomPart1}-${randomPart2}`;
         };
         const user_code = generateUserCode();

         const { error: upsertError } = await supabase
           .from('users')
           .upsert([
             {
               id: data.user.id,
               first_name: firstName,
               last_name: lastName,
               email: email,
               role: 'worker', // Schema requires valid enum: 'doctor', 'worker', 'admin'
               status: true,
               clinic_id: personalClinicId,
               clinic_name: `${firstName}'s Home`,
               user_code: user_code,
             },
           ], {
             onConflict: 'id'
           });
         
         if (upsertError) {
           console.error('Error upserting user data:', upsertError);
         }
      }

      // After sign up, you may want to auto-login or prompt email confirmation.
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

