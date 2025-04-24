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
      // Start fade out animation
      setFadeOut(true);
      
      // Remove component after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500); // Match this with the transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="mt-4 text-lg font-medium">Loading your experience...</h2>
        <p className="text-sm text-muted-foreground mt-2">Applying your theme settings</p>
      </div>
    </div>
  );
} 