import { cn } from "./utils"

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingSpinner({ className, size = "md" }: LoadingProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loading className={className} size={size} />
    </div>
  );
}
