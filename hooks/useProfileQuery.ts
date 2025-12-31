import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    clinic_id?: string;
    user_code?: string;
    clinic_name?: string;
}

export function useProfileQuery() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['profile', user?.clientId],
        queryFn: async () => {
            if (!user?.clientId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.clientId)
                .single();

            if (error) throw error;
            return data as UserProfile;
        },
        enabled: !!user?.clientId,
    });
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth(); // Note: AuthContext might be stale if we update here, but we'll invalidate.

    return useMutation({
        mutationFn: async ({
            id,
            firstName,
            lastName,
            email,
            password,
            currentEmail
        }: {
            id: string,
            firstName: string,
            lastName: string,
            email: string,
            password?: string,
            currentEmail?: string
        }) => {
            console.log("Starting profile update...", { id, firstName, lastName, email });

            // 1. Update public.users table (Database)
            const { error: dbError } = await supabase
                .from('users')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                })
                .eq('id', id);

            if (dbError) {
                console.error("Database update failed:", dbError);
                throw new Error(`Database update failed: ${dbError.message}`);
            }
            console.log("Database update successful");

            // 2. Update Auth (Email or Password)
            const authUpdates: { email?: string, password?: string } = {};

            // Only update email if strictly different and both exist
            if (currentEmail && email !== currentEmail) {
                console.log("Email change detected", { from: currentEmail, to: email });
                authUpdates.email = email;
            } else if (!currentEmail && email) {
                // Edge case: no current email known?
                console.log("Setting email (no current email known)", email);
                authUpdates.email = email;
            }

            if (password && password.trim().length > 0) {
                console.log("Password change detected");
                authUpdates.password = password;
            }

            if (Object.keys(authUpdates).length > 0) {
                console.log("Applying auth updates...", authUpdates);
                const { error: authError } = await supabase.auth.updateUser(authUpdates);

                if (authError) {
                    console.error("Auth update failed:", authError);
                    // Decide if we should rollback DB update? 
                    // ideally yes, but for now just throw
                    throw new Error(`Auth update failed: ${authError.message}`);
                }
                console.log("Auth updates successful");
            } else {
                console.log("No auth updates required");
            }

            return { id, firstName, lastName, email };
        },
        onSuccess: (data) => {
            console.log("Mutation success, invalidating queries");
            queryClient.invalidateQueries({ queryKey: ['profile', user?.clientId] });
        },
        onError: (error) => {
            console.error("Mutation failed:", error);
        }
    });
}
