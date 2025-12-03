"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  photoUrl?: string;
  createdAt: string;
  status?: "Active" | "Inactive";
}

interface PetsContextType {
  pets: Pet[];
  addPet: (petData: Omit<Pet, "id" | "createdAt">) => void;
  getPetById: (id: string) => Pet | undefined;
  updatePet: (id: string, petData: Partial<Pet>) => void;
  deletePet: (id: string) => void;
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

const STORAGE_KEY = "vetodiag-pets";

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);

  // Load pets from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedPets = JSON.parse(stored);
          setPets(parsedPets);
        } catch (error) {
          console.error("Error loading pets from localStorage:", error);
        }
      }
    }
  }, []);

  // Save pets to localStorage whenever pets change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
  }, [pets]);

  const addPet = (petData: Omit<Pet, "id" | "createdAt">) => {
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: petData.status || "Active",
    };
    setPets((prev) => [...prev, newPet]);
    return newPet;
  };

  const getPetById = (id: string) => {
    return pets.find((pet) => pet.id === id);
  };

  const updatePet = (id: string, petData: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? { ...pet, ...petData } : pet))
    );
  };

  const deletePet = (id: string) => {
    setPets((prev) => prev.filter((pet) => pet.id !== id));
  };

  return (
    <PetsContext.Provider value={{ pets, addPet, getPetById, updatePet, deletePet }}>
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

