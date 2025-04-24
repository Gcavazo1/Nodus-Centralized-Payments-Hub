import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Container size variants
 */
export type ContainerSize = 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Container component props
 */
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Element type to render as */
  as?: React.ElementType;
  /** Size variant of the container */
  size?: ContainerSize;
  /** Center content horizontally */
  centered?: boolean;
}

/**
 * Container Component
 * 
 * A responsive container element with configurable max-width
 * that centers content horizontally within the viewport.
 */
export function Container({
  as: Component = 'div',
  className,
  children,
  size = 'default',
  centered = true,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    default: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <Component
      className={cn(
        "px-4 sm:px-6 lg:px-8", 
        centered && "mx-auto", 
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 