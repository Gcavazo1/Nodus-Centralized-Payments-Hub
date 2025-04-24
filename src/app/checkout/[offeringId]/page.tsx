import React from 'react';
import { UnifiedCheckoutFlow } from '@/components/checkout/UnifiedCheckoutFlow';

// This page component acts primarily as a container
// for the client-side UnifiedCheckoutFlow component which handles the logic.

// No props needed if the client component reads the ID from the URL
export default function CheckoutPage() {
  // The client component UnifiedCheckoutFlow uses useParams() to get the offeringId

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      {/* 
        Pass offeringId or potentially fetch basic offering details here 
        if needed before rendering the client component. 
        For now, UnifiedCheckoutFlow will handle fetching/finding details using the ID.
      */}
      <UnifiedCheckoutFlow />
    </div>
  );
} 