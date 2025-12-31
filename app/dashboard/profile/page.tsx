"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import SkeletonProfile from "@/components/skeletons/SkeletonProfile";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profileData, isLoading } = useProfileQuery();

  if (isLoading || !user) {
    return <SkeletonProfile />;
  }

  // Merge AuthContext user with fresh profile data
  const displayUser = {
    ...user,
    name: profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : user.name,
    email: profileData?.email || user.email,
    clinicId: profileData?.clinic_id || user.clinicId,
    clinicName: profileData?.clinic_name || user.clinicName,
    userCode: profileData?.user_code || user.userCode,
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-surface-dark rounded-xl shadow-lg border border-border-dark overflow-hidden">
        {/* Header / Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          <div className="absolute -bottom-12 left-8">
            <Image
              src={displayUser.avatar || defaultAvatar}
              alt="Profile"
              width={96}
              height={96}
              className="rounded-full border-4 border-surface-dark bg-surface-dark object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{displayUser.name || "User Name"}</h1>
              <p className="text-gray-400">{displayUser.email || "user@example.com"}</p>
            </div>
            <Link
              href="/dashboard/profile/edit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/50 hover:scale-105"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-border-dark pb-2">
                Personal Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <p className="text-lg text-white mt-1">{displayUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <p className="text-lg text-white mt-1">{displayUser.email}</p>
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
                  {displayUser.userCode || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Clinic ID
                </label>
                <p className="text-lg font-mono text-text-dark-secondary mt-1 tracking-wide">
                  {displayUser.clinicId || "N/A"}
                </p>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Clinic Name
                </label>
                <p className="text-lg text-white mt-1">
                  {displayUser.clinicName || "Personal Clinic"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
