interface SkeletonCardProps {
  className?: string;
  height?: string;
}

export default function SkeletonCard({ className = "", height = "h-32" }: SkeletonCardProps) {
  return (
    <div className={`bg-surface-dark border border-border-dark rounded-xl p-6 ${height} ${className} animate-pulse`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}
