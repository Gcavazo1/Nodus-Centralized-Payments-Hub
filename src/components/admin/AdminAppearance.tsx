'use client';

import { useState, useEffect } from 'react';
// import { db } from '@/lib/firebase'; // Unused
// import { doc, getDoc, setDoc } from 'firebase/firestore'; // Unused
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardContent, CardFooter
import { Button } from '@/components/ui/button';
import { Palette, Check, Loader2, SunIcon, MoonIcon, ImageIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Slider } from '@/components/ui/slider';
import { SocialLinksManager } from '@/components/admin/SocialLinksManager';
import { ThemeColorsSettings } from '@/components/admin/ThemeColorsSettings';
import { ColorPickerInput } from '@/components/ui/color-picker';
import { DEFAULT_THEME_SETTINGS } from '@/config/theme-defaults';

// Define theme options
const themeOptions = [
  { id: 'centralized', name: 'Centralized', description: 'Clean, professional look for payment services' },
  { id: 'chique', name: 'Chique', description: 'Elegant, upscale design for premium services' },
  { id: 'commerce', name: 'Commerce', description: 'Business-oriented theme for e-commerce' },
  { id: 'crimson', name: 'Crimson', description: 'Bold, dynamic style with warm accents' },
  { id: 'currency', name: 'Currency', description: 'Finance-focused design with monetary elements' },
  { id: 'elegant', name: 'Elegant', description: 'Minimalist, refined aesthetic' },
  { id: 'marketing', name: 'Marketing', description: 'Vibrant theme for promotional campaigns' },
  { id: 'nodes', name: 'Nodes', description: 'Tech-inspired theme with network motifs' },
  { id: 'custom', name: 'Custom', description: 'Your own custom theme (requires deployment)' },
];

