import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Input variants using class-variance-authority
 * Provides consistent styling for different input styles and sizes
 */
const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-w-0 rounded-md border bg-transparent text-base transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted/50 dark:bg-muted/20",
        outline: "border-2",
        payment: "border-primary/20",
        error: "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-11 px-4 py-2 text-base",
        xl: "h-12 px-4 py-2 text-lg",
      },
      width: {
        default: "w-full",
        auto: "w-auto",
        xs: "w-20",
        sm: "w-32",
        md: "w-48",
        lg: "w-64",
        xl: "w-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
    },
  }
)

/**
 * Input component props
 */
export interface InputProps 
  extends Omit<React.ComponentProps<"input">, "size" | "width">,
    VariantProps<typeof inputVariants> {
  /**
   * Element to render before the input
   */
  startAdornment?: React.ReactNode;
  /**
   * Element to render after the input
   */
  endAdornment?: React.ReactNode;
  /**
   * Override width CSS directly (alternative to width variant)
   */
  customWidth?: string;
}

/**
 * Input Component
 * 
 * A versatile input component with multiple variants, sizes, and options
 * for adornments. Supports all standard HTML input attributes.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    variant, 
    size, 
    width, 
    startAdornment,
    endAdornment,
    customWidth,
    ...props 
  }, ref) => {
    // If we have adornments, we need to wrap the input in a div
    const hasAdornments = startAdornment || endAdornment;
    
    const inputElement = (
    <input
      type={type}
      data-slot="input"
        ref={ref}
      className={cn(
          inputVariants({ variant, size, width }),
          hasAdornments && 'flex-1',
          customWidth && customWidth, // Apply direct width if provided
        className
      )}
      {...props}
    />
    );
    
    // If no adornments, just return the input
    if (!hasAdornments) {
      return inputElement;
    }
    
    // With adornments, wrap in a container
    return (
      <div className={cn(
        "relative flex items-center w-full gap-2", 
        width && width !== 'default' ? 'w-auto' : 'w-full' // Keep container width consistent with input
      )}>
        {startAdornment && (
          <div className="flex items-center text-muted-foreground">
            {startAdornment}
          </div>
        )}
        
        {inputElement}
        
        {endAdornment && (
          <div className="flex items-center text-muted-foreground">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
