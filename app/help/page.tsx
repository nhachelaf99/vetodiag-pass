import Link from "next/link";
import InlineHeader from "@/components/InlineHeader";


export default function HelpPage() {
  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through your dashboard by clicking on the 'Appointments' tab and selecting 'Schedule New'. Follow the steps to choose your pet, the service, and available time slot."
    },
    {
      question: "Where can I find my pet's lab results?",
      answer: "Lab results are available in the 'Results' section of your dashboard. Once your veterinarian uploads them, you'll receive a notification and can download them directly."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to 'Settings' in your dashboard sidebar. From there, you can update your contact information, password, and communication preferences."
    },
    {
      question: "Is there a mobile app?",
      answer: "VetoDiag is fully responsive and works great on mobile browsers. We are currently developing dedicated mobile apps for iOS and Android."
    },
  ];

  return (
    <div className="min-h-screen bg-background-dark font-poppins">

      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-xl text-gray-400">
              How can we assist you today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-card-dark p-8 rounded-xl border border-border-dark hover:border-primary/50 transition-colors">
              <span className="material-icons text-4xl text-primary mb-4">contact_support</span>
              <h3 className="text-xl font-bold text-white mb-2">Technical Support</h3>
              <p className="text-gray-400 mb-4">Having trouble with the platform? Our tech team is here to help.</p>
              <Link href="#" className="text-primary font-medium hover:underline">Contact Support &rarr;</Link>
            </div>
            <div className="bg-card-dark p-8 rounded-xl border border-border-dark hover:border-primary/50 transition-colors">
              <span className="material-icons text-4xl text-primary mb-4">medical_services</span>
              <h3 className="text-xl font-bold text-white mb-2">Veterinary Inquiries</h3>
              <p className="text-gray-400 mb-4">Questions about your pet's health? Reach out to your clinic.</p>
              <Link href="#" className="text-primary font-medium hover:underline">Find Clinic Info &rarr;</Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-surface-dark rounded-lg p-6 border border-border-dark">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
