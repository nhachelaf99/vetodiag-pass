"use client";

import Link from "next/link";
import Image from "next/image";
import { usePets } from "@/contexts/PetsContext";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBu6AruUNZq21FsQqqwnmF070Pqnu7ihYMwirIuuEZfiv8wtRFbZchWWiXyHszCm8tHMPeYrTSmStPYvqwjBIBpoGaCdwl6PcNyovGk8w_imSmtqs3Z6mWjgWrneX3-miLgV4y869OIhPPuvmGeOBTVKPGyMsj944ZYo0cHSjawH-PYizNiE3UmW8NIjQhqqU-qJyOzNCEzzmP9cgKSmJYm3fdlgVsgPcEYj88FoxnO3_wDWIxIK6i6sL2LQsOlGQ2oyfLmlG1cciQ";

export default function MyPetsSection() {
  const { pets } = usePets();
  const displayPets = pets.slice(0, 3); // Show first 3 pets

  return (
    <section className="font-inter">
      <h3 className="text-xl font-semibold mb-4 text-white">My Pets</h3>
      <div className="grid grid-cols-2 gap-6">
        {displayPets.map((pet) => (
          <div
            key={pet.id}
            className="bg-card-dark p-6 rounded-lg border border-border-dark"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={pet.photoUrl || defaultAvatar}
                  alt={`${pet.breed} named ${pet.name}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <h4 className="font-bold text-lg text-white">{pet.name}</h4>
                  <p className="text-sm text-gray-400">
                    {pet.breed}, {pet.age}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  pet.status === "Active"
                    ? "bg-primary/20 text-primary"
                    : "bg-red-900/50 text-red-300"
                }`}
              >
                {pet.status || "Active"}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href={`/dashboard/my-pets/${pet.id}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                View Record
              </Link>
            </div>
          </div>
        ))}
        <Link
          href="/dashboard/my-pets"
          className="flex items-center justify-center bg-card-dark p-6 rounded-lg border-2 border-dashed border-border-dark hover:border-primary transition-colors cursor-pointer"
        >
          <div className="text-center text-gray-400">
            <span className="material-icons text-4xl">add_circle</span>
            <p className="mt-2 font-semibold">Add New Pet</p>
          </div>
        </Link>
      </div>
    </section>
  );
}

