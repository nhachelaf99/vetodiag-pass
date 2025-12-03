"use client";

import Link from "next/link";
import Image from "next/image";
import { usePets } from "@/contexts/PetsContext";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDyt4c5BbRgVrFVjacO5V7NwCgkZNE4MHId8PLtKDOMEXAPP_TaBmiKcYl7kiH_qBJ-6J0u9NiRbmYgL3Co0CFkH9_kL-XFG_HiJzRD1YPtoQHA5iTSaf1mCOtbm2768HG3Wz5M7qcIxeHt2AtDTcdKjqENz3Ad2FbimMoTi4Vb4jTbDgnxS2wlGy0uqePibloKxmb_fu7UONK7uy_w1wlREXAfQJWvjJqOHCmjDbcgPKfzYBnfiL4UvW7eqflEHFoF_dzOOh3urSY";

export default function MyPatientsPage() {
  const { pets } = usePets();
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

