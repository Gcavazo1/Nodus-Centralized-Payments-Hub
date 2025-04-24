import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminFirestoreInstance } from '@/lib/firebase-admin';
import { 
  recordWebhookEvent,
  processCompletedCheckout, 
  checkPaymentExistsByMetadata,
  updateWebhookEventStatus,
  checkWebhookEventProcessed
} from '@/lib/server-firestore';
import { WebhookPayload } from '@/lib/server-firestore';

// Define error type for better type safety
interface ErrorWithMessage {
  message: string;
}

// Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get the Stripe signature from headers
    const headers = await request.headers;
    const signature = headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Stripe signature missing' }, { status: 400 });
    }

    // Get the raw body as text
    const rawBody = await request.text();

    // Verify the event with Stripe
    let event: Stripe.Event;
    try {
      // Add check for stripe initialization
      if (!stripe) {
        throw new Error("Stripe client is not initialized. Check STRIPE_SECRET_KEY.");
      }
      
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: unknown) {
      const error = err as ErrorWithMessage;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get Firestore instance
    const db = await getAdminFirestoreInstance();

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if this event ID has already been processed
      const isProcessed = await checkWebhookEventProcessed(db, event.id, 'stripe');
      if (isProcessed) {
        return NextResponse.json({ received: true, message: 'Event already processed' });
      }
      
      // Record the webhook event
      const webhookEventRef = await recordWebhookEvent(
        db, 
        event.id, 
        'stripe', 
        event.type, 
        event.data.object as unknown as WebhookPayload
      );
      
      try {
        // Check if payment already exists using metadata
        const paymentExists = await checkPaymentExistsByMetadata(db, session.metadata);
        if (paymentExists) {
          await updateWebhookEventStatus(webhookEventRef, 'skipped_duplicate');
          return NextResponse.json({ received: true, message: 'Payment already exists' });
        }
        
        // Process the completed checkout
        const result = await processCompletedCheckout(db, session);
        await updateWebhookEventStatus(
          webhookEventRef, 
          result.success ? 'processed' : 'failed', 
          result.error
        );
      } catch (error: unknown) {
        const err = error as ErrorWithMessage;
        console.error('Error processing Stripe session:', err);
        if (webhookEventRef) {
          await updateWebhookEventStatus(webhookEventRef, 'failed', err.message);
        }
        return NextResponse.json(
          { error: 'Error processing Stripe session' },
          { status: 500 }
        );
      }
    } else {
      // For other event types, just acknowledge receipt
      // You can add handling for other event types as needed
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 