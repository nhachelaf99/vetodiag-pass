export default function SkeletonPetCard() {
  return (
    <div className="bg-card-dark p-6 rounded-lg border border-border-dark animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  );
}
