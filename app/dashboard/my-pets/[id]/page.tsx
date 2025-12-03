"use client";

import { useState } from "react";
import Link from "next/link";

const medicalHistory = [
  {
    id: 1,
    title: "Dental Cleaning",
    date: "Jan 15, 2024",
    description:
      "Routine dental cleaning and check-up. Mild tartar buildup noted. All clear otherwise.",
    icon: "dentistry",
  },
  {
    id: 2,
    title: "Follow-up: Skin Allergy",
    date: "Oct 20, 2023",
    description:
      "Prescription for Apoquel refilled. Skin condition has improved significantly.",
    icon: "science",
  },
  {
    id: 3,
    title: "Annual Check-up & Wellness Exam",
    date: "May 05, 2023",
    description:
      "Overall health is excellent. Vaccinations administered. Discussed diet and exercise.",
    icon: "stethoscope",
  },
];

const vaccinations = [
  {
    name: "Rabies",
    nextDue: "May 05, 2026",
    status: "Up-to-date",
    statusColor: "bg-green-500/20 text-green-300",
  },
  {
    name: "DHPP",
    nextDue: "May 05, 2024",
    status: "Due Soon",
    statusColor: "bg-amber-500/20 text-amber-300",
  },
  {
    name: "Bordetella",
    nextDue: "Nov 05, 2023",
    status: "Overdue",
    statusColor: "bg-red-500/20 text-red-300",
  },
];

