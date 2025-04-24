# Payment Providers Setup Guide

This guide explains how to set up and configure the payment providers in your Payment Hub template.

## Overview

The Payment Hub template supports two payment processors:

1. **Stripe** - For credit card payments and bank transfers
2. **Coinbase Commerce** - For cryptocurrency payments

You can enable either one or both based on your business needs. Each provider requires its own set of API keys and webhook configuration.

## Stripe Setup

[Stripe](https://stripe.com) is a widely-used payment processor for accepting credit card payments, bank transfers, and more.

### Step 1: Create a Stripe Account

1. Go to [Stripe.com](https://stripe.com) and sign up for an account
2. Verify your email address and complete the initial setup

### Step 2: Get Your API Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers > API keys**
3. You'll see two types of keys:
   - **Publishable key** (starts with `pk_`) - This is used on the client-side
   - **Secret key** (starts with `sk_`) - This is used on the server-side

4. For development, use the **test mode** keys
5. For production, use the **live mode** keys (only when ready to accept real payments)

### Step 3: Add Stripe Keys to Environment Variables

Add your Stripe API keys to your `.env.local` file:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### Step 4: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your application when events occur, such as when a payment is successful.

#### Local Development Webhooks

For local development, you can use Stripe CLI to forward webhook events to your local server:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account via CLI:
   ```bash
   stripe login
   ```
3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```
4. The CLI will display a webhook signing secret. Copy this secret and add it to your `.env.local` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

#### Production Webhooks

For production:

1. Go to **Developers > Webhooks** in your Stripe Dashboard
2. Click **Add endpoint**
3. Set the endpoint URL to `https://your-domain.com/api/stripe/webhook`
4. Select the events to listen for (at minimum, select the following):
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. After creating the endpoint, you'll see a **Signing secret**. Copy this and add it to your environment variables for production:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### Step 5: Configure Stripe in the Payment Hub

To enable Stripe in your Payment Hub, ensure the following setting is enabled in your Firestore Database:

1. In the `siteSettings` collection, document `general`, set:
   ```
   enableStripe: true
   ```

## Coinbase Commerce Setup

[Coinbase Commerce](https://commerce.coinbase.com/) allows you to accept cryptocurrency payments including Bitcoin, Ethereum, and others.

### Step 1: Create a Coinbase Commerce Account

1. Go to [commerce.coinbase.com](https://commerce.coinbase.com/) and sign up for an account
2. Verify your email address and complete the initial setup
3. Connect your existing Coinbase account or create a new one

### Step 2: Get Your API Keys

1. Log in to your Coinbase Commerce Dashboard
2. Go to **Settings > API keys**
3. Click **Create an API key**
4. Give it a name (e.g., "Payment Hub Integration")
5. Select all permissions 
6. Click **Create API key**
7. Copy the displayed API key immediately (it won't be shown again)

### Step 3: Add Coinbase Commerce Keys to Environment Variables

Add your Coinbase Commerce API key to your `.env.local` file:

```
NEXT_PUBLIC_COINBASE_COMMERCE_KEY=your_coinbase_commerce_key
COINBASE_COMMERCE_API_KEY=your_coinbase_commerce_key
```

### Step 4: Set Up Coinbase Commerce Webhooks

Webhooks allow Coinbase Commerce to notify your application when events occur, such as when a crypto payment is confirmed.

#### Local Development Webhooks

For local development, you can use a service like [ngrok](https://ngrok.com/) to forward webhook events to your local server:

1. Install ngrok and start it:
   ```bash
   ngrok http 3000
   ```
2. Copy the HTTPS URL provided by ngrok (e.g., `https://a1b2c3d4.ngrok.io`)

3. In your Coinbase Commerce Dashboard:
   - Go to **Settings > Webhooks**
   - Click **Add an endpoint**
   - Enter the URL as `https://your-ngrok-url/api/coinbase/webhook`
   - Click **Add endpoint**
   - Copy the **Webhook secret**

4. Add the webhook secret to your `.env.local` file:
   ```
   COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
   ```

#### Production Webhooks

For production:

1. Go to **Settings > Webhooks** in your Coinbase Commerce Dashboard
2. Click **Add an endpoint**
3. Set the endpoint URL to `https://your-domain.com/api/coinbase/webhook`
4. Click **Add endpoint**
5. Copy the **Webhook secret** and add it to your environment variables for production:
   ```
   COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
   ```

### Step 5: Configure Coinbase Commerce in the Payment Hub

To enable Coinbase Commerce in your Payment Hub, ensure the following setting is enabled in your Firestore Database:

1. In the `siteSettings` collection, document `general`, set:
   ```
   enableCoinbase: true
   ```

## Testing Your Payment Configuration

### Testing Stripe Payments

1. Use Stripe's test card numbers to make test payments:
   - Card number: `4242 4242 4242 4242`
   - Expiration: Any future date (e.g., `12/30`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

2. After a successful test payment:
   - Check your Stripe Dashboard to confirm the payment
   - Verify that the webhook was received by your application
   - Check the Firebase Firestore Database for new entries in `payments` and `orders` collections

### Testing Coinbase Commerce Payments

1. When you initiate a Coinbase Commerce checkout, you'll be redirected to a Coinbase-hosted page
2. In test mode, you can simulate various payment scenarios
3. After completing a test payment:
   - Check your Coinbase Commerce Dashboard to confirm the charge
   - Verify that the webhook was received by your application
   - Check the Firebase Firestore Database for new entries in `payments` and `orders` collections

## Troubleshooting

### Stripe Issues

1. **Payment not being processed**
   - Check that your Stripe API keys are correct
   - Verify that the webhook is properly configured
   - Look for errors in your server logs

2. **Webhook not being received**
   - Check that your webhook URL is correct
   - Verify that the webhook secret is properly set in your environment variables
   - Check Stripe Dashboard > Developers > Webhooks > Recent events to see if events are being sent

3. **Test vs. Live Mode**
   - Ensure consistency between your keys and mode (don't mix test keys with live mode)
   - For production, make sure you've activated your Stripe account and completed all verification steps

### Coinbase Commerce Issues

1. **Charge not being created**
   - Check that your Coinbase Commerce API key is correct and has proper permissions
   - Verify that you're using the correct API endpoint

2. **Webhook not being received**
   - Check that your webhook URL is correct
   - Verify that the webhook secret is properly set in your environment variables
   - In the Coinbase Commerce Dashboard, you can view recent webhook attempts and their status

3. **Payment status not updating**
   - Cryptocurrency payments can take time to confirm depending on network congestion
   - Check the status of the charge in your Coinbase Commerce Dashboard

## Advanced Configuration

### Customizing Payment Flow

You can customize the payment flow by editing the following files:

- `src/components/checkout/UnifiedCheckoutFlow.tsx` - Main checkout component
- `src/app/api/stripe/checkout/route.ts` - Stripe checkout API endpoint
- `src/app/api/coinbase/checkout/route.ts` - Coinbase checkout API endpoint

### Adding Additional Payment Methods

To add more payment methods to Stripe (like Apple Pay, Google Pay, etc.):

1. Update your Stripe dashboard settings to enable additional payment methods
2. Modify the checkout process in `src/app/api/stripe/checkout/route.ts` to include these methods

### Currency Configuration

To change your currency:

1. Update the `currencyCode` and `currencySymbol` fields in the `siteSettings` collection
2. Ensure both payment providers support your chosen currency
3. Update your product prices accordingly (remember they're stored in the smallest unit - cents, pence, etc.)

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` and `COINBASE_COMMERCE_API_KEY` server-side only
2. **Validate webhooks**: Always verify webhook signatures using the webhook secrets
3. **Use HTTPS**: Ensure all endpoints are served over HTTPS, especially in production
4. **Implement idempotency**: The template handles this, but be aware when making custom changes
5. **Regular monitoring**: Regularly check your Stripe and Coinbase Commerce dashboards for any suspicious activity 