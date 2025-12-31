"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeBanner() {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-white">Welcome, {user?.name || "User"}</h2>
      <p className="text-gray-400 mt-2">
        Here is an overview of your pets' health and activities.
      </p>
    </div>
  );
}
