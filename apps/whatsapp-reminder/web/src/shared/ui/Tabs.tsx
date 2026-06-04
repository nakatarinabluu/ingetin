import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"
import { cn } from "@/shared/lib/tw.utils"

/**
 * 🚀 THE MODERN PRO TABS SYSTEM - v9.0
 * Professional, precise, and high-performance.
 */

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-xl bg-secondary/50 p-1 text-muted-foreground relative border border-border/50",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-1.5 text-xs font-bold tracking-tight transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary relative z-10",
      className
    )}
    {...props}
  >
    {children}
    {/* Animated Background for Active Tab */}
    {(props as Record<string, unknown>)["data-state"] === "active" && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-white rounded-lg shadow-subtle border border-border/50 -z-10"
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      />
    )}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
