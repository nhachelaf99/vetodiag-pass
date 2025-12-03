"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@email.com",
    phone: "(555) 123-4567",
    street: "123 Vetinary Lane",
    city: "Petville",
    state: "CA",
    zip: "90210",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyCode = () => {
    const code = user?.clientId ? `JD-${user.clientId}` : "JD-84312";
    navigator.clipboard.writeText(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted", formData, notifications);
  };

  const clientCode = user?.clientId ? `JD-${user.clientId}` : "JD-84312";
  const memberSince = "2019";

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex p-4 border-b border-border-dark pb-8">
        <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex gap-6 items-center">
            <div className="relative shrink-0">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32"
                style={{
                  backgroundImage: user?.avatar
                    ? `url("${user.avatar}")`
                    : "none",
                }}
              />
              <button className="absolute bottom-0 right-0 flex items-center justify-center size-8 rounded-full bg-primary text-black hover:bg-primary/80 transition-opacity">
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
                {user?.name || "Jane Doe"}
              </h2>
              <p className="text-base font-normal leading-normal mt-2 text-text-dark-secondary">
                Member since {memberSince}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-dark border border-border-dark">
            <div className="flex flex-col">
              <p className="text-sm font-normal text-text-dark-secondary">
                Client Code
              </p>
              <p className="text-xl font-semibold tracking-wider text-white">
                {clientCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center size-10 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                content_copy
              </span>
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="p-6 bg-surface-dark rounded-lg border border-border-dark">
            <h3 className="text-xl font-bold text-white mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="p-6 bg-surface-dark rounded-lg border border-border-dark">
            <h3 className="text-xl font-bold text-white mb-6">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="street"
                >
                  Street Address
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="street"
                  name="street"
                  type="text"
                  value={formData.street}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="city"
                >
                  City
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="state"
                >
                  State
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-text-dark-secondary mb-2"
                  htmlFor="zip"
                >
                  ZIP Code
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md text-white placeholder:text-text-dark-secondary focus:ring-primary focus:border-primary px-3 py-2 outline-none"
                  id="zip"
                  name="zip"
                  type="text"
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="lg:col-span-1 p-6 bg-surface-dark rounded-lg border border-border-dark h-fit">
          <h3 className="text-xl font-bold text-white mb-6">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white" htmlFor="email-notifs">
                Email Notifications
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={notifications.email}
                  onChange={() => handleToggle("email")}
                  className="sr-only peer"
                  id="email-notifs"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-border-dark rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white" htmlFor="sms-notifs">
                SMS Reminders
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={notifications.sms}
                  onChange={() => handleToggle("sms")}
                  className="sr-only peer"
                  id="sms-notifs"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-border-dark rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white" htmlFor="push-notifs">
                App Push Notifications
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={notifications.push}
                  onChange={() => handleToggle("push")}
                  className="sr-only peer"
                  id="push-notifs"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-border-dark rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-white text-sm font-bold leading-normal tracking-[0.015em] border border-border-dark hover:bg-white/10 transition-colors"
          >
            <span className="truncate">Cancel</span>
          </button>
          <button
            type="submit"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-black text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-opacity"
          >
            <span className="truncate">Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

