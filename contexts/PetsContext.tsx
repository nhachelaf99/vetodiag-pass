"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  refetchPets: () => void;
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

export function PetsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['pets', user?.clientId],
    queryFn: async () => {
      if (!isAuthenticated || !user?.clientId) return [];

      let currentClinicId = user.clinicId;

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
          return [];
      }

      const { data, error } = await supabase
        .from('patient')
        .select('*')
        .eq('clinic_id', currentClinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        species: p.species_category,
        breed: p.breed || "",
        age: p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()} years` : "Unknown",
        photoUrl: p.photo_url,
        createdAt: p.created_at,
        status: "Active" as const,
        sex: p.sex,
        patientCode: p.patient_code,
      }));
    },
    enabled: !!isAuthenticated && !!user?.clientId,
    staleTime: 5 * 60 * 1000,
  });

  const addPetMutation = useMutation({
    mutationFn: async (petData: Omit<Pet, "id" | "createdAt">) => {
        if (!user?.clientId) throw new Error("No user logged in");

        const { data: userData } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('id', user.clientId)
            .single();
        
        if (!userData?.clinic_id) throw new Error("User has no clinic_id");

        let dob = new Date().toISOString(); 
        const ageMatch = petData.age.match(/(\d+)/);
        if (ageMatch) {
            const years = parseInt(ageMatch[0]);
            const d = new Date();
            d.setFullYear(d.getFullYear() - years);
            dob = d.toISOString();
        }

        const validSpecies = ['dog', 'cat', 'bird', 'reptile', 'rodent', 'other'];
        let speciesCategory = petData.species.toLowerCase();
        if (!validSpecies.includes(speciesCategory)) {
            speciesCategory = 'other';
        }

        const patient_code = `PAT-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

        const newPatient = {
            clinic_id: userData.clinic_id,
            name: petData.name,
            species_category: speciesCategory,
            breed: petData.breed,
            sex: petData.sex || 'male',
            date_of_birth: dob,
            photo_url: petData.photoUrl,
            patient_code: patient_code,
        };

        const { data, error } = await supabase
            .from('patient')
            .insert([newPatient])
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pets', user?.clientId] });
    }
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, petData }: { id: string; petData: Partial<Pet> }) => {
        // Implementation for update would go here
        return { id, ...petData };
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pets', user?.clientId] });
    }
  });

  const deletePetMutation = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from('patient').delete().eq('id', id);
        if (error) throw error;
        return id;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pets', user?.clientId] });
    }
  });

  const addPet = async (petData: Omit<Pet, "id" | "createdAt">) => {
    try {
        await addPetMutation.mutateAsync(petData);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
  };

  const updatePet = (id: string, petData: Partial<Pet>) => {
    updatePetMutation.mutate({ id, petData });
  };

  const deletePet = (id: string) => {
    deletePetMutation.mutate(id);
  };

  const getPetById = (id: string) => {
    return pets.find((pet: Pet) => pet.id === id);
  };

  return (
    <PetsContext.Provider value={{ pets, loading, addPet, getPetById, updatePet, deletePet, refetchPets: refetch }}>
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
