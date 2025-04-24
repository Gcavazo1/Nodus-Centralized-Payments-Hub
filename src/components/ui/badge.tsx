import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge variants using class-variance-authority
 * Provides consistent styling for different badge styles
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning:
          "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        neutral:
          "border-transparent bg-gray-500 text-white hover:bg-gray-500/80",
        // Payment status badges
        pending:
          "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
        processing:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        completed:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        canceled:
          "border-transparent bg-gray-500 text-white hover:bg-gray-500/80",
        failed:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.25 text-[10px]",
        lg: "px-3 py-0.75 text-sm",
      },
      shape: {
        default: "rounded-full",
        rounded: "rounded-md",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

/**
 * Badge component props
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display at the start of the badge
   */
  startIcon?: React.ReactNode;
  /**
   * Optional icon to display at the end of the badge
   */
  endIcon?: React.ReactNode;
  /**
   * If true, badge will have a dot at the start
   */
  hasDot?: boolean;
  /**
   * Color for the dot (if hasDot is true)
   */
  dotColor?: string;
}

/**
 * Badge Component
 * 
 * A versatile badge component with multiple variants and sizes.
 * Can include icons or indicator dots.
 */
function Badge({ 
  className, 
  variant, 
  size, 
  shape,
  startIcon,
  endIcon,
  hasDot = false,
  dotColor,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size, shape }), className)} 
      {...props}
    >
      {hasDot && (
        <span 
          className={cn(
            "mr-1 inline-block h-1.5 w-1.5 rounded-full", 
            dotColor || (variant ? `bg-current` : "bg-current")
          )} 
        />
      )}
      
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </div>
  );
}

export { Badge, badgeVariants } 