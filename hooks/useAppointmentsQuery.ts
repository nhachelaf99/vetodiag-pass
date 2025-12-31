import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
    id: string;
    date: string;
    rawDate: string;
    time: string;
    petName: string;
    service: string;
    doctor: string;
    status: string;
    location: string;
}

export function useAppointmentsQuery() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['appointments', user?.email], // Changed key to email to be more stable
        queryFn: async () => {
            if (!user?.email) return [];

            // 1. Resolve real Client ID from 'client' table using email
            // This is critical because Auth ID != Client Owner ID in some cases
            const { data: clientData } = await supabase
                .from('client')
                .select('id')
                .eq('email', user.email)
                .single();

            // Use resolved ID or fallback to user.clientId
            const targetOwnerId = clientData?.id || user.clientId;

            if (!targetOwnerId) return [];

            // 2. Fetch appointments for patients owned by this owner
            const { data, error } = await supabase
                .from('rdv')
                .select(`
                  id,
                  date,
                  time,
                  type,
                  status:done,
                  patient!inner (name, owner_id),
                  clinique (name, address)
                `)
                .eq('patient.owner_id', targetOwnerId)
                .order('date', { ascending: true });

            if (error) {
                console.error("Error fetching appointments:", error);
                throw error;
            }

            const appointments: Appointment[] = (data || []).map((item: any) => {
                const isDone = item.status;
                const status = isDone ? 'Completed' : 'Upcoming';
                const dateObj = new Date(item.date);
                const dateStr = dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                });

                return {
                    id: item.id,
                    rawDate: item.date,
                    date: dateStr,
                    time: item.time.substring(0, 5),
                    petName: item.patient?.name || 'Unknown Pet',
                    service: item.type || 'General Checkup',
                    doctor: item.clinique?.name || 'Veterinary Clinic',
                    status: status,
                    location: item.clinique?.address || 'Main Location',
                };
            });

            return appointments;
        },
        enabled: !!user?.email,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}
