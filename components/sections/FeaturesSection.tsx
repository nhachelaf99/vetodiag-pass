export default function FeaturesSection() {
  const features = [
    {
      icon: "calendar_month",
      title: "Easy Appointments",
      description:
        "Book, reschedule, or cancel appointments with your vet in just a few clicks. Get reminders so you never miss a visit.",
    },
    {
      icon: "folder_shared",
      title: "Medical Records",
      description:
        "Access your pet's complete health history, including vaccinations, lab results, and prescriptions, anytime, anywhere.",
    },
    {
      icon: "pill",
      title: "Prescription Refills",
      description:
        "Request prescription refills online and get notified when they are ready for pickup at your clinic.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything You Need, All in One Place
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Manage your pet's health with our powerful, client-focused tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card-dark p-8 rounded-2xl border border-gray-800/50"
            >
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
                {feature.icon}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

