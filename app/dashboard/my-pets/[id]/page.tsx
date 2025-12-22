"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  title?: string; // Sometimes used as title in other views
  description?: string; // Can be mapped from notes
  notes: string;
  created_at: string;
}

interface Vaccination {
  id: string;
  vaccination_name: string;
  next_time: string; // Due date
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
  
  const [activeTab, setActiveTab] = useState("medical-history");
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
        
        // 1. Fetch Patient Details
        const { data: patientData, error: patientError } = await supabase
          .from("patient")
          .select("*")
          .eq("id", id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // 2. Fetch Medical History (Clinical Cases)
        const { data: historyData, error: historyError } = await supabase
          .from("clinical_case")
          .select("*")
          .eq("patient_id", id)
          .order("visit_date", { ascending: false });

        if (historyError) {
            console.error("Error fetching history:", historyError);
        } else {
            setHistory(historyData || []);
        }

        // 3. Fetch Vaccinations
        const { data: vaxData, error: vaxError } = await supabase
          .from("vaccination")
          .select("*")
          .eq("patient_id", id)
          .order("next_time", { ascending: true });

        if (vaxError) {
            console.error("Error fetching vaccinations:", vaxError);
        } else {
            setVaccinations(vaxData || []);
        }
        
        // 4. Fetch Documents (External Results)
        // Check if table exists first or wrap in try/catch if uncertain, 
        // but assuming 'patient_documents' from CRM schema analysis.
        const { data: docData, error: docError } = await supabase
          .from("patient_documents")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false });

        if (docError) {
           console.log("Documents fetch error (may be empty):", docError.message);
        } else {
           setDocuments(docData || []);
        }

      } catch (err: any) {
        console.error("Error loading pet data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  // Calculate age from DOB
  const getAge = (dob: string) => {
    if (!dob) return "Unknown age";
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

  // Helper for vaccination status
  const getVaxStatus = (nextDue: string) => {
    const due = new Date(nextDue);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Overdue", color: "bg-red-500/20 text-red-300" };
    if (diffDays < 30) return { label: "Due Soon", color: "bg-amber-500/20 text-amber-300" };
    return { label: "Up-to-date", color: "bg-green-500/20 text-green-300" };
  };

  // Icon helper
  const getIconForType = (type: string) => {
    const lower = type?.toLowerCase() || "";
    if (lower.includes("dent")) return "dentistry";
    if (lower.includes("surgery") || lower.includes("opér")) return "medical_services";
    if (lower.includes("consult")) return "stethoscope";
    return "healing";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading pet profile...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-red-400">Error: {error || "Patient not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background-dark font-display text-text-primary-dark">
      {/* 
          REMOVED SECONDARY SIDEBAR 
          This page now takes full width minus the main app sidebar (layout handled).
      */}

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center border-b border-border-dark pb-8 mb-8">
          <div className="relative group">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 md:h-40 md:w-40 shadow-lg ring-4 ring-surface-dark bg-surface-dark"
              style={{ 
                backgroundImage: patient.photo_url 
                  ? `url("${patient.photo_url}")` 
                  : 'url("https://via.placeholder.com/150?text=No+Image")' 
              }}
            >
                {!patient.photo_url && (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <span className="material-symbols-outlined text-4xl">pets</span>
                    </div>
                )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                  {patient.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400 text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">pets</span>
                    {patient.species} • {patient.breed}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">cake</span>
                    {getAge(patient.date_of_birth)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">weight</span>
                    {patient.weight || "N/A"}
                  </span>
                  {patient.sex && (
                     <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">
                            {patient.sex === 'M' ? 'male' : 'female'}
                        </span>
                        {patient.sex === 'M' ? 'Male' : 'Female'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-dark border border-border-dark text-white hover:bg-white/5 transition-all font-medium min-w-[120px]">
                  <span className="material-symbols-outlined text-xl">edit</span>
                  Edit Profile
                </button>
                <button 
                  onClick={() => setIsPassOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all font-bold min-w-[120px] shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-xl">qr_code_2</span>
                  Share Pass
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex border-b border-border-dark min-w-max">
            {[
              { id: "medical-history", label: "Medical History" },
              { id: "vaccinations", label: "Vaccinations" },
              { id: "external-results", label: "External Results/Docs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "medical-history" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Consultations
              </h3>
              
              {history.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 bg-surface-dark rounded-2xl border border-border-dark">
                    No medical history recorded yet.
                 </div>
              ) : (
                <div className="relative border-l-2 border-border-dark ml-4 md:ml-6 space-y-8 pl-8 md:pl-10 py-2">
                    {history.map((item) => (
                    <div key={item.id} className="relative">
                        <div className="absolute -left-[49px] md:-left-[51px] top-0 bg-surface-dark border-2 border-border-dark p-2 rounded-full z-10">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {getIconForType(item.clinical_case_type)}
                            </span>
                        </div>
                        <div className="flex flex-col bg-surface-dark p-5 rounded-2xl border border-border-dark hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-white capitalize">
                                    {item.clinical_case_type || "Consultation"}
                                </h4>
                                <span className="text-sm font-medium text-gray-400">
                                    {new Date(item.visit_date).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {item.notes || "No additional notes recorded."}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "vaccinations" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">vaccines</span>
                Vaccination Schedule
              </h3>
              
              <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vaccine</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Administered</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Next Due</th>
                      <th className="p-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {vaccinations.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">No vaccinations recorded.</td>
                        </tr>
                    ) : (
                        vaccinations.map((vax) => {
                        const status = getVaxStatus(vax.next_time);
                        return (
                            <tr key={vax.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-white font-medium">{vax.vaccination_name}</td>
                            <td className="p-4 text-gray-400 text-sm">
                                {new Date(vax.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-gray-400 text-sm">
                                {new Date(vax.next_time).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.label}
                                </span>
                            </td>
                            </tr>
                        );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "external-results" && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Documents & Results
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-gray-500 bg-surface-dark rounded-2xl border border-border-dark">
                            No documents found.
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="bg-surface-dark p-5 rounded-2xl border border-border-dark hover:border-primary/50 transition-all group cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-background-dark p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                        <span className="material-symbols-outlined text-2xl">
                                            {doc.file_type?.includes('image') ? 'image' : 'picture_as_pdf'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold mb-1 truncate">{doc.title}</h4>
                                <p className="text-gray-400 text-sm">View Document</p>
                            </div>
                        ))
                    )}
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Patient Pass Modal */}
      {isPassOpen && patient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-dark rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl scale-100 transform transition-all">
            <div className="p-8 text-center relative">
               <button 
                  onClick={() => setIsPassOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

              <h3 className="text-2xl font-bold text-white mb-2">Patient Pass</h3>
              <p className="text-gray-400 text-sm mb-6">Scan to access medical records</p>
              
              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-inner mx-auto">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${patient.patient_code || patient.id}`}
                  alt="Patient QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
              </div>

              <div className="bg-background-dark rounded-xl p-4 border border-border-dark mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Access ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                    {patient.patient_code || patient.id.slice(0, 8)}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(patient.patient_code || patient.id)}
                    className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 border-t border-border-dark text-center">
                <p className="text-xs text-primary/70 font-medium">
                    Valid for VetoDiag partner clinics
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
