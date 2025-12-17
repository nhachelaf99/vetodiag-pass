"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePets, Pet } from "@/contexts/PetsContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { pets: contextPets, loading: petsLoading } = usePets();
  const { user } = useAuth();
  const [localPets, setLocalPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]); // Existing rdvs for availability
  const [loadingClinics, setLoadingClinics] = useState(true);
  
  // Use local pets if context is empty but we found some, otherwise context pets
  const pets = localPets.length > 0 ? localPets : contextPets;

  const [formData, setFormData] = useState({
    patientId: "",
    clinicId: "", // User must select a clinic
    date: new Date().toISOString().split('T')[0], // Default to today
    time: "",
    type: "Consultation",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Clinics
  useEffect(() => {
    const fetchClinics = async () => {
        try {
            const { data, error } = await supabase
                .from('clinique')
                .select('id, name, address');
            
            if (error) throw error;
            if (data) setClinics(data);
        } catch (err) {
            console.error("Error fetching clinics", err);
        } finally {
            setLoadingClinics(false);
        }
    };
    fetchClinics();
  }, []);

  // Fetch Pets
  useEffect(() => {
      const loadPetsFallback = async () => {
          if (contextPets.length === 0 && !petsLoading && user) {
               let cid = user.clinicId; // Still try to get default clinic ID for pets
               if (!cid && user.clientId) {
                    const { data } = await supabase.from('users').select('clinic_id').eq('id', user.clientId).single();
                    if (data) cid = data.clinic_id;
               }

               if (cid) {
                   const { data: petData } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('clinic_id', cid)
                    .order('created_at', { ascending: false });
                   
                   if (petData && petData.length > 0) {
                        const mapped: Pet[] = petData.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            species: p.species_category,
                            breed: p.breed || "",
                            age: "Unknown", 
                            photoUrl: p.photo_url,
                            createdAt: p.created_at,
                            sex: p.sex,
                        }));
                        setLocalPets(mapped);
                   }
               }
          }
      };
      loadPetsFallback();
  }, [contextPets, petsLoading, user]);

  // Fetch Appointments (Availability) when Clinic + Date changes
  useEffect(() => {
      if (!formData.clinicId || !formData.date) return;

      const fetchAvailability = async () => {
          const { data } = await supabase
            .from('rdv')
            .select('time, date')
            .eq('clinic_id', formData.clinicId)
            .eq('date', formData.date); // Filter by selected date
          
          if (data) setAppointments(data);
          else setAppointments([]);
      };
      fetchAvailability();
  }, [formData.clinicId, formData.date]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.patientId || !formData.date || !formData.time || !formData.clinicId) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("rdv")
        .insert([
          {
            clinic_id: formData.clinicId,
            patient_id: formData.patientId,
            date: formData.date,
            time: formData.time,
            type: formData.type,
            owner_service: formData.notes, 
            done: false,
          },
        ]);

      if (insertError) throw insertError;

      setSuccess("Appointment scheduled successfully!");
      // Optionally redirect
      setTimeout(() => router.push("/dashboard/appointments"), 1500);
    } catch (err: any) {
      console.error("Error scheduling appointment:", err);
      setError(err.message || "Failed to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate Time Slots
  const timeSlots = [];
  for (let i = 9; i <= 17; i++) {
      timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  // Determine availability
  const isTimeTaken = (time: string) => {
      // Simple check: does any appointment match this time?
      // Note: DB time might be "10:00:00", we compare prefix
      return appointments.some(app => app.time.startsWith(time));
  };

  if (petsLoading || loadingClinics) {
      return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="font-inter max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Schedule Appointment</h1>
        <p className="text-gray-400 mt-2">
          Find a clinic and book a visit.
        </p>
      </div>

      <div className="bg-surface-dark rounded-lg shadow-lg border border-border-dark p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Selections */}
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Select Pet
                    </label>
                    <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                    >
                    <option value="">-- Choose a pet --</option>
                    {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Select Clinic
                    </label>
                    <select
                    name="clinicId"
                    value={formData.clinicId}
                    onChange={handleChange}
                    className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                    >
                    <option value="">-- Choose a Clinic --</option>
                    {clinics.map((c) => (
                        <option key={c.id} value={c.id}>
                        {c.name} - {c.address}
                        </option>
                    ))}
                    </select>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Service Type
                    </label>
                    <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                    >
                    <option value="Consultation">Consultation</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Notes
                    </label>
                    <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Briefly describe the reason..."
                    className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                    />
                </div>
              </div>

              {/* Right Column: Date & Availability */}
              <div className="space-y-6">
                   <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="block w-full bg-background-dark border border-border-dark rounded-lg shadow-sm placeholder-text-dark-secondary text-white focus:ring-primary focus:border-primary sm:text-sm px-4 py-3"
                        />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-white mb-2">
                            Available Time Slots
                       </label>
                       {!formData.clinicId ? (
                           <div className="text-gray-500 italic text-sm p-4 border border-dashed border-gray-700 rounded-lg">
                               Please select a clinic first.
                           </div>
                       ) : (
                           <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                               {timeSlots.map(time => {
                                   const taken = isTimeTaken(time);
                                   const selected = formData.time === time;
                                   return (
                                       <button
                                            key={time}
                                            type="button"
                                            disabled={taken}
                                            onClick={() => setFormData({...formData, time})}
                                            className={`
                                                px-2 py-2 text-sm rounded-md border transition-all
                                                ${taken 
                                                    ? 'bg-red-900/20 border-red-900/50 text-red-500 cursor-not-allowed opacity-50' 
                                                    : selected
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-background-dark border-gray-700 text-gray-300 hover:border-primary/50'
                                                }
                                            `}
                                       >
                                           {time}
                                           {taken && <span className="block text-[10px] text-red-400">Booked</span>}
                                       </button>
                                   )
                               })}
                           </div>
                       )}
                   </div>
              </div>
          </div>

          <div className="flex justify-end pt-4 gap-3 border-t border-gray-800">
             <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-transparent rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Scheduling..." : "Confirm Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
