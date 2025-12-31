export default function SkeletonAppointment() {
  return (
    <div className="bg-card-dark p-6 rounded-lg border border-border-dark hover:border-primary/50 transition-colors flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-6 flex-1">
        <div className="bg-primary/10 w-16 h-16 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-700 rounded w-48"></div>
          <div className="flex items-center gap-4">
            <div className="h-3 bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 bg-gray-700 rounded w-24"></div>
        <div className="h-8 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}
