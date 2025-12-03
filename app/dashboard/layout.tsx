"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMyPetsRoute = pathname.startsWith("/dashboard/my-pets");
  const isMessagesRoute = pathname.startsWith("/dashboard/messages");

  // My-pets and messages routes use Header (from ConditionalHeader), not Sidebar
  if (isMyPetsRoute || isMessagesRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background-dark">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

