import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/tw.utils"

/**
 * WhatsApp Official Card System
 */

const cardVariants = cva(
  "relative transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border border-[#e9edef] shadow-wa hover:shadow-wa-md",
        secondary: "bg-[#f0f2f5] border border-[#e9edef] shadow-none",
        flat: "bg-white border border-[#e9edef] shadow-none",
        glass: "bg-white/80 backdrop-blur-md border border-[#e9edef] shadow-wa",
        none: "bg-transparent border-none shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      rounded: {
        default: "rounded-xl",
        lg: "rounded-2xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      rounded: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  overflowHidden?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, asChild = false, overflowHidden = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, rounded, className }),
          overflowHidden && "overflow-hidden"
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1 mb-4", className)} {...props} />
)

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-[#111b21] tracking-tight", className)} {...props} />
)

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-[#54656f] leading-relaxed", className)} {...props} />
)

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("pt-0", className)} {...props} />
)

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center pt-4 mt-4 border-t border-[#e9edef]", className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
