import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/tw.utils"

/**
 * WhatsApp Official Button System
 */

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa-green focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-wa-green text-white hover:bg-wa-green-dark shadow-none",
        secondary: "bg-wa-bg text-wa-dark hover:bg-wa-border border border-wa-border",
        accent: "bg-[#25D366] text-white hover:bg-[#20bd5a]",
        outline: "bg-transparent border border-wa-green text-wa-green hover:bg-wa-green/6",
        ghost: "bg-transparent text-wa-icon hover:bg-wa-bg hover:text-wa-dark",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
      rounded: {
        default: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, leftIcon, rightIcon, isLoading = false, children, ...props }, ref) => {

    const combinedClassName = cn(buttonVariants({ variant, size, rounded, className }))

    if (asChild) {
      return (
        <Slot className={combinedClassName} ref={ref} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={combinedClassName}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : null}
        <div className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </div>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
