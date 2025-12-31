export default function SkeletonProfile() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="bg-surface-dark rounded-xl shadow-lg border border-border-dark overflow-hidden">
        {/* Banner Skeleton */}
        <div className="h-32 bg-gray-700/50 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-surface-dark"></div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-3">
              <div className="h-8 bg-gray-700 rounded w-64"></div>
              <div className="h-4 bg-gray-700 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-32"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
              <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-full"></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
