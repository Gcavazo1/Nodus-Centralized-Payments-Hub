import { NextResponse } from 'next/server';
// Switch to Admin SDK for adding quotes
import { getAdminFirestoreInstance } from '@/lib/firebase-admin'; 
import { FieldValue } from 'firebase-admin/firestore'; 
// Import the email function
import { sendQuoteAcknowledgementEmail } from '@/lib/email';
import { QuoteRequest } from '@/lib/definitions';
// Import site configuration
import { siteConfig } from '@/config/site';

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define the expected structure of the quote request data in Firestore
// Align this with your QuoteRequest type in definitions.ts if you have one
interface QuoteRequestData {
  name: string;
  email: string;
  projectType: string;
  description: string;
  company?: string;
  phone?: string;
  budget?: string;
  timeline?: string;
  status: string; // Add status field
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export async function POST(request: Request) {
  console.log('--- QUOTE API ROUTE HIT ---');
  let db;
  try {
    db = await getAdminFirestoreInstance();
    console.log('[Quote API] Firestore Admin instance obtained.');
  } catch (error) {
    console.error('[Quote API] Error getting Firestore instance:', error);
    return NextResponse.json({ error: 'Failed to initialize database connection.' }, { status: 500 });
  }

  let quoteDataForEmail: { name?: string; email: string; projectType?: string; description?: string; budget?: string; timeline?: string; phone?: string; companyName?: string; supportEmail?: string } | null = null;

  try {
    const body = await request.json();
    console.log("[Quote API] Quote submission received:", body);

    // --- Input Validation ---
    if (!body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields (email, message).' }, { status: 400 });
    }
    if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (typeof body.message !== 'string' || body.message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long.' }, { status: 400 });
    }
    // Optional fields validation
    const name = typeof body.name === 'string' ? body.name : undefined;
    const projectType = typeof body.projectType === 'string' ? body.projectType : 'other';
    const description = body.message;
    const company = typeof body.company === 'string' ? body.company : undefined;
    const phone = typeof body.phone === 'string' ? body.phone : undefined;
    const budget = typeof body.budget === 'string' ? body.budget : undefined;
    const timeline = typeof body.timeline === 'string' ? body.timeline : undefined;

    // Store data needed for email before trying DB write
    quoteDataForEmail = {
      name: name,
      email: body.email,
      projectType: projectType,
      description: description,
      budget: budget,
      timeline: timeline,
      phone: phone,
      companyName: siteConfig.name,
      supportEmail: siteConfig.contact.email
    };

    // Prepare data for Firestore
    const quoteData: QuoteRequestData = {
      name: name || '',
      email: body.email,
      projectType: projectType,
      description: description,
      company: company,
      phone: phone,
      budget: budget,
      timeline: timeline,
      status: 'new', // Initial status
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Add to Firestore using Admin SDK
    const quoteRef = await db.collection('quoteRequests').add(quoteData);
    const requestId = quoteRef.id;
    console.log(`[Quote API] Quote request ${requestId} added successfully.`);

    // --- Send Acknowledgement Email --- 
    if (process.env.RESEND_API_KEY && quoteDataForEmail) {
      console.log(`[Quote API] Attempting to send acknowledgement email to ${quoteDataForEmail.email}...`);
      try {
        await sendQuoteAcknowledgementEmail({
          to: quoteDataForEmail.email,
          customerName: quoteDataForEmail.name || 'there',
          projectType: quoteDataForEmail.projectType,
          description: quoteDataForEmail.description,
          budget: quoteDataForEmail.budget,
          timeline: quoteDataForEmail.timeline,
          phone: quoteDataForEmail.phone,
          companyName: quoteDataForEmail.companyName,
          supportEmail: quoteDataForEmail.supportEmail,
        });
        console.log(`[Quote API] Acknowledgement email call successful for ${quoteDataForEmail.email}.`);
      } catch (emailError) {
        // Log email sending errors but don't fail the API response
        console.error(`[Quote API] Failed to send acknowledgement email for request ${requestId}:`, emailError);
      }
    } else {
      console.log(`[Quote API] Skipping quote acknowledgement email: Resend API key not configured.`);
    }
    // ----------------------------------

    // Return success response
    return NextResponse.json({ 
      message: "Quote request received successfully!", 
      requestId: requestId 
    });

  } catch (error) {
    console.error("[Quote API] Error processing quote request:", error);
    // Handle JSON parsing errors or other specific errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    // Generic error for Firestore or other issues
    return NextResponse.json({ error: 'Failed to process quote request.' }, { status: 500 });
  }
} 