/**
 * Shared TypeScript definitions for the application
 * 
 * This file contains all the common interfaces and types
 * used throughout the application for consistent typing.
 */

// ==============================
// Common Types
// ==============================

/**
 * Common status types used across the application
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Timestamp type for database objects
 */
export interface Timestamps {
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Common API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Notification displayed to users
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

// ==============================
// Payment Related Types
// ==============================

/**
 * Payment status options
 */
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

/**
 * Payment intent from payment processor
 */
export interface PaymentIntent {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date | string;
  paymentMethod: string;
  metadata?: Record<string, string>;
}

/**
 * Checkout session for redirecting to payment processor
 */
export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: Date | string;
}

/**
 * Payment data to be stored in the database
 */
export interface PaymentData {
  customerId: string;
  orderId?: string;
  quoteId?: string;
  amount: number;
  status: PaymentStatus;
  provider: 'stripe' | 'coinbase' | 'manual' | string;
  providerPaymentId: string;
  currency?: string;
  metadata?: Record<string, unknown>;
}

// ==============================
// User/Customer Types
// ==============================

/**
 * Physical address for shipping and billing
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Customer profile
 */
export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  metadata?: Record<string, unknown>;
}

// ==============================
// Order Related Types
// ==============================

/**
 * Order status options
 */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'canceled' | 'refunded';

/**
 * Order item in an order
 */
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Complete order with items
 */
export interface Order extends Timestamps {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentIntentId?: string;
  currency?: string;
  notes?: string;
  provider?: string;
}

/**
 * Data for creating a new order
 */
export interface OrderData {
  customerId: string;
  items?: Array<Omit<OrderItem, 'id'>>;
  status?: OrderStatus;
  totalAmount: number;
  paymentIntentId?: string;
  paymentMethod: string;
  currency?: string;
  metadata?: Record<string, unknown>;
}

// ==============================
// Quote Related Types
// ==============================

/**
 * Quote request status options
 */
export type QuoteRequestStatus = 'new' | 'viewed' | 'in-progress' | 'completed' | 'rejected';

/**
 * Project types for quote requests
 */
export type ProjectType = 'website' | 'ecommerce' | 'consultation' | 'app' | 'maintenance' | 'other';

/**
 * Quote request submitted by customer
 */
export interface QuoteRequest extends Timestamps {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType: ProjectType;
  description: string;
  budget?: string;
  timeline?: string;
  status: QuoteRequestStatus;
}

/**
 * Quote status options
 */
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'paid';

/**
 * Quote item in a quote
 */
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Complete quote with items
 */
export interface Quote extends Timestamps {
  id: string;
  requestId: string;
  customerId: string;
  validUntil: Date | string;
  items: QuoteItem[];
  totalAmount: number;
  currency?: string;
  notes?: string;
  status: QuoteStatus;
}

// ==============================
// Admin Types
// ==============================

/**
 * Admin user roles
 */
export type AdminRole = 'admin' | 'viewer';

/**
 * Admin user with permissions
 */
export interface AdminUser extends Timestamps {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin?: Date | string;
}

// ==============================
// Theme Types
// ==============================

/**
 * Theme settings stored in database
 */
export interface ThemeSettings {
  selectedTheme: string;
  lightOverlayOpacity: number;
  darkOverlayOpacity: number;
  updatedAt?: Date | string;
}

// ==============================
// Webhook Event Tracking
// ==============================

/**
 * Possible webhook event processing statuses
 */
export type WebhookProcessingStatus = 
  | 'received'    // Initial state when webhook is received
  | 'processing'  // Being processed 
  | 'completed'   // Successfully processed
  | 'failed'      // Processing failed
  | 'retrying'    // Scheduled for retry
  | 'abandoned';  // Max retries exceeded or permanently unprocessable

/**
 * Data structure for tracking webhook events
 */
export interface WebhookEventData {
  id: string;                           // Internal ID (document ID)
  provider: 'stripe' | 'coinbase' | string; // Payment provider source
  eventId: string;                      // Provider's event ID
  eventType: string;                    // Type of event (e.g., 'checkout.session.completed')
  status: WebhookProcessingStatus;      // Current processing status
  rawEvent?: Record<string, unknown>;   // Optional raw event data
  receivedAt: Date | string;            // When the webhook was received
  processedAt?: Date | string;          // When processing completed (if succeeded)
  failedAt?: Date | string;             // When processing failed (if failed)
  errorMessage?: string;                // Error message if processing failed
  retryCount: number;                   // Number of processing attempts
  lastRetryAt?: Date | string;          // Timestamp of last retry
  nextRetryAt?: Date | string;          // Scheduled time for next retry (if any)
  relatedResources?: {                  // References to resources created/updated by this webhook
    customerId?: string;
    orderId?: string;
    paymentId?: string;
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;   // Additional metadata
}

/**
 * Input data for creating a webhook event record
 */
export type WebhookEventInput = Omit<WebhookEventData, 'id' | 'receivedAt' | 'retryCount'> & {
  retryCount?: number;
  receivedAt?: Date | string;
};

// Basic Site Configuration Types (Example)
export type SiteConfig = {
    name: string;
    description: string;
    url: string;
    ogImage?: string;
    links?: {
      twitter?: string;
      github?: string;
      // Add other social links
    };
  };
  
  // Offering Types (Products/Services)
  export type Offering = {
    id: string; // Unique identifier (e.g., SKU, slug)
    name: string;
    description: string;
    price: number; // Price in smallest currency unit (e.g., cents)
    currency: string; // e.g., 'usd', 'eur'
    type: 'product' | 'service';
    imageUrl?: string;
    // Add other relevant fields (features, benefits, etc.)
  };
  
  // Navigation Types
  export type NavItem = {
    title: string;
    href: string;
    disabled?: boolean;
  };
  
  export type MainNavItem = NavItem;
  
  // Quote Form Data Type
  export type QuoteFormData = {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    projectType: string;
    description: string;
    budget?: string;
    timeline?: string;
  };

  // Coinbase Commerce Webhook Event Type (Basic Structure)
  // Based on common fields, might need refinement based on specific event types you handle
  export interface CoinbaseWebhookEvent {
    id: string; // Event ID
    type: string; // e.g., 'charge:confirmed', 'charge:failed'
    api_version: string;
    created_at: string; // ISO 8601 timestamp
    data: CoinbaseChargeData; // The charge object
  }

  export interface CoinbaseChargeData {
    id: string; // Charge ID
    code: string; // Charge code (often used as identifier)
    resource: string; // Should be 'charge'
    name?: string;
    description?: string;
    hosted_url: string;
    created_at: string;
    expires_at: string;
    timeline: { time: string; status: string }[];
    metadata?: { [key: string]: string | number | boolean | null }; // Crucial for passing custom data
    pricing_type: 'fixed_price' | 'no_price';
    pricing: {
      local: { amount: string; currency: string };
      bitcoin?: { amount: string; currency: string };
      ethereum?: { amount: string; currency: string };
      // Add other crypto types as needed
      [key: string]: { amount: string; currency: string } | undefined; // Index signature
    };
    payments: CoinbasePayment[];
    addresses: { [network: string]: string };
    support_email?: string;
    // Add other fields as needed based on Coinbase API documentation
  }

  export interface CoinbasePayment {
    network: string; // e.g., 'bitcoin', 'ethereum'
    transaction_id: string;
    status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'UNRESOLVED' | 'RESOLVED' | 'CANCELED';
    value: {
      local: { amount: string; currency: string };
      crypto: { amount: string; currency: string };
    };
    block: {
      height: number;
      hash: string;
      confirmations_accumulated: number;
      confirmations_required: number;
    };
    // Add other payment fields as needed
  }
  
  // Add other shared types/interfaces as needed 