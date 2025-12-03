const quickLinks = [
  { icon: "description", label: "Prescriptions" },
  { icon: "food_bank", label: "Diet Plans" },
  { icon: "email", label: "Message Us" },
  { icon: "help_outline", label: "Help Center" },
];

export default function QuickLinksSection() {
  return (
    <section className="font-inter">
      <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((link, index) => (
          <a
            key={index}
            href="#"
            className="flex flex-col items-center justify-center bg-card-dark p-4 rounded-lg border border-border-dark hover:border-primary transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-icons text-primary text-2xl">
                {link.icon}
              </span>
            </div>
            <span className="text-sm font-medium text-white">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

