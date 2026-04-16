import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/tw.utils"

/**
 * WhatsApp Official Button System
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[#00a884] text-white hover:bg-[#008069] shadow-none",
        secondary: "bg-[#f0f2f5] text-[#111b21] hover:bg-[#e9edef] border border-[#e9edef]",
        accent: "bg-[#25D366] text-white hover:bg-[#20bd5a]",
        outline: "bg-transparent border border-[#00a884] text-[#00a884] hover:bg-[#00a884]/6",
        ghost: "bg-transparent text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#111b21]",
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
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
