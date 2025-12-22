"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string; // might not exist in simplified schema
  zip_code: string;
  avatar_url?: string;
  user_code?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ClientProfile>({
     id: "",
     first_name: "",
     last_name: "",
     email: "",
     phone: "",
     address: "",
     city: "",
     state: "",
     zip_code: "",
  });
  
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        const { data, error } = await supabase
          .from('client')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (error) {
            // If code is PGRST116, it means no rows returned (profile doesn't exist yet)
            if (error.code === 'PGRST116') {
                console.log("No client profile found for this user (first login?)");
                // Optional: set default values or leave as empty
            } else {
                throw error;
            }
        }
        
        if (data) {
            let first = data.first_name || "";
            let last = data.last_name || "";

            if (!first && !last && data.full_name) {
                 const parts = data.full_name.trim().split(" ");
                 first = parts[0];
                 last = parts.slice(1).join(" ");
            }

            setFormData({
                id: data.id,
                first_name: first || "",
                last_name: last || "",
                email: data.email || "",
                phone: data.phone || data.telephone || "", // Corrected field name: 'telephone' in DB
                address: data.address || "",
                city: data.region || "", // Mapping region to city/region field
                state: data.wilaya || "", // Mapping wilaya to state
                zip_code: "", // Not in current schema
                avatar_url: undefined, // Not on client table currently (or check if added?)
                user_code: "N/A" // Client doesn't have user_code in SQL provided, using N/A or generating derived
            });
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyCode = () => {
    const code = formData.user_code || "";
    navigator.clipboard.writeText(code);
    // Could add toast here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const full_name = `${formData.first_name} ${formData.last_name}`.trim();
        
        // Prepare update object
        const updates = {
            full_name: full_name,
            telephone: formData.phone,
            address: formData.address,
            region: formData.city,
            wilaya: formData.state
        };

        const { error } = await supabase
            .from('client')
            .update(updates)
            .eq('id', formData.id);

        if (error) throw error;
        // alert("Profile updated successfully!"); 
    } catch (err: any) {
        console.error("Error updating profile:", err?.message || err);
        // alert("Error updating profile: " + err.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-background-dark flex items-center justify-center">
              <div className="text-gray-500">Loading settings...</div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-display">
      <header className="flex flex-col md:flex-row gap-6 md:justify-between md:items-center border-b border-border-dark pb-8 mb-8">
        <div className="flex gap-6 items-center">
          <div className="relative shrink-0 group">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 md:h-32 md:w-32 bg-surface-dark border-4 border-surface-dark shadow-xl"
              style={{
                backgroundImage: formData.avatar_url
                  ? `url("${formData.avatar_url}")`
                  : 'url("https://via.placeholder.com/150")',
              }}
            >
                {!formData.avatar_url && (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                )}
            </div>
            <button className="absolute bottom-0 right-0 flex items-center justify-center size-8 rounded-full bg-primary text-black hover:bg-primary/90 transition-transform hover:scale-110 shadow-lg">
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-base font-normal leading-normal mt-2 text-primary">
              Client
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-border-dark shadow-sm">
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">
              User Code
            </p>
            <p className="text-xl font-mono font-bold tracking-wider text-white">
              {formData.user_code || "Generating..."}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center size-10 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              content_copy
            </span>
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Personal Information */}
          <div className="p-8 bg-surface-dark rounded-3xl border border-border-dark shadow-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
                  htmlFor="first_name"
                >
                  First Name
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary px-4 py-3 outline-none transition-all"
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
                  htmlFor="last_name"
                >
                  Last Name
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary px-4 py-3 outline-none transition-all"
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-gray-500 px-4 py-3 outline-none cursor-not-allowed"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  title="Contact support to change email"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary px-4 py-3 outline-none transition-all"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Moved to right column or below) */}
        <div className="lg:col-span-1 space-y-6">
             <div className="p-8 bg-surface-dark rounded-3xl border border-border-dark h-fit shadow-sm">
                <h3 className="text-xl font-bold text-white mb-4">Account Actions</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Update your profile information. Some fields like email are read-only for security.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
