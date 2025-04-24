# Webhook Configuration Guide

This guide provides detailed instructions for setting up, testing, and troubleshooting webhooks in your Payment Hub.

## Overview

Webhooks are a critical component of the Payment Hub, enabling real-time communication between payment providers (Stripe and Coinbase Commerce) and your application. They allow your application to:

- Receive payment confirmations
- Update order statuses
- Send confirmation emails
- Record transaction details
- Handle refunds and disputes

## How Webhooks Work in Payment Hub

1. **Payment Provider Events**: When something happens in Stripe or Coinbase (e.g., a payment is completed), they send an HTTP POST request to your webhook URL.
2. **Verification**: Your application verifies the webhook signature to ensure it's legitimate.
3. **Event Processing**: If valid, your application processes the event and updates your database.
4. **Duplicate Prevention**: The system checks if an event has already been processed to prevent duplicate actions.
5. **Customer Notification**: After processing, the system can trigger confirmation emails or other actions.

## Webhook Endpoints

The Payment Hub includes two webhook endpoints:

- **Stripe**: `/api/stripe/webhook`
- **Coinbase**: `/api/coinbase/webhook`

## Setting Up Webhooks

### Stripe Webhook Setup

#### Development Environment

1. **Install Stripe CLI**:
   - Download and install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Log in with your Stripe account: `stripe login`

2. **Forward Webhooks**:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

3. **Get Webhook Secret**:
   - The CLI will display a webhook signing secret
   - Add this to your `.env.local`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     ```

#### Production Environment

1. **Create Webhook Endpoint in Stripe Dashboard**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) > Developers > Webhooks
   - Click "Add endpoint"
   - Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook`

2. **Select Events**:
   - At minimum, select these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - For additional features, you may want to add:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

3. **Get Webhook Secret**:
   - After creating the endpoint, find the "Signing secret" in the endpoint details
   - Add it to your environment variables in production:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     ```

### Coinbase Commerce Webhook Setup

#### Development Environment

1. **Use Tunneling Service**:
   - Install [ngrok](https://ngrok.com/download) or similar tunneling service
   - Start a tunnel to your local server:
     ```bash
     ngrok http 3000
     ```
   - Note the HTTPS URL provided (e.g., `https://a1b2c3d4.ngrok.io`)

