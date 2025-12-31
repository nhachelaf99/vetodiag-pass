"use client";

import { useDashboardQuery } from "@/hooks/useDashboardQuery";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import MyPetsSection from "@/components/dashboard/MyPetsSection";
import RecentActivitiesSection from "@/components/dashboard/RecentActivitiesSection";
import UpcomingAppointmentsSection from "@/components/dashboard/UpcomingAppointmentsSection";
import SkeletonCard from "@/components/skeletons/SkeletonCard";
import SkeletonList from "@/components/skeletons/SkeletonList";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardQuery();
  const appointments = data?.appointments || [];
  const activities = data?.activities || [];

  return (
    <div className="font-inter">
      <WelcomeBanner />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <MyPetsSection />
          {isLoading ? (
            <SkeletonList count={5} />
          ) : (
            <RecentActivitiesSection activities={activities} />
          )}
        </div>
        <div className="md:col-span-1 space-y-8">
          {isLoading ? (
            <>
              <SkeletonCard height="h-64" />
              <SkeletonCard height="h-48" />
              <SkeletonCard height="h-48" />
            </>
          ) : (
            <UpcomingAppointmentsSection appointments={appointments} />
          )}
        </div>
      </div>
    </div>
  );
}

