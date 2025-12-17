"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-surface-dark rounded-xl shadow-lg border border-border-dark overflow-hidden">
        {/* Header / Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          <div className="absolute -bottom-12 left-8">
            <Image
              src={user?.avatar || defaultAvatar}
              alt="Profile"
              width={96}
              height={96}
              className="rounded-full border-4 border-surface-dark bg-surface-dark object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <h1 className="text-3xl font-bold text-white mb-1">{user?.name || "User Name"}</h1>
          <p className="text-gray-400 mb-6">{user?.email || "user@example.com"}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-border-dark pb-2">
                Personal Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <p className="text-lg text-white mt-1">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <p className="text-lg text-white mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-border-dark pb-2">
                Account Details
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </label>
                <p className="text-lg font-mono text-primary mt-1 tracking-wide">
                  {user?.userCode || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Clinic ID
                </label>
                <p className="text-lg font-mono text-text-dark-secondary mt-1 tracking-wide">
                  {user?.clinicId || "N/A"}
                </p>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Clinic Name
                </label>
                <p className="text-lg text-white mt-1">
                  {user?.clinicName || "Personal Clinic"}
                </p>
              </div>
            </div>
          </div>
          
           <div className="mt-10 flex justify-end">
              <button 
                className="bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 px-6 rounded-lg transition-colors"
                disabled
              >
                Edit Profile (Coming Soon)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
