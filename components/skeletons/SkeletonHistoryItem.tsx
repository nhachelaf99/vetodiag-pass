export default function SkeletonHistoryItem() {
  return (
    <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark transition-all flex flex-col md:flex-row items-start gap-5 animate-pulse">
      <div className="w-14 h-14 bg-gray-700 rounded-xl flex-shrink-0"></div>
      
      <div className="flex-1 w-full space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-700 rounded w-64"></div>
          </div>
          <div className="h-6 bg-gray-700 rounded w-24"></div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
