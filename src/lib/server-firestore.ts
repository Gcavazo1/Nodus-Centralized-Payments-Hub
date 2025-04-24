import type {
  Firestore,
  DocumentReference,
} from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type Stripe from 'stripe';
import type { CoinbaseWebhookEvent, CoinbasePayment } from './definitions'; // Import CoinbasePayment
import { sendPaymentConfirmationEmail } from './email'; // Add import for email function

// Define a more specific type for payload and metadata
export type WebhookPayload = Record<string, unknown>;
export type PaymentMetadata = Record<string, string | number | boolean | null | undefined>;

// --- Webhook Event Helpers ---

/**
 * Records an incoming webhook event.
 * @param db - Firestore Admin instance.
 * @param eventId - Unique ID from the provider (Stripe event ID, Coinbase event ID).
 * @param provider - 'stripe' or 'coinbase'.
 * @param eventType - The specific event type string (e.g., 'checkout.session.completed').
 * @param payload - The raw event data object.
 * @returns Reference to the created webhook event document.
 */
export async function recordWebhookEvent(
  db: Firestore,
  eventId: string,
  provider: 'stripe' | 'coinbase',
  eventType: string,
  payload: WebhookPayload
): Promise<DocumentReference> {
  const webhookEventRef = await db.collection('webhookEvents').add({
    provider,
    eventId,
    eventType,
    payload: payload ?? null, // Store the raw payload
    status: 'received', // Initial status
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return webhookEventRef;
}

/**
 * Checks if a webhook event has already been successfully processed.
 * @param db - Firestore Admin instance.
 * @param eventId - Unique ID from the provider.
 * @param provider - 'stripe' or 'coinbase'.
 * @returns True if the event exists and has status 'processed' or 'skipped_duplicate', false otherwise.
 */
export async function checkWebhookEventProcessed(
  db: Firestore,
  eventId: string,
  provider: 'stripe' | 'coinbase'
): Promise<boolean> {
  const snapshot = await db
    .collection('webhookEvents')
    .where('provider', '==', provider)
    .where('eventId', '==', eventId)
    .where('status', 'in', ['processed', 'skipped_duplicate']) // Check for successful processing or intentional skip
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return true;
  }
  return false;
}

/**
 * Updates the status and optionally adds an error message to a recorded webhook event.
 * @param webhookEventRef - DocumentReference of the webhook event in Firestore.
 * @param status - The new status string (e.g., 'processing', 'processed', 'failed', 'skipped_duplicate').
 * @param errorMessage - Optional error message if the status is 'failed'.
 */
export async function updateWebhookEventStatus(
  webhookEventRef: DocumentReference,
  status: string,
  errorMessage?: string
): Promise<void> {
  const updateData: { status: string; updatedAt: FieldValue; errorMessage?: string } = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (errorMessage && (status === 'failed' || status === 'processed_failure')) {
    updateData.errorMessage = errorMessage;
  }
  try {
    await webhookEventRef.update(updateData);
    console.log(`Updated webhook event ${webhookEventRef.id} status to: ${status}`);
  } catch (error) {
    console.error(`Failed to update status for webhook event ${webhookEventRef.id}:`, error);
    // Decide if we need to re-throw or handle this failure
  }
}

// --- Payment & Customer Helpers ---

/**
 * Checks if a payment record likely already exists based on metadata (e.g., Stripe session ID).
 * @param db - Firestore Admin instance.
 * @param metadata - Metadata object potentially containing unique identifiers.
 * @returns True if a payment with matching metadata is found, false otherwise.
 */
export async function checkPaymentExistsByMetadata(
  db: Firestore, 
  metadata: PaymentMetadata | null | undefined
): Promise<boolean> {
  if (!metadata) return false;

  // Prioritize specific known keys if available
  if (metadata.payment_id && typeof metadata.payment_id === 'string') {
    const doc = await db.collection('payments').doc(metadata.payment_id).get();
    if (doc.exists) return true;
  }
  
  if (metadata.session_id && typeof metadata.session_id === 'string') {
    const snapshot = await db.collection('payments')
                            .where('metadata.session_id', '==', metadata.session_id)
                            .limit(1).get();
    if (!snapshot.empty) return true;
  }
  
  if (metadata.charge_id && typeof metadata.charge_id === 'string') { // For Coinbase
    const snapshot = await db.collection('payments')
                            .where('metadata.charge_id', '==', metadata.charge_id)
                            .limit(1).get();
    if (!snapshot.empty) return true;
  }

  // Add more checks if needed based on your metadata strategy

  return false;
}

/**
 * Finds or creates a customer based on email.
 * @param db - Firestore Admin instance.
 * @param email - Customer's email address.
 * @param name - Customer's name (optional).
 * @param providerCustomerId - Customer ID from the payment provider (e.g., Stripe Customer ID).
 * @returns The Firestore document ID of the customer.
 */
async function findOrCreateCustomer(
  db: Firestore, 
  email: string,
  name?: string | null,
  providerCustomerId?: string | null
): Promise<string> {
  const customerQuery = db.collection('customers').where('email', '==', email).limit(1);
  const customerSnapshot = await customerQuery.get();

  if (customerSnapshot.empty) {
    console.log(`Creating new customer for email: ${email}`);
    
    // Create the base customer data
    const customerData = {
      email: email,
      name: name ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    // Add provider ID if available
    if (providerCustomerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (customerData as any).stripeCustomerId = providerCustomerId;
    }
    
    const customerRef = await db.collection('customers').add(customerData);
    return customerRef.id;
  } else {
    const customerDoc = customerSnapshot.docs[0];
    console.log(`Found existing customer ${customerDoc.id} for email: ${email}`);
    
    // Update only if needed
    const updateFields = {};
    
    if (name && !customerDoc.data().name) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updateFields as any).name = name;
    }
    
    if (providerCustomerId && !customerDoc.data().stripeCustomerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updateFields as any).stripeCustomerId = providerCustomerId;
    }
    
    // Only update if we have fields to update beyond the timestamp
    if (Object.keys(updateFields).length > 0) {
      await customerDoc.ref.update({
        ...updateFields,
      updatedAt: FieldValue.serverTimestamp()
    });
    }
    
    return customerDoc.id;
  }
}

