import Stripe from 'stripe';

// Validate environment variables 
const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!secretKey) {
  console.warn("Stripe secret key (STRIPE_SECRET_KEY) is not set in .env.local. Stripe functionality will be disabled.");
}
if (!publishableKey) {
  console.warn("Stripe publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is not set in .env.local. Stripe Checkout may not function correctly.");
}

// Initialize Stripe client
let stripe: Stripe | null = null;
if (secretKey) {
  try {
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil', // Updated to correct API version
      typescript: true,
    });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
} else {
  console.error("Stripe secret key missing. Stripe functionality disabled.");
}

// Check if Stripe is configured
const isStripeConfigured = !!stripe && !!publishableKey;

// Export the initialized Stripe client and the publishable key
export { stripe, publishableKey, isStripeConfigured };
