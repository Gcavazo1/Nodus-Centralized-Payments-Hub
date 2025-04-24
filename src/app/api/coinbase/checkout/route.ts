import { NextResponse } from 'next/server';
import { Client } from 'coinbase-commerce-node'; // Import Client type
import { isCoinbaseConfigured, Charge } from '@/lib/coinbase'; // Import config check and types from our corrected module
import { products, services } from '@/config/offerings'; 
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating unique transaction IDs
import { resources } from 'coinbase-commerce-node'; // Import the library resources directly

// Ensure the client is initialized (this sets the API key globally for the library)
// Use a check to avoid initializing multiple times if this route is hit frequently
if (process.env.COINBASE_COMMERCE_API_KEY) {
    Client.init(process.env.COINBASE_COMMERCE_API_KEY);
} else {
    console.error("COINBASE_COMMERCE_API_KEY not found during Client.init in checkout route.");
}

// Ensure NEXT_PUBLIC_APP_URL is set for redirects
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request: Request) {
  // Use isCoinbaseConfigured which checks if the API key was provided
  if (!isCoinbaseConfigured) { 
    console.error('Coinbase Commerce API Key is not configured.');
    return NextResponse.json({ error: 'Coinbase Commerce configuration error.' }, { status: 500 });
  }

  if (!appUrl) {
     console.error('NEXT_PUBLIC_APP_URL is not set. Required for Coinbase redirects.');
     return NextResponse.json({ error: 'Application URL configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    // Destructure new customer fields
    const { offeringId, customerEmail, customerName, customerPhone } = body;

    // Validate required fields
    if (!offeringId || !customerName || !customerEmail) {
      return NextResponse.json({ 
        error: 'Missing required checkout data (offeringId, customerName, customerEmail).' 
      }, { status: 400 });
    }

    // Find the product/service by ID
    const allOfferings = [...products, ...services];
    const offering = allOfferings.find(o => o.id === offeringId);

    if (!offering || offering.price === null) {
      return NextResponse.json({ error: 'Offering not found or has no price' }, { status: 404 });
    }

    // Convert price from cents to major currency unit (e.g., USD)
    const priceInMajorUnit = (offering.price / 100).toFixed(2);

    const transactionId = uuidv4();
    
    // Define type for chargeData based on Coinbase API needs
    interface CoinbaseChargeData {
      name: string;
      description: string;
      local_price: { amount: string; currency: string };
      pricing_type: 'fixed_price';
      metadata: { [key: string]: string };
      redirect_url: string;
      cancel_url: string;
    }

    const chargeData: CoinbaseChargeData = {
      name: offering.title,
      description: offering.description || 'Payment for service/product',
      local_price: {
        amount: priceInMajorUnit,
        currency: 'USD', 
      },
      pricing_type: 'fixed_price' as const,
      metadata: {
        offeringId: offering.id,
        transaction_id: transactionId, 
        // Store customer info with consistent keys
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || '', // Store phone, default to empty string
        order_reference: `order_${Date.now()}`, // Keep if needed
      },
      redirect_url: `${appUrl}/success?source=coinbase&transaction_id=${transactionId}`, 
      cancel_url: `${appUrl}/cancel?source=coinbase&transaction_id=${transactionId}`,
    };

    const { Charge: ChargeResource } = resources; 
    const charge: Charge = await ChargeResource.create(chargeData);

    // Return the hosted URL and transaction ID
    return NextResponse.json({ 
      hosted_url: charge.hosted_url,
      transaction_id: transactionId 
    });

  } catch (error) {
    console.error('Error creating Coinbase charge:', error);
    // Type the error more specifically if possible, otherwise use unknown
    const typedError = error as { response?: { data?: { error?: { message?: string } } } }; 
    // Check if the error has a response object (API errors)
    if (typedError?.response?.data?.error?.message) {
        console.error('Coinbase API Error details:', typedError.response.data);
        return NextResponse.json({ error: `Coinbase API Error: ${typedError.response.data.error.message}` }, { status: 500 });
    } else if (typedError?.response?.data) {
        // Handle cases where the error structure might be different but data exists
        console.error('Coinbase API Error details (unknown structure):', typedError.response.data);
        return NextResponse.json({ error: 'Coinbase API Error: Unknown structure' }, { status: 500 });
    } else if (error instanceof Error) {
        // Handle generic JavaScript errors
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for completely unknown errors
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 