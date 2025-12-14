"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getOwnerByAccessCode, getPatientByAccessCode } from "@/lib/mock-data/patients";

export default function DoctorAccessPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const code = accessCode.trim().toUpperCase();
      const owner = getOwnerByAccessCode(code);
      const patient = getPatientByAccessCode(code);

      if (owner) {
        router.push(`/doctor-access/owner/${owner.id}/select-patient`);
      } else if (patient) {
        router.push(`/doctor-access/patient/${patient.id}`);
      } else {
        setError("Invalid Access ID. Please checks the code and try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            {/* Logo placeholder if needed, using text for now */}
          <h1 className="text-4xl font-bold text-primary font-poppins mb-2">Vetodiag</h1>
          <h2 className="text-2xl font-semibold text-white">Doctor Access Portal</h2>
          <p className="mt-2 text-gray-400">
            Enter a Patient or Owner Access ID to view medical records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-surface-dark p-8 rounded-xl border border-border-dark shadow-xl">
          <div className="space-y-2">
            <label htmlFor="access-code" className="text-sm font-medium text-white">
              Access ID
            </label>
            <div className="relative">
              <input
                id="access-code"
                name="accessCode"
                type="text"
                required
                className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center tracking-widest text-lg font-mono uppercase"
                placeholder="XXX-XXX-XXX"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <span className="absolute right-3 top-3.5 material-icons text-gray-500">
                vpn_key
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
              <span className="material-icons text-sm">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !accessCode.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                 <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                 Verifying...
              </span>
            ) : (
              "Access Records"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
            Are you a Vetodiag Doctor? <a href="#" className="text-primary hover:underline">Log in</a> for full access.
        </p>
      </div>
    </div>
  );
}
