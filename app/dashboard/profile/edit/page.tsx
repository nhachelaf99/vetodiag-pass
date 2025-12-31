"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileQuery, useUpdateProfileMutation } from "@/hooks/useProfileQuery";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profileData, isLoading: isQueryLoading } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when data loads
  useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        email: profileData.email || user?.email || "",
      }));
    } else if (user && !isQueryLoading) {
      // Fallback if profile query empty but user auth exists
       const nameParts = user.name.split(" ");
       setFormData(prev => ({
         ...prev,
         firstName: nameParts[0] || "",
         lastName: nameParts.slice(1).join(" ") || "",
         email: user.email || "",
       }));
    }
  }, [profileData, user, isQueryLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    console.log("Submitting profile update form...", formData);

    const userId = user?.clientId || profileData?.id;
    if (!userId) {
        console.error("User ID missing", { user, profileData });
        setStatus({ type: 'error', message: "User ID missing. Please reload." });
        return;
    }

    // Validation
    if (!formData.firstName.trim()) {
       setStatus({ type: 'error', message: "First name is required" });
       return;
    }
    if (!formData.email.trim()) {
       setStatus({ type: 'error', message: "Email is required" });
       return;
    }
    if (formData.password) {
        if (formData.password.length < 6) {
            setStatus({ type: 'error', message: "Password must be at least 6 characters" });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', message: "Passwords do not match" });
            return;
        }
    }

    setIsSubmitting(true);
    try {
        console.log("Calling mutation...", {
            id: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            hasPassword: !!formData.password,
            currentEmail: profileData?.email || user?.email
        });

        await updateMutation.mutateAsync({
            id: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password || undefined,
            currentEmail: profileData?.email || user?.email
        });

        console.log("Mutation completed successfully");
        setStatus({ type: 'success', message: "Profile updated successfully!" });
        
        // Clear sensitive fields
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

        // Redirect after short delay
        setTimeout(() => {
            router.push("/dashboard/profile");
        }, 1500);

    } catch (err: any) {
        console.error("Update failed in component catch block:", err);
        setStatus({ type: 'error', message: err.message || "Failed to update profile" });
    } finally {
        console.log("Finally block reached, resetting isSubmitting");
        setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isQueryLoading) {
      return (
          <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard/profile"
            className="p-2 rounded-lg bg-surface-dark border border-border-dark text-gray-400 hover:text-white transition-colors"
          >
              <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      </div>

      <div className="bg-surface-dark rounded-xl shadow-lg border border-border-dark overflow-hidden p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status Messages */}
            {status.message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                    status.type === 'error' 
                        ? 'bg-red-500/10 border border-red-500/50 text-red-400' 
                        : 'bg-green-500/10 border border-green-500/50 text-green-400'
                }`}>
                    {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}

            {/* Personal Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-border-dark pb-2">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="First Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Last Name"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Changing email requires verification.</p>
                </div>
            </div>

            {/* Security */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-white border-b border-border-dark pb-2">
                    Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password (Optional)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border-dark">
                <Link
                    href="/dashboard/profile"
                    className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-white/5 transition-colors font-medium"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-primary text-black hover:bg-green-500 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
