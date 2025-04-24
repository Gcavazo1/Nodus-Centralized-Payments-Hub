export type ProductType = 'digital' | 'service' | 'consultation';
export type PaymentMethod = 'stripe' | 'crypto' | 'invoice';

export interface Offering {
  id: string;
  title: string;
  description: string;
  type: ProductType;
  price: number | null; // null for custom quotes
  priceUnit?: string; // e.g., 'hour', 'project', empty for flat price
  image: string;
  features: string[];
  paymentMethods: PaymentMethod[];
  customizable: boolean;
  popular?: boolean;
}

export const products: Offering[] = [
  {
    id: 'basic-website-template',
    title: 'Basic Website Template',
    description: 'A clean, responsive website template for small businesses and personal use.',
    type: 'digital',
    price: 99,
    image: '/images/products/website-template.jpg',
    features: [
      'Responsive design',
      '5 page templates',
      'Contact form',
      'SEO optimized',
      '1 month support',
    ],
    paymentMethods: ['stripe', 'crypto'],
    customizable: false,
    popular: true,
  },
  {
    id: 'ecommerce-template',
    title: 'E-commerce Template',
    description: 'Complete e-commerce solution with product listings, cart, and checkout.',
    type: 'digital',
    price: 249,
    image: '/images/products/ecommerce-template.jpg',
    features: [
      'Product catalog',
      'Shopping cart',
      'Checkout process',
      'Customer accounts',
      'Inventory management',
      '3 months support',
    ],
    paymentMethods: ['stripe', 'crypto'],
    customizable: true,
  },
];

export const services: Offering[] = [
  {
    id: 'web-development-starter',
    title: 'Web Development Starter Package',
    description: 'A fixed-price package for a professional, custom 5-page business website.',
    type: 'service',
    price: 250000, // Example: $2500.00 in cents
    image: '/images/services/web-development.jpg',
    features: [
      'Custom 5-page design',
      'Responsive development',
      'Basic CMS setup',
      'Contact form integration',
      'Basic SEO setup',
      '1 month post-launch support',
    ],
    paymentMethods: ['stripe', 'invoice'],
    customizable: true,
  },
  {
    id: 'ui-ux-audit',
    title: 'UI/UX Audit & Recommendations',
    description: 'A comprehensive review of your existing website or app with actionable insights.',
    type: 'consultation',
    price: 75000, // Example: $750.00 in cents
    image: '/images/services/design-consultation.jpg',
    features: [
      'Full UX review (up to 10 screens)',
      'Interface assessment',
      'User flow analysis',
      'Heuristic evaluation',
      'Detailed report with recommendations',
      'Follow-up Q&A session',
    ],
    paymentMethods: ['stripe', 'invoice'],
    customizable: true,
  },
  {
    id: 'custom-project',
    title: 'Custom Project Quote Request',
    description: 'Need something unique? Request a detailed quote for your specific project.',
    type: 'service',
    price: null, // Price remains null for quote requests
    image: '/images/services/custom-project.jpg',
    features: [
      'Requirements analysis',
      'Custom proposal',
      'Flexible scope',
      'Dedicated project manager',
      'Regular progress updates',
      'Satisfaction guarantee',
    ],
    paymentMethods: ['invoice', 'stripe'],
    customizable: true,
  },
]; 