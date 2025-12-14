"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPatientById, Patient } from "@/lib/mock-data/patients";

// Mock medical data (same as owner view for consistency in V1)
const medicalHistory = [
  {
    id: 1,
    title: "Dental Cleaning",
    date: "Jan 15, 2024",
    description: "Routine dental cleaning and check-up. Mild tartar buildup noted. All clear otherwise.",
    icon: "dentistry",
  },
  {
    id: 2,
    title: "Follow-up: Skin Allergy",
    date: "Oct 20, 2023",
    description: "Prescription for Apoquel refilled. Skin condition has improved significantly.",
    icon: "science",
  },
  {
    id: 3,
    title: "Annual Check-up & Wellness Exam",
    date: "May 05, 2023",
    description: "Overall health is excellent. Vaccinations administered. Discussed diet and exercise.",
    icon: "stethoscope",
  },
];

const vaccinations = [
  { name: "Rabies", nextDue: "May 05, 2026", status: "Up-to-date", statusColor: "bg-green-500/20 text-green-300" },
  { name: "DHPP", nextDue: "May 05, 2024", status: "Due Soon", statusColor: "bg-amber-500/20 text-amber-300" },
  { name: "Bordetella", nextDue: "Nov 05, 2023", status: "Overdue", statusColor: "bg-red-500/20 text-red-300" },
];

const externalResults = [
  { id: 1, title: "Blood Panel - Central Vet Clinic", date: "July 22, 2023" },
  { id: 2, title: "X-Ray - Emergency Animal Hospital", date: "March 12, 2023" },
];

export default function DoctorPatientView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("medical-history");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
        const found = getPatientById(params.id);
        setPatient(found || null);
        setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  
  if (!patient) return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-bold mb-4">Patient Not Found</h2>
          <Link href="/doctor-access" className="text-primary hover:underline">Return to Search</Link>
      </div>
  );

  return (
    <div className="min-h-screen bg-background-dark font-display text-text-primary-dark">
      {/* Doctor Header */}
      <header className="bg-surface-dark border-b border-border-dark sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/doctor-access" className="text-gray-400 hover:text-white transition-colors">
                      <span className="material-icons">close</span>
                  </Link>
                  <div className="flex items-center gap-2">
                       <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Guest View</span>
                       <h1 className="text-white font-bold text-lg">Patient Record Access</h1>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-semibold">
                      <span className="material-icons text-sm">save</span>
                      Save to Dashboard
                  </button>
                  <div className="h-8 w-[1px] bg-border-dark mx-2"></div>
                  <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Doctor Login</Link>
              </div>
          </div>
      </header>
        
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Patient Header Card */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
             
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 shrink-0 border-4 border-background-dark shadow-lg block"
                  style={{ backgroundImage: `url("${patient.photoUrl}")` }}
                />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-bold leading-tight tracking-tight text-white mb-2">
                    {patient.name}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-gray-300 text-sm md:text-base mb-6">
                      <span className="flex items-center gap-1"><span className="material-icons text-gray-500 text-sm">pets</span> {patient.species} - {patient.breed}</span>
                      <span className="flex items-center gap-1"><span className="material-icons text-gray-500 text-sm">cake</span> {patient.age}</span>
                      <span className="flex items-center gap-1"><span className="material-icons text-gray-500 text-sm">monitor_weight</span> {patient.weight}</span>
                      <span className="flex items-center gap-1"><span className="material-icons text-gray-500 text-sm">male</span> {patient.sex}</span>
                  </div>

                   <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <div className="px-4 py-2 bg-background-dark/50 rounded-lg border border-border-dark">
                            <span className="text-xs text-gray-500 block uppercase tracking-wider">Microchip ID</span>
                            <span className="text-white font-mono">{patient.microchipId}</span>
                        </div>
                         <div className="px-4 py-2 bg-background-dark/50 rounded-lg border border-border-dark">
                            <span className="text-xs text-gray-500 block uppercase tracking-wider">Last Visit</span>
                            <span className="text-accent-green font-medium">{patient.lastVisit}</span>
                        </div>
                   </div>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[200px]">
                    <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                        <span className="material-icons">add_circle</span>
                        Add Medical Note
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <span className="material-icons">history</span>
                        View Full History
                    </button>
                </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8 border-b border-border-dark">
             <div className="flex gap-8 overflow-x-auto">
              {['medical-history', 'vaccinations', 'external-results'].map((tab) => (
                   <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 text-sm font-bold tracking-wide whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-accent-green text-white"
                        : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    {tab.replace('-', ' ').toUpperCase()}
                  </button>
              ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {activeTab === "medical-history" && (
                <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
                  <div className="p-4 border-b border-border-dark">
                      <h3 className="font-bold text-white">Recent Medical History</h3>
                  </div>
                  <div className="divide-y divide-border-dark">
                    {medicalHistory.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex gap-4">
                           <div className="flex-shrink-0 size-10 rounded-full bg-background-dark border border-border-dark flex items-center justify-center group-hover:border-primary transition-colors">
                            <span className="material-icons text-accent-green">{item.icon}</span>
                           </div>
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-medium">{item.title}</h4>
                                    <span className="text-xs text-gray-500">• {item.date}</span>
                               </div>
                               <p className="text-gray-400 text-sm">{item.description}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
                {/* Info Card/Widgets */}
                 <div className="bg-surface-dark rounded-xl border border-border-dark p-4">
                    <h3 className="font-bold text-white mb-4">Safe to Auto-Run?</h3>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <span className="material-icons text-green-500">check_circle</span>
                        <p className="text-sm text-green-200">No known allergies</p>
                    </div>
                </div>

              {activeTab === "vaccinations" && (
                <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
                   <div className="p-4 border-b border-border-dark">
                      <h3 className="font-bold text-white">Vaccination Status</h3>
                  </div>
                  <div className="divide-y divide-border-dark">
                          {vaccinations.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium text-sm">{vaccine.name}</p>
                                    <p className="text-xs text-gray-500">Next: {vaccine.nextDue}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${vaccine.statusColor}`}>
                                    {vaccine.status}
                                </span>
                            </div>
                          ))}
                  </div>
                </div>
              )}
  
              {activeTab === "external-results" && (
                <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
                   <div className="p-4 border-b border-border-dark">
                      <h3 className="font-bold text-white">External Documents</h3>
                  </div>
                   <div className="divide-y divide-border-dark">
                    {externalResults.map((result) => (
                       <div key={result.id} className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                           <div>
                               <p className="text-white text-sm font-medium">{result.title}</p>
                               <p className="text-xs text-gray-500">{result.date}</p>
                           </div>
                           <span className="material-icons text-gray-500">chevron_right</span>
                       </div>
                    ))}
                   </div>
                </div>
              )}
            </div>
          </div>
      </main>
    </div>
  );
}
