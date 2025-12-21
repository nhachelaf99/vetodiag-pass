"use client";

import Link from "next/link";
import Image from "next/image";
import { usePets } from "@/contexts/PetsContext";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDyt4c5BbRgVrFVjacO5V7NwCgkZNE4MHId8PLtKDOMEXAPP_TaBmiKcYl7kiH_qBJ-6J0u9NiRbmYgL3Co0CFkH9_kL-XFG_HiJzRD1YPtoQHA5iTSaf1mCOtbm2768HG3Wz5M7qcIxeHt2AtDTcdKjqENz3Ad2FbimMoTi4Vb4jTbDgnxS2wlGy0uqePibloKxmb_fu7UONK7uy_w1wlREXAfQJWvjJqOHCmjDbcgPKfzYBnfiL4UvW7eqflEHFoF_dzOOh3urSY";

import { useAuth } from "@/contexts/AuthContext";

export default function MyPatientsPage() {
  const { pets } = usePets();
  const { user } = useAuth();
  
  // Use real user data or fallback if loading
  const ownerName = user?.name || "Loading Name...";
  const ownerEmail = "client@vetodiag.com"; // Email not in current context
  const ownerId = user?.clientId || "LOADING-ID";


  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white font-poppins">
            My Patients
          </h1>
          <p className="mt-2 text-lg text-text-dark-secondary font-poppins">
            View and manage your beloved pets' health records.
          </p>
        </div>

        {/* Owner Pass Card */}
        <div className="mb-8 bg-surface-dark rounded-xl shadow-lg border border-border-dark overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons text-9xl text-white">badge</span>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <div className="bg-white p-2 rounded-lg shrink-0">
               {/* QR Code using public API for demo */}
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ownerId}`}
                alt="Owner QR Code"
                width={150}
                height={150}
                className="rounded"
                unoptimized
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2 uppercase tracking-wider">
                Owner Pass
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{ownerName}</h2>
              <p className="text-gray-400 mb-6">{ownerEmail}</p>
              
              <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                <div className="bg-background-dark/50 px-4 py-2 rounded-lg border border-border-dark">
                  <span className="text-xs text-gray-500 block uppercase tracking-wider">Owner ID</span>
                  <p className="text-xl font-mono font-bold text-primary tracking-widest">{ownerId}</p>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(ownerId)}
                  className="p-3 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Copy ID"
                >
                  <span className="material-icons">content_copy</span>
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 max-w-lg">
                Share this ID or QR code with any veterinarian to give them temporary access to all your pets' medical records.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark rounded-lg shadow-lg border border-border-dark">
          <div className="p-6 border-b border-border-dark flex justify-between items-center">
            <h2 className="text-xl font-bold text-white font-poppins">
              Your Registered Pets
            </h2>
            <Link
              href="/dashboard/my-pets"
              className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-base">add</span>
              Add New Patient
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    PATIENT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    SPECIES
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    BREED
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    AGE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {pets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No pets registered yet.{" "}
                      <Link
                        href="/dashboard/my-pets"
                        className="text-primary hover:underline"
                      >
                        Add your first pet
                      </Link>
                    </td>
                  </tr>
                ) : (
                  pets.map((patient) => (
                    <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Image
                            src={patient.photoUrl || defaultAvatar}
                            alt={patient.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                            unoptimized
                          />
                          <span className="text-white font-medium">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {patient.species}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {patient.breed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/my-pets/${patient.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          View Records
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

