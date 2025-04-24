/**
 * Site Configuration Types
 * These types define the structure of the site configuration object.
 */

/**
 * Social media link configuration
 */
export type SocialLinks = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
};

/**
 * Contact information
 */
export type ContactInfo = {
  email: string;
  phone?: string;
  address?: string;
};

/**
 * Creator information
 */
export type CreatorInfo = {
  name: string;
  role: string;
  bio?: string;
};

/**
 * Main site configuration type
 */
export type SiteConfig = {
  phone: string;
  email: string;
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: SocialLinks;
  contact: ContactInfo;
  creator: CreatorInfo;
  copyright?: string;
  keywords?: string[];
  defaultLocale?: string;
};

/**
 * Site Configuration
 * Central configuration for site metadata, contact info, and creator details
 */
export const siteConfig: SiteConfig = {
  name: "Nodus Payment Hub",
  description: "A centralized payment processing hub for creators, developers, and freelancers.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com",
  ogImage: "/images/og-image.jpg",
  links: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername/payment-hub",
    linkedin: "https://linkedin.com/in/yourusername",
  },
  contact: {
    email: "contact@your-domain.com",
    phone: "+1 (123) 456-7890", // Optional
  },
  creator: {
    name: "Your Name",
    role: "Developer & Creator",
    bio: "Passionate about creating tools that simplify payments for freelancers and creators."
  },
  copyright: `© ${new Date().getFullYear()} Payment Hub. All rights reserved.`,
  keywords: [
    "payment processing",
    "freelancer",
    "developer",
    "creator",
    "stripe",
    "coinbase",
    "crypto payments"
  ],
  defaultLocale: "en-US",
  phone: "",
  email: ""
}; 