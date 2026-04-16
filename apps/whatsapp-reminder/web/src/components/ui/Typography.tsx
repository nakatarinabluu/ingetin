import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/tw.utils"

/**
 * 💡 THE MODERN PRO TYPOGRAPHY SYSTEM - v9.0
 * Focus: Clarity, Precision, and Professional Utility.
 */

const typographyVariants = cva(
  "transition-colors duration-300 text-left selection:bg-accent/20 selection:text-accent hyphens-auto break-words overflow-wrap-anywhere",
  {
    variants: {
      variant: {
        hero: "text-[clamp(2.25rem,10vw,8rem)] font-black tracking-tighter leading-[1.15] md:leading-[0.85] text-foreground font-display",
        h1: "text-[clamp(1.75rem,8vw,4.5rem)] font-extrabold tracking-tighter leading-relaxed md:leading-tight text-foreground font-display",
        h2: "text-[clamp(1.5rem,6vw,3.5rem)] font-bold tracking-tight leading-relaxed md:leading-tight text-foreground font-display",
        h3: "text-xl md:text-3xl font-bold tracking-tight text-foreground font-display",
        h4: "text-lg font-bold tracking-tight text-foreground font-display",
        lead: "text-base md:text-xl font-medium text-muted-foreground/80 leading-relaxed font-body",
        p: "text-sm md:text-base font-medium leading-relaxed text-foreground/80 font-body",
        small: "text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] font-body text-center md:text-left",
        muted: "text-xs md:text-sm font-medium text-muted-foreground/60 font-body",
        code: "font-mono text-xs md:text-sm bg-muted px-1.5 py-0.5 rounded-md border border-border/50",
        gradient: "text-gradient font-display font-black",
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        accent: "text-accent",
        primary: "text-primary",
        white: "text-white",
        destructive: "text-destructive",
        success: "text-success",
      }
    },
    defaultVariants: {
      variant: "p",
      color: "default",
    },
  }
)

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "label" | "code"
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, as, ...props }, ref) => {
    const Component = as || (
      variant === "h1" ? "h1" : 
      variant === "h2" ? "h2" : 
      variant === "h3" ? "h3" : 
      variant === "h4" ? "h4" : 
      variant === "code" ? "code" : "p"
    )
    
    return (
      <Component
        // @ts-ignore - Component is dynamic, ref compatibility is handled by the caller
        ref={ref}
        className={cn(typographyVariants({ variant, color, className }))}
        {...props}
      />
    )
  }
)

Typography.displayName = "Typography"

export { Typography }
