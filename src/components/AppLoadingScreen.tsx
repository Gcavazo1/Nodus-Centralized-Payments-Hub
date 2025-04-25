"use client";

import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Loader2 } from "lucide-react";

export function AppLoadingScreen() {
  const { isLoading } = useSiteSettings();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Delay before starting the fade-out
      const fadeDelay = 1000; // 1 second delay
      const fadeDuration = 500; // Duration of the fade-out animation (from CSS)

      // Start fade out after the delay
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, fadeDelay);

      // Remove component after delay + animation completes
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, fadeDelay + fadeDuration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${ // Ensure high z-index
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="mt-4 text-lg font-medium">Loading your experience...</h2>
        <p className="text-sm text-muted-foreground mt-2">powered by NODUS centralized payment hub</p>
      </div>
    </div>
  );
} 
