import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div
      role="status"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full animate-spin border-zinc-800 border-t-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
