/**
 * Skeleton component for loading states
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "h-12 w-full" }: SkeletonProps) {
  return (
    <div className={`${className} animate-pulse rounded bg-gray-200`} />
  );
}
