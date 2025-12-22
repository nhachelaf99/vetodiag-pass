"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MyPetsSection from "@/components/dashboard/MyPetsSection";
import RecentActivitiesSection from "@/components/dashboard/RecentActivitiesSection";
import UpcomingAppointmentsSection from "@/components/dashboard/UpcomingAppointmentsSection";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    async function fetchData() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            // 1. Get Client ID
            const { data: client } = await supabase
                .from('client')
                .select('id')
                .eq('email', session.user.email)
                .single();
            
            if (!client) return;

            // 2. Fetch Upcoming Appointments
            const { data: rdvData } = await supabase
                .from('rdv')
                .select(`
                    date,
                    time,
                    type,
                    clinique ( name )
                `)
                .eq('patient.owner_id', client.id) // Indirectly via patient? Or rdv has client_id sometimes?
                // rdv schema: clinic_id, patient_id. Patient has owner_id.
                // Let's try joining patient to filter by owner
                // .eq('patient.owner_id', client.id) might not work directly in standard simple queries without valid FK setup for deep filtering sometimes.
                // Alternative: Fetch patients first, then RDVs.
                // Or simplified: .in('patient_id', patientIds)
                
                // Let's fetch patients first for safety
                const { data: patients } = await supabase
                  .from('patient')
                  .select('id')
                  .eq('owner_id', client.id);
                  
                const patientIds = patients?.map((p: any) => p.id) || [];
                
                if (patientIds.length > 0) {
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

                     if (appts) {
                         const formattedAppts = appts.map((DisplayAppt: any) => ({
                             date: new Date(DisplayAppt.date).toLocaleDateString() + ' ' + DisplayAppt.time,
                             title: DisplayAppt.type || "Appointment",
                             subtitle: `with ${DisplayAppt.clinique?.name || "Clinic"} for ${DisplayAppt.patient?.name}`,
                         }));
                         setAppointments(formattedAppts);
                     }
                     
                     // 3. Fetch Recent Activities (Past Appointments + Clinical Cases + Vaccinations)
                     // A. Past RDV
                     const { data: pastAppts } = await supabase
                        .from('rdv')
                        .select(`
                            date, type, clinique(name), patient(name)
                        `)
                        .in('patient_id', patientIds)
                        .lt('date', new Date().toISOString())
                        .order('date', { ascending: false })
                        .limit(3);
                        
                     // B. Clinical Cases
                     const { data: cases } = await supabase
                        .from('clinical_case')
                        .select(`
                             visit_date, clinical_case_type, clinique(name), patient(name)
                        `)
                         .in('patient_id', patientIds)
                         .order('visit_date', { ascending: false })
                         .limit(3);

                     // C. Vaccinations
                      const { data: vax } = await supabase
                        .from('vaccination')
                        .select(`
                             created_at, vaccination_name, clinique(name), patient(name)
                        `)
                         .in('patient_id', patientIds)
                         .order('created_at', { ascending: false })
                         .limit(3);
                         
                      // Combine & Sort
                      let combined = [
                          ...(pastAppts || []).map((x: any) => ({
                              icon: "event",
                              title: x.type || "Appointment",
                              subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                              time: new Date(x.date).toLocaleDateString(),
                              dateObj: new Date(x.date)
                          })),
                          ...(cases || []).map((x: any) => ({
                              icon: "healing",
                              title: x.clinical_case_type || "Consultation",
                              subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                              time: new Date(x.visit_date).toLocaleDateString(),
                              dateObj: new Date(x.visit_date)
                          })),
                           ...(vax || []).map((x: any) => ({
                              icon: "vaccines",
                              title: `Vaccine: ${x.vaccination_name}`,
                              subtitle: `${x.patient?.name} at ${x.clinique?.name}`,
                              time: new Date(x.created_at).toLocaleDateString(),
                              dateObj: new Date(x.created_at)
                          }))
                      ];
                      
                      combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
                      setActivities(combined.slice(0, 5));
                }

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  return (
    <div className="font-inter">
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <MyPetsSection />
          <RecentActivitiesSection activities={activities} />
        </div>
        <div className="md:col-span-1 space-y-8">
          <UpcomingAppointmentsSection appointments={appointments} />
        </div>
      </div>
    </div>
  );
}

