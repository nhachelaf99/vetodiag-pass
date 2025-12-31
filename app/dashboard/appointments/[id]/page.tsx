"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Phone, 
    AlertCircle, 
    CheckCircle2, 
    ArrowLeft, 
    Share2, 
    Printer, 
    Navigation, 
    Dog, 
    Stethoscope, 
    CalendarX, 
    MoreHorizontal
} from "lucide-react";
import Image from "next/image";

interface AppointmentDetail {
  id: string;
  date: string;
  time: string;
  type: string;
  status: boolean; // done
  notes?: string;
  patient: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    photo_url?: string;
  };
  clinique: {
    name: string;
    address?: string;
    telephone?: string;
  };
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetails() {
      try {
        const { data, error } = await supabase
            .from('rdv')
            .select(`
                id,
                date,
                time,
                type,
                notes,
                done,
                patient (
                    *,
                    id,
                    name,
                    breed,
                    photo_url
                ),
                clinique (
                    name,
                    address,
                    telephone
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        console.log("Fetched Appointment Data:", data);
        
        // Map data to interface
        setAppointment({
            id: data.id,
            date: data.date,
            time: data.time,
            type: data.type,
            status: data.done,
            notes: data.notes,
            patient: Array.isArray(data.patient) ? data.patient[0] : (data.patient || { id: "", name: "Unknown Pet" }),
            clinique: Array.isArray(data.clinique) ? data.clinique[0] : (data.clinique || { name: "Unknown Clinic" })
        });

      } catch (err: any) {
        console.error("Error loading appointment:", err);
        setError("Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) {
     return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-gray-400 font-display">Loading appointment...</p>
             </div>
        </div>
     );
  }

  if (error || !appointment) {
      return (
          <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Unavailable</h2>
                  <p className="text-gray-400 mb-6">{error || "This appointment could not be found."}</p>
                  <Link href="/dashboard/appointments" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all">
                      Return to Appointments
                  </Link>
              </div>
          </div>
      );
  }

  const dateObj = new Date(appointment.date);
  const isPast = dateObj < new Date() && appointment.status;
  const statusColor = appointment.status 
      ? "bg-green-500/10 text-green-500 border-green-500/20" 
      : "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return (
    <div className="min-h-screen bg-background-dark font-display p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
            
            {/* Nav */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/appointments" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">Visit Details</h1>
                    <p className="text-gray-400 text-sm">ID: #{appointment.id.slice(0,8)}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Share">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white transition-colors">
                         <Printer className="w-4 h-4" />
                         <span>Print</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Hero Ticket */}
                    <div className="bg-[#09090b] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                        
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${statusColor}`}>
                                    {appointment.status ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                    {appointment.status ? "COMPLETED" : "UPCOMING"}
                                </div>
                                <div className="text-right">
                                     <p className="text-3xl font-bold text-white tracking-tight">{appointment.time.slice(0,5)}</p>
                                     <p className="text-gray-400 font-medium">
                                        {dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                     </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                                    <Stethoscope className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Service Type</p>
                                    <h2 className="text-2xl font-bold text-white">{appointment.type}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{appointment.clinique.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Cutout Effect */}
                        <div className="relative h-4 bg-[#09090b] border-t border-dashed border-gray-800 flex items-center">
                            <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-background-dark border border-gray-800" />
                            <div className="absolute right-0 translate-x-1/2 w-6 h-6 rounded-full bg-background-dark border border-gray-800" />
                        </div>

                        <div className="p-8 bg-white/5 md:flex justify-between items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Clinic Address</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {appointment.clinique.address || "No address provided"}
                                </div>
                            </div>
                            <button className="mt-4 md:mt-0 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg">
                                <Navigation className="w-4 h-4" />
                                Get Directions
                            </button>
                        </div>
                    </div>

                    {/* Additional Details */}
                    {appointment.notes && (
                         <div className="bg-[#09090b] border border-gray-800 rounded-3xl p-8">
                             <h3 className="text-lg font-bold text-white mb-4">Doctor's Notes / Instructions</h3>
                             <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                 {appointment.notes}
                             </p>
                         </div>
                    )}

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    
                    {/* Pet Card */}
                    <div className="bg-[#09090b] border border-gray-800 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Patient</h3>
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-gray-800 overflow-hidden relative">
                                {appointment.patient.photo_url ? (
                                    <Image src={appointment.patient.photo_url} alt={appointment.patient.name} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <Dog className="w-8 h-8" />
                                    </div>
                                )}
                             </div>
                             <div>
                                 <h4 className="text-lg font-bold text-white">{appointment.patient.name}</h4>
                                 <p className="text-sm text-gray-400">{appointment.patient.breed || "Pet"}</p>
                                 <Link href={`/dashboard/my-pets/${appointment.patient.id}`} className="text-primary text-xs font-bold hover:underline mt-1 block">
                                     View Profile
                                 </Link>
                             </div>
                        </div>
                    </div>

                    {/* Clinic Contact */}
                    <div className="bg-[#09090b] border border-gray-800 rounded-3xl p-6">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Contact</h3>
                         <div className="space-y-4">
                             <div className="flex items-start gap-4">
                                 <div className="p-2 rounded-lg bg-gray-800 text-white">
                                     <MapPin className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <p className="text-white font-medium text-sm">{appointment.clinique.name}</p>
                                     <p className="text-gray-500 text-xs mt-1">{appointment.clinique.address}</p>
                                 </div>
                             </div>
                             {appointment.clinique.telephone && (
                                 <div className="flex items-center gap-4">
                                     <div className="p-2 rounded-lg bg-gray-800 text-white">
                                         <Phone className="w-5 h-5" />
                                     </div>
                                     <a href={`tel:${appointment.clinique.telephone}`} className="text-primary font-bold hover:underline">
                                         {appointment.clinique.telephone}
                                     </a>
                                 </div>
                             )}
                         </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <button className="w-full py-4 rounded-xl border border-gray-800 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Add to Calendar
                        </button>
                        {!appointment.status && (
                             <button className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 font-bold transition-all flex items-center justify-center gap-2">
                                <CalendarX className="w-4 h-4" />
                                Cancel Appointment
                             </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
