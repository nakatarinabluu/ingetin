import * as React from "react"
import { cn } from "@/shared/lib/tw.utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, containerClassName, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn("w-full flex flex-col gap-1.5 text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-wa-dark"
          >
            {label}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          {...props}
          className={cn(
            "flex w-full min-h-[100px] bg-white border text-[15px] text-wa-dark font-normal",
            "rounded-lg px-4 py-3 outline-none transition-all duration-150 resize-none",
            "placeholder:text-wa-muted placeholder:font-normal",
            "focus:border-wa-green focus:ring-3 focus:ring-wa-green/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-wa-bg",
            error
              ? "border-red-400 bg-red-50/50 focus:border-red-400 focus:ring-red-400/10"
              : "border-wa-border",
            className
          )}
        />

        {error && (
          <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-wa-muted mt-0.5">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