2. **Create Webhook in Coinbase Commerce**:
   - Go to [Coinbase Commerce Dashboard](https://commerce.coinbase.com/) > Settings > Webhooks
   - Click "Add an endpoint"
   - Enter the URL from ngrok + `/api/coinbase/webhook`:
     ```
     https://a1b2c3d4.ngrok.io/api/coinbase/webhook
     ```
   - Save the webhook
   - Copy the "Webhook Secret"

3. **Configure Environment Variable**:
   - Add the webhook secret to your `.env.local`:
     ```
     COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
     ```

#### Production Environment

1. **Create Webhook in Coinbase Commerce**:
   - Go to Coinbase Commerce Dashboard > Settings > Webhooks
   - Click "Add an endpoint"
   - Enter your production URL:
     ```
     https://your-domain.com/api/coinbase/webhook
     ```
   - Save the webhook
   - Copy the "Webhook Secret"

2. **Configure Environment Variable**:
   - Add the webhook secret to your production environment variables:
     ```
     COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
     ```

## Testing Webhooks

### Testing Stripe Webhooks

#### Using Stripe CLI

The Stripe CLI allows you to simulate webhook events locally:

1. **Start the Webhook Forwarding**:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

2. **Trigger Test Events**:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Check Your Application**:
   - Monitor your console logs for webhook processing
   - Verify database updates in Firestore
   - Check if confirmation emails are sent (if configured)

#### Using Stripe Dashboard

For production testing:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Select your endpoint
3. Click "Send test webhook"
4. Choose an event type (e.g., `checkout.session.completed`)
5. Click "Send test webhook"

### Testing Coinbase Commerce Webhooks

Coinbase Commerce doesn't provide a CLI tool like Stripe, but you can test webhooks by:

1. **Create a Test Charge**:
   - Create a small test payment through your application
   - Complete the payment in the Coinbase Commerce checkout

2. **Check Webhook Deliveries**:
   - In Coinbase Commerce Dashboard > Settings > Webhooks
   - Click on your endpoint
   - View "Recent deliveries" to see webhook attempts

3. **Verify Processing**:
   - Check your application logs
   - Verify database updates
   - Confirm email delivery (if configured)

## Webhook Security

### Signature Verification

Both Stripe and Coinbase Commerce webhooks include a signature in the request headers. The Payment Hub verifies these signatures before processing events:

```typescript
// Example from Stripe webhook handler
const signature = req.headers['stripe-signature'] as string;
try {
  event = stripeInstance.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
} catch (err) {
  console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
  return new Response(`Webhook signature verification failed`, { status: 400 });
}
```

### Security Best Practices

1. **Keep Secrets Private**: Never expose webhook secrets in client-side code or public repositories
2. **Use HTTPS**: Always use HTTPS for production webhook endpoints
3. **Validate All Input**: Validate webhook payloads before processing
4. **Implement Idempotency**: Handle duplicate webhook events gracefully (the Payment Hub does this automatically)
5. **Monitor Webhook Failures**: Set up monitoring for webhook processing failures

## Webhook Handler Implementation

### Stripe Webhook Handler

The Stripe webhook handler is located at `src/app/api/stripe/webhook/route.ts`.

Key functions:

1. **Signature verification**: Ensures the webhook is legitimate
2. **Event recording**: Stores the event in Firestore to prevent duplicate processing
3. **Event processing**: Handles different event types
4. **Email sending**: Triggers confirmation emails (if configured)

### Coinbase Webhook Handler

The Coinbase webhook handler is located at `src/app/api/coinbase/webhook/route.ts`.

Key functions:

1. **Signature verification**: Uses Coinbase's verification method
2. **Event recording**: Stores events in Firestore
3. **Charge processing**: Updates orders and payments based on charge status
4. **Email confirmation**: Sends payment confirmations (if configured)

## Customizing Webhook Handlers

You may need to customize webhook handlers for special requirements:

### Adding Custom Logic

To add custom business logic when a payment succeeds:

```typescript
// Example of adding custom logic to src/app/api/stripe/webhook/route.ts
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  
  // Process the payment as usual
  await processStripePayment(db, session);
  
  // Add your custom logic here
  await customBusinessLogic(session.customer_email, session.amount_total);
}

// Implement your custom function
async function customBusinessLogic(customerEmail, amount) {
  // Your custom logic, e.g.:
  // - Update loyalty points
  // - Trigger a fulfillment system
  // - Record analytics
  // - etc.
}
```

### Adding New Event Types

To handle additional Stripe events:

```typescript
// Example of handling additional events
if (event.type === 'customer.subscription.created') {
  const subscription = event.data.object;
  
  // Handle new subscription
  await processNewSubscription(db, subscription);
}

async function processNewSubscription(db, subscription) {
  // Your subscription handling logic
}
```

## Common Webhook Issues

### Troubleshooting

1. **Webhook Verification Failures**:
   - Check that the correct webhook secret is in your environment variables
   - Ensure the raw request body is being used for verification (not parsed JSON)
   - Verify that header names are correct

2. **Events Not Processing**:
   - Check application logs for errors
   - Verify that the event type matches what your handler expects
   - Ensure database access is working properly

3. **Duplicate Event Processing**:
   - The Payment Hub includes idempotency by tracking event IDs
   - If you see duplicates, check the `webhookEvents` collection in Firestore

4. **Webhook Timeouts**:
   - Webhooks should respond quickly (under 10 seconds)
   - Move time-consuming operations to background tasks where possible
   - Consider using Firebase Functions for long-running operations

### Debugging Techniques

1. **Enhanced Logging**:
   Add detailed logging to troubleshoot webhook issues:

   ```typescript
   console.log(`Webhook received: ${event.type}`);
   console.log(`Event data:`, JSON.stringify(event.data.object, null, 2));
   ```

2. **Check Provider Dashboards**:
   - Stripe Dashboard > Developers > Webhooks > Recent events
   - Coinbase Commerce > Settings > Webhooks > Recent deliveries

3. **Test with Simple Handlers**:
   Create a simplified handler to isolate issues:

   ```typescript
   export async function POST(req: Request) {
     const body = await req.text();
     console.log('Received webhook:', body);
     return new Response('Success', { status: 200 });
   }
   ```

## Advanced Webhook Configurations

### Handling Failed Webhooks

Payment providers will retry failed webhook deliveries. Your handlers should be able to handle these retries:

```typescript
// Example retry handling
// In most cases, the existing idempotency checks will handle this
// But you can add additional logic:
if (event.type === 'payment_intent.payment_failed') {
  const intent = event.data.object;
  const existingRecord = await db.collection('failedPayments')
    .where('paymentIntentId', '==', intent.id)
    .get();
  
  if (!existingRecord.empty) {
    // Already processed this failure, but update attempt count
    await existingRecord.docs[0].ref.update({
      retryCount: FieldValue.increment(1),
      lastAttempt: FieldValue.serverTimestamp()
    });
  } else {
    // New failure, record it
    await db.collection('failedPayments').add({
      paymentIntentId: intent.id,
      customerId: intent.customer,
      amount: intent.amount,
      createdAt: FieldValue.serverTimestamp(),
      lastAttempt: FieldValue.serverTimestamp(),
      retryCount: 0
    });
  }
}
```

### Handling Multiple Environments

For managing webhooks across different environments (development, staging, production):

1. **Use Environment-Specific Webhook Endpoints**:
   - Create separate webhook configurations in Stripe/Coinbase for each environment
   - Use environment-specific secrets

2. **Environment Detection in Handlers**:
   ```typescript
   const environment = process.env.NODE_ENV || 'development';
   if (environment !== 'production') {
     console.log(`Processing ${event.type} event in ${environment} environment`);
     // Maybe bypass certain production-only actions
   }
   ```

## Next Steps

After setting up webhooks:

1. **Monitor Performance**: Keep an eye on webhook processing times and success rates
2. **Set Up Alerts**: Configure alerts for webhook failures
3. **Test Edge Cases**: Test various scenarios including payment failures, refunds, and disputes
4. **Document Custom Logic**: If you've added custom logic, document it for future reference

For further assistance with webhook configuration, refer to:
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Coinbase Commerce Webhooks Documentation](https://commerce.coinbase.com/docs/api/#webhooks) 