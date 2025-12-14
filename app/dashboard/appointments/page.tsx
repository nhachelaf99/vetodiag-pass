"use client";

import { useState } from "react";

// Mock data for appointments
const appointments = [
  {
    id: 1,
    date: "Friday, October 27, 2023",
    time: "9:00 AM",
    petName: "Rocky",
    service: "Wellness Exam",
    doctor: "Dr. Emily Carter",
    status: "Upcoming",
    location: "Main Clinic",
  },
  {
    id: 2,
    date: "Tuesday, November 5, 2023",
    time: "3:30 PM",
    petName: "Milo",
    service: "Grooming Session",
    doctor: "The Grooming Spot",
    status: "Upcoming",
    location: "Annex Building",
  },
  {
    id: 3,
    date: "Monday, November 18, 2023",
    time: "11:00 AM",
    petName: "Daisy",
    service: "Dental Check-up",
    doctor: "Dr. James Rodriguez",
    status: "Upcoming",
    location: "Main Clinic",
  },
  {
    id: 4,
    date: "Wednesday, September 15, 2023",
    time: "2:00 PM",
    petName: "Rocky",
    service: "Vaccination",
    doctor: "Dr. Sarah Smith",
    status: "Completed",
    location: "Main Clinic",
  },
];

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("Upcoming");

  const filteredAppointments = appointments.filter(
    (app) => app.status === filter
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
        <button className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          <span className="material-icons">add</span>
          Schedule New
        </button>
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
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
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
                    {appointment.date.split(" ")[2].replace(",", "")}
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
          </div>
        )}
      </div>
    </div>
  );
}