// --- Stripe Specific Processing ---

/**
 * Processes a completed Stripe Checkout session.
 * Creates customer, order, and payment records in Firestore.
 * Assumes basic validation and event recording happened before calling this.
 * @param db - Firestore Admin instance.
 * @param session - The Stripe Checkout Session object.
 * @returns Object indicating success status and optional error message.
 */
export async function processCompletedCheckout(
  db: Firestore, 
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; error?: string; customerId?: string; orderId?: string; paymentId?: string }> {
  const batch = db.batch();
  let customerId: string | undefined;
  let orderId: string | undefined;
  let paymentId: string | undefined;

  try {
    // --- Prioritize metadata for customer info ---
    const customerEmail = session.metadata?.customer_email || session.customer_details?.email;
    const customerName = session.metadata?.customer_name || session.customer_details?.name;
    const customerPhone = session.metadata?.customer_phone; // Primarily from metadata now

    if (!customerEmail) {
      // If email is still missing after checking metadata and details, it's a critical issue
      console.error(`Critical: Missing customer email in checkout session ${session.id} AND metadata.`);
      throw new Error('Missing customer email in checkout session.');
    }

    // 1. Find or Create Customer (using metadata-derived info)
    customerId = await findOrCreateCustomer(
      db,
      customerEmail, 
      customerName, // Pass name derived above
      typeof session.customer === 'string' ? session.customer : session.customer?.id
    );

    // 2. Create Order (ensure metadata is stored)
    const orderRef = db.collection('orders').doc();
    orderId = orderRef.id;
    batch.set(orderRef, {
        customerId,
        status: 'processing',
        totalAmount: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        // Store the consistent metadata from the session creation
        metadata: {
            offeringId: session.metadata?.offeringId || null,
            transaction_id: session.metadata?.transaction_id || null,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || '',
            ...(session.metadata ?? {}),
        },
        provider: 'stripe',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // 3. Create Payment Record (ensure metadata is stored consistently)
    const paymentRef = db.collection('payments').doc();
    paymentId = paymentRef.id;
    batch.set(paymentRef, {
        orderId,
        customerId,
        provider: 'stripe',
        providerPaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        status: 'succeeded', 
        paymentMethod: session.payment_method_types?.[0] ?? 'unknown',
        metadata: { 
            session_id: session.id,
            // Explicitly store consistent customer and transaction info
            offeringId: session.metadata?.offeringId || null,
            transaction_id: session.metadata?.transaction_id || null,
            customer_name: customerName, 
            customer_email: customerEmail,
            customer_phone: customerPhone || '',
            // Include other metadata from the session
            ...(session.metadata ?? {}), 
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Commit all writes in a batch
    await batch.commit();
    console.log(`Successfully processed Stripe session ${session.id}. Customer: ${customerId}, Order: ${orderId}, Payment: ${paymentId}`);

    // --- Trigger Email Confirmation (using derived data) ---
    // Check Resend API key existence before calling
    if (process.env.RESEND_API_KEY) {
       const amountTotal = session.amount_total;
       if (customerEmail && amountTotal !== null && amountTotal !== undefined) {
         try {
           console.log(`[server-firestore] Triggering email for Stripe session ${session.id} to ${customerEmail}`);
           await sendPaymentConfirmationEmail({
             to: customerEmail, // Use derived email
             customerName: customerName ?? undefined, // Use derived name
             amount: amountTotal,
             currency: session.currency || 'usd',
             provider: 'Stripe',
             transactionId: session.id,
             // Optionally add transaction URL or other details from metadata if needed
           });
         } catch (emailError) {
           console.error(`[server-firestore] Failed to SEND confirmation email for Stripe session ${session.id}, but processing continues:`, emailError);
           // Do not throw, let the webhook succeed even if email fails
         }
       } else {
          console.warn(`[server-firestore] Skipping email for session ${session.id}: Missing derived customer email or amount total.`);
       }
    } else {
         console.log(`[server-firestore] Skipping email confirmation for session ${session.id}: RESEND_API_KEY not configured.`);
    }
    
    return { success: true, customerId, orderId, paymentId };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
    console.error(`Error processing Stripe checkout session ${session.id}:`, error);
    return { success: false, error: errorMessage };
  }
}

// --- Coinbase Specific Processing ---

/**
 * Processes a confirmed or resolved Coinbase Commerce charge event.
 * Creates customer, order, and payment records in Firestore.
 * Assumes basic validation and event recording happened before calling this.
 * @param db - Firestore Admin instance.
 * @param event - The Coinbase Commerce webhook event object.
 * @returns Object indicating success status and optional error message.
 */
export async function processCompletedCoinbaseCharge(
  db: Firestore,
  event: CoinbaseWebhookEvent
): Promise<{ success: boolean; error?: string; customerId?: string; orderId?: string; paymentId?: string }> {
  const batch = db.batch();
  let customerId: string | undefined;
  let paymentId: string | undefined;
  let orderId: string | undefined;
  const charge = event.data;

  try {
    // --- Ensure metadata keys match those set in the API ---
    const customerEmail = charge.metadata?.customer_email; // Use correct key
    const customerName = charge.metadata?.customer_name;   // Use correct key
    const customerPhone = charge.metadata?.customer_phone;  // Use correct key

    if (!customerEmail) {
       // This should be far less likely now, but keep the check
       console.error(`Critical: Missing customer_email in Coinbase charge metadata for ${charge.code}.`);
       throw new Error('Missing customer email in Coinbase charge metadata.');
    }

    // 1. Find or Create Customer (using metadata-derived info)
    customerId = await findOrCreateCustomer(
      db,
      String(customerEmail), // Explicitly convert to string
      customerName ? String(customerName) : null // Convert if exists, else null
      // No providerCustomerId for Coinbase here
    );

    // 2. Create Order Record (mirroring Stripe logic)
    const orderRef = db.collection('orders').doc();
    orderId = orderRef.id;
    const orderData = {
        customerId,
        status: 'processing', // Or 'completed' if appropriate for Coinbase flow
        totalAmount: parseFloat(charge.pricing?.local?.amount ?? '0') * 100, // Convert to cents
        currency: charge.pricing?.local?.currency?.toLowerCase() ?? 'usd',
        metadata: { // Store consistent metadata
            offeringId: charge.metadata?.offeringId || null,
            transaction_id: charge.metadata?.transactionId || null, // Fixed: using transactionId instead of transaction_id
            customer_name: customerName || null,
            customer_email: customerEmail || null,
            customer_phone: customerPhone || null,
            charge_code: charge.code || null,
            charge_id: charge.id || null,
            ...(charge.metadata || {}), // Include other metadata
        },
        provider: 'coinbase',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(orderRef, orderData);

    // 3. Create Payment Record (ensure metadata is stored consistently)
    const paymentRef = db.collection('payments').doc();
    paymentId = paymentRef.id;

    const pricing = charge.pricing;
    let settledAmount: { amount: string; currency: string } | undefined;

    if (charge.pricing_type === 'fixed_price') {
      settledAmount = pricing.local; // Use local for fixed price
    } else if (charge.pricing_type === 'no_price') {
      const firstPayment = charge.payments?.[0]?.value?.crypto;
      if (firstPayment) {
         settledAmount = firstPayment;
      } else {
         settledAmount = { amount: '0', currency: 'USD' }; 
      }
    } else {
       const cryptoKey = Object.keys(pricing).find(k => k !== 'local');
       settledAmount = cryptoKey ? pricing[cryptoKey] : pricing.local; 
    }
    
    if (!settledAmount) {
      console.error(`Could not determine settled amount for Coinbase charge ${charge.code}. Pricing:`, pricing);
      throw new Error('Could not determine settled amount for charge.');
    }

    batch.set(paymentRef, {
      customerId,
      provider: 'coinbase',
      providerPaymentId: charge.code, 
      amount: parseFloat(settledAmount.amount) * 100, 
      currency: settledAmount.currency.toUpperCase(), 
      status: 'succeeded',
      paymentMethod: charge.payments?.map((p: CoinbasePayment) => p.network).join(', ') ?? 'crypto',
      metadata: {
        charge_id: charge.id,
        charge_code: charge.code,
        hosted_url: charge.hosted_url,
        // Explicitly store consistent customer and transaction info
        transaction_id: charge.metadata?.transaction_id, // Get from metadata - this matches Coinbase checkout route
        customer_name: customerName, // Already derived from correct metadata key
        customer_email: customerEmail, // Already derived from correct metadata key
        customer_phone: customerPhone || '',
        // Include other metadata from the charge
        ...(charge.metadata ?? {}),
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    console.log(`Successfully processed Coinbase charge ${charge.code}. Customer: ${customerId}, Order: ${orderId}, Payment: ${paymentId}`);

    // --- Trigger Email Confirmation (using derived data) ---
    if (process.env.RESEND_API_KEY) {
      const amount = parseFloat(settledAmount.amount) * 100;
      const currency = settledAmount.currency.toUpperCase();
      
      // Use the customerEmail and customerName derived from metadata earlier
      if (customerEmail && !isNaN(amount) && currency) { 
        try {
          console.log(`[server-firestore] Triggering email for Coinbase charge ${charge.code} to ${customerEmail}`);
          await sendPaymentConfirmationEmail({
            to: String(customerEmail), // Use derived email, converted to string
            customerName: customerName ? String(customerName) : undefined, // Use derived name, converted to string if exists
            amount,
            currency,
            provider: 'Coinbase',
            transactionId: charge.code,
            transactionUrl: charge.hosted_url || undefined,
          });
        } catch (emailError) {
           console.error(`[server-firestore] Failed to SEND confirmation email for Coinbase charge ${charge.code}, but processing continues:`, emailError);
           // Do not throw
        }
      } else {
        console.warn(`[server-firestore] Skipping email for charge ${charge.code}: Missing derived customer email, valid amount, or currency.`);
      }
    } else {
      console.log(`[server-firestore] Skipping email confirmation for charge ${charge.code}: RESEND_API_KEY not configured.`);
    }

    return { success: true, customerId, orderId, paymentId };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
    console.error(`Error processing Coinbase charge ${charge.code}:`, error);
    return { success: false, error: errorMessage };
  }
} 