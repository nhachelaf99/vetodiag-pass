"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOwnerById, getPatientsByOwnerId, Owner, Patient } from "@/lib/mock-data/patients";

export default function SelectPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundOwner = getOwnerById(params.id);
      if (foundOwner) {
        setOwner(foundOwner);
        setPatients(getPatientsByOwnerId(foundOwner.id));
      }
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Owner Not Found</h2>
        <Link href="/doctor-access" className="text-primary hover:underline">Return to Search</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark font-poppins">
      <header className="bg-surface-dark border-b border-border-dark py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/doctor-access" className="text-gray-400 hover:text-white transition-colors">
            <span className="material-icons">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Select Patient</h1>
        </div>
        <div className="text-sm text-gray-400">
          Viewing pets of: <span className="text-white font-medium">{owner.name}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link 
              key={patient.id} 
              href={`/doctor-access/patient/${patient.id}`}
              className="bg-surface-dark border border-border-dark rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg group"
            >
              <div className="flex items-center gap-5 mb-4">
                 <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-surface-dark group-hover:border-primary transition-colors">
                    <Image
                      src={patient.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDyt4c5BbRgVrFVjacO5V7NwCgkZNE4MHId8PLtKDOMEXAPP_TaBmiKcYl7kiH_qBJ-6J0u9NiRbmYgL3Co0CFkH9_kL-XFG_HiJzRD1YPtoQHA5iTSaf1mCOtbm2768HG3Wz5M7qcIxeHt2AtDTcdKjqENz3Ad2FbimMoTi4Vb4jTbDgnxS2wlGy0uqePibloKxmb_fu7UONK7uy_w1wlREXAfQJWvjJqOHCmjDbcgPKfzYBnfiL4UvW7eqflEHFoF_dzOOh3urSY"}
                      alt={patient.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{patient.name}</h3>
                    <p className="text-gray-400 text-sm">{patient.species} • {patient.breed}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Age</p>
                  <p className="text-gray-300 font-medium">{patient.age}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Sex</p>
                  <p className="text-gray-300 font-medium">{patient.sex}</p>
                </div>
                 <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Weight</p>
                  <p className="text-gray-300 font-medium">{patient.weight}</p>
                </div>
                <div>
                   <p className="text-gray-500 text-xs uppercase mb-1">Last Visit</p>
                   <p className="text-gray-300 font-medium">{patient.lastVisit || 'N/A'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