export default function AdminAppearance() {
  const { siteSettings, updateSiteSettings, isLoading: isContextLoading, error: contextError } = useSiteSettings();
  const [selectedTheme, setSelectedTheme] = useState<string>(siteSettings.theme.selectedTheme);
  const [lightOpacity, setLightOpacity] = useState<number>(siteSettings.theme.lightOverlayOpacity);
  const [darkOpacity, setDarkOpacity] = useState<number>(siteSettings.theme.darkOverlayOpacity);
  const [lightOverlayColor, setLightOverlayColor] = useState<string>(siteSettings.theme.lightOverlayColor || "oklch(0.0 0.0 0.0)");
  const [darkOverlayColor, setDarkOverlayColor] = useState<string>(siteSettings.theme.darkOverlayColor || "oklch(0.0 0.0 0.0)");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when context loads or changes
  useEffect(() => {
    if (!isContextLoading) {
      setSelectedTheme(siteSettings.theme.selectedTheme);
      setLightOpacity(siteSettings.theme.lightOverlayOpacity);
      setDarkOpacity(siteSettings.theme.darkOverlayOpacity);
      setLightOverlayColor(siteSettings.theme.lightOverlayColor || "oklch(0.0 0.0 0.0)");
      setDarkOverlayColor(siteSettings.theme.darkOverlayColor || "oklch(0.0 0.0 0.0)");
      setIsLoading(false);
      // Clear local error if context loaded successfully
      if (!contextError) {
         setError(null);
      }
    } else {
        setIsLoading(true);
    }
    // Use context error state if it exists
    if (contextError) {
        setError(contextError);
    }
  }, [isContextLoading, siteSettings.theme, contextError]);

  // Check for unsaved changes against context state
  useEffect(() => {
    if (!isLoading && !isContextLoading) {
      setHasChanges(
        selectedTheme !== siteSettings.theme.selectedTheme ||
        lightOpacity !== siteSettings.theme.lightOverlayOpacity ||
        darkOpacity !== siteSettings.theme.darkOverlayOpacity ||
        lightOverlayColor !== siteSettings.theme.lightOverlayColor ||
        darkOverlayColor !== siteSettings.theme.darkOverlayColor
      );
    }
  }, [selectedTheme, lightOpacity, darkOpacity, lightOverlayColor, darkOverlayColor, siteSettings.theme, isLoading, isContextLoading]);

  // Prepare theme data for saving/applying
  const getThemeSettingsToUpdate = () => ({
    selectedTheme: selectedTheme,
    lightOverlayOpacity: lightOpacity,
    darkOverlayOpacity: darkOpacity,
    lightOverlayColor: lightOverlayColor,
    darkOverlayColor: darkOverlayColor,
  });

  // Save theme settings (only theme part)
  const saveThemeSettings = async () => {
    setIsSaving(true);
    setError(null);
    const themeUpdate = getThemeSettingsToUpdate();
    
    try {
      // Use the updated context function, passing only the theme part
      await updateSiteSettings({ theme: themeUpdate });
      
      toast.success(
        'Theme settings saved successfully. Please refresh the page to see the new background.',
        {
          duration: 5000, // Show for 5 seconds
          description: 'The background will update after refreshing'
        }
      );
      setHasChanges(false); // Reset flag after successful save
    } catch (err) {
      console.error('Error saving theme settings:', err);
      // Error is likely already set by the context, but set local just in case
      const errorMessage = err instanceof Error ? err.message : 'Failed to save theme settings. Please try again.';
      setError(errorMessage);
      toast.error('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply changes immediately (only theme part)
  const applyChanges = async () => {
    setIsSaving(true);
    setError(null);
    const themeUpdate = getThemeSettingsToUpdate();

    try {
      // Use the updated context function, passing only the theme part
      await updateSiteSettings({ theme: themeUpdate });
      toast.success('Theme changes applied successfully!');
      setHasChanges(false); // Reset flag after successful apply
    } catch (err) {
      console.error('Error applying theme settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply changes. Please try again.';
      setError(errorMessage);
      toast.error('Failed to apply changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Add reset all function
  const resetAllThemeSettings = async () => {
    if (confirm("Are you sure you want to reset all theme settings to defaults? This will reset theme selection, overlay colors, opacity, and all custom colors.")) {
      setIsSaving(true);
      setError(null);
      
      try {
        // Reset local state
        setSelectedTheme(DEFAULT_THEME_SETTINGS.selectedTheme);
        setLightOpacity(DEFAULT_THEME_SETTINGS.lightOverlayOpacity);
        setDarkOpacity(DEFAULT_THEME_SETTINGS.darkOverlayOpacity);
        setLightOverlayColor(DEFAULT_THEME_SETTINGS.lightOverlayColor || "oklch(0.0 0.0 0.0)");
        setDarkOverlayColor(DEFAULT_THEME_SETTINGS.darkOverlayColor || "oklch(0.0 0.0 0.0)");
        
        // Use our centralized default settings
        await updateSiteSettings({ theme: DEFAULT_THEME_SETTINGS });
        
        toast.success('All theme settings have been reset to defaults');
        setHasChanges(false);
      } catch (err) {
        console.error('Error resetting theme settings:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to reset theme settings. Please try again.';
        setError(errorMessage);
        toast.error('Failed to reset theme settings');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatOpacity = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Appearance Settings</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={resetAllThemeSettings} 
            disabled={isLoading || isSaving}
            variant="outline"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Reset All Settings
              </>
            )}
          </Button>
          <Button 
            onClick={applyChanges} 
            disabled={isLoading || isSaving || !hasChanges}
            variant="outline"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Changes'
            )}
          </Button>
          <Button 
            onClick={saveThemeSettings} 
            disabled={isLoading || isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* Theme Options */}
      <div>
        <h2 className="text-xl font-medium mb-4">Theme Options</h2>
        <p className="text-muted-foreground mb-6">
          Select a theme for your payment hub. Each theme includes light and dark mode variants.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeOptions.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={() => setSelectedTheme(theme.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Opacity Controls */}
      <div>
        <h2 className="text-xl font-medium mb-4">Background Overlay</h2>
        <p className="text-muted-foreground mb-6">
          Adjust the overlay colors and opacity for light and dark modes.
        </p>
        
        <div className="space-y-6">
          {/* Light Mode Overlay Controls */}
          <div className="space-y-4 p-4 border rounded-md">
            <div className="flex items-center">
              <SunIcon className="h-5 w-5 mr-2 text-yellow-500" />
              <h3 className="font-medium">Light Mode Overlay</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ColorPickerInput
                  label="Overlay Color"
                  value={lightOverlayColor}
                  onChange={setLightOverlayColor}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Opacity</span>
                  <span className="text-sm font-medium">{formatOpacity(lightOpacity)}</span>
                </div>
                <Slider
                  value={[lightOpacity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(values) => setLightOpacity(values[0])}
                  disabled={isLoading}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transparent</span>
                  <span>Full Overlay</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dark Mode Overlay Controls */}
          <div className="space-y-4 p-4 border rounded-md">
            <div className="flex items-center">
              <MoonIcon className="h-5 w-5 mr-2 text-indigo-400" />
              <h3 className="font-medium">Dark Mode Overlay</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ColorPickerInput
                  label="Overlay Color"
                  value={darkOverlayColor}
                  onChange={setDarkOverlayColor}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Opacity</span>
                  <span className="text-sm font-medium">{formatOpacity(darkOpacity)}</span>
                </div>
                <Slider
                  value={[darkOpacity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(values) => setDarkOpacity(values[0])}
                  disabled={isLoading}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transparent</span>
                  <span>Full Overlay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Overlay Preview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Background Overlay Preview</h2>
          <Button 
            onClick={saveThemeSettings} 
            disabled={isLoading || isSaving || !hasChanges}
            size="sm"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Overlay Changes
              </>
            )}
          </Button>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light mode preview */}
            <div>
              <h3 className="text-sm font-medium mb-2">Light Mode</h3>
              <div className="aspect-video bg-card rounded-md border overflow-hidden shadow-sm relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: selectedTheme === 'custom' ? 'url(/images/custom-light-background.jpg)' : `url(/images/${selectedTheme}-light-background.jpg)`,
                  }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundColor: lightOverlayColor,
                    opacity: lightOpacity 
                  }} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-foreground font-medium">Light Mode Preview</p>
                </div>
              </div>
            </div>
            
            {/* Dark mode preview */}
            <div>
              <h3 className="text-sm font-medium mb-2">Dark Mode</h3>
              <div className="aspect-video bg-card rounded-md border overflow-hidden shadow-sm relative dark">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: selectedTheme === 'custom' ? 'url(/images/custom-dark-background.jpg)' : `url(/images/${selectedTheme}-dark-background.jpg)`,
                  }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundColor: darkOverlayColor,
                    opacity: darkOpacity 
                  }} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-foreground dark:text-foreground font-medium">Dark Mode Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Colors Settings */}
      <ThemeColorsSettings />
      
      {/* Social Links Manager */}
      <div className="mt-10">
        <SocialLinksManager />
      </div>
    </div>
  );
}

// Theme card component
interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard = ({ theme, isSelected, onSelect }: ThemeCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all border-2",
        isSelected ? "border-primary" : "border-transparent hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <div className="aspect-video w-full bg-muted relative">
        {!imageError ? (
          <img 
            src={`/images/${theme.id}-light-background.jpg`} 
            alt={`${theme.name} theme`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <Check className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center justify-between">
          {theme.name}
          {isSelected && <Palette className="h-4 w-4 text-primary" />}
        </CardTitle>
        <CardDescription>{theme.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}; 