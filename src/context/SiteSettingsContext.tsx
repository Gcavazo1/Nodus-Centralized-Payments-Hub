'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, DocumentData, writeBatch } from 'firebase/firestore';
import { DEFAULT_THEME_SETTINGS, DEFAULT_PAYMENT_SETTINGS } from '@/config/theme-defaults';
import type { ThemeColors } from '@/config/theme-defaults';

// Set to true to enable verbose debug logging
const DEBUG_LOGGING = true;

// Helper function for conditionally logging
const debugLog = (...args: unknown[]) => {
  if (DEBUG_LOGGING) {
    console.log(`[${new Date().toISOString()}] SiteSettingsContext:`, ...args);
  }
};

// Re-export these interfaces using the types from our constants file
interface ThemeSettings {
  selectedTheme: string;
  lightOverlayOpacity: number;
  darkOverlayOpacity: number;
  lightOverlayColor?: string;
  darkOverlayColor?: string;
  colors?: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

interface PaymentSettings {
  enableCoinbase: boolean;
  // Add other providers here later if needed, e.g., enableStripe: boolean;
}

interface SiteSettings {
  theme: ThemeSettings;
  payments: PaymentSettings;
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings;
  isLoading: boolean;
  error: string | null;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  fetchSiteSettings: () => Promise<void>;
}

// Use the imported defaults
const defaultThemeSettings = DEFAULT_THEME_SETTINGS;
const defaultPaymentSettings = DEFAULT_PAYMENT_SETTINGS;

const defaultSiteSettings: SiteSettings = {
  theme: defaultThemeSettings,
  payments: defaultPaymentSettings,
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  siteSettings: defaultSiteSettings,
  isLoading: true,
  error: null,
  updateSiteSettings: async () => {},
  fetchSiteSettings: async () => {},
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetchSiteSettings function
  const fetchSiteSettings = useCallback(async () => {
    debugLog("Starting fetchSiteSettings...");
    setIsLoading(true);
    setError(null);
    try {
      const themeDocRef = doc(db, 'siteSettings', 'theme');
      const paymentsDocRef = doc(db, 'siteSettings', 'paymentProviders');
      
      const [themeSnap, paymentsSnap] = await Promise.all([
        getDoc(themeDocRef),
        getDoc(paymentsDocRef),
      ]);
      
      let fetchedThemeSettings = defaultThemeSettings;
      if (themeSnap.exists()) {
        const data = themeSnap.data() as DocumentData;
        fetchedThemeSettings = {
          selectedTheme: data.selectedTheme || defaultThemeSettings.selectedTheme,
          lightOverlayOpacity: data.lightOverlayOpacity ?? defaultThemeSettings.lightOverlayOpacity,
          darkOverlayOpacity: data.darkOverlayOpacity ?? defaultThemeSettings.darkOverlayOpacity,
          lightOverlayColor: data.lightOverlayColor || defaultThemeSettings.lightOverlayColor,
          darkOverlayColor: data.darkOverlayColor || defaultThemeSettings.darkOverlayColor,
          colors: data.colors || defaultThemeSettings.colors
        };
      }

      let fetchedPaymentSettings = defaultPaymentSettings;
      if (paymentsSnap.exists()) {
        const data = paymentsSnap.data() as DocumentData;
        fetchedPaymentSettings = {
          enableCoinbase: data.enableCoinbase === true, // Explicitly check for true
        };
      }

      debugLog("Fetched data", {
        themeExists: themeSnap.exists(),
        paymentsExists: paymentsSnap.exists(),
        fetchedThemeSettings,
        fetchedPaymentSettings
      });

      const newSettings = {
        theme: fetchedThemeSettings,
        payments: fetchedPaymentSettings,
      };

      // Ensure we're not updating state if the values haven't changed
      if (JSON.stringify(newSettings) !== JSON.stringify(siteSettings)) {
        debugLog("Settings changed, updating state");
        setSiteSettings(newSettings);
      } else {
        debugLog("Settings unchanged, not updating state");
      }

    } catch (err) {
      console.error("Error fetching site settings:", err);
      setError('Failed to load site settings. Using default values.');
      // Fallback to default settings if there's an error
      setSiteSettings(defaultSiteSettings);
    } finally {
      setIsLoading(false);
      debugLog("fetchSiteSettings finished.");
    }
  }, [siteSettings]); // Only include siteSettings as it's used for comparison

  // Initial fetch of site settings
  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]); // Add fetchSiteSettings as a dependency

  // Function to update site settings
  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    debugLog("Starting updateSiteSettings with", newSettings);
    setIsLoading(true); // Indicate loading during update
    try {
      const batch = db ? writeBatch(db) : null;
      let newLocalSettings = { ...siteSettings };

      if (newSettings.theme && batch) {
        const themeRef = doc(db, 'siteSettings', 'theme');
        batch.set(themeRef, { ...newSettings.theme, updatedAt: new Date() }, { merge: true });
        newLocalSettings = { ...newLocalSettings, theme: { ...siteSettings.theme, ...newSettings.theme } };
      }
      
      if (newSettings.payments && batch) {
        const paymentsRef = doc(db, 'siteSettings', 'paymentProviders');
        batch.set(paymentsRef, { ...newSettings.payments, updatedAt: new Date() }, { merge: true });
        newLocalSettings = { ...newLocalSettings, payments: { ...siteSettings.payments, ...newSettings.payments } };
      }
      
      if(batch){
          await batch.commit();
          debugLog("Batch commit successful.");
          // Update local state immediately after successful save
          setSiteSettings(newLocalSettings);
          debugLog("State updated after save", newLocalSettings);
          setError(null); // Clear previous errors on success
      } else {
          throw new Error("Database not initialized for batch write.");
      }

    } catch (err) {
      console.error("Error updating site settings:", err);
      setError('Failed to update site settings.'); // Set error state
      throw err; // Propagate error to caller
    } finally {
        setIsLoading(false);
        debugLog("updateSiteSettings finished.");
    }
  };

  const value = {
    siteSettings,
    isLoading,
    error,
    updateSiteSettings,
    fetchSiteSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
} 