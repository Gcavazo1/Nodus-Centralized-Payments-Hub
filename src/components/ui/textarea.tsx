import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Textarea variants using class-variance-authority
 * Provides consistent styling for different textarea styles
 */
const textareaVariants = cva(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted/50 dark:bg-input/30",
        outline: "border-2",
        error: "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      },
      height: {
        default: "min-h-16",
        sm: "min-h-12",
        md: "min-h-24",
        lg: "min-h-32",
        xl: "min-h-40",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      height: "default",
      resize: "vertical",
    },
  }
)

/**
 * Textarea component props
 */
export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "height">,
    VariantProps<typeof textareaVariants> {
  /**
   * Show a word/character counter
   */
  showCount?: boolean;
  /**
   * Type of counter to display (words or characters)
   */
  counterType?: "words" | "characters";
  /**
   * Maximum allowed count (words or characters)
   */
  maxCount?: number;
}

/**
 * Textarea Component
 * 
 * A versatile textarea component with multiple variants and sizes.
 * Includes optional character/word counter.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    height, 
    resize,
    showCount = false,
    counterType = "characters",
    maxCount,
    onChange,
    value,
    defaultValue,
    ...props 
  }, ref) => {
    const [count, setCount] = React.useState(() => {
      const initialText = value?.toString() || defaultValue?.toString() || "";
      return counterType === "words" 
        ? initialText.trim().split(/\s+/).filter(Boolean).length 
        : initialText.length;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      
      // Update the count
      setCount(
        counterType === "words" 
          ? text.trim().split(/\s+/).filter(Boolean).length 
          : text.length
      );
      
      // Call the original onChange handler
      onChange?.(e);
    };

  return (
      <div className="flex flex-col w-full">
    <textarea
      data-slot="textarea"
          className={cn(textareaVariants({ variant, height, resize }), className)}
          ref={ref}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
      {...props}
    />
        
        {showCount && (
          <div className="flex justify-end mt-1 text-xs text-muted-foreground">
            <span>
              {count}
              {maxCount ? ` / ${maxCount}` : ""} {counterType}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants }
