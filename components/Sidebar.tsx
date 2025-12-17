"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/my-pets", label: "My Pets", icon: "pets" },
    { href: "/dashboard/appointments", label: "Appointments", icon: "calendar_month" },
    { href: "/dashboard/history", label: "History", icon: "history" },
    { href: "/dashboard/messages", label: "Messages", icon: "chat" },
    { href: "/dashboard/billing", label: "Billing", icon: "credit_card" },
  ];

  return (
    <aside className="w-64 bg-surface-dark border-r border-border-dark flex flex-col p-4 font-inter">
      <div className="flex flex-col gap-4 flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{ backgroundImage: user?.avatar ? `url("${user.avatar}")` : 'none' }}
          />
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-medium leading-normal text-white truncate" title={user?.name}>
              {user?.name || "User"}
            </h1>
            <p className="text-sm font-normal leading-normal text-gray-400 truncate" title={user?.userCode}>
              {user?.userCode || ""}
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const IconComponent = "span";
            const iconClass = "material-icons";
            const iconStyle = {};
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "hover:bg-white/10 text-gray-300"
                }`}
              >
                <IconComponent className={iconClass} style={iconStyle}>{item.icon}</IconComponent>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 mt-auto flex flex-col gap-1">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === "/dashboard/settings"
              ? "bg-white/10 text-white font-medium"
              : "hover:bg-white/10 text-gray-300"
          }`}
        >
          <span 
            className="material-icons"
            style={pathname === "/dashboard/settings" ? { } : {}}
          >
            settings
          </span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
        >
          <span className="material-icons">help_outline</span>
          <span className="text-sm font-medium">Help</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 w-full transition-colors mt-2"
        >
          <span className="material-icons">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

