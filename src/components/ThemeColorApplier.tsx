"use client";

import { useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useTheme } from "next-themes";

export function ThemeColorApplier() {
  const { siteSettings } = useSiteSettings();
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    if (!siteSettings?.theme) return;
    
    const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
    
    // Apply custom colors if available
    if (siteSettings.theme.colors) {
      const colors = siteSettings.theme.colors[themeMode];
      
      if (!colors) return;
      
      // Apply the custom colors
      if (colors.background) {
        document.documentElement.style.setProperty('--background', colors.background);
      }
      
      if (colors.foreground) {
        document.documentElement.style.setProperty('--foreground', colors.foreground);
      }
      
      if (colors.card) {
        document.documentElement.style.setProperty('--card', colors.card);
        // Also update popover which typically uses the same color as card
        document.documentElement.style.setProperty('--popover', colors.card);
      }
      
      if (colors.cardForeground) {
        document.documentElement.style.setProperty('--card-foreground', colors.cardForeground);
        // Also update popover-foreground to match
        document.documentElement.style.setProperty('--popover-foreground', colors.cardForeground);
      }
      
      if (colors.primary) {
        document.documentElement.style.setProperty('--primary', colors.primary);
      }
      
      // Apply text/foreground colors
      if (colors.primaryForeground) {
        document.documentElement.style.setProperty('--primary-foreground', colors.primaryForeground);
      }
      
      if (colors.secondaryForeground) {
        document.documentElement.style.setProperty('--secondary-foreground', colors.secondaryForeground);
      }
      
      if (colors.mutedForeground) {
        document.documentElement.style.setProperty('--muted-foreground', colors.mutedForeground);
      }
      
      if (colors.secondary) {
        document.documentElement.style.setProperty('--secondary', colors.secondary);
      }
      
      if (colors.muted) {
        document.documentElement.style.setProperty('--muted', colors.muted);
      }
      
      if (colors.accent) {
        document.documentElement.style.setProperty('--accent', colors.accent);
      }
      
      if (colors.accentForeground) {
        document.documentElement.style.setProperty('--accent-foreground', colors.accentForeground);
      }
      
      if (colors.border) {
        document.documentElement.style.setProperty('--border', colors.border);
        document.documentElement.style.setProperty('--input', colors.border);
      }
    }
    
    // Apply overlay colors
    if (siteSettings.theme.lightOverlayColor) {
      document.documentElement.style.setProperty('--light-overlay', siteSettings.theme.lightOverlayColor);
    }
    
    if (siteSettings.theme.darkOverlayColor) {
      document.documentElement.style.setProperty('--dark-overlay', siteSettings.theme.darkOverlayColor);
    }
    
    // Log that colors were applied
    console.log(`[ThemeColorApplier] Applied ${themeMode} theme colors:`, 
      siteSettings.theme.colors?.[themeMode], 
      { 
        lightOverlay: siteSettings.theme.lightOverlayColor,
        darkOverlay: siteSettings.theme.darkOverlayColor
      }
    );
    
    // Return a cleanup function that resets the custom variables 
    return () => {
      // Reset to CSS variables defined in globals.css
      document.documentElement.style.removeProperty('--background');
      document.documentElement.style.removeProperty('--foreground');
      document.documentElement.style.removeProperty('--card');
      document.documentElement.style.removeProperty('--card-foreground');
      document.documentElement.style.removeProperty('--popover');
      document.documentElement.style.removeProperty('--popover-foreground');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-foreground');
      document.documentElement.style.removeProperty('--secondary');
      document.documentElement.style.removeProperty('--secondary-foreground');
      document.documentElement.style.removeProperty('--muted');
      document.documentElement.style.removeProperty('--muted-foreground');
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-foreground');
      document.documentElement.style.removeProperty('--border');
      document.documentElement.style.removeProperty('--input');
      document.documentElement.style.removeProperty('--light-overlay');
      document.documentElement.style.removeProperty('--dark-overlay');
    };
  }, [resolvedTheme, siteSettings?.theme]);
  
  return null; // This component doesn't render anything
} 