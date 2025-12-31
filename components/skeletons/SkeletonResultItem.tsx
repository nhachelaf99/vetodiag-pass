export default function SkeletonResultItem() {
  return (
    <div className="bg-card-dark p-6 rounded-lg border border-border-dark flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-6 w-full">
        {/* Icon Skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0"></div>
        
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>
          
          {/* Details Skeleton */}
          <div className="flex items-center gap-4 mt-1">
            <div className="h-4 bg-gray-700/50 rounded w-20"></div>
            <div className="h-4 bg-gray-700/50 rounded w-24"></div>
            <div className="h-4 bg-gray-700/50 rounded w-16"></div>
          </div>
        </div>
      </div>
      
      {/* Button Skeleton */}
      <div className="w-10 h-10 rounded-lg bg-gray-700/30"></div>
    </div>
  );
}
