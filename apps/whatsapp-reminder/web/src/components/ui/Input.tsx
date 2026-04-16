import * as React from "react"
import { cn } from "../../utils/tw.utils"
import { Eye, EyeOff } from "lucide-react"

/**
 * WhatsApp Official Input Component
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, leftIcon, rightIcon, containerClassName, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn("w-full flex flex-col gap-1.5 text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#111b21]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#54656f] pointer-events-none z-10">
              {React.isValidElement(leftIcon)
                ? React.cloneElement(leftIcon as React.ReactElement, { size: 18, strokeWidth: 2 })
                : leftIcon}
            </div>
          )}

          <input
            type={inputType}
            id={inputId}
            ref={ref}
            {...props}
            className={cn(
              "flex w-full h-12 bg-white border text-[15px] text-[#111b21] font-normal",
              "rounded-lg px-4 outline-none transition-all duration-150",
              "placeholder:text-[#667781] placeholder:font-normal",
              "focus:border-[#00a884] focus:ring-3 focus:ring-[#00a884]/10",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f0f2f5]",
              error
                ? "border-red-400 bg-red-50/50 focus:border-red-400 focus:ring-red-400/10"
                : "border-[#e9edef]",
              leftIcon ? "pl-10" : "",
              (rightIcon || isPassword) ? "pr-10" : "",
              className
            )}
          />

          <div className="absolute right-3.5 flex items-center z-10">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#54656f] hover:text-[#111b21] transition-colors p-0.5 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            ) : (
              rightIcon && (
                <div className="text-[#54656f] pointer-events-none">
                  {React.isValidElement(rightIcon)
                    ? React.cloneElement(rightIcon as React.ReactElement, { size: 18, strokeWidth: 2 })
                    : rightIcon}
                </div>
              )
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#667781] mt-0.5">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
