"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * ThemeToggle Component Props
 */
interface ThemeToggleProps {
  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;
  /**
   * Button size variant - inherits from Button component
   */
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  /**
   * Button variant - inherits from Button component
   */
  variant?: "ghost" | "outline" | "default" | "secondary" | "subtle";
  /**
   * Visually show the current theme as a label
   */
  showLabel?: boolean;
  /**
   * Customize the label shown for light theme
   */
  lightLabel?: string;
  /**
   * Customize the label shown for dark theme
   */
  darkLabel?: string;
}

/**
 * ThemeToggle Component
 * 
 * A button that toggles between light and dark themes.
 * Uses next-themes for theme management.
 */
export function ThemeToggle({
  className,
  size = "icon",
  variant = "ghost",
  showLabel = false,
  lightLabel = "Light",
  darkLabel = "Dark",
}: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we can safely show the UI without risking hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || resolvedTheme === "light");
  
  // Helper for toggling theme
  const toggleTheme = React.useCallback(() => {
    setTheme(isLight ? "dark" : "light");
  }, [isLight, setTheme]);

  // Display nothing until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className={`h-9 w-9 ${className || ''}`} />;
  }

  // With label, use a different layout
  if (showLabel) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={className}
        onClick={toggleTheme}
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      >
        {isLight ? (
          <>
            <Moon className="mr-2 h-4 w-4" />
            {darkLabel}
          </>
        ) : (
          <>
            <Sun className="mr-2 h-4 w-4" />
            {lightLabel}
          </>
        )}
      </Button>
    );
  }

  // Default icon-only version
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
    >
      <Sun 
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
        aria-hidden="true"
      />
      <Moon 
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
        aria-hidden="true"
      />
      <span className="sr-only">
        {isLight ? `Switch to dark theme` : `Switch to light theme`}
      </span>
    </Button>
  );
} 