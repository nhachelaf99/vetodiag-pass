"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  id: string;
  date: string;
  rawDate: string; // Keep original date string for logic
  time: string;
  petName: string;
  service: string;
  doctor: string;
  status: string;
  location: string;
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("Upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      // We don't strictly need clinicId for filtering if RLS is set up, 
      // but we need to know the user is authenticated and ready.
      if (!user) return;

      let currentClinicId = user.clinicId;

      // Fallback if missing (e.g. reload before context populates fully)
      if (!currentClinicId && user.clientId) {
        const { data } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('id', user.clientId)
            .single();
        if (data) currentClinicId = data.clinic_id;
      }

      if (!currentClinicId) {
          console.error("No clinic ID found for user");
          setLoading(false);
          return;
      }

      try {
        // Rely on RLS to filter by clinic_id/owner access, but also enforce strict filtering for user's pets
        const { data, error } = await supabase
          .from("rdv")
          .select(`
            id,
            date,
            time,
            type,
            status:done,
            patient!inner (name, clinic_id),
            clinique (name, address)
          `)
          .eq('patient.clinic_id', currentClinicId) // Only show appointments for OUR pets
          .order('date', { ascending: true });

        if (error) {
           console.error("Error fetching appointments:", error);
        } else if (data) {
           console.log("Raw Appointments Data:", data);
           const mapped: Appointment[] = data.map((item: any) => {
               const isDone = item.status;
               const status = isDone ? "Completed" : "Upcoming";
               const dateObj = new Date(item.date);
               const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
               
               return {
                   id: item.id,
                   rawDate: item.date,
                   date: dateStr, 
                   time: item.time.substring(0, 5),
                   petName: item.patient?.name || "Unknown Pet",
                   service: item.type || "General",
                   doctor: item.clinique?.name || "Clinic",
                   status: status,
                   location: item.clinique?.address || "Main Clinic"
               };
           });
           setAppointments(mapped);
        }
      } catch (err) {
         console.error("Unexpected error:", err);
      } finally {
         setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const filteredAppointments = appointments.filter(
    (app) => filter === "All" || app.status === filter
  );

  return (
    <div className="font-inter space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="text-gray-400 mt-2">
            Manage your upcoming and past appointments.
          </p>
        </div>
        <Link 
          href="/dashboard/appointments/new"
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <span className="material-icons">add</span>
          Schedule New
        </Link>
      </div>



      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            filter === "Upcoming"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setFilter("Upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            filter === "Completed"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setFilter("Completed")}
        >
          Past
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            filter === "All"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setFilter("All")}
        >
          All
        </button>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-12 text-gray-400">Loading appointments...</div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-card-dark p-6 rounded-lg border border-border-dark hover:border-primary/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center flex-col text-primary">
                  <span className="text-xs font-bold uppercase">
                    {appointment.date.split(",")[0].substring(0, 3)}
                  </span>
                  <span className="text-xl font-bold">
                    {appointment.date.split(",")[1]?.trim().split(" ")[1] || "01"}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {appointment.service} for {appointment.petName}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-base">schedule</span>
                      {appointment.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-base">person</span>
                      {appointment.doctor}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-base">place</span>
                      {appointment.location}
                    </span>
                     <span className="text-xs text-gray-500">
                      ({appointment.status})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  Reschedule
                </button>
                <button className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card-dark rounded-lg border border-border-dark border-dashed">
            <span className="material-icons text-4xl text-gray-600 mb-2">
              event_busy
            </span>
            <p className="text-gray-400">No {filter.toLowerCase()} appointments found.</p>
             {appointments.length === 0 && (
                <p className="text-xs text-red-400 mt-2">Zero appointments fetched from DB.</p>
            )}
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Calendar</h2>
        <div className="bg-surface-dark rounded-xl shadow-lg border border-border-dark p-6">
           <CalendarView appointments={appointments} />
        </div>
      </div>
    </div>
  );
}

function CalendarView({ appointments }: { appointments: Appointment[] }) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

    const days = [];
    // Padding for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="w-full">
            <div className="mb-4 text-white font-bold text-lg">
                {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-medium">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    if (day === null) return <div key={idx} className="h-24 md:h-32 bg-transparent"></div>;

                    // Check for appointments on this day
                    const dayAppointments = appointments.filter(app => {
                        const appDate = new Date(app.rawDate); // Use rawDate
                        return appDate.getDate() === day && 
                               appDate.getMonth() === currentMonth && 
                               appDate.getFullYear() === currentYear;
                    });

                    const isToday = day === today.getDate();

                    return (
                        <div key={idx} className={`h-24 md:h-32 bg-background-dark border border-gray-700 rounded-lg p-2 ${isToday ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-white/5 transition-colors'}`}>
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : 'text-gray-300'}`}>{day}</div>
                            <div className="space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)] scrollbar-hide">
                                {dayAppointments.map(app => (
                                    <div key={app.id} className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded truncate" title={`${app.time} - ${app.petName}`}>
                                        {app.time} {app.petName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
