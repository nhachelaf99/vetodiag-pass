import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
    appointments: any[];
    activities: any[];
}

export function useDashboardQuery() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['dashboard', user?.email],
        queryFn: async (): Promise<DashboardData> => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) {
                return { appointments: [], activities: [] };
            }

            // 1. Get Client ID
            const { data: client } = await supabase
                .from('client')
                .select('id')
                .eq('email', session.user.email)
                .single();

            if (!client) {
                return { appointments: [], activities: [] };
            }

            // Fetch patients first
            const { data: patients } = await supabase
                .from('patient')
                .select('id')
                .eq('owner_id', client.id);

            const patientIds = patients?.map((p: any) => p.id) || [];

            if (patientIds.length === 0) {
                return { appointments: [], activities: [] };
            }

            // 2. Fetch Upcoming Appointments
            const { data: appts } = await supabase
                .from('rdv')
                .select(`
          date,
          time,
          type,
          clinique ( name ),
          patient ( name )
        `)
                .in('patient_id', patientIds)
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(3);

            const formattedAppts = (appts || []).map((item: any) => ({
                date: new Date(item.date).toLocaleDateString() + ' ' + item.time,
                title: item.type || "Appointment",
                subtitle: `with ${item.clinique?.name || "Clinic"} for ${item.patient?.name}`,
            }));

            // 3. Fetch Recent Activities
            const [pastAppts, cases, vax] = await Promise.all([
                // Past RDV
                supabase
                    .from('rdv')
                    .select(`date, type, clinique(name), patient(name)`)
                    .in('patient_id', patientIds)
                    .lt('date', new Date().toISOString())
                    .order('date', { ascending: false })
                    .limit(3),

                // Clinical Cases
                supabase
                    .from('clinical_case')
                    .select(`visit_date, clinical_case_type, clinique(name), patient(name)`)
                    .in('patient_id', patientIds)
                    .order('visit_date', { ascending: false })
                    .limit(3),

                // Vaccinations
                supabase
                    .from('vaccination')
                    .select(`created_at, vaccination_name, clinique(name), patient(name)`)
                    .in('patient_id', patientIds)
                    .order('created_at', { ascending: false })
                    .limit(3),
            ]);

            // Combine & Sort
            let combined = [
                ...(pastAppts.data || []).map((x: any) => ({
                    icon: "event",
                    title: x.type || "Appointment",
                    subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                    time: new Date(x.date).toLocaleDateString(),
                    dateObj: new Date(x.date),
                })),
                ...(cases.data || []).map((x: any) => ({
                    icon: "healing",
                    title: x.clinical_case_type || "Consultation",
                    subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                    time: new Date(x.visit_date).toLocaleDateString(),
                    dateObj: new Date(x.visit_date),
                })),
                ...(vax.data || []).map((x: any) => ({
                    icon: "vaccines",
                    title: `Vaccine: ${x.vaccination_name}`,
                    subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                    time: new Date(x.created_at).toLocaleDateString(),
                    dateObj: new Date(x.created_at),
                })),
            ];

            combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

            return {
                appointments: formattedAppts,
                activities: combined.slice(0, 5),
            };
        },
        enabled: !!user,
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
}
