"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const userAvatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfz1EGnpOhsGzJbweveovW0krpbjcOiOz0k8b8kvA6yiFGYQlUgr0G-HYGCIuJw8D4rkILKUE8cJzgZjHhiM39cItF02BmOKG53cI7fZwbzttUKqixfqRF9_kLjjgYxqwLfcNN8VoYMu_RW3_eRXvEb5GFnPf2vEtjc0gAWt-kNlgiuCjxEJ_BHbFfJ-BpR4573OzUz8w09PgN7Dtbjn-z27x9hiHPP5Uu-VyGbY-T_90lkwWRHkCcSgqnUD3LZ6mwXS1lu2B__-c";

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center mb-8 font-inter">
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome, Walker Family</h2>
        <p className="text-gray-400">
          Here is an overview of your pets' health and activities.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/scan-qr"
          className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          Scan QR Code
        </Link>
        <button className="relative p-2 rounded-full hover:bg-gray-800">
          <span className="material-icons text-gray-300">notifications</span>
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-background-dark"></span>
        </button>
        <div className="flex items-center gap-3">
          <Image
            src={userAvatarUrl}
            alt="User avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
            unoptimized
          />
          <div>
            <p className="font-semibold text-sm text-white">Chloe Walker</p>
            <p className="text-xs text-gray-400">Client ID: 67890</p>
          </div>
        </div>
      </div>
    </header>
  );
}

