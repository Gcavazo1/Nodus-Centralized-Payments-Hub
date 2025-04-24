import { NextRequest, NextResponse } from 'next/server';
import { updateWebhookEventStatus } from '@/lib/server-firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Use the newly created auth options
import { getAdminFirestoreInstance } from '@/lib/firebase-admin'; // Use Admin SDK
import { FieldValue } from 'firebase-admin/firestore'; // Use Admin SDK FieldValue

export async function POST(req: NextRequest) {
  // Check authentication and admin status using the defined authOptions
  const session = await getServerSession(authOptions); 

  if (!session) { 
    return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
  }

  // Now TypeScript knows about session.user.role because of next-auth.d.ts
  const isAdmin = session.user?.role === 'admin'; 
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    if (!data.webhookEventId) {
      return NextResponse.json({ error: 'Missing required parameter: webhookEventId' }, { status: 400 });
    }
    
    // Use Admin SDK to get Firestore instance and document reference
    const db = await getAdminFirestoreInstance();
    const webhookEventRef = db.collection('webhookEvents').doc(data.webhookEventId);
    const webhookEventSnapshot = await webhookEventRef.get(); // Use .get() with Admin SDK
    
    if (!webhookEventSnapshot.exists) {
      return NextResponse.json({ error: 'Webhook event not found' }, { status: 404 });
    }
    
    const eventData = webhookEventSnapshot.data();
    
    if (eventData?.status !== 'failed' && eventData?.status !== 'abandoned') {
      return NextResponse.json({ 
        error: `Cannot retry webhook in status: ${eventData?.status}. Only failed or abandoned webhooks can be retried.` 
      }, { status: 400 });
    }
    
    // Update webhook event status to 'retrying' using the Admin SDK ref
    await updateWebhookEventStatus(webhookEventRef, 'retrying');

    // Update the metadata separately using the Admin SDK ref
    await webhookEventRef.update({ // Use .update() directly on Admin SDK ref
      'metadata.retryTriggeredBy': session.user?.email || session.user?.name || 'unknown', // Added optional chaining for session
      'metadata.retryTriggeredAt': new Date().toISOString(),
      'metadata.previousStatus': eventData?.status,
      updatedAt: FieldValue.serverTimestamp() // Use Admin SDK FieldValue
    });
    
    // In a real implementation, you would now:
    // 1. Queue the webhook for reprocessing (could use a Cloud Function, Task Queue, or direct processing)
    // 2. Set up a background job to actually process the webhook again
    
    // For this demonstration, we'll just mark it as queued
    const provider = eventData?.provider;
    const eventType = eventData?.eventType;
    
    // Log the retry attempt
    console.log(`[Admin API] Webhook retry requested for ${provider} event ${data.webhookEventId} (${eventType}) by ${session.user?.email || 'unknown'}`);
    
    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook queued for retry',
      webhookEventId: data.webhookEventId
    });
    
  } catch (error: unknown) {
    console.error('[Admin API] Error retrying webhook:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to retry webhook: ${message}` }, { status: 500 });
  }
} 