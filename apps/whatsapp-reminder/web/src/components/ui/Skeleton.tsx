import { cn } from "../../utils/tw.utils"

/**
 * 🚀 THE MODERN PRO SKELETON - v9.0
 * Performance-driven loading perception.
 */

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-secondary border border-border/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
