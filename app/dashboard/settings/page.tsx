"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Bell, Shield, Globe, ChevronRight, Smartphone, Lock } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState({
      email: true,
      push: true,
      marketing: false
  });

  const toggleNotification = (key: keyof typeof notifications) => {
      setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings & Preferences</h1>
        <p className="text-gray-400">Manage your application experience and security.</p>
      </div>

      {/* Appearance */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border-dark">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                Appearance
            </h2>
        </div>
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Theme</h3>
                    <p className="text-sm text-gray-400">Customize your interface theme.</p>
                </div>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <button 
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Sun className="w-4 h-4 inline-block mr-2" />
                        Light
                    </button>
                    <button 
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            theme === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Moon className="w-4 h-4 inline-block mr-2" />
                        Dark
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border-dark">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
            </h2>
        </div>
        <div className="divide-y divide-border-dark">
            <div className="p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive appointments and medical updates via email.</p>
                </div>
                <button 
                    onClick={() => toggleNotification('email')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-primary' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
            <div className="p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Receive real-time alerts on your device.</p>
                </div>
                <button 
                    onClick={() => toggleNotification('push')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-primary' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border-dark">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security & Privacy
            </h2>
        </div>
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl border border-border-dark">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Device Management</h3>
                        <p className="text-sm text-gray-400">Manage devices logged into your account.</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
             <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl border border-border-dark">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400">Add an extra layer of security.</p>
                    </div>
                </div>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded border border-primary/20">Coming Soon</span>
            </div>
        </div>
      </section>

      {/* Language */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-border-dark">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language & Region
            </h2>
        </div>
        <div className="p-6">
             <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Language</h3>
                    <p className="text-sm text-gray-400">Select your preferred language.</p>
                </div>
                <select className="bg-background-dark border border-border-dark text-white rounded-lg px-4 py-2 outline-none focus:border-primary">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                </select>
            </div>
        </div>
      </section>

      <div className="text-center text-sm text-gray-500 pt-8">
        <p>VetoDiag Pass v1.2.0 • Build 2024.12.31</p>
      </div>
    </div>
  );
}
