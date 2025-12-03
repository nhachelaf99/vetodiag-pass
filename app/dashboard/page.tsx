import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MyPetsSection from "@/components/dashboard/MyPetsSection";
import RecentActivitiesSection from "@/components/dashboard/RecentActivitiesSection";
import UpcomingAppointmentsSection from "@/components/dashboard/UpcomingAppointmentsSection";
import QuickLinksSection from "@/components/dashboard/QuickLinksSection";

export default function DashboardPage() {
  return (
    <div className="font-inter">
      <DashboardHeader />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <MyPetsSection />
          <RecentActivitiesSection />
        </div>
        <div className="col-span-1 space-y-8">
          <UpcomingAppointmentsSection />
          <QuickLinksSection />
        </div>
      </div>
    </div>
  );
}

