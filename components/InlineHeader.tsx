"use client";

import Link from "next/link";

export default function InlineHeader() {
  return (
    <header className="bg-background-dark border-x border-t border-gray-800/50 rounded-t-2xl">
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
              href="/login"
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

