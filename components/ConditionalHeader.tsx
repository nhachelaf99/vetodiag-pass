"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const authRoutes = ["/login"];
const dashboardRoutes = ["/dashboard", "/dashboard/appointments", "/dashboard/billing", "/dashboard/documents", "/dashboard/scan-qr", "/dashboard/profile"];

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
  if (isAuthRoute || isDashboardRoute || isMyPetsRoute || isMessagesRoute) {
    return null;
  }

  return <Header />;
}

