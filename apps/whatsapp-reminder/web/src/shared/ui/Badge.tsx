import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/tw.utils"

/**
 * 🚀 THE MODERN PRO BADGE SYSTEM - v9.0
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter transition-colors focus:outline-none border",
  {
    variants: {
      variant: {
        default:
          "bg-primary/5 text-primary border-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground border-border",
        destructive:
          "bg-destructive/5 text-destructive border-destructive/10",
        success:
          "bg-success/5 text-success border-success/10",
        warning:
          "bg-warning/5 text-warning border-warning/10",
        accent:
          "bg-accent/5 text-accent border-accent/10",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
