# Frontend Theming Guide

This guide explains how to customize the visual appearance of your Payment Hub to match your brand identity and design preferences.

## Overview

The Payment Hub template uses a modern, component-based approach to styling with:

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library based on Radix UI
- **CSS Variables** - For theme colors and other design tokens
- **Admin Appearance Settings** - A dedicated UI for managing core theme colors, background images, and social links.

## Theme Configuration Files

The main files and systems involved in visual appearance are:

- **`src/components/admin/AdminAppearance.tsx`** - The UI for managing theme settings.
- **`src/context/SiteSettingsContext.tsx`** - Manages loading and saving theme settings from Firebase.
- **`src/config/theme-defaults.ts`** - Centralized file defining the default theme settings.
- **`src/components/ThemeColorApplier.tsx`** - Applies the loaded theme colors as CSS variables.
- **`src/app/globals.css`** - Global CSS, base theme variables, and styles not covered by the admin UI.
- **`tailwind.config.js`** - Core theme settings (like fonts, spacing) and Tailwind configuration.
- **`components.json`** - Shadcn UI component configuration.

## Core Theme Customization via Admin Panel

The easiest and recommended way to customize the core visual appearance is through the **Admin Appearance Settings** page (accessible via `/admin-settings`).

This page allows you to manage:

- **Theme Selection**: Choose from pre-defined themes (like Centralized, Chique, Commerce) or set up a custom theme.
- **Background Overlay**: Adjust the color and opacity for the background image overlay in both light and dark modes.
- **Theme Colors**: Customize the main color palette for light and dark modes.

### Customizing Theme Colors

Navigate to the **Admin Appearance Settings** page. You'll find sections for:

1.  **Theme Options**: Select the base theme (background image set).
2.  **Background Overlay**: Control the overlay color and transparency.
3.  **Theme Colors**: Use color pickers to adjust:
    *   **Background Colors**: `Background`, `Foreground`, `Card`, `Card Foreground`, `Primary`
    *   **Text Colors**: `Primary Text`, `Secondary Text`, `Muted Text`
    *   **UI Colors**: `Accent`, `Accent Foreground`, `Border`

Changes made here are saved to your Firebase database and applied dynamically across the application.

### Default Theme Settings

The default values used for the initial setup and when resetting the theme are defined in:

**`src/config/theme-defaults.ts`**

```ts
// src/config/theme-defaults.ts
export const DEFAULT_THEME_COLORS = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.129 0.042 264.695)",
    card: "oklch(1 0 0)",
    // ... other light mode colors
  },
  dark: {
    background: "oklch(0.0 0.0 0.0)",
    foreground: "oklch(0.984 0.003 247.858)",
    card: "oklch(20.5% 0 0)",
    // ... other dark mode colors
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
```

If you need to change the *default* state (e.g., for new installations or resets), modify this file.

## Customizing Other Styles (globals.css)

While the core theme colors are managed via the admin panel, other CSS variables and base styles are still defined in `src/app/globals.css`.

Open `src/app/globals.css` to customize:

- **Specific UI Element Colors**: Variables like `--destructive`, `--ring`, `--chart-*`, `--sidebar-*`.
- **Border Radius**: Modify `--radius`.
- **Base Font Sizes/Styles**: Adjust base HTML/body styles.
- **CSS Overrides**: Add custom CSS rules if needed.

Example: Modifying the destructive color:

```css
/* In :root or .dark section */
--destructive: oklch(0.6 0.25 20); /* Change to a different red/orange */
```

### Typography

To change the fonts, modify the `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other config
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        // Add custom fonts here and update font variables in globals.css
        // heading: ['Montserrat', 'sans-serif'],
      },
      // ... other extensions
    },
  },
  // ... plugins etc.
}
```

Remember to import/load your custom fonts appropriately (e.g., in `src/app/layout.tsx` or `src/app/globals.css`).

### Spacing and Layout

