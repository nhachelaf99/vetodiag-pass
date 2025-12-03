const activities = [
  {
    icon: "vaccines",
    title: "Rabies booster for Rocky",
    subtitle: "Dr. Emily Carter",
    time: "5 days ago",
    linkText: "View details",
  },
  {
    icon: "healing",
    title: "Post-surgery check-up for Milo",
    subtitle: "Dr. James Rodriguez",
    time: "2 weeks ago",
    linkText: "View details",
  },
  {
    icon: "science",
    title: "Lab results for Daisy are available",
    subtitle: "Senior wellness panel",
    time: "1 month ago",
    linkText: "View results",
  },
];

export default function RecentActivitiesSection() {
  return (
    <section className="font-inter">
      <h3 className="text-xl font-semibold mb-4 text-white">Recent Activities</h3>
      <div className="bg-card-dark p-6 rounded-lg border border-border-dark space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <span className="material-icons text-primary">{activity.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{activity.title}</p>
              <p className="text-sm text-gray-400">{activity.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-300">{activity.time}</p>
              <a
                href="#"
                className="text-xs text-primary hover:underline"
              >
                {activity.linkText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

