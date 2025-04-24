import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
// Import Admin SDK functions
import { getAdminFirestoreInstance } from '@/lib/firebase-admin';
import { 
  checkWebhookEventProcessed,
  recordWebhookEvent, 
  updateWebhookEventStatus,
  checkPaymentExistsByMetadata,
  processCompletedCoinbaseCharge
} from '@/lib/server-firestore';
import type { CoinbaseWebhookEvent } from '@/lib/definitions';
import type { WebhookPayload } from '@/lib/server-firestore';

// Define webhook secret from environment
const coinbaseWebhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;

// Environment check at module load
if (!coinbaseWebhookSecret) {
  console.warn('[Coinbase Webhook] COINBASE_COMMERCE_WEBHOOK_SECRET not set. Webhook verification will fail.');
}

// Set of event types we want to process
const relevantEvents = new Set([
  'charge:confirmed',
  'charge:resolved',
  // Add others as needed
]);

export async function POST(req: Request) {
  // console.log('[Coinbase Webhook] ===== RECEIVED COINBASE WEBHOOK REQUEST ====='); // Removed
  
  if (!coinbaseWebhookSecret) {
    console.error('[Coinbase Webhook] Error: Webhook secret is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // 1. Get and validate the signature
  const headersList = await headers();
  const signature = headersList.get('x-cc-webhook-signature');

    if (!signature) {
    console.error('[Coinbase Webhook] Error: Missing x-cc-webhook-signature header');
       return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }
    
  // 2. Get the raw body
  const rawBody = await req.text();
  // console.log('[Coinbase Webhook] Received Raw Body:', rawBody); // Removed
  
  // 3. Verify the signature
  let event: CoinbaseWebhookEvent;
  try {
    // Verify signature
    const hmac = crypto.createHmac('sha256', coinbaseWebhookSecret);
    const digest = hmac.update(rawBody).digest('hex');
    
    if (digest !== signature) {
      console.error('[Coinbase Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the full payload first
    const fullPayload = JSON.parse(rawBody);

    // Extract the actual event object which is nested
    if (!fullPayload || typeof fullPayload !== 'object' || !fullPayload.event) {
        console.error('[Coinbase Webhook] Invalid payload structure: Missing nested event object.');
        return NextResponse.json({ error: 'Invalid payload structure.' }, { status: 400 });
    }
    event = fullPayload.event as CoinbaseWebhookEvent; // Assign the nested event object

    // console.log(`[Coinbase Webhook] Event verified: ${event.type} | Event ID: ${event.id} (Payload ID: ${topLevelEventId})`); // Removed
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Coinbase Webhook] Error validating webhook: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook validation error: ${errorMessage}` }, { status: 400 });
  }

  // 4. Process the verified event
  if (relevantEvents.has(event.type)) {
    let db;
    try {
      // console.log('[Coinbase Webhook] Getting Admin Firestore instance...'); // Removed
      db = await getAdminFirestoreInstance();
      // console.log('[Coinbase Webhook] Admin Firestore instance obtained.'); // Removed
      
      // Check if this event has already been processed
      const isProcessed = await checkWebhookEventProcessed(db, event.id, 'coinbase');
      if (isProcessed) {
        // console.log(`[Coinbase Webhook] Event ${event.id} already processed. Skipping.`); // Removed
        return NextResponse.json({ received: true, message: 'Event already processed' });
      }

      // Record the raw event
      // recordWebhookEvent logs internally
      const webhookEventRef = await recordWebhookEvent(db, event.id, 'coinbase', event.type, event.data as unknown as WebhookPayload);
      // console.log(`[Coinbase Webhook] Event ${event.id} recorded.`); // Removed
      
      try {
        const charge = event.data;
        
        // Check if payment already exists
        const paymentExists = await checkPaymentExistsByMetadata(db, { 
          charge_id: charge.id,
          charge_code: charge.code 
        });
        
        if (paymentExists) {
          // console.log(`[Coinbase Webhook] Payment for charge ${charge.code} already exists. Skipping creation.`); // Removed
          await updateWebhookEventStatus(webhookEventRef, 'skipped_duplicate');
          return NextResponse.json({ received: true, message: 'Payment already exists' });
        }
        
        // Process charge event
        const paymentResult = await processCompletedCoinbaseCharge(db, event);
        // console.log(`[Coinbase Webhook] Payment processing result:`, paymentResult); // Removed
        
        // Email confirmation is now handled inside processCompletedCoinbaseCharge
        
        await updateWebhookEventStatus(webhookEventRef, paymentResult.success ? 'processed' : 'failed', paymentResult.error);
        
      } catch (processingError) {
        const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown processing error';
        console.error(`[Coinbase Webhook] Error processing event ${event.id}:`, processingError);
        if (webhookEventRef) {
          await updateWebhookEventStatus(webhookEventRef, 'failed', errorMessage);
        }
      }
      
    } catch (error) {
      console.error('[Coinbase Webhook] Failed to handle event:', error);
      // Check if it's a Firestore initialization error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Firestore Admin instance')) {
        return NextResponse.json({ error: 'Internal server error during Firestore initialization.' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  } else {
    // console.log(`[Coinbase Webhook] Ignoring irrelevant event type: ${event.type}`); // Removed
  }
  
  return NextResponse.json({ received: true });
} 