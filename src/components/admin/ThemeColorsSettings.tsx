'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ColorPickerInput } from '@/components/ui/color-picker';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Default colors to reset to
const defaultColors = {
  light: {
    background: "oklch(1 0 0)",
    card: "oklch(1 0 0)",
    primary: "oklch(0.208 0.042 265.755)",
    primaryForeground: "oklch(0.984 0.003 247.858)",
    secondaryForeground: "oklch(0.208 0.042 265.755)",
    mutedForeground: "oklch(0.80 0.15 85.0)"
  },
  dark: {
    background: "oklch(0.0 0.0 0.0)",
    card: "oklch(20.5% 0 0)",
    primary: "oklch(0.929 0.013 255.508)",
    primaryForeground: "oklch(0.208 0.042 265.755)",
    secondaryForeground: "oklch(0.984 0.003 247.858)",
    mutedForeground: "oklch(0.80 0.15 85.0)"
  }
};

interface ThemeModeColors {
  background: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondaryForeground: string;
  mutedForeground: string;
}

interface ThemeColorSettings {
  light: ThemeModeColors;
  dark: ThemeModeColors;
}

export function ThemeColorsSettings() {
  const { siteSettings, updateSiteSettings, isLoading: isContextLoading } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");
  const [settings, setSettings] = useState<ThemeColorSettings>(() => ({
    light: {
      background: siteSettings?.theme?.colors?.light?.background || defaultColors.light.background,
      card: siteSettings?.theme?.colors?.light?.card || defaultColors.light.card,
      primary: siteSettings?.theme?.colors?.light?.primary || defaultColors.light.primary,
      primaryForeground: siteSettings?.theme?.colors?.light?.primaryForeground || defaultColors.light.primaryForeground,
      secondaryForeground: siteSettings?.theme?.colors?.light?.secondaryForeground || defaultColors.light.secondaryForeground,
      mutedForeground: siteSettings?.theme?.colors?.light?.mutedForeground || defaultColors.light.mutedForeground,
    },
    dark: {
      background: siteSettings?.theme?.colors?.dark?.background || defaultColors.dark.background,
      card: siteSettings?.theme?.colors?.dark?.card || defaultColors.dark.card,
      primary: siteSettings?.theme?.colors?.dark?.primary || defaultColors.dark.primary,
      primaryForeground: siteSettings?.theme?.colors?.dark?.primaryForeground || defaultColors.dark.primaryForeground,
      secondaryForeground: siteSettings?.theme?.colors?.dark?.secondaryForeground || defaultColors.dark.secondaryForeground,
      mutedForeground: siteSettings?.theme?.colors?.dark?.mutedForeground || defaultColors.dark.mutedForeground,
    }
  }));
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when context loads or changes
  useEffect(() => {
    if (!isContextLoading && siteSettings?.theme?.colors) {
      setSettings({
        light: {
          background: siteSettings.theme.colors.light?.background || defaultColors.light.background,
          card: siteSettings.theme.colors.light?.card || defaultColors.light.card,
          primary: siteSettings.theme.colors.light?.primary || defaultColors.light.primary,
          primaryForeground: siteSettings.theme.colors.light?.primaryForeground || defaultColors.light.primaryForeground,
          secondaryForeground: siteSettings.theme.colors.light?.secondaryForeground || defaultColors.light.secondaryForeground,
          mutedForeground: siteSettings.theme.colors.light?.mutedForeground || defaultColors.light.mutedForeground,
        },
        dark: {
          background: siteSettings.theme.colors.dark?.background || defaultColors.dark.background,
          card: siteSettings.theme.colors.dark?.card || defaultColors.dark.card,
          primary: siteSettings.theme.colors.dark?.primary || defaultColors.dark.primary,
          primaryForeground: siteSettings.theme.colors.dark?.primaryForeground || defaultColors.dark.primaryForeground,
          secondaryForeground: siteSettings.theme.colors.dark?.secondaryForeground || defaultColors.dark.secondaryForeground,
          mutedForeground: siteSettings.theme.colors.dark?.mutedForeground || defaultColors.dark.mutedForeground,
        }
      });
    }
  }, [isContextLoading, siteSettings?.theme?.colors]);

  // Check for unsaved changes
  useEffect(() => {
    if (!isContextLoading && siteSettings?.theme?.colors) {
      const currentSettings = {
        light: {
          background: siteSettings.theme.colors.light?.background || "",
          card: siteSettings.theme.colors.light?.card || "",
          primary: siteSettings.theme.colors.light?.primary || "",
          primaryForeground: siteSettings.theme.colors.light?.primaryForeground || "",
          secondaryForeground: siteSettings.theme.colors.light?.secondaryForeground || "",
          mutedForeground: siteSettings.theme.colors.light?.mutedForeground || "",
        },
        dark: {
          background: siteSettings.theme.colors.dark?.background || "",
          card: siteSettings.theme.colors.dark?.card || "",
          primary: siteSettings.theme.colors.dark?.primary || "",
          primaryForeground: siteSettings.theme.colors.dark?.primaryForeground || "",
          secondaryForeground: siteSettings.theme.colors.dark?.secondaryForeground || "",
          mutedForeground: siteSettings.theme.colors.dark?.mutedForeground || "",
        }
      };

      setHasChanges(
        settings.light.background !== currentSettings.light.background ||
        settings.light.card !== currentSettings.light.card ||
        settings.light.primary !== currentSettings.light.primary ||
        settings.light.primaryForeground !== currentSettings.light.primaryForeground ||
        settings.light.secondaryForeground !== currentSettings.light.secondaryForeground ||
        settings.light.mutedForeground !== currentSettings.light.mutedForeground ||
        settings.dark.background !== currentSettings.dark.background ||
        settings.dark.card !== currentSettings.dark.card ||
        settings.dark.primary !== currentSettings.dark.primary ||
        settings.dark.primaryForeground !== currentSettings.dark.primaryForeground ||
        settings.dark.secondaryForeground !== currentSettings.dark.secondaryForeground ||
        settings.dark.mutedForeground !== currentSettings.dark.mutedForeground
      );
    }
  }, [settings, siteSettings?.theme?.colors, isContextLoading]);

  const updateThemeColor = (mode: "light" | "dark", property: keyof ThemeModeColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [property]: value
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await updateSiteSettings({
        theme: {
          ...siteSettings.theme,
          colors: settings
        }
      });
      toast.success("Theme colors saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving theme colors:", error);
      toast.error("Failed to save theme colors");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Colors</CardTitle>
        <CardDescription>
          Customize the colors for light and dark themes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="light" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "light" | "dark")}
        >
          <TabsList>
            <TabsTrigger value="light">Light Theme</TabsTrigger>
            <TabsTrigger value="dark">Dark Theme</TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="space-y-4 py-4" key="light-content">
            <h3 className="text-lg font-medium mb-2">Background Colors</h3>
            <ColorPickerInput
              label="Background Color"
              value={settings.light.background}
              onChange={(value) => updateThemeColor("light", "background", value)}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.light.card}
              onChange={(value) => updateThemeColor("light", "card", value)}
            />
            <ColorPickerInput
              label="Primary Color"
              value={settings.light.primary}
              onChange={(value) => updateThemeColor("light", "primary", value)}
            />
            
            <h3 className="text-lg font-medium mb-2 mt-6">Text Colors</h3>
            <ColorPickerInput
              label="Primary Text Color"
              value={settings.light.primaryForeground}
              onChange={(value) => updateThemeColor("light", "primaryForeground", value)}
            />
            <ColorPickerInput
              label="Secondary Text Color"
              value={settings.light.secondaryForeground}
              onChange={(value) => updateThemeColor("light", "secondaryForeground", value)}
            />
            <ColorPickerInput
              label="Muted Text Color"
              value={settings.light.mutedForeground}
              onChange={(value) => updateThemeColor("light", "mutedForeground", value)}
            />
          </TabsContent>
          <TabsContent value="dark" className="space-y-4 py-4" key="dark-content">
            <h3 className="text-lg font-medium mb-2">Background Colors</h3>
            <ColorPickerInput
              label="Background Color"
              value={settings.dark.background}
              onChange={(value) => updateThemeColor("dark", "background", value)}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.dark.card}
              onChange={(value) => updateThemeColor("dark", "card", value)}
            />
            <ColorPickerInput
              label="Primary Color"
              value={settings.dark.primary}
              onChange={(value) => updateThemeColor("dark", "primary", value)}
            />
            
            <h3 className="text-lg font-medium mb-2 mt-6">Text Colors</h3>
            <ColorPickerInput
              label="Primary Text Color"
              value={settings.dark.primaryForeground}
              onChange={(value) => updateThemeColor("dark", "primaryForeground", value)}
            />
            <ColorPickerInput
              label="Secondary Text Color"
              value={settings.dark.secondaryForeground}
              onChange={(value) => updateThemeColor("dark", "secondaryForeground", value)}
            />
            <ColorPickerInput
              label="Muted Text Color"
              value={settings.dark.mutedForeground}
              onChange={(value) => updateThemeColor("dark", "mutedForeground", value)}
            />
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={saveSettings} 
            disabled={loading || !hasChanges || isContextLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme Colors"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 