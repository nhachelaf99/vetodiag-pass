"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppointmentsQuery } from "@/hooks/useAppointmentsQuery";
import SkeletonAppointment from "@/components/skeletons/SkeletonAppointment";
import { 
    CalendarPlus, 
    Calendar as CalendarIcon, 
    MapPin, 
    Clock, 
    User, 
    CheckCircle2, 
    Circle,
    ChevronRight,
    Search
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  rawDate: string; // ISO string 2023-10-25
  time: string;
  petName: string;
  service: string;
  doctor: string;
  status: string;
  location: string;
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("Upcoming");
  const { data: appointments = [], isLoading } = useAppointmentsQuery();

  const filteredAppointments = appointments.filter(
    (app) => filter === "All" || app.status === filter
  );

  return (
    <div className="font-display space-y-8 max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <CalendarIcon className="w-8 h-8 text-primary" />
             Appointments
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Manage your schedule and view visit history.
          </p>
        </div>
        
        <Link 
          href="/dashboard/appointments/new"
          className="group flex items-center gap-2 bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <CalendarPlus className="w-5 h-5" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Controls & Statistics */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-1">
        
        {/* Custom Tabs */}
        <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm self-start">
            {['Upcoming', 'Completed', 'All'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        filter === tab
                            ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Search Mockup (Visual fill) */}
        <div className="relative w-full md:w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search appointments..." 
                className="w-full bg-[#09090b] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 hidden lg:block">{filter} Appointments</h2>
            
            {isLoading ? (
                <>
                    <SkeletonAppointment />
                    <SkeletonAppointment />
                    <SkeletonAppointment />
                </>
            ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => (
                    <AppointmentCard key={app.id} appointment={app} />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#09090b] rounded-2xl border border-gray-800 border-dashed">
                    <CalendarIcon className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-400 font-medium">No appointments found.</p>
                    {filter === 'Upcoming' && (
                        <p className="text-sm text-gray-600 mt-1">Book a new appointment to get started.</p>
                    )}
                </div>
            )}
          </div>

          {/* Sidebar / Calendar Widget */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#09090b] rounded-3xl border border-gray-800 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      Calendar
                  </h3>
                  <CalendarWidget appointments={appointments} />
              </div>

              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-primary/20 to-emerald-900/20 rounded-3xl border border-primary/10 p-6">
                  <h4 className="font-bold text-primary mb-2">Did you know?</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                      Regular check-ups can detect health issues early. Schedule a visit for your pet at least once a year.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    const isCompleted = appointment.status === 'Completed';
    const dateObj = new Date(appointment.rawDate);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });

    return (
        <div className="group bg-[#09090b] p-5 rounded-2xl border border-gray-800 hover:border-gray-700 hover:bg-[#0c0c0e] transition-all flex flex-col sm:flex-row items-stretch gap-6 shadow-sm">
            {/* Date Block */}
            <div className={`flex flex-col items-center justify-center p-4 rounded-xl w-full sm:w-20 shrink-0 ${
                isCompleted ? 'bg-gray-900/50 text-gray-500' : 'bg-primary/10 text-primary'
            }`}>
                <span className="text-xs font-bold uppercase tracking-wider">{month}</span>
                <span className="text-2xl font-bold">{day}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white truncate pr-4">
                        {appointment.service}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        isCompleted 
                            ? 'bg-gray-800 text-gray-400 border-gray-700' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                        {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3 fill-current" />}
                        {appointment.status}
                    </span>
                </div>
                
                <p className="text-gray-400 font-medium mb-3 flex items-center gap-2">
                    For <span className="text-white">{appointment.petName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {appointment.time}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded-md">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {appointment.doctor}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {appointment.location}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-800 pt-4 sm:pt-0 sm:pl-6 pl-0 mt-4 sm:mt-0 gap-3 min-w-[100px]">
                {!isCompleted && (
                    <button className="w-full text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                        Reschedule
                    </button>
                )}
                <Link
                    href={`/dashboard/appointments/${appointment.id}`}
                    className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all group-hover:bg-primary group-hover:text-black"
                >
                    Details
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}

function CalendarWidget({ appointments }: { appointments: Appointment[] }) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDay + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    return (
        <div className="w-full select-none">
            <div className="flex justify-between items-center mb-4 text-sm font-bold text-white">
                <span>{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 uppercase mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const isToday = day === today.getDate();
                    // Find appointments for this day
                    const hasApp = day && appointments.some(app => {
                        const d = new Date(app.rawDate);
                        return d.getDate() === day && d.getMonth() === currentMonth;
                    });
                     const hasCompletedApp = day && appointments.some(app => {
                        const d = new Date(app.rawDate);
                        return d.getDate() === day && d.getMonth() === currentMonth && app.status === 'Completed';
                    });


                    return (
                        <div 
                            key={idx} 
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium relative ${
                                day 
                                    ? 'hover:bg-white/5 text-gray-400 cursor-pointer' 
                                    : 'text-transparent'
                            } ${isToday ? 'bg-primary/20 text-primary font-bold' : ''}`}
                        >
                            {day}
                            {hasApp && !hasCompletedApp && (
                                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary shadow-sm shadow-primary" />
                            )}
                             {hasCompletedApp && (
                                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gray-500" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
