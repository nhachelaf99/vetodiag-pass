"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Cat, 
  CalendarDays, 
  History, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/my-pets", label: "My Pets", icon: Cat },
    { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <aside className="w-72 bg-[#09090b] border-r border-[#27272a] flex flex-col h-screen fixed hidden md:flex z-50">
      {/* Brand Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Cat className="w-6 h-6 text-black" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">VetoDiag<span className="text-primary">.Pass</span></h1>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Patient Portal</p>
             </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 pb-2">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Main Menu</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/10 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary filter drop-shadow-sm" : "text-gray-500 group-hover:text-gray-300"}`} />
                <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
            </Link>
          );
        })}

        <div className="px-4 pt-8 pb-2">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Preferences</p>
        </div>
        
        <Link
            href="/dashboard/settings"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname === "/dashboard/settings"
                ? "bg-primary/10 text-primary border border-primary/10"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
        >
            <Settings className={`w-5 h-5 ${pathname === "/dashboard/settings" ? "text-primary" : "text-gray-500 group-hover:text-gray-300"}`} />
            <span className="text-sm font-medium">Settings</span>
        </Link>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
         <div className="relative">
            <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-[#27272a] group"
            >
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shrink-0 relative">
                     {user?.avatar ? (
                         <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-500">
                             <UserIcon className="w-5 h-5" />
                         </div>
                     )}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                </div>
                <MoreVertical className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </button>

            {/* Dropdown Menu (Upward) */}
            {isProfileMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl p-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <Link 
                        href="/dashboard/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                    </Link>
                    <div className="h-px bg-[#27272a] my-1" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
         </div>
      </div>
    </aside>
  );
}
