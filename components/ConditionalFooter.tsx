"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const authenticatedRoutes = ["/dashboard/my-pets", "/dashboard/appointments", "/dashboard/results"];
const dashboardRoutes = ["/dashboard", "/dashboard/billing", "/dashboard/documents", "/dashboard/scan-qr", "/dashboard/messages", "/dashboard/settings"];
const authRoutes = ["/login"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthenticatedRoute = authenticatedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthenticatedRoute || isDashboardRoute || isAuthRoute) {
    return null;
  }

  return <Footer />;
}
