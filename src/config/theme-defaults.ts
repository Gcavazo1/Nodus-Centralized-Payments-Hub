/**
 * Default theme settings
 * 
 * Central source of truth for default theme colors and settings.
 * Import this file wherever default theme values are needed.
 */

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
}

export interface ThemeColorSettings {
  light: ThemeColors;
  dark: ThemeColors;
}

export const DEFAULT_THEME_COLORS: ThemeColorSettings = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.129 0.042 264.695)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.129 0.042 264.695)",
    primary: "oklch(0.208 0.042 265.755)",
    primaryForeground: "oklch(0.984 0.003 247.858)",
    secondary: "oklch(0.968 0.007 247.896)",
    secondaryForeground: "oklch(0.208 0.042 265.755)",
    muted: "oklch(0.968 0.007 247.896)",
    mutedForeground: "oklch(0.80 0.15 85.0)",
    accent: "oklch(0.65 0.28 330)",
    accentForeground: "oklch(0.208 0.042 265.755)",
    border: "oklch(0.929 0.013 255.508)"
  },
  dark: {
    background: "oklch(0.0 0.0 0.0)",
    foreground: "oklch(0.984 0.003 247.858)",
    card: "oklch(20.5% 0 0)",
    cardForeground: "oklch(0.984 0.003 247.858)",
    primary: "oklch(0.929 0.013 255.508)",
    primaryForeground: "oklch(0.208 0.042 265.755)",
    secondary: "oklch(0.279 0.041 260.031)",
    secondaryForeground: "oklch(0.984 0.003 247.858)",
    muted: "oklch(0.279 0.041 260.031)",
    mutedForeground: "oklch(0.89 0.37 142.59)",
    accent: "oklch(0.65 0.3026 12.71)",
    accentForeground: "oklch(0.984 0.003 247.858)",
    border: "oklch(0.65 0.3026 12.71)"
  }
};

export const DEFAULT_THEME_SETTINGS = {
  selectedTheme: 'centralized',
  lightOverlayOpacity: 0.25,
  darkOverlayOpacity: 0.72,
  lightOverlayColor: "oklch(0.0 0.0 0.0)",
  darkOverlayColor: "oklch(0.0 0.0 0.0)",
  colors: DEFAULT_THEME_COLORS
};

// Default payment settings
export const DEFAULT_PAYMENT_SETTINGS = {
  enableCoinbase: false
}; 