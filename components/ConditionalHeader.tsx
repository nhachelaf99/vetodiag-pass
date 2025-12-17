"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const authRoutes = ["/login"];
const dashboardRoutes = ["/dashboard", "/dashboard/appointments", "/dashboard/billing", "/dashboard/documents", "/dashboard/scan-qr", "/dashboard/settings"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isHomePage = pathname === "/";
  const isMyPetsRoute = pathname.startsWith("/dashboard/my-pets");
  const isMessagesRoute = pathname.startsWith("/dashboard/messages");



  // Show header ONLY for messages routes (currently), hide for other dashboard routes including my-pets which now uses sidebar
  if (isAuthRoute || (isDashboardRoute) || (isMyPetsRoute)) {
     if (isMessagesRoute) return <Header />; // Exception: Messages still uses top header? User said "same header/sidebar as OTHER pages", implying my-pets should be standard.
     return null;
  }

  return <Header />;
}

