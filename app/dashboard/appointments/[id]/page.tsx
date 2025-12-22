"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface AppointmentDetail {
  id: string;
  date: string;
  time: string;
  type: string;
  status: boolean;
  notes?: string;
  patient: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    age?: number;
  };
  clinique: {
    name: string;
    address?: string;
    phone?: string;
  };
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      if (!params.id) {
        console.log("❌ Missing appointment ID");
        setError("No appointment ID provided");
        setLoading(false);
        return;
      }

      if (!user) {
        console.log("❌ User not loaded yet");
        setLoading(false);
        return;
      }

      console.log("🔍 Starting appointment fetch...");
      console.log("📋 Appointment ID:", params.id);
      console.log("👤 User:", {
        clientId: user.clientId,
        clinicId: user.clinicId,
        name: user.name
      });

      try {
        // Check current user session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log("🔐 Auth User:", authUser?.id);

        // Try a simple query first to test access
        console.log("🧪 Testing basic rdv table access...");
        const { data: testData, error: testError } = await supabase
          .from("rdv")
          .select("id")
          .limit(1);
        
        if (testError) {
          console.error("❌ Cannot access rdv table:", testError);
          setError(`Database access error: ${testError.message || 'RLS policy may be blocking access'}`);
          setLoading(false);
          return;
        }
        console.log("✅ Can access rdv table, found records:", testData?.length || 0);

        // Now try to fetch the specific appointment
        console.log("🔍 Fetching appointment with ID:", params.id);
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("rdv")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (appointmentError) {
          console.error("❌ Error fetching appointment:", {
            message: appointmentError.message,
            details: appointmentError.details,
            hint: appointmentError.hint,
            code: appointmentError.code,
            fullError: appointmentError
          });
          setError(`Failed to load appointment: ${appointmentError.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (!appointmentData) {
          console.error("❌ No appointment found with ID:", params.id);
          setError("Appointment not found");
          setLoading(false);
          return;
        }

        console.log("✅ Appointment data:", appointmentData);

        // Fetch patient details (may fail due to RLS)
        console.log("🔍 Fetching patient with ID:", appointmentData.id_patient);
        const { data: patientData, error: patientError } = await supabase
          .from("patient")
          .select("id, name, species, breed, age, clinic_id")
          .eq("id", appointmentData.id_patient)
          .maybeSingle();

        if (patientError) {
          console.warn("⚠️ Could not fetch patient (RLS may be blocking):", {
            message: patientError.message,
            code: patientError.code,
            hint: patientError.hint
          });
          console.log("ℹ️ Continuing without patient details...");
        } else if (patientData) {
          console.log("✅ Patient data:", patientData);
        } else {
          console.log("ℹ️ No patient data found");
        }

        // Verify this appointment belongs to user's clinic (skip if patient data unavailable)
        // Note: RLS policies should handle access control at the database level
        if (patientData && user.clinicId && patientData.clinic_id !== user.clinicId) {
          console.error("❌ Permission denied: clinic mismatch", {
            patientClinic: patientData.clinic_id,
            userClinic: user.clinicId
          });
          setError("You don't have permission to view this appointment");
          setLoading(false);
          return;
        }

        // Fetch clinic details (may fail due to RLS)
        console.log("🔍 Fetching clinic with ID:", appointmentData.id_clinique);
        const { data: clinicData, error: clinicError } = await supabase
          .from("clinique")
          .select("name, address, telephone")
          .eq("id", appointmentData.id_clinique)
          .maybeSingle();

        if (clinicError) {
          console.warn("⚠️ Could not fetch clinic (RLS may be blocking):", {
            message: clinicError.message,
            code: clinicError.code,
            hint: clinicError.hint
          });
          console.log("ℹ️ Continuing without clinic details...");
        } else if (clinicData) {
          console.log("✅ Clinic data:", clinicData);
        } else {
          console.log("ℹ️ No clinic data found");
        }

        console.log("✅ Setting appointment state...");
        setAppointment({
          id: appointmentData.id,
          date: appointmentData.date,
          time: appointmentData.time,
          type: appointmentData.type,
          status: appointmentData.done,
          notes: appointmentData.notes,
          patient: {
            id: patientData?.id || "",
            name: patientData?.name || "Unknown Pet",
            species: patientData?.species,
            breed: patientData?.breed,
            age: patientData?.age,
          },
          clinique: {
            name: clinicData?.name || "Unknown Clinic",
            address: clinicData?.address,
            phone: clinicData?.telephone,
          },
        });
        console.log("✅ Appointment loaded successfully!");
      } catch (err: any) {
        console.error("❌ Unexpected error:", err);
        console.error("Error stack:", err.stack);
        setError(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetail();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
          <span className="material-icons text-4xl text-red-400 mb-2">error</span>
          <p className="text-red-400 text-lg mb-4">{error || "Appointment not found"}</p>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/appointments"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-icons text-gray-400">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Appointment Details</h1>
            <p className="text-gray-400 mt-1">View your appointment information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <span className="material-icons text-base">edit</span>
            Reschedule
          </button>
          <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2">
            <span className="material-icons text-base">cancel</span>
            Cancel
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            appointment.status
              ? "bg-green-500/20 text-green-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {appointment.status ? "Completed" : "Upcoming"}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info Card */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-primary">event</span>
              Appointment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Date
                </label>
                <p className="text-lg text-white">{formattedDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Time
                </label>
                <p className="text-lg text-white">{appointment.time}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Service Type
                </label>
                <p className="text-lg text-white">{appointment.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Appointment ID
                </label>
                <p className="text-lg font-mono text-primary">{appointment.id.substring(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Pet Info Card */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-primary">pets</span>
              Pet Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Pet Name
                </label>
                <p className="text-lg text-white">{appointment.patient.name}</p>
              </div>
              {appointment.patient.species && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Species
                  </label>
                  <p className="text-lg text-white">{appointment.patient.species}</p>
                </div>
              )}
              {appointment.patient.breed && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Breed
                  </label>
                  <p className="text-lg text-white">{appointment.patient.breed}</p>
                </div>
              )}
              {appointment.patient.age && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Age
                  </label>
                  <p className="text-lg text-white">{appointment.patient.age} years</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          {appointment.notes && (
            <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-icons text-primary">note</span>
                Notes
              </h2>
              <p className="text-gray-300 leading-relaxed">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Clinic Info */}
        <div className="space-y-6">
          {/* Clinic Info Card */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-primary">local_hospital</span>
              Clinic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Clinic Name
                </label>
                <p className="text-lg text-white">{appointment.clinique.name}</p>
              </div>
              {appointment.clinique.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Address
                  </label>
                  <p className="text-white">{appointment.clinique.address}</p>
                </div>
              )}
              {appointment.clinique.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <p className="text-white">{appointment.clinique.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/dashboard/my-pets/${appointment.patient.id}`}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-icons text-primary">pets</span>
                <span className="text-white">View Pet Profile</span>
              </Link>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <span className="material-icons text-primary">print</span>
                <span className="text-white">Print Details</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <span className="material-icons text-primary">share</span>
                <span className="text-white">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
