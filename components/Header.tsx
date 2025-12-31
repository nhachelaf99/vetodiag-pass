"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function Header() {
  const pathname = usePathname();
  const isMyPetsActive = pathname === "/dashboard/my-pets" || pathname.startsWith("/dashboard/my-pets");
  const isHomePage = pathname === "/";
  const { isAuthenticated, user } = useAuth();

  // Home page header (landing page)
  if (isHomePage) {
    return (
      <header className="bg-background-dark border-x border-t border-gray-800/50 rounded-t-2xl sticky top-0 z-[100] backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">VetoDiag</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="#about"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="#services"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="#contact"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="hidden md:block text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated header (for other pages when logged in)
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-background-dark/80 border-b border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
              <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold">
                V
              </span>
              <span className="text-text-dark-primary">VetoDiag</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-primary"
                    : "text-text-dark-secondary hover:text-primary"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/my-pets"
                className={`text-sm font-medium transition-colors ${
                  isMyPetsActive
                    ? "text-primary"
                    : "text-text-dark-secondary hover:text-primary"
                }`}
              >
                My Pets
              </Link>
              <Link
                href="/dashboard/appointments"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard/appointments" || pathname.startsWith("/dashboard/appointments")
                    ? "text-primary"
                    : "text-text-dark-secondary hover:text-primary"
                }`}
              >
                Appointments
              </Link>
              <Link
                href="/dashboard/results"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard/results" || pathname.startsWith("/dashboard/results")
                    ? "text-primary"
                    : "text-text-dark-secondary hover:text-primary"
                }`}
              >
                Results
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <Image
                    src={user?.avatar || defaultAvatar}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm font-medium text-text-dark-primary">
                      {user?.name || ""}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
