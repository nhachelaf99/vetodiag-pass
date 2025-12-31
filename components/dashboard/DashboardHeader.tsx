"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const userAvatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="flex justify-between items-center mb-8 font-inter">
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome, {user?.name || "User"}</h2>
        <p className="text-gray-400">
          Here is an overview of your pets' health and activities.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors focus:outline-none"
          >
            <Image
              src={user?.avatar || userAvatarUrl}
              alt="User avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
              unoptimized
            />
            <div className="min-w-0 text-left hidden md:block">
              <p className="font-semibold text-sm text-white truncate max-w-[150px]" title={user?.name}>{user?.name || "User"}</p>
            </div>
            <span className="material-icons text-gray-400">expand_more</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-dark border border-border-dark rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border-dark md:hidden">
                <p className="font-semibold text-sm text-white truncate">{user?.name || "User"}</p>
              </div>
              
              <Link 
                href="/dashboard/profile" 
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span className="material-icons text-lg">person</span>
                My Profile
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span className="material-icons text-lg">settings</span>
                Settings
              </Link>
              
              <div className="border-t border-border-dark my-1"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
              >
                <span className="material-icons text-lg">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

