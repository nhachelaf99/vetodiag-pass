import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface HistoryItem {
    id: string;
    type: 'Medical Record' | 'Appointment' | 'Lab Result' | 'Invoice' | 'Vaccination';
    title: string;
    description: string;
    date: string;
    icon: string;
    petName?: string;
    doctorName?: string;
}

export function useHistoryQuery() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['history', user?.email, user?.clientId],
        queryFn: async () => {
            if (!user?.clientId) {
                throw new Error('User not authenticated');
            }

            let ownerId = user.clientId;
            let isClientTable = false;

            // 1. Try to find explicit Client record (legacy/synced system)
            // Some users exist in 'client' table, others just in 'users'
            if (user.email) {
                const { data: client } = await supabase
                    .from('client')
                    .select('id')
                    .eq('email', user.email)
                    .maybeSingle();

                if (client) {
                    ownerId = client.id;
                    isClientTable = true;
                }
            }

            // 2. Get My Patients
            // Fetch patients linked to this owner (either user.id or client.id)
            const { data: patients, error: patientsError } = await supabase
                .from('patient')
                .select('id, name')
                .eq('owner_id', ownerId);

            if (patientsError) console.error("Error fetching patients:", patientsError);

            const patientIds = patients?.map((p) => p.id) || [];
            const patientMap = new Map(patients?.map((p) => [p.id, p.name]));

            // If no patients found via primary ID, and we found a client record earlier,
            // maybe we should try the user.id as fallback or vice versa? 
            // For now, if no patients, we check if we can fetch by clinic if absolutely necessary (but risky for data privacy).
            // Safer: Just empty list.
            if (patientIds.length === 0) {
                return [];
            }

            // 3. Parallel Fetching for specific patients
            const [casesRes, vaxRes, rdvRes, payRes] = await Promise.all([
                // Clinical Cases
                supabase
                    .from('clinical_case')
                    .select('*')
                    .in('patient_id', patientIds)
                    .order('visit_date', { ascending: false }),

                // Vaccinations
                supabase
                    .from('vaccination')
                    .select('*')
                    .in('patient_id', patientIds)
                    .order('created_at', { ascending: false }),

                // Appointments (RDV)
                supabase
                    .from('rdv')
                    .select('*, clinique(name)')
                    .in('patient_id', patientIds)
                    .order('date', { ascending: false }),

                // Payments (Linked to Owner/Client)
                supabase
                    .from('payments')
                    .select('*')
                    .eq(isClientTable ? 'client_id' : 'user_id', ownerId)
                    .order('created_at', { ascending: false }),
            ]);

            const items: HistoryItem[] = [];

            // Map Clinical Cases
            casesRes.data?.forEach((item: any) => {
                items.push({
                    id: `case-${item.id}`,
                    type: 'Medical Record',
                    title: item.clinical_case_type || 'Consultation',
                    description: item.notes || 'No details recorded',
                    date: item.visit_date,
                    icon: 'medical_services',
                    petName: patientMap.get(item.patient_id) || 'Unknown Pet',
                });
            });

            // Map Vaccinations
            vaxRes.data?.forEach((item: any) => {
                items.push({
                    id: `vax-${item.id}`,
                    type: 'Vaccination',
                    title: `Vaccination: ${item.vaccination_name}`,
                    description: `Next due: ${new Date(item.next_time).toLocaleDateString()}`,
                    date: item.created_at,
                    icon: 'vaccines',
                    petName: patientMap.get(item.patient_id) || 'Unknown Pet',
                });
            });

            // Map Appointments
            rdvRes.data?.forEach((item: any) => {
                items.push({
                    id: `rdv-${item.id}`,
                    type: 'Appointment',
                    title: item.type || 'Appointment',
                    description: `Status: ${item.done ? 'Completed' : 'Upcoming'}`,
                    date: `${item.date}T${item.time}`,
                    icon: 'calendar_month',
                    petName: patientMap.get(item.patient_id) || 'Unknown Pet',
                    doctorName: item.clinique?.name || 'Clinic',
                });
            });

            // Map Payments
            // Note: payments might use different ID column if schema doesn't support user_id
            // We use safe check on payRes.data assuming query worked (Supabase ignores invalid col filters sometimes or errors).
            // Actually, we should check for error.
            if (!payRes.error && payRes.data) {
                payRes.data.forEach((item: any) => {
                    items.push({
                        id: `pay-${item.id}`,
                        type: 'Invoice',
                        title: 'Payment Record',
                        description: item.description || `Amount: $${item.amount}`,
                        date: item.created_at,
                        icon: 'receipt',
                        doctorName: 'Billing System',
                    });
                });
            }

            // Sort by Date Descending
            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return items;
        },
        enabled: !!user?.clientId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
