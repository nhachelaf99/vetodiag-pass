"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Dog, FileText, Loader2, AlertCircle } from "lucide-react";

interface Pet {
    id: string;
    name: string;
    clinic_id: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
      petId: "",
      date: "",
      time: "",
      type: "Consultation",
      reason: ""
  });

  useEffect(() => {
    async function fetchPets() {
        if (!user?.email) return;
        try {
            // 1. Resolve real Client ID from 'client' table using email
            const { data: clientData, error: clientError } = await supabase
                .from('client')
                .select('id')
                .eq('email', user.email)
                .single();

            if (clientError || !clientData) {
                console.warn("Could not find client record by email, trying Auth ID directly as fallback.");
            }

            const targetOwnerId = clientData?.id || user.clientId;

            // 2. Fetch pets using the resolved owner ID
            const { data, error } = await supabase
                .from('patient')
                .select('id, name, clinic_id')
                .eq('owner_id', targetOwnerId);
            
            if (error) throw error;
            setPets(data || []);
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, petId: data[0].id }));
            }
        } catch (err) {
            console.error("Error fetching pets:", err);
            setError("Failed to load pets. Please try refreshing.");
        } finally {
            setIsLoadingPets(false);
        }
    }
    fetchPets();
  }, [user?.email, user?.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!formData.petId || !formData.date || !formData.time) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
    }

    try {
        const selectedPet = pets.find(p => p.id === formData.petId);
        if (!selectedPet) throw new Error("Selected pet invalid");

        if (!selectedPet.clinic_id) {
            throw new Error(`This pet (${selectedPet.name}) is not linked to a clinic. Cannot book appointment.`);
        }

        const payload = {
            patient_id: formData.petId,
            id_clinique: selectedPet.clinic_id, // Trying 'id_clinique' based on previous file usage
            date: formData.date,
            time: formData.time,
            type: formData.type,
            done: false,
        };
        console.log("Submitting payload:", payload);

        const { error: insertError, data } = await supabase
            .from('rdv')
            .insert(payload)
            .select();

        if (insertError) {
             // Throw object with details to be caught below
             throw { 
                message: insertError.message, 
                details: insertError.details, 
                hint: insertError.hint,
                code: insertError.code 
            };
        }

        console.log("Appointment created:", data);
        router.push("/dashboard/appointments");
    } catch (err: any) {
        console.error("Booking failed detailed:", err);
        const errMsg = err.message || JSON.stringify(err);
        const errDetails = err.details ? ` (${err.details})` : '';
        const errHint = err.hint ? ` Hint: ${err.hint}` : '';
        setError(`Failed: ${errMsg}${errDetails}${errHint}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="font-display max-w-2xl mx-auto p-4 md:p-8 min-h-screen">
       <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard/appointments"
            className="p-2 rounded-lg bg-surface-dark border border-border-dark text-gray-400 hover:text-white transition-colors"
          >
              <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
            <p className="text-gray-400">Schedule a visit for your pet.</p>
          </div>
      </div>

      <div className="bg-[#09090b] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-xl">
        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Pet Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    Select Pet
                </label>
                {isLoadingPets ? (
                    <div className="h-12 w-full bg-gray-800 rounded-xl animate-pulse" />
                ) : pets.length === 0 ? (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                        No pets found. Please <Link href="/dashboard/my-pets/add" className="underline hover:text-white">add a pet</Link> first.
                    </div>
                ) : (
                    <div className="relative">
                        <Dog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <select
                            name="petId"
                            value={formData.petId}
                            onChange={handleChange}
                            className="w-full bg-[#18181b] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
                        >
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>{pet.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                        Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-[#18181b] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                        Time
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full bg-[#18181b] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            {/* Service Type */}
            <div>
                 <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    Service Type
                </label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-[#18181b] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
                    >
                        <option value="Consultation">General Consultation</option>
                        <option value="Checkup">Annual Checkup</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Grooming">Grooming</option>
                    </select>
                </div>
            </div>

            {/* Reason */}
            <div>
                 <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    Additional Notes (Optional)
                </label>
                <textarea
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Describe any symptoms or specific requests..."
                    className="w-full bg-[#18181b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600 resize-none"
                />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={isSubmitting || isLoadingPets || pets.length === 0}
                    className="w-full bg-primary text-black font-bold text-lg py-3 rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Booking...
                        </>
                    ) : (
                        "Confirm Booking"
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
