"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VetoDiagLogoIcon from "@/components/icons/VetoDiagLogoIcon";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Simulate signup
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // For now, just redirect to login
      router.push("/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-dark font-poppins text-gray-200 antialiased">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary/20 p-2 rounded-full">
              <VetoDiagLogoIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white font-poppins">
              VetoDiag
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-white font-poppins">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400 font-poppins">
            Join us to manage your pet's health.
          </p>
        </div>
        <div className="bg-[#181C1A] p-8 rounded-lg">
          <form action="#" className="space-y-6" method="POST" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-1 font-poppins"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary bg-[#0A0F0D] text-white font-poppins"
                  id="name"
                  name="name"
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-1 font-poppins"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="mt-1">
                <input
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary bg-[#0A0F0D] text-white font-poppins"
                  id="email"
                  name="email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-1 font-poppins"
                htmlFor="password"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary bg-[#0A0F0D] text-white font-poppins"
                  id="password"
                  name="password"
                  required
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-1 font-poppins"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary bg-[#0A0F0D] text-white font-poppins"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 text-center font-poppins">
                {error}
              </div>
            )}
            <div>
              <button
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark transition-colors duration-200 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-400 font-poppins">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:text-primary/80 font-poppins"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
