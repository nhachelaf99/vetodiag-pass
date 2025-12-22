interface Appointment {
    date: string;
    title: string;
    subtitle: string;
}

export default function UpcomingAppointmentsSection({ appointments = [] }: { appointments?: Appointment[] }) {
  if (!appointments || appointments.length === 0) {
      return (
        <section className="font-inter">
            <h3 className="text-xl font-semibold mb-4 text-white">
                Upcoming Appointments
            </h3>
            <div className="bg-card-dark p-6 rounded-lg border border-border-dark space-y-4 text-gray-400 text-center">
                No upcoming appointments.
            </div>
             <button className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors hidden">
                Schedule a new appointment
            </button>
        </section>
      )
  }
  return (
    <section className="font-inter">
      <h3 className="text-xl font-semibold mb-4 text-white">
        Upcoming Appointments
      </h3>
      <div className="bg-card-dark p-6 rounded-lg border border-border-dark space-y-4">
        {appointments.map((appointment, index) => (
          <div key={index} className="bg-border-dark/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-primary">{appointment.date}</p>
            <p className="text-white mt-1">{appointment.title}</p>
            <p className="text-xs text-gray-400">{appointment.subtitle}</p>
          </div>
        ))}
        <button className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
          Schedule a new appointment
        </button>
      </div>
    </section>
  );
}

