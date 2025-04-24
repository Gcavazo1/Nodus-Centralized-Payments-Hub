"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
// import { useThemeSettings } from "@/context/ThemeSettingsContext"; // Old import
import { useSiteSettings } from "@/context/SiteSettingsContext"; // New import
// Removed Image import as we are using CSS background
// import Image from 'next/image'; 

/**
 * BackgroundImage component props
 */
interface BackgroundImageProps {
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string;
  /**
   * URL for the dark theme background image (fallback)
   */
  darkImageUrl?: string;
  /**
   * URL for the light theme background image (fallback)
   */
  lightImageUrl?: string;
  /**
   * Optional override for light overlay opacity (0-1)
   */
  lightOverlayOpacity?: number;
  /**
   * Optional override for dark overlay opacity (0-1)
   */
  darkOverlayOpacity?: number;
  /**
   * Preload the alternate theme image for faster theme switching
   */
  preloadAlternateTheme?: boolean;
  /**
   * Blur amount for background image
   */
  blurAmount?: string;
}

/**
 * BackgroundImage Component
 * 
 * Responsive background image component that changes based on the current theme.
 * Uses context for theme settings and handles loading states and errors.
 */
export function BackgroundImage({
  className,
  // Fallback image paths if theme settings can't be loaded
  darkImageUrl = "/images/centralized-dark-background.jpg",
  lightImageUrl = "/images/centralized-light-background.jpg",
  lightOverlayOpacity,
  darkOverlayOpacity,
  preloadAlternateTheme = true,
  blurAmount,
}: BackgroundImageProps) {
  const { theme, systemTheme } = useTheme();
  // Use the new context hook
  const { siteSettings, isLoading: isSiteSettingsLoading } = useSiteSettings();
  
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set CSS variables for opacity using siteSettings.theme
  useEffect(() => {
    if (mounted && !isSiteSettingsLoading) {
      // Use prop values first, then fallback to context values from siteSettings.theme
      const lightOpacity = lightOverlayOpacity ?? siteSettings.theme.lightOverlayOpacity;
      const darkOpacity = darkOverlayOpacity ?? siteSettings.theme.darkOverlayOpacity;
      
      // Set CSS custom properties for the overlay opacities
      document.documentElement.style.setProperty(
        '--light-overlay-opacity', 
        lightOpacity.toString()
      );
      document.documentElement.style.setProperty(
        '--dark-overlay-opacity', 
        darkOpacity.toString()
      );
  }
  }, [
    mounted, 
    isSiteSettingsLoading, 
    siteSettings.theme.lightOverlayOpacity, // Dependency on theme settings
    siteSettings.theme.darkOverlayOpacity, // Dependency on theme settings
    lightOverlayOpacity,
    darkOverlayOpacity
  ]);

  // Determine the correct theme - handle SSR and system preferences
  const resolvedTheme = useMemo(() => {
    if (!mounted) return "light"; // Default during SSR
    return theme === "system" ? systemTheme : theme;
  }, [mounted, theme, systemTheme]);

  const isLightMode = resolvedTheme === "light";
  
  // Calculate image paths using siteSettings.theme.selectedTheme
  const themePath = `/images/${isSiteSettingsLoading ? 'centralized' : siteSettings.theme.selectedTheme}`;
  const mainImageUrl = isLightMode 
    ? `${themePath}-light-background.jpg` 
    : `${themePath}-dark-background.jpg`;
  
  // During loading or error, use the provided default paths
  const displayUrl = isSiteSettingsLoading || imageError
    ? (isLightMode ? lightImageUrl : darkImageUrl) 
    : mainImageUrl;
  
  // Determine alternate theme image for preloading using siteSettings.theme.selectedTheme
  const alternateImageUrl = isLightMode
    ? `${themePath}-dark-background.jpg`
    : `${themePath}-light-background.jpg`;
  
  const themeBgClass = isLightMode ? "theme-light-bg" : "theme-dark-bg";

  // If not mounted, render an empty div to avoid hydration mismatch
  if (!mounted) {
    return <div className={cn("fixed inset-0 -z-10", className)} />;
  }

  return (
    <div className={cn(
        "fixed inset-0 -z-10 overflow-hidden", 
        themeBgClass,
        className
      )}>
      {/* Background image - Overlay is handled by globals.css */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000",
          blurAmount && `backdrop-blur-${blurAmount}`
        )}
        style={{ backgroundImage: `url(${displayUrl})` }}
        key={displayUrl}
        onError={() => setImageError(true)}
      />
      
      {/* Preload the alternate theme image for faster theme switching */}
      {preloadAlternateTheme && (
        <link
          rel="preload"
          as="image"
          href={alternateImageUrl}
          key={alternateImageUrl}
        />
      )}
    </div>
  );
} 