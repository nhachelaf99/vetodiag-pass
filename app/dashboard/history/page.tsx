"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface HistoryItem {
  id: string;
  type: "Medical Record" | "Appointment" | "Lab Result" | "Invoice" | "Vaccination";
  title: string;
  description: string;
  date: string; // ISO string
  icon: string;
  petName?: string;
  doctorName?: string;
}

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("All");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        // 1. Get Client ID
        const { data: client, error: clientError } = await supabase
            .from('client')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (clientError || !client) {
            console.warn("Client not found for history:", clientError?.message);
            // Don't crash, just show empty history
            setLoading(false); 
            return;
        }

        // 2. Get My Patients
        const { data: patients } = await supabase
            .from('patient')
            .select('id, name')
            .eq('owner_id', client.id); // Assuming owner_id links to client
        
        const patientIds = patients?.map(p => p.id) || [];
        const patientMap = new Map(patients?.map(p => [p.id, p.name]));

        // 3. Parallel Fetching
        const [casesRes, vaxRes, rdvRes, payRes] = await Promise.all([
            // Clinical Cases
            patientIds.length > 0 ? supabase
                .from('clinical_case')
                .select('*')
                .in('patient_id', patientIds)
                .order('visit_date', { ascending: false }) : Promise.resolve({ data: [] }),
            
            // Vaccinations
            patientIds.length > 0 ? supabase
                .from('vaccination')
                .select('*')
                .in('patient_id', patientIds)
                .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),

            // Appointments (RDV)
            patientIds.length > 0 ? supabase
                .from('rdv')
                .select('*, clinique(name)')
                .in('patient_id', patientIds)
                .order('date', { ascending: false }) : Promise.resolve({ data: [] }),

            // Payments
            supabase
                .from('payments')
                .select('*')
                .eq('client_id', client.id)
                .order('created_at', { ascending: false })
        ]);

        const items: HistoryItem[] = [];

        // Map Clinical Cases
        casesRes.data?.forEach((item: any) => {
            items.push({
                id: `case-${item.id}`,
                type: "Medical Record",
                title: item.clinical_case_type || "Consultation",
                description: item.notes || "No details recorded",
                date: item.visit_date,
                icon: "medical_services",
                petName: patientMap.get(item.patient_id) || "Unknown Pet",
            });
        });

        // Map Vaccinations
        vaxRes.data?.forEach((item: any) => {
            items.push({
                id: `vax-${item.id}`,
                type: "Vaccination",
                title: `Vaccination: ${item.vaccination_name}`,
                description: `Next due: ${new Date(item.next_time).toLocaleDateString()}`,
                date: item.created_at,
                icon: "vaccines",
                petName: patientMap.get(item.patient_id) || "Unknown Pet",
            });
        });

        // Map Appointments
        rdvRes.data?.forEach((item: any) => {
            items.push({
                id: `rdv-${item.id}`,
                type: "Appointment",
                title: item.type || "Appointment",
                description: `Status: ${item.done ? 'Completed' : 'Upcoming'}`,
                date: `${item.date}T${item.time}`,
                icon: "calendar_month",
                petName: patientMap.get(item.patient_id) || "Unknown Pet",
                doctorName: item.clinique?.name
            });
        });

        // Map Payments
        payRes.data?.forEach((item: any) => {
            items.push({
                id: `pay-${item.id}`,
                type: "Invoice",
                title: "Payment Record",
                description: item.description || `Amount: $${item.amount}`,
                date: item.created_at,
                icon: "receipt",
                doctorName: "Billing System"
            });
        });

        // Sort by Date Descending
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistoryItems(items);

      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredHistory = filterType === "All"
      ? historyItems
      : historyItems.filter((item) => item.type === filterType);

  const filters = ["All", "Medical Record", "Appointment", "Vaccination", "Invoice"];

  return (
    <div className="font-display space-y-8 max-w-5xl mx-auto p-4 md:p-8 bg-background-dark min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">History</h1>
          <p className="text-gray-400 mt-2">
            View your pet's medical history and past activities.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
            <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterType === f
                    ? "bg-primary text-black shadow-lg shadow-primary/25 scale-105"
                    : "bg-surface-dark text-gray-400 hover:bg-white/10 hover:text-white border border-border-dark"
                }`}
            >
                {f}
            </button>
            ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-12 text-gray-500">Loading history...</div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-surface-dark p-6 rounded-2xl border border-border-dark hover:border-primary/50 transition-all group flex flex-col md:flex-row items-start gap-5 relative overflow-hidden"
            >
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

              <div className="w-14 h-14 bg-background-dark rounded-xl flex items-center justify-center flex-shrink-0 border border-border-dark group-hover:border-primary/50 transition-colors z-10">
                <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
              </div>
              
              <div className="flex-1 w-full z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-500 whitespace-nowrap bg-background-dark px-2 py-1 rounded-lg border border-border-dark">
                    {new Date(item.date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-bold text-gray-500 bg-background-dark/50 p-2 rounded-lg inline-flex">
                  {item.petName && (
                    <span className="flex items-center gap-1.5 text-gray-300">
                        <span className="material-symbols-outlined text-sm">pets</span>
                        {item.petName}
                    </span>
                  )}
                  {item.doctorName && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="flex items-center gap-1.5 text-gray-300">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {item.doctorName}
                        </span>
                    </>
                  )}
                   <span className="w-1 h-1 rounded-full bg-gray-600" />
                   <span className="uppercase text-primary tracking-wider">{item.type}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-surface-dark rounded-2xl border border-border-dark border-dashed">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 opacity-50">
              history_toggle_off
            </span>
            <p className="text-gray-400 text-lg">No history found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
