# Offerings Configuration Guide

This guide explains how to customize the products and services available in your Payment Hub.

## Overview

The Payment Hub template includes a predefined set of offerings (products and services) that you can customize to match your business needs. All offerings are defined in a single configuration file, making it easy to update your catalog.

## Offerings Configuration File

The offerings are defined in: `src/config/offerings.ts`

This file contains:
- Type definitions for your offerings
- Two arrays: `products` and `services`

## Understanding the Offering Structure

Each offering (product or service) has the following structure:

```typescript
interface Offering {
  id: string;               // Unique identifier for the offering
  title: string;            // Display name
  description: string;      // Short description
  type: ProductType;        // 'digital', 'service', or 'consultation'
  price: number | null;     // Price in your currency's smallest unit (e.g., cents for USD)
                            // null means custom quote required
  priceUnit?: string;       // Optional unit for pricing (e.g., 'hour', 'project')
  image: string;            // Path to the image relative to the public folder
  features: string[];       // Bullet points of features/benefits
  paymentMethods: PaymentMethod[]; // Accepted payment methods
  customizable: boolean;    // Whether this item can be customized
  popular?: boolean;        // Optional flag to highlight as popular
}
```

## Customizing Your Offerings

### Step 1: Prepare Your Images

1. Add your product/service images to the `public/images/products/` or `public/images/services/` directories
2. Use consistent image dimensions (recommended: 800x600px or 4:3 ratio)
3. Optimize images for web to keep file sizes small

### Step 2: Edit the Configuration File

Open `src/config/offerings.ts` in your code editor and modify the `products` and `services` arrays:

```typescript
export const products: Offering[] = [
  {
    id: "your-product-id",       // Used in URLs and as a key - use kebab-case
    title: "Your Product Name",  // Display name - can include spaces
    description: "A compelling description of your product.", 
    type: "digital",             // Choose from 'digital', 'service', 'consultation'
    price: 9900,                 // Price in cents (99.00 in dollars)
    image: "/images/products/your-product-image.jpg",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4",
      "Feature 5",
    ],
    paymentMethods: ["stripe", "crypto"], // Available: 'stripe', 'crypto', 'invoice'
    customizable: false,         // Can this be customized?
    popular: true,               // Optional - highlight as popular
  },
  // Add more products as needed...
];
```

### Step 3: Setting Service Offerings

Services are configured in the same file, in the `services` array:

```typescript
export const services: Offering[] = [
  {
    id: "your-service-id",
    title: "Your Service Name",
    description: "Describe your service clearly and concisely.",
    type: "service",
    price: 8500,               // For hourly services, this is the hourly rate
    priceUnit: "hour",         // Add "hour", "project", etc. for clarity
    image: "/images/services/your-service-image.jpg",
    features: [
      "Benefit 1",
      "Benefit 2",
      "Benefit 3",
      "Benefit 4",
      "Benefit 5",
    ],
    paymentMethods: ["stripe", "invoice"],
    customizable: true,
  },
  // Add more services as needed...
];
```

### Step 4: Configuring Custom Quote Services

For services that require a custom quote:

```typescript
{
  id: "custom-project",
  title: "Custom Project",
  description: "Need something unique? Request a quote for your custom project.",
  type: "service",
  price: null,                // null indicates custom pricing
  image: "/images/services/custom-project.jpg",
  features: [
    "Requirements analysis",
    "Custom proposal",
    "Flexible scope",
    "Dedicated project manager",
    "Regular progress updates",
    "Satisfaction guarantee",
  ],
  paymentMethods: ["invoice", "stripe"],
  customizable: true,
}
```

## Important Notes

1. **Price Format**: Prices should be specified in the smallest currency unit (cents for USD, pence for GBP, etc.)
   - $10.00 should be entered as `1000`
   - $99.99 should be entered as `9999`

2. **Image Paths**: Make sure the image paths are correct relative to your `public` directory

3. **PaymentMethods**: Only include payment methods that you have configured
   - `"stripe"` requires valid Stripe API keys
   - `"crypto"` requires valid Coinbase Commerce API keys
   - `"invoice"` doesn't require additional configuration

4. **Handling Custom Quote Payments**: Offerings with `price: null` will typically direct users to submit a quote request. The Payment Hub's standard checkout flow is designed for predefined, fixed-price offerings. To accept payment for an agreed-upon custom quote amount:
    - **Recommended Workflow:** After agreeing on a price with the customer, the admin should manually create a specific payment request using the chosen provider's dashboard (e.g., a Stripe Payment Link or a Coinbase Commerce charge) for the exact quote amount.
    - **Send Link:** This unique payment link/URL is then sent directly to the customer for payment.
    - **Note:** This method leverages the security and functionality of the payment provider but bypasses the integrated checkout flow and automatic tracking within the Payment Hub for that specific transaction. Manual reconciliation or record-keeping might be needed.

5. **Changes Take Effect Immediately**: After saving the file, refresh your application to see the changes

6. **Restart Development Server**: If you don't see your changes, try restarting your development server:
   ```bash
   npm run dev
   ```

## Example: Complete Catalog Update

Here's an example of a complete update replacing all default offerings with your own:

```typescript
export const products: Offering[] = [
  {
    id: "premium-theme",
    title: "Premium WordPress Theme",
    description: "A responsive, feature-rich WordPress theme for professionals.",
    type: "digital",
    price: 5900,
    image: "/images/products/premium-theme.jpg",
    features: [
      "Fully responsive design",
      "WooCommerce compatible",
      "SEO optimized",
      "Page builder included",
      "1 year of updates",
    ],
    paymentMethods: ["stripe", "crypto"],
    customizable: false,
    popular: true,
  },
  {
    id: "design-assets-bundle",
    title: "UI Design Assets Bundle",
    description: "Complete UI kit with over 500 components for web and mobile.",
    type: "digital",
    price: 3900,
    image: "/images/products/design-assets.jpg",
    features: [
      "500+ UI components",
      "Sketch & Figma files",
      "Responsive grid system",
      "Dark & light themes",
      "Regular updates",
    ],
    paymentMethods: ["stripe"],
    customizable: false,
  }
];

export const services: Offering[] = [
  {
    id: "website-development",
    title: "Website Development",
    description: "Custom website development for your business needs.",
    type: "service",
    price: 9500,
    priceUnit: "hour",
    image: "/images/services/web-dev.jpg",
    features: [
      "Custom design",
      "Mobile responsive",
      "SEO optimization",
      "CMS integration",
      "Performance tuning",
      "30 days support",
    ],
    paymentMethods: ["stripe", "invoice"],
    customizable: true,
  },
  {
    id: "custom-project",
    title: "Custom Software Project",
    description: "Tailored software solutions for your unique requirements.",
    type: "service",
    price: null,
    image: "/images/services/custom-project.jpg",
    features: [
      "Detailed requirements analysis",
      "Custom development",
      "Testing & QA",
      "Ongoing maintenance available",
      "Dedicated project manager",
      "Regular progress updates",
    ],
    paymentMethods: ["invoice", "stripe"],
    customizable: true,
  }
];
```

## Troubleshooting

- **Changes not appearing**: Clear your browser cache or try an incognito/private window
- **Image not displaying**: Verify the image path is correct and the file exists in your `public` directory
- **Type errors**: Ensure your offering objects follow the `Offering` interface structure 