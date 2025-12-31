"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
    Activity, 
    Syringe, 
    FileText, 
    Calendar, 
    Clock, 
    Weight, 
    Ruler, 
    Fingerprint, 
    Edit, 
    QrCode, 
    Stethoscope, // instead of medical_services
    Dog, // instead of pets
    Cat, // fallback species
    ChevronRight,
    Search,
    Download,
    X,
    Copy,
    Share2,
    CalendarCheck,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import SkeletonProfile from "@/components/skeletons/SkeletonProfile";

// Interfaces matching Supabase schema
interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  weight: string;
  photo_url?: string;
  sex?: string;
  patient_code?: string;
}

interface ClinicalCase {
  id: string;
  visit_date: string;
  clinical_case_type: string;
  title?: string;
  description?: string;
  notes: string;
  created_at: string;
}

interface Vaccination {
  id: string;
  vaccination_name: string;
  next_time: string;
  created_at: string;
}

interface PatientDocument {
  id: string;
  title: string;
  created_at: string;
  file_type?: string;
}

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<ClinicalCase[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Fetch Patient
        const { data: patientData, error: patientError } = await supabase
          .from("patient")
          .select("*")
          .eq("id", id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // 2. Fetch History
        const { data: historyData } = await supabase
            .from("clinical_case")
            .select("*")
            .eq("patient_id", id)
            .order("visit_date", { ascending: false });
        setHistory(historyData || []);

        // 3. Fetch Vaccinations
        const { data: vaxData } = await supabase
            .from("vaccination")
            .select("*")
            .eq("patient_id", id)
            .order("next_time", { ascending: true });
        setVaccinations(vaxData || []);

        // 4. Fetch Documents
        const { data: docData } = await supabase
           .from("patient_documents") // Ensure table exists or fail gracefully
           .select("*")
           .eq("patient_id", id)
           .order("created_at", { ascending: false });
        setDocuments(docData || []);

      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  const getAge = (dob: string) => {
    if (!dob) return "Unknown";
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    return years > 0 ? `${years} years` : `${months} months`;
  };

  const getVaxStatus = (nextDue: string) => {
    const due = new Date(nextDue);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Overdue", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle };
    if (diffDays < 30) return { label: "Due Soon", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock };
    return { label: "Up to Date", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 };
  };

  if (loading) return <SkeletonProfile />;

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Pet Profile Not Found</h2>
            <p className="text-gray-400 max-w-md">We couldn't locate the records for this patient. They may have been removed or you might not have access.</p>
            <Link href="/dashboard/my-pets" className="text-primary hover:underline">Return to My Pets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background-dark font-display pb-20">
      
      {/* Dynamic Header Background */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background-dark z-0" />
           {/* Abstract shapes */}
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl mx-auto px-4 sm:px-8">
               {/* Content positioned over background if needed, mostly empty for now */}
           </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 md:-mt-40 relative z-10 w-full">
          {/* Main Card */}
          <div className="bg-[#09090b]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Avatar */}
                  <div className="relative shrink-0 mx-auto md:mx-0">
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl p-1 bg-gradient-to-br from-gray-700 to-gray-900 shadow-xl overflow-hidden relative group">
                          {patient.photo_url ? (
                              <Image 
                                src={patient.photo_url} 
                                alt={patient.name} 
                                fill 
                                className="object-cover rounded-[20px]"
                                unoptimized
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-[20px]">
                                   <Dog className="w-16 h-16 text-gray-600" />
                              </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[20px]">
                                <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
                                    <Edit className="w-5 h-5" />
                                </button>
                          </div>
                      </div>
                      <div className="absolute -bottom-3 -right-3">
                           <button 
                                onClick={() => setIsPassOpen(true)}
                                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                title="Show Pet Pass"
                           >
                               <QrCode className="w-6 h-6" />
                           </button>
                      </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4 mb-4">
                          <div>
                              <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{patient.name}</h1>
                                {patient.sex && (
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${patient.sex === 'M' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-pink-500/10 border-pink-500/20 text-pink-500'}`}>
                                        <span className="text-sm font-bold">{patient.sex}</span>
                                    </span>
                                )}
                              </div>
                              <p className="text-lg text-gray-400 font-medium">{patient.breed}</p>
                          </div>
                          
                          <div className="flex gap-2">
                               <Link 
                                href={`/dashboard/appointments/new?petId=${patient.id}`}
                                className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-green-500 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                               >
                                    <CalendarCheck className="w-4 h-4" />
                                    <span>Book Visit</span>
                               </Link>
                               <button className="px-3 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors">
                                    <Edit className="w-4 h-4" />
                               </button>
                          </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            <StatCard icon={Calendar} label="Age" value={getAge(patient.date_of_birth)} />
                            <StatCard icon={Weight} label="Weight" value={patient.weight || "N/A"} />
                            <StatCard icon={Dog} label="Species" value={patient.species} />
                            <StatCard icon={Fingerprint} label="Patient ID" value={patient.patient_code || patient.id.slice(0,6)} />
                      </div>
                  </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 mt-10 border-b border-gray-800 overflow-x-auto scrollbar-hide">
                  <TabButton id="overview" label="Overview" icon={Activity} active={activeTab} set={setActiveTab} />
                  <TabButton id="medical-history" label="Medical History" icon={Stethoscope} active={activeTab} set={setActiveTab} />
                  <TabButton id="vaccinations" label="Vaccinations" icon={Syringe} active={activeTab} set={setActiveTab} count={vaccinations.length > 0 ? vaccinations.length : undefined} />
                  <TabButton id="documents" label="Documents" icon={FileText} active={activeTab} set={setActiveTab} />
              </div>
          </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Recent Activity / Snapshot */}
                            <div className="bg-[#09090b] border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    Latest Updates
                                </h3>
                                <div className="space-y-4">
                                     {history.slice(0, 3).map(item => (
                                         <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                             <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                 <Stethoscope className="w-5 h-5" />
                                             </div>
                                             <div>
                                                 <h4 className="font-bold text-white text-sm">{item.clinical_case_type || "Consultation"}</h4>
                                                 <p className="text-xs text-gray-500 mt-0.5">{new Date(item.visit_date).toLocaleDateString()}</p>
                                                 <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.notes}</p>
                                             </div>
                                         </div>
                                     ))}
                                     {history.length === 0 && <p className="text-gray-500 italic">No recent activity.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'medical-history' && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {history.map((item, idx) => (
                                 <div key={item.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-800 last:before:hidden">
                                     <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#09090b] border-2 border-gray-700 flex items-center justify-center z-10">
                                         <div className="w-2 h-2 rounded-full bg-gray-500" />
                                     </div>
                                     <div className="bg-[#09090b] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-white capitalize">{item.clinical_case_type}</h4>
                                                <p className="text-sm text-primary font-medium">{item.title}</p>
                                            </div>
                                            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                                {new Date(item.visit_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed mt-2 whitespace-pre-wrap">{item.notes}</p>
                                     </div>
                                 </div>
                             ))}
                             {history.length === 0 && (
                                <div className="text-center py-12 bg-[#09090b] rounded-2xl border border-gray-800 border-dashed">
                                    <Stethoscope className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">No medical history found.</p>
                                </div>
                             )}
                         </div>
                    )}

                    {activeTab === 'vaccinations' && (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {vaccinations.map(vax => {
                                 const status = getVaxStatus(vax.next_time);
                                 const StatusIcon = status.icon;
                                 return (
                                     <div key={vax.id} className="flex items-center justify-between p-5 bg-[#09090b] border border-gray-800 rounded-2xl hover:border-gray-700 transition-all">
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                 <Syringe className="w-6 h-6" />
                                             </div>
                                             <div>
                                                 <h4 className="font-bold text-white">{vax.vaccination_name}</h4>
                                                 <p className="text-xs text-gray-500 mt-0.5">Administered: {new Date(vax.created_at).toLocaleDateString()}</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                                 <StatusIcon className="w-3.5 h-3.5" />
                                                 {status.label}
                                             </div>
                                             <p className="text-xs text-gray-500 mt-2 font-mono">Due: {new Date(vax.next_time).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                 );
                             })}
                             {vaccinations.length === 0 && (
                                <div className="text-center py-12 bg-[#09090b] rounded-2xl border border-gray-800 border-dashed">
                                    <Syringe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">No vaccinations recorded.</p>
                                </div>
                             )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {documents.map(doc => (
                                <div key={doc.id} className="p-5 bg-[#09090b] border border-gray-800 rounded-2xl hover:border-gray-600 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-8">
                                        <FileText className="w-8 h-8 text-gray-600 group-hover:text-primary transition-colors" />
                                        <span className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-white mb-1 truncate">{doc.title}</h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-white transition-colors">
                                        <span>Download</span>
                                        <Download className="w-3 h-3" />
                                    </div>
                                </div>
                            ))}
                            {documents.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-[#09090b] rounded-2xl border border-gray-800 border-dashed">
                                    <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">No documents available.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Sidebar Widgets) */}
                <div className="space-y-6">
                    {/* Next Appointment Widget */}
                    <div className="bg-gradient-to-br from-[#09090b] to-[#121214] border border-gray-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-white mb-4">Next Appointment</h3>
                        <div className="p-4 rounded-xl bg-surface-dark border border-gray-700/50 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">General Checkup</p>
                                    <p className="text-xs text-gray-400">Dr. Smith • VetCare Clinic</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 bg-black/20 p-2 rounded-lg">
                                <span>Oct 24, 2024</span>
                                <span>10:00 AM</span>
                            </div>
                        </div>
                        <Link href="/dashboard/appointments/new" className="block w-full py-3 rounded-xl border border-gray-700 text-center text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            Schedule New
                        </Link>
                    </div>

                    {/* Needs Attention Widget (Mock) */}
                    <div className="bg-[#09090b] border border-gray-800 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Health Status</h3>
                         <div className="space-y-3">
                             <div className="flex items-center gap-3 text-sm">
                                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                                 <span className="text-gray-300">Vaccinations up to date</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm">
                                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                                 <span className="text-gray-300">Healthy weight range</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm">
                                 <AlertCircle className="w-5 h-5 text-amber-500" />
                                 <span className="text-gray-300">Dental check due soon</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
      </div>

      {/* Pet Pass Modal */}
      {isPassOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-[#18181b] border border-gray-700 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative">
                  <button onClick={() => setIsPassOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                          <Dog className="w-8 h-8 text-black" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">VetoPass</h2>
                      <p className="text-gray-400 text-sm mb-8">Scan to access {patient.name}'s medical records</p>
                      
                      <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
                          <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${patient.patient_code || patient.id}`}
                            alt="QR"
                            width={200}
                            height={200}
                            className="w-full"
                          />
                      </div>

                      <div className="w-full bg-black/20 rounded-xl p-3 flex items-center justify-between border border-white/5">
                          <span className="text-xs uppercase font-bold text-gray-500">ID CODE</span>
                          <div className="flex items-center gap-2">
                              <span className="font-mono text-primary font-bold">{patient.patient_code || patient.id.slice(0,6).toUpperCase()}</span>
                              <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <Icon className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">{label}</p>
            <p className="text-sm font-bold text-white truncate w-full">{value}</p>
        </div>
    );
}

function TabButton({ id, label, icon: Icon, active, set, count }: any) {
    const isActive = active === id;
    return (
        <button
            onClick={() => set(id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
        >
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
            {label}
            {count && <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full">{count}</span>}
            {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
        </button>
    );
}