The Payment Hub uses Tailwind's built-in spacing system. If you want to customize the spacing scale, modify the `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other config
  theme: {
    extend: {
      spacing: {
        // Add custom spacing values
        '18': '4.5rem',
        '128': '32rem',
      },
      // ... other extensions
    },
  },
  // ... plugins etc.
}
```

## Component-Level Customization

### Customizing Specific UI Components

The Payment Hub uses Shadcn UI components, which can be customized at the component level by editing the files in `src/components/ui/`.

#### Button Styling Example:

Locate `src/components/ui/button.tsx` and adjust the styles within `buttonVariants`:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...", // Base styles
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Modify or add variants
      },
      // ... sizes ...
    },
  }
)
```

### Card Component Example:

Similarly, you can customize the card component in `src/components/ui/card.tsx`:

```tsx
// Modify styles or add new variations
const Card = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // Adjust base card styles
      className
    )}
    {...props}
  />
))
```

## Adding Custom Components

You can create custom components to extend the design system. Place them in `src/components/ui/` or another appropriate directory.

Example (already provided in previous section)

## Checkout Flow Customization

The checkout flow appearance can be customized by editing:

- **`src/components/checkout/UnifiedCheckoutFlow.tsx`**: For layout, structure, form fields, steps.
- **`src/components/checkout/PaymentMethodSelector.tsx`**: For payment option styling.

Example of customizing payment method selection buttons:

```tsx
// src/components/checkout/PaymentMethodSelector.tsx
<Button
  type="button"
  onClick={() => onSelect('stripe')}
  variant={selectedMethod === 'stripe' ? 'default' : 'outline'}
  className="flex-1 justify-center gap-2"
>
  <CreditCardIcon className="h-5 w-5" />
  <span>Credit Card</span>
</Button>
```

## Advanced Customization

### Custom Layouts

Modify or create new layout components in `src/components/layout`.

### Dark Mode Support

Dark mode colors are primarily handled by the Admin Appearance Settings. Variables not covered there (like `--destructive` in dark mode) can be adjusted in the `.dark { ... }` section of `src/app/globals.css`.

### Page-Specific Styling

For page-specific styling, add custom CSS classes to your page components and define them in `src/app/globals.css` or use Tailwind's utility classes directly.

## Custom CSS Overrides

If needed, add specific CSS overrides in `src/app/globals.css`.

```css
/* Custom overrides */
.my-custom-element {
  /* Your styles */
}
```

## Mobile Responsiveness

The template uses Tailwind's responsive utilities (`sm:`, `md:`, etc.).

### Breakpoint Customization

Modify breakpoints in `tailwind.config.js` if needed.

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      // ... default breakpoints
      'mobile': {'max': '639px'}, // Example custom breakpoint
    },
  },
}
```

### Testing Responsive Designs

Always test your theme customizations on various device sizes.

## Logo and Brand Assets

### Replacing the Logo

1.  Add your logo (preferably SVG) to the `public/` directory (e.g., `public/logo.svg`).
2.  Update the logo reference in `src/components/layout/Header.tsx` (or wherever the logo component is used).

```tsx
// src/components/layout/Header.tsx
<Link href="/" className="flex items-center space-x-2">
  <img 
    src="/logo.svg" // Update path
    alt={siteConfig.name} 
    className="h-8 w-auto" // Adjust size as needed
  />
</Link>
```

### Favicon and App Icons

Replace the icons in the `public/` directory:

-   `favicon.ico`
-   `apple-touch-icon.png`
-   Other icons referenced in `public/manifest.json` (e.g., `icon-192.png`, `icon-512.png`)

Update `public/manifest.json` and the metadata icons in `src/app/layout.tsx` if your filenames change.

## Troubleshooting

### Common Theme Issues

1.  **Admin Color Changes Not Applying**: Ensure the `ThemeColorApplier` component is rendered within your `SiteSettingsProvider`. Check the browser console for errors related to Firebase or context loading.
2.  **`globals.css` Changes Not Working**: Check for conflicting styles or ensure your CSS selectors are specific enough. Run `npm run dev` to recompile styles.
3.  **Tailwind Classes Not Working**: Ensure Tailwind is running (`npm run dev`) and that your class names are correct.

## Next Steps

After customizing your theme:

1.  Thoroughly test all components and pages.
2.  Verify responsive behavior.
3.  Test both light and dark modes.
4.  Check color contrast for accessibility.

For more advanced needs:

1.  Create custom Tailwind plugins.
2.  Extend Shadcn UI components further.
3.  Document your specific theme implementation if needed. 