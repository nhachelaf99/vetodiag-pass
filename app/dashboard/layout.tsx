"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import UniversalHeader from "@/components/UniversalHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMyPetsRoute = pathname.startsWith("/dashboard/my-pets");
  const isMessagesRoute = pathname.startsWith("/dashboard/messages");

  // My-pets routes should now use the standard Sidebar layout, so we remove it from the exception.
  // Only messages route currently uses Header (from ConditionalHeader)


  return (
    <div className="flex h-screen bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-72 transition-all duration-300">
        <UniversalHeader />
        <main className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">{children}</main>
      </div>
    </div>
  );
}

