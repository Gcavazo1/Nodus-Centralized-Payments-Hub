# Frontend Theming Guide

This guide explains how to customize the visual appearance of your Payment Hub to match your brand identity and design preferences.

## Overview

The Payment Hub template uses a modern, component-based approach to styling with:

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library based on Radix UI
- **CSS Variables** - For theme colors and other design tokens

You can customize almost every aspect of the visual design without having to modify complex CSS files.

## Theme Configuration Files

The main files that control the visual appearance are:

- **`tailwind.config.js`** - Core theme settings and Tailwind configuration
- **`src/app/globals.css`** - Global CSS and CSS variables
- **`components.json`** - Shadcn UI component configuration

## Basic Theme Customization

### Step 1: Colors

The easiest way to customize the appearance is to modify the color scheme.

Open `src/app/globals.css` and locate the `:root` section with CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  /* ... other dark mode colors ... */
}
```

These color variables are defined using HSL (Hue, Saturation, Lightness) format. 

To change a color, you can:

1. Use a color picker tool that provides HSL values
2. Replace the values for the variables you want to modify

For example, to change the primary color to a blue shade:

```css
--primary: 210 100% 50%; /* A vibrant blue */
--primary-foreground: 0 0% 100%; /* White text for contrast */
```

### Step 2: Typography

To change the fonts, modify the `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other config
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        // Add custom fonts here
        heading: ['Montserrat', 'sans-serif'],
      },
      // ... other extensions
    },
  },
  // ... plugins etc.
}
```

Then, to use your custom font, you'll need to:

1. Import the font in `src/app/globals.css` using `@import` or `@font-face`
2. Apply the font using the Tailwind classes (e.g., `font-heading`)

### Step 3: Border Radius

To adjust the roundness of elements throughout the application, modify the `--radius` variable in `src/app/globals.css`:

```css
:root {
  /* ... other variables ... */
  --radius: 0.75rem; /* More rounded corners */
}
```

### Step 4: Spacing and Layout

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

The Payment Hub uses Shadcn UI components, which can be customized at the component level.

#### Button Styling Example:

To modify the button component styling, locate `src/components/ui/button.tsx` and adjust the styles:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

You can modify the existing variants or add new ones to match your design needs.

### Card Component Example:

Similarly, you can customize the card component in `src/components/ui/card.tsx`:

```tsx
// Modify styles or add new variations
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
```

## Adding Custom Components

You can create custom components to extend the design system. For example, to create a custom callout component:

```tsx
// src/components/ui/callout.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "p-4 rounded-md border",
  {
    variants: {
      variant: {
        default: "bg-muted/50 border-muted-foreground/20",
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        danger: "bg-red-50 border-red-200 text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  icon?: React.ReactNode
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(calloutVariants({ variant }), className)}
        {...props}
      >
        {icon && <div className="mr-4">{icon}</div>}
        <div>{children}</div>
      </div>
    )
  }
)
Callout.displayName = "Callout"

export { Callout, calloutVariants }
```

## Checkout Flow Customization

The checkout flow is a critical part of the payment experience. To customize its appearance:

### Modifying the Checkout Component

Edit `src/components/checkout/UnifiedCheckoutFlow.tsx` to customize the checkout experience:

- Layout and structure
- Form field appearance
- Step indicators
- Payment option styling

### Payment Method Selection

The payment method selection UI can be customized in the same component:

```tsx
// Example of customizing payment method selection buttons
<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
  <Button
    type="button"
    onClick={() => setPaymentMethod('stripe')}
    className={cn(
      "flex-1 border flex items-center justify-center gap-2",
      paymentMethod === 'stripe' 
        ? "bg-primary text-primary-foreground" 
        : "bg-background hover:bg-secondary"
    )}
  >
    <CreditCardIcon className="h-5 w-5" />
    <span>Credit Card</span>
  </Button>
  
  {showCoinbaseOption && (
    <Button
      type="button"
      onClick={() => setPaymentMethod('coinbase')}
      className={cn(
        "flex-1 border flex items-center justify-center gap-2",
        paymentMethod === 'coinbase' 
          ? "bg-primary text-primary-foreground" 
          : "bg-background hover:bg-secondary"
      )}
    >
      <BitcoinIcon className="h-5 w-5" />
      <span>Cryptocurrency</span>
    </Button>
  )}
</div>
```

## Advanced Customization

### Custom Layouts

To create custom layouts, you can modify or create new layout components in the `src/components/layout` directory.

### Dark Mode Support

The template includes dark mode support. You can customize dark mode colors by modifying the `.dark` class variables in `src/app/globals.css`.

### Page-Specific Styling

For page-specific styling, you can add custom styles to the page components in `src/app`:

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <div className="custom-page-style">
      {/* Page content */}
    </div>
  )
}
```

Then add the corresponding CSS to `src/app/globals.css`:

```css
.custom-page-style {
  /* Your page-specific styles */
}
```

## Custom CSS Overrides

If you need to override styles that can't be achieved through the methods above, you can add custom CSS in `src/app/globals.css`:

```css
/* Custom overrides that go beyond Tailwind utilities */
.my-custom-element {
  /* Custom properties */
  background: linear-gradient(to right, #ff7e5f, #feb47b);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}
```

## Mobile Responsiveness

The Payment Hub is built to be responsive by default using Tailwind's responsive utilities. You can further customize the mobile experience:

### Breakpoint Customization

Modify breakpoints in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... other config
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Add custom breakpoints
      'mobile': {'max': '639px'},
      'tablet': {'min': '640px', 'max': '1023px'},
    },
  },
  // ... plugins etc.
}
```

### Testing Responsive Designs

Always test your custom themes on various device sizes to ensure a good experience across all devices.

## Logo and Brand Assets

### Replacing the Logo

1. Add your logo to the `public/images/` directory
2. Update the logo reference in the Navbar component (usually in `src/components/layout/Navbar.tsx`):

```tsx
// Example logo replacement
<Link href="/" className="flex items-center space-x-2">
  <Image 
    src="/images/your-logo.png" 
    alt="Your Brand" 
    width={120} 
    height={40} 
    className="object-contain" 
  />
</Link>
```

### Favicon and App Icons

Replace the favicon and app icons in the `public` directory:

- `favicon.ico`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`

Also update the metadata in `src/app/layout.tsx` to reference your new icons.

## Troubleshooting

### Common Theme Issues

1. **CSS Variables Not Applying**: Ensure that you're modifying the correct CSS variables and that they are properly defined in the scope where they're used.

2. **Component Styles Not Changing**: If changes to component styles aren't reflecting, check that you're modifying the right component file and that component is being used in your layout.

3. **Tailwind Classes Not Working**: Run `npm run dev` to ensure Tailwind is watching for changes in your classes.

## Next Steps

After customizing your theme:

1. Test all components to ensure styling is consistent
2. Verify responsive behavior on different screen sizes
3. Test both light and dark modes if you support them
4. Consider accessibility implications of your color choices

For more advanced customization needs, you may want to:

1. Create a custom theme plugin for Tailwind
2. Extend the Shadcn UI component system with your own variants
3. Consider a design system documentation page for your specific implementation 