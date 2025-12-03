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

  // Show header for my-pets and messages routes, hide for other dashboard routes
  if (isAuthRoute || (isDashboardRoute && !isMyPetsRoute && !isMessagesRoute) || isHomePage) {
    return null;
  }

  return <Header />;
}

