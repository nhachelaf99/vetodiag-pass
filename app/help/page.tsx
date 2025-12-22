"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Clinic {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function HelpPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinicInfo() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        // Get Client -> Clinic linkage
        // Assuming client table has clinic_id or we find it via patients
        const { data: client } = await supabase
            .from('client')
            .select('id, clinic_id')
            .eq('email', session.user.email)
            .single();

        if (client?.clinic_id) {
            const { data: clinicData } = await supabase
                .from('clinique') // Table might be 'clinique' or 'clinics' based on Appointment page usage
                .select('*')
                .eq('id', client.clinic_id)
                .single();
            
            if (clinicData) {
                setClinic({
                    name: clinicData.name,
                    phone: clinicData.phone || clinicData.phone_number,
                    email: clinicData.email,
                    address: clinicData.address
                });
            }
        } else if (client?.id) {
             // Fallback: Check patients
             const { data: patient } = await supabase
                .from('patient')
                .select('clinic_id')
                .eq('owner_id', client.id)
                .limit(1)
                .single();
             
             if (patient?.clinic_id) {
                const { data: clinicData } = await supabase
                    .from('clinique')
                    .select('*')
                    .eq('id', patient.clinic_id)
                    .single();
                if (clinicData) setClinic({
                    name: clinicData.name,
                    phone: clinicData.phone || clinicData.phone_number,
                    email: clinicData.email,
                    address: clinicData.address
                });
             }
        }

      } catch (err) {
        console.error("Error fetching clinic info:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinicInfo();
  }, []);

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through your dashboard by clicking on the 'Appointments' tab and selecting 'Schedule New'. Follow the steps to choose your pet, the service, and available time slot."
    },
    {
      question: "Where can I find my pet's lab results?",
      answer: "Lab results are available in the 'My Pets' section under the 'External Results' tab. Once your veterinarian uploads them, they will appear there instantly."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to 'Settings' in your dashboard sidebar. From there, you can update your contact information and preferences."
    },
    {
      question: "Is there a mobile app?",
      answer: "VetoDiag is fully responsive and works great on mobile browsers. We are currently developing dedicated mobile apps for iOS and Android."
    },
  ];

  return (
    <div className="min-h-screen bg-background-dark font-display flex flex-col">
      {/* Simple Header */}
      <header className="p-6 border-b border-border-dark flex justify-between items-center bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
            <span className="text-xl font-bold text-white tracking-tight">VetoDiag Help</span>
         </div>
         <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
         </Link>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-bold text-white mb-6">How can we assist you?</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions or get in touch with your veterinary clinic directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Technical Support Card */}
            <div className="bg-surface-dark p-10 rounded-3xl border border-border-dark hover:border-primary/50 transition-all group hover:bg-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-9xl text-primary">contact_support</span>
               </div>
              <span className="material-symbols-outlined text-5xl text-primary mb-6">headset_mic</span>
              <h3 className="text-2xl font-bold text-white mb-3">Technical Support</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                  Having trouble accessing your account or using the platform feature?
              </p>
              <a href="mailto:support@vetodiag.com" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Contact Support 
                  <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>

            {/* Clinic Info Card */}
            <div className="bg-surface-dark p-10 rounded-3xl border border-border-dark hover:border-primary/50 transition-all group hover:bg-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <span className="material-symbols-outlined text-9xl text-primary">local_hospital</span>
               </div>
              <span className="material-symbols-outlined text-5xl text-primary mb-6">medical_services</span>
              <h3 className="text-2xl font-bold text-white mb-3">Veterinary Inquiries</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                  Questions about your pet's health, appointments, or prescriptions?
              </p>
              
              {loading ? (
                  <div className="h-20 flex items-center text-gray-500">Loading clinic info...</div>
              ) : clinic ? (
                  <div className="bg-background-dark p-4 rounded-xl border border-border-dark space-y-2 text-sm">
                      <p className="font-bold text-white text-lg mb-2">{clinic.name}</p>
                      <p className="flex items-center gap-2 text-gray-400">
                          <span className="material-symbols-outlined text-base">call</span>
                          {clinic.phone || "No phone listed"}
                      </p>
                       <p className="flex items-center gap-2 text-gray-400">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {clinic.address || "No address listed"}
                      </p>
                       <p className="flex items-center gap-2 text-gray-400">
                          <span className="material-symbols-outlined text-base">mail</span>
                          {clinic.email || "No email listed"}
                      </p>
                  </div>
              ) : (
                  <div className="text-amber-400 text-sm bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                      No clinic linked to your account. Please schedule an appointment to connect.
                  </div>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-surface-dark rounded-2xl p-6 border border-border-dark hover:bg-white/5 transition-colors">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                      <span className="text-primary mt-1 text-sm">0{index + 1}</span>
                      {faq.question}
                  </h3>
                  <p className="text-gray-400 pl-8 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
      </main>
      
      <footer className="p-8 text-center text-gray-600 text-sm border-t border-border-dark mt-12 bg-surface-dark/30">
        &copy; {new Date().getFullYear()} VetoDiag. All rights reserved.
      </footer>
    </div>
  );
}
