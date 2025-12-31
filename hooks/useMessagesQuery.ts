import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface UserProfile {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
    role?: string;
    full_name?: string;
}

export interface MessagesData {
    messages: ChatMessage[];
    profiles: Record<string, UserProfile>;
    linkedClientId: string | null;
}

export function useMessagesQuery() {
    const { user } = useAuth();
    // Use clientId as stable identifier
    const userId = user?.clientId;
    const userEmail = user?.email;

    return useQuery({
        queryKey: ['messages', userId],
        queryFn: async (): Promise<MessagesData> => {
            if (!userId) {
                return { messages: [], profiles: {}, linkedClientId: null };
            }

            // 1. Resolve Linked Client ID
            let linkedClientId: string | null = null;
            if (userEmail) {
                try {
                    const { data: clientData } = await supabase
                        .from('client')
                        .select('id')
                        .eq('email', userEmail)
                        .maybeSingle();

                    if (clientData) {
                        linkedClientId = clientData.id;
                    }
                } catch (e) {
                    console.warn("Linked client lookup failed", e);
                }
            }

            // 2. Build ID List
            const myIds = [userId];
            if (linkedClientId) myIds.push(linkedClientId);
            const idString = myIds.join(',');

            // 3. Fetch Messages
            const { data: msgs, error: msgError } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.in.(${idString}),receiver_id.in.(${idString})`)
                .order("created_at", { ascending: true });

            if (msgError) throw msgError;

            const messages = (msgs || []) as ChatMessage[];
            const profiles: Record<string, UserProfile> = {};

            if (messages.length === 0) {
                return { messages, profiles, linkedClientId };
            }

            // 4. Fetch Profiles
            const otherUserIds = new Set<string>();
            messages.forEach(m => {
                if (!myIds.includes(m.sender_id)) otherUserIds.add(m.sender_id);
            });
            const uniqueIds = Array.from(otherUserIds);

            if (uniqueIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, first_name, last_name, role')
                    .in('id', uniqueIds);

                if (usersData) {
                    usersData.forEach((u: any) => {
                        profiles[u.id] = {
                            id: u.id,
                            first_name: u.first_name || "Membre",
                            last_name: u.last_name || "",
                            role: u.role,
                            full_name: `${u.first_name || 'Membre'} ${u.last_name || ''}`.trim()
                        };
                    });
                }

                // Fallback for missing
                uniqueIds.forEach(id => {
                    if (!profiles[id]) {
                        profiles[id] = {
                            id,
                            first_name: "Membre",
                            last_name: "Clinique",
                            full_name: "Membre de la clinique"
                        };
                    }
                });
            }

            return { messages, profiles, linkedClientId };
        },
        enabled: !!userId,
        staleTime: Infinity, // Rely on refetch/subscription for updates
    });
}

export function useSendMessageMutation() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ senderId, targetId, content }: { senderId: string; targetId: string; content: string }) => {
            const { error } = await supabase.from("messages").insert({
                sender_id: senderId,
                receiver_id: targetId,
                content: content,
                is_read: false
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', user?.clientId] });
        }
    });
}
