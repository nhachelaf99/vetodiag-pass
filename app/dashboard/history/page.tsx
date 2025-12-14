"use client";

import { useState } from "react";

// Mock data for history
const historyItems = [
  {
    id: 1,
    type: "Medical Record",
    title: "Vaccination Record Updated",
    description: "Rabies booster administered to Rocky.",
    date: "5 days ago",
    doctor: "Dr. Emily Carter",
    icon: "vaccines",
    pet: "Rocky",
  },
  {
    id: 2,
    type: "Appointment",
    title: "Surgery Completed",
    description: "Neutering surgery for Milo was successful.",
    date: "2 weeks ago",
    doctor: "Dr. James Rodriguez",
    icon: "healing",
    pet: "Milo",
  },
  {
    id: 3,
    type: "Lab Result",
    title: "Blood Work Results Available",
    description: "Annual wellness panel results for Daisy.",
    date: "1 month ago",
    doctor: "Lab Corp",
    icon: "science",
    pet: "Daisy",
  },
  {
    id: 4,
    type: "Invoice",
    title: "Payment Processed",
    description: "Invoice #12345 for Wellness Exam paid.",
    date: "1 month ago",
    doctor: "Billing Dept",
    icon: "receipt",
    pet: "Rocky",
  },
];

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("All");

  const filteredHistory =
    filterType === "All"
      ? historyItems
      : historyItems.filter((item) => item.type === filterType);

  const filters = ["All", "Medical Record", "Appointment", "Lab Result", "Invoice"];

  return (
    <div className="font-inter space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">History</h1>
        <p className="text-gray-400 mt-2">
          View your pet's medical history and past activities.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterType === f
                ? "bg-primary text-white"
                : "bg-card-dark text-gray-400 hover:bg-gray-800 hover:text-white border border-border-dark"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-card-dark p-6 rounded-lg border border-border-dark hover:border-gray-600 transition-colors flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-primary">{item.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded">
                    <span className="material-icons text-xs">pets</span>
                    {item.pet}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-xs">person</span>
                    {item.doctor}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-xs">category</span>
                    {item.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card-dark rounded-lg border border-border-dark border-dashed">
            <span className="material-icons text-4xl text-gray-600 mb-2">
              history_toggle_off
            </span>
            <p className="text-gray-400">No history found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
