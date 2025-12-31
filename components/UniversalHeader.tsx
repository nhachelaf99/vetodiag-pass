"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const defaultAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function UniversalHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-surface-dark/95 border-b border-border-dark mb-6">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Image
                  src={user?.avatar || defaultAvatar}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-border-dark hover:ring-primary transition-all"
                  unoptimized
                />
                <div className="min-w-0 text-left hidden md:block">
                  <p className="font-semibold text-sm text-white truncate max-w-[150px]" title={user?.name}>
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">
                    {user?.email || ""}
                  </p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-dark border border-border-dark rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Mobile header */}
                  <div className="px-4 py-3 border-b border-border-dark md:hidden">
                    <p className="font-semibold text-sm text-white truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{user?.email || ""}</p>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="material-icons text-lg">person</span>
                    My Profile
                  </Link>

                  {/* Settings Link */}
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="material-icons text-lg">settings</span>
                    Settings
                  </Link>

                  <div className="border-t border-border-dark my-1"></div>

                  {/* Logout Button */}
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
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-0.5rem);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
