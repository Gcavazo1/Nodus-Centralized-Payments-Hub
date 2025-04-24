import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { products, services } from '@/config/offerings';
import { getAdminFirestoreInstance } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get an offering by ID
const getOfferingById = (id: string) => {
  return [...products, ...services].find(offering => offering.id === id);
};

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured properly' },
        { status: 500 }
      );
    }

    // Parse request body
    const requestData = await request.json();
    const { offeringId, name, email, customFields } = requestData;

    // Validate required fields
    if (!offeringId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get offering details
    const offering = getOfferingById(offeringId);
    if (!offering) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      );
    }

    // Validate that the offering has a price
    if (offering.price === null) {
      return NextResponse.json(
        { error: 'Selected offering requires a custom quote' },
        { status: 400 }
      );
    }

    // Generate a transaction ID for tracking
    const transactionId = uuidv4();

    // Create a document in Firestore to track this transaction
    const db = await getAdminFirestoreInstance();
    const transactionRef = db.collection('transactions').doc(transactionId);
    await transactionRef.set({
      transactionId,
      offeringId: offering.id,
      customerId: null, // Will be updated with Stripe customer ID after payment
      customerName: name,
      customerEmail: email,
      amount: offering.price,
      currency: 'usd',
      status: 'pending',
      paymentMethod: 'stripe',
      customFields: customFields || {},
      createdAt: new Date().toISOString(),
    });

    // Create line items for Stripe checkout
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: offering.title,
            description: offering.description,
          },
          unit_amount: offering.price,
        },
        quantity: 1,
      },
    ];

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      client_reference_id: transactionId,
      customer_email: email,
      metadata: {
        transaction_id: transactionId,
        offeringId: offering.id,
        customer_name: name,
      },
    });

    // Return the session URL
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 