const externalResults = [
  {
    id: 1,
    title: "Blood Panel - Central Vet Clinic",
    date: "July 22, 2023",
  },
  {
    id: 2,
    title: "X-Ray - Emergency Animal Hospital",
    date: "March 12, 2023",
  },
];

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("medical-history");

  const petData = {
    name: "Milo",
    species: "Canine",
    breed: "Golden Retriever",
    age: "5 years",
    weight: "72 lbs",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyt4c5BbRgVrFVjacO5V7NwCgkZNE4MHId8PLtKDOMEXAPP_TaBmiKcYl7kiH_qBJ-6J0u9NiRbmYgL3Co0CFkH9_kL-XFG_HiJzRD1YPtoQHA5iTSaf1mCOtbm2768HG3Wz5M7qcIxeHt2AtDTcdKjqENz3Ad2FbimMoTi4Vb4jTbDgnxS2wlGy0uqePibloKxmb_fu7UONK7uy_w1wlREXAfQJWvjJqOHCmjDbcgPKfzYBnfiL4UvW7eqflEHFoF_dzOOh3urSY",
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark font-display text-text-primary-dark">
      <aside className="flex flex-col w-64 bg-surface-dark p-4 shrink-0">
        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLuVT5CoIegkA7tfmXMNSHbEo9TgrY6usaaTU5KY2p9l_L9idpefoavvA7OPMqFWMrmfbQ-o33DomnMDYbAM9diG1v_shaFJ7nlwc-R5ILF3BruJufelxsWmN0re55OYm9xUqXSQBb9pfZJCRQDrjyhsNWukjfjPHIpnmQ_rg2fCvj32EzfQJukCy38_LIHf927qM0saLFEW6KpKu-XRWd4foSiqyymaXg3Vu6OkvJtIDGMET3tAUDbhFEJ3Uxa5pyX4j1HJ1svu4")',
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-text-primary-dark text-base font-medium leading-normal">
                Jane Doe
              </h1>
              <p className="text-text-secondary-dark text-sm font-normal leading-normal">
                jane.doe@email.com
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary-dark hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link
              href="/dashboard/my-pets/patients"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-text-primary-dark"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pets
              </span>
              <p className="text-sm font-medium leading-normal">My Pets</p>
            </Link>
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary-dark hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              <p className="text-sm font-medium leading-normal">Appointments</p>
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary-dark hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">credit_card</span>
              <p className="text-sm font-medium leading-normal">Billing</p>
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary-dark hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </Link>
          <Link
            href="/dashboard/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary-dark hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">help</span>
            <p className="text-sm font-medium leading-normal">Help</p>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex p-4 border-b border-border-dark pb-8">
            <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-center">
              <div className="flex gap-6 items-center">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 shrink-0"
                  style={{ backgroundImage: `url("${petData.avatar}")` }}
                />
                <div className="flex flex-col justify-center">
                  <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
                    {petData.name}
                  </h2>
                  <p className="text-base font-normal leading-normal mt-1 text-gray-400">
                    Species: {petData.species}, Breed: {petData.breed}, Age: {petData.age}
                  </p>
                  <p className="text-base font-normal leading-normal text-gray-400">
                    Weight: {petData.weight}
                  </p>
                </div>
              </div>
              <div className="flex w-full max-w-[480px] gap-3 md:w-auto">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 md:flex-auto border border-border-dark hover:bg-white/10 transition-colors">
                  <span className="truncate">Edit Profile</span>
                </button>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent-green text-black text-sm font-bold leading-normal tracking-[0.015em] flex-1 md:flex-auto hover:bg-opacity-80 transition-opacity">
                  <span className="truncate">Download Records</span>
                </button>
              </div>
            </div>
          </header>

          <div className="mt-8">
            <div className="flex border-b border-border-dark px-4 gap-8">
              <button
                onClick={() => setActiveTab("medical-history")}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                  activeTab === "medical-history"
                    ? "border-b-accent-green text-white"
                    : "border-b-transparent text-gray-400 hover:border-b-border-dark hover:text-white"
                }`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                  Medical History
                </p>
              </button>
              <button
                onClick={() => setActiveTab("vaccinations")}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                  activeTab === "vaccinations"
                    ? "border-b-accent-green text-white"
                    : "border-b-transparent text-gray-400 hover:border-b-border-dark hover:text-white"
                }`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                  Vaccinations
                </p>
              </button>
              <button
                onClick={() => setActiveTab("external-results")}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                  activeTab === "external-results"
                    ? "border-b-accent-green text-white"
                    : "border-b-transparent text-gray-400 hover:border-b-border-dark hover:text-white"
                }`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                  External Results
                </p>
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {activeTab === "medical-history" && (
                <>
                  <h3 className="text-xl font-bold text-white px-4 mb-4">
                    Medical History
                  </h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 px-4">
                    {medicalHistory.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex flex-col items-center gap-1 pt-3">
                          <div className="flex items-center justify-center size-10 rounded-full bg-surface-dark border border-border-dark">
                            <span className="material-symbols-outlined text-accent-green">
                              {item.icon}
                            </span>
                          </div>
                          {index < medicalHistory.length - 1 && (
                            <div className="w-[2px] bg-border-dark h-full" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col py-3 pb-8">
                          <p className="text-white text-base font-medium leading-normal">
                            {item.title}
                          </p>
                          <p className="text-gray-400 text-sm font-normal leading-normal">
                            {item.date}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-8">
              {activeTab === "vaccinations" && (
                <div>
                  <h3 className="text-xl font-bold text-white px-4 mb-4">Vaccinations</h3>
                  <div className="px-4">
                    <div className="overflow-hidden rounded-lg border border-border-dark bg-surface-dark">
                      <table className="w-full text-left">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-4 py-3 text-white text-sm font-medium leading-normal">
                              Vaccine
                            </th>
                            <th className="px-4 py-3 text-white text-sm font-medium leading-normal">
                              Next Due
                            </th>
                            <th className="px-4 py-3 text-white text-sm font-medium leading-normal text-center">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaccinations.map((vaccine, index) => (
                            <tr
                              key={vaccine.name}
                              className={index > 0 ? "border-t border-t-border-dark" : ""}
                            >
                              <td className="h-[64px] px-4 py-2 text-white text-sm font-normal leading-normal">
                                {vaccine.name}
                              </td>
                              <td className="h-[64px] px-4 py-2 text-gray-400 text-sm font-normal leading-normal">
                                {vaccine.nextDue}
                              </td>
                              <td className="h-[64px] px-4 py-2 text-sm font-normal leading-normal">
                                <div className="flex justify-center">
                                  <span
                                    className={`truncate inline-flex items-center justify-center rounded-full h-7 px-3 ${vaccine.statusColor} text-xs font-medium`}
                                  >
                                    {vaccine.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "external-results" && (
                <div>
                  <h3 className="text-xl font-bold text-white px-4 mb-4">
                    External Results
                  </h3>
                  <div className="flex flex-col gap-3 px-4">
                    {externalResults.map((result) => (
                      <div
                        key={result.id}
                        className="rounded-lg border border-border-dark bg-surface-dark overflow-hidden"
                      >
                        <button className="w-full flex justify-between items-center p-4 text-left">
                          <div className="flex flex-col">
                            <p className="text-white font-medium">{result.title}</p>
                            <p className="text-sm text-gray-400">{result.date}</p>
                          </div>
                          <span className="material-symbols-outlined text-white transition-transform">
                            expand_more
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

