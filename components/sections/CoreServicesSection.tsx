export default function CoreServicesSection() {
  const services = [
    {
      icon: "pets",
      title: "Patient Management",
      description:
        "Keep track of all your pets under one account. View individual profiles, health timelines, and specific needs with ease.",
    },
    {
      icon: "forum",
      title: "Direct Vet Messaging",
      description:
        "Have a non-urgent question? Send secure messages to your veterinary clinic and receive timely responses from the care team.",
    },
    {
      icon: "receipt_long",
      title: "Billing & Invoices",
      description:
        "View your billing history, download invoices, and manage payments securely through our integrated portal.",
    },
    {
      icon: "lightbulb",
      title: "Educational Resources",
      description:
        "Access a curated library of articles and guides on pet health, nutrition, and behavior to help you be the best pet owner.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Our Core Services
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Dedicated to providing top-tier veterinary care solutions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card-dark p-8 rounded-2xl border border-gray-800/50 flex items-start space-x-6"
            >
              <span className="material-symbols-outlined text-primary text-4xl mt-1">
                {service.icon}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-400">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

