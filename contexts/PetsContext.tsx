"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  photoUrl?: string;
  createdAt: string;
  status?: "Active" | "Inactive";
  sex?: "male" | "female";
  patientCode?: string;
}

interface PetsContextType {
  pets: Pet[];
  addPet: (petData: Omit<Pet, "id" | "createdAt">) => Promise<boolean>;
  getPetById: (id: string) => Pet | undefined;
  updatePet: (id: string, petData: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  loading: boolean;
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Load pets from Supabase on mount or authentication change
  useEffect(() => {
    const fetchPets = async () => {
      if (!isAuthenticated || !user) {
        setPets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let currentClinicId = user.clinicId;

        // Fallback: If clinicId is missing in context, fetch from DB
        if (!currentClinicId) {
            const { data: userData } = await supabase
                .from('users')
                .select('clinic_id')
                .eq('id', user.clientId)
                .single();
            
            if (userData?.clinic_id) {
                currentClinicId = userData.clinic_id;
            }
        }

        if (!currentClinicId) {
            console.log("No clinic ID found for user, showing empty pets list.");
            setPets([]);
            setLoading(false);
            return;
        }

        // Fetch pets ONLY for this clinic
        const { data, error } = await supabase
          .from('patient')
          .select('*')
          .eq('clinic_id', currentClinicId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching pets:", error);
        } else if (data) {
          // Map DB patient to frontend Pet
          const mappedPets: Pet[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            species: p.species_category,
            breed: p.breed || "",
            // Calculate age from DOB roughly
            age: p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} years` : "Unknown",
            photoUrl: p.photo_url,
            createdAt: p.created_at,
            status: "Active", // Default
            sex: p.sex,
          }));
          setPets(mappedPets);
        }
      } catch (err) {
        console.error("Unexpected error fetching pets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [isAuthenticated, user]);

  const addPet = async (petData: Omit<Pet, "id" | "createdAt">): Promise<boolean> => {
    if (!user) {
        console.error("No user logged in");
        return false;
    }

    try {
      // 1. Get user's clinic_id from public.users
      // (This is needed because we need to insert it)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.clientId)
        .single();
      
      if (userError || !userData?.clinic_id) {
          console.error("User has no clinic_id, cannot add pet", userError);
          // Fallback: This user might be legacy. We might need to auto-create clinic here 
          // but that's complex logic for this context. 
          // Ideally they should re-register.
          return false;
      }

      // 2. Map frontend data to DB data
      // Approximate DOB from "age" string (e.g. "5 years" -> 2020-01-01)
      let dob = new Date().toISOString(); 
      const ageMatch = petData.age.match(/(\d+)/);
      if (ageMatch) {
          const years = parseInt(ageMatch[0]);
          const d = new Date();
          d.setFullYear(d.getFullYear() - years);
          dob = d.toISOString();
      }

      // Map species to enum
      const validSpecies = ['dog', 'cat', 'bird', 'reptile', 'rodent', 'other'];
      let speciesCategory = petData.species.toLowerCase();
      if (!validSpecies.includes(speciesCategory)) {
          speciesCategory = 'other';
      }

      // Generate readable patient code PAT-XXX-XXX
      const generatePatientCode = () => {
          const randomPart1 = Math.floor(100 + Math.random() * 900);
          const randomPart2 = Math.floor(100 + Math.random() * 900);
          return `PAT-${randomPart1}-${randomPart2}`;
      };
      const patient_code = generatePatientCode();

      const newPatient = {
          clinic_id: userData.clinic_id,
          name: petData.name,
          species_category: speciesCategory,
          breed: petData.breed,
          sex: petData.sex || 'male', // Default if missing
          date_of_birth: dob,
          photo_url: petData.photoUrl,
          patient_code: patient_code,
          // owner_id: null // Implicitly null
      };

      const { data, error } = await supabase
        .from('patient')
        .insert([newPatient])
        .select()
        .single();

      if (error) {
        console.error("Error adding pet to DB:", error);
        return false;
      }

      if (data) {
        const newPet: Pet = {
            id: data.id,
            name: data.name,
            species: data.species_category,
            breed: data.breed || "",
            age: petData.age,
            photoUrl: data.photo_url,
            createdAt: data.created_at,
            status: "Active",
            sex: data.sex,
            patientCode: data.patient_code,
        };
        setPets((prev) => [newPet, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
        console.error("Unexpected error adding pet:", err);
        return false;
    }
  };

  const getPetById = (id: string) => {
    return pets.find((pet) => pet.id === id);
  };

  const updatePet = (id: string, petData: Partial<Pet>) => {
    // TODO: Implement Supabase update
    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? { ...pet, ...petData } : pet))
    );
  };

  const deletePet = async (id: string) => {
     try {
         const { error } = await supabase.from('patient').delete().eq('id', id);
         if (error) {
             console.error("Error deleting pet:", error);
         } else {
             setPets((prev) => prev.filter((pet) => pet.id !== id));
         }
     } catch (err) {
         console.error("Unexpected error deleting pet:", err);
     }
  };

  return (
    <PetsContext.Provider value={{ pets, loading, addPet, getPetById, updatePet, deletePet }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetsContext);
  if (context === undefined) {
    throw new Error("usePets must be used within a PetsProvider");
  }
  return context;
}

