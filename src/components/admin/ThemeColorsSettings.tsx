'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ColorPickerInput } from '@/components/ui/color-picker';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { DEFAULT_THEME_COLORS, type ThemeColors, type ThemeColorSettings } from '@/config/theme-defaults';

// Use the imported defaults
const defaultColors = DEFAULT_THEME_COLORS;

export function ThemeColorsSettings() {
  const { siteSettings, updateSiteSettings, isLoading: isContextLoading } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");
  const [settings, setSettings] = useState<ThemeColorSettings>(() => ({
    light: {
      background: siteSettings?.theme?.colors?.light?.background || defaultColors.light.background,
      foreground: siteSettings?.theme?.colors?.light?.foreground || defaultColors.light.foreground,
      card: siteSettings?.theme?.colors?.light?.card || defaultColors.light.card,
      cardForeground: siteSettings?.theme?.colors?.light?.cardForeground || defaultColors.light.cardForeground,
      primary: siteSettings?.theme?.colors?.light?.primary || defaultColors.light.primary,
      primaryForeground: siteSettings?.theme?.colors?.light?.primaryForeground || defaultColors.light.primaryForeground,
      secondary: siteSettings?.theme?.colors?.light?.secondary || defaultColors.light.secondary,
      secondaryForeground: siteSettings?.theme?.colors?.light?.secondaryForeground || defaultColors.light.secondaryForeground,
      muted: siteSettings?.theme?.colors?.light?.muted || defaultColors.light.muted,
      mutedForeground: siteSettings?.theme?.colors?.light?.mutedForeground || defaultColors.light.mutedForeground,
      accent: siteSettings?.theme?.colors?.light?.accent || defaultColors.light.accent,
      accentForeground: siteSettings?.theme?.colors?.light?.accentForeground || defaultColors.light.accentForeground,
      border: siteSettings?.theme?.colors?.light?.border || defaultColors.light.border
    },
    dark: {
      background: siteSettings?.theme?.colors?.dark?.background || defaultColors.dark.background,
      foreground: siteSettings?.theme?.colors?.dark?.foreground || defaultColors.dark.foreground,
      card: siteSettings?.theme?.colors?.dark?.card || defaultColors.dark.card,
      cardForeground: siteSettings?.theme?.colors?.dark?.cardForeground || defaultColors.dark.cardForeground,
      primary: siteSettings?.theme?.colors?.dark?.primary || defaultColors.dark.primary,
      primaryForeground: siteSettings?.theme?.colors?.dark?.primaryForeground || defaultColors.dark.primaryForeground,
      secondary: siteSettings?.theme?.colors?.dark?.secondary || defaultColors.dark.secondary,
      secondaryForeground: siteSettings?.theme?.colors?.dark?.secondaryForeground || defaultColors.dark.secondaryForeground,
      muted: siteSettings?.theme?.colors?.dark?.muted || defaultColors.dark.muted,
      mutedForeground: siteSettings?.theme?.colors?.dark?.mutedForeground || defaultColors.dark.mutedForeground,
      accent: siteSettings?.theme?.colors?.dark?.accent || defaultColors.dark.accent,
      accentForeground: siteSettings?.theme?.colors?.dark?.accentForeground || defaultColors.dark.accentForeground,
      border: siteSettings?.theme?.colors?.dark?.border || defaultColors.dark.border
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
          foreground: siteSettings.theme.colors.light?.foreground || defaultColors.light.foreground,
          card: siteSettings.theme.colors.light?.card || defaultColors.light.card,
          cardForeground: siteSettings.theme.colors.light?.cardForeground || defaultColors.light.cardForeground,
          primary: siteSettings.theme.colors.light?.primary || defaultColors.light.primary,
          primaryForeground: siteSettings.theme.colors.light?.primaryForeground || defaultColors.light.primaryForeground,
          secondary: siteSettings.theme.colors.light?.secondary || defaultColors.light.secondary,
          secondaryForeground: siteSettings.theme.colors.light?.secondaryForeground || defaultColors.light.secondaryForeground,
          muted: siteSettings.theme.colors.light?.muted || defaultColors.light.muted,
          mutedForeground: siteSettings.theme.colors.light?.mutedForeground || defaultColors.light.mutedForeground,
          accent: siteSettings.theme.colors.light?.accent || defaultColors.light.accent,
          accentForeground: siteSettings.theme.colors.light?.accentForeground || defaultColors.light.accentForeground,
          border: siteSettings.theme.colors.light?.border || defaultColors.light.border
        },
        dark: {
          background: siteSettings.theme.colors.dark?.background || defaultColors.dark.background,
          foreground: siteSettings.theme.colors.dark?.foreground || defaultColors.dark.foreground,
          card: siteSettings.theme.colors.dark?.card || defaultColors.dark.card,
          cardForeground: siteSettings.theme.colors.dark?.cardForeground || defaultColors.dark.cardForeground,
          primary: siteSettings.theme.colors.dark?.primary || defaultColors.dark.primary,
          primaryForeground: siteSettings.theme.colors.dark?.primaryForeground || defaultColors.dark.primaryForeground,
          secondary: siteSettings.theme.colors.dark?.secondary || defaultColors.dark.secondary,
          secondaryForeground: siteSettings.theme.colors.dark?.secondaryForeground || defaultColors.dark.secondaryForeground,
          muted: siteSettings.theme.colors.dark?.muted || defaultColors.dark.muted,
          mutedForeground: siteSettings.theme.colors.dark?.mutedForeground || defaultColors.dark.mutedForeground,
          accent: siteSettings.theme.colors.dark?.accent || defaultColors.dark.accent,
          accentForeground: siteSettings.theme.colors.dark?.accentForeground || defaultColors.dark.accentForeground,
          border: siteSettings.theme.colors.dark?.border || defaultColors.dark.border
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
          foreground: siteSettings.theme.colors.light?.foreground || "",
          card: siteSettings.theme.colors.light?.card || "",
          cardForeground: siteSettings.theme.colors.light?.cardForeground || "",
          primary: siteSettings.theme.colors.light?.primary || "",
          primaryForeground: siteSettings.theme.colors.light?.primaryForeground || "",
          secondary: siteSettings.theme.colors.light?.secondary || "",
          secondaryForeground: siteSettings.theme.colors.light?.secondaryForeground || "",
          muted: siteSettings.theme.colors.light?.muted || "",
          mutedForeground: siteSettings.theme.colors.light?.mutedForeground || "",
          accent: siteSettings.theme.colors.light?.accent || "",
          accentForeground: siteSettings.theme.colors.light?.accentForeground || "",
          border: siteSettings.theme.colors.light?.border || ""
        },
        dark: {
          background: siteSettings.theme.colors.dark?.background || "",
          foreground: siteSettings.theme.colors.dark?.foreground || "",
          card: siteSettings.theme.colors.dark?.card || "",
          cardForeground: siteSettings.theme.colors.dark?.cardForeground || "",
          primary: siteSettings.theme.colors.dark?.primary || "",
          primaryForeground: siteSettings.theme.colors.dark?.primaryForeground || "",
          secondary: siteSettings.theme.colors.dark?.secondary || "",
          secondaryForeground: siteSettings.theme.colors.dark?.secondaryForeground || "",
          muted: siteSettings.theme.colors.dark?.muted || "",
          mutedForeground: siteSettings.theme.colors.dark?.mutedForeground || "",
          accent: siteSettings.theme.colors.dark?.accent || "",
          accentForeground: siteSettings.theme.colors.dark?.accentForeground || "",
          border: siteSettings.theme.colors.dark?.border || ""
        }
      };

      setHasChanges(
        settings.light.background !== currentSettings.light.background ||
        settings.light.foreground !== currentSettings.light.foreground ||
        settings.light.card !== currentSettings.light.card ||
        settings.light.cardForeground !== currentSettings.light.cardForeground ||
        settings.light.primary !== currentSettings.light.primary ||
        settings.light.primaryForeground !== currentSettings.light.primaryForeground ||
        settings.light.secondary !== currentSettings.light.secondary ||
        settings.light.secondaryForeground !== currentSettings.light.secondaryForeground ||
        settings.light.muted !== currentSettings.light.muted ||
        settings.light.mutedForeground !== currentSettings.light.mutedForeground ||
        settings.light.accent !== currentSettings.light.accent ||
        settings.light.accentForeground !== currentSettings.light.accentForeground ||
        settings.light.border !== currentSettings.light.border ||
        settings.dark.background !== currentSettings.dark.background ||
        settings.dark.foreground !== currentSettings.dark.foreground ||
        settings.dark.card !== currentSettings.dark.card ||
        settings.dark.cardForeground !== currentSettings.dark.cardForeground ||
        settings.dark.primary !== currentSettings.dark.primary ||
        settings.dark.primaryForeground !== currentSettings.dark.primaryForeground ||
        settings.dark.secondary !== currentSettings.dark.secondary ||
        settings.dark.secondaryForeground !== currentSettings.dark.secondaryForeground ||
        settings.dark.muted !== currentSettings.dark.muted ||
        settings.dark.mutedForeground !== currentSettings.dark.mutedForeground ||
        settings.dark.accent !== currentSettings.dark.accent ||
        settings.dark.accentForeground !== currentSettings.dark.accentForeground ||
        settings.dark.border !== currentSettings.dark.border
      );
    }
  }, [settings, siteSettings?.theme?.colors, isContextLoading]);

  const updateThemeColor = (mode: "light" | "dark", property: keyof ThemeColors, value: string) => {
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
              label="Foreground Color"
              value={settings.light.foreground}
              onChange={(value) => updateThemeColor("light", "foreground", value)}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.light.card}
              onChange={(value) => updateThemeColor("light", "card", value)}
            />
            <ColorPickerInput
              label="Card Foreground Color"
              value={settings.light.cardForeground}
              onChange={(value) => updateThemeColor("light", "cardForeground", value)}
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
            
            <h3 className="text-lg font-medium mb-2 mt-6">UI Colors</h3>
            <ColorPickerInput
              label="Accent Color"
              value={settings.light.accent}
              onChange={(value) => updateThemeColor("light", "accent", value)}
            />
            <ColorPickerInput
              label="Accent Foreground Color"
              value={settings.light.accentForeground}
              onChange={(value) => updateThemeColor("light", "accentForeground", value)}
            />
            <ColorPickerInput
              label="Border Color"
              value={settings.light.border}
              onChange={(value) => updateThemeColor("light", "border", value)}
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
              label="Foreground Color"
              value={settings.dark.foreground}
              onChange={(value) => updateThemeColor("dark", "foreground", value)}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.dark.card}
              onChange={(value) => updateThemeColor("dark", "card", value)}
            />
            <ColorPickerInput
              label="Card Foreground Color"
              value={settings.dark.cardForeground}
              onChange={(value) => updateThemeColor("dark", "cardForeground", value)}
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
            
            <h3 className="text-lg font-medium mb-2 mt-6">UI Colors</h3>
            <ColorPickerInput
              label="Accent Color"
              value={settings.dark.accent}
              onChange={(value) => updateThemeColor("dark", "accent", value)}
            />
            <ColorPickerInput
              label="Accent Foreground Color"
              value={settings.dark.accentForeground}
              onChange={(value) => updateThemeColor("dark", "accentForeground", value)}
            />
            <ColorPickerInput
              label="Border Color"
              value={settings.dark.border}
              onChange={(value) => updateThemeColor("dark", "border", value)}
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