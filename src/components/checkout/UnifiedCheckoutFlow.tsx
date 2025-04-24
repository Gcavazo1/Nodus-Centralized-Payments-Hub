"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { products, services } from '@/config/offerings';
import type { Offering } from '@/config/offerings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// Placeholders for sub-components (we'll create these next)
import { CustomerInfoForm } from './CustomerInfoForm'; 
import { PaymentMethodSelection } from './PaymentMethodSelection';

// Define the structure for customer information
interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

type CheckoutStep = 'info' | 'payment' | 'processing' | 'error' | 'loading' | 'hidden';

export function UnifiedCheckoutFlow() {
  const params = useParams();
  const offeringId = params.offeringId as string;
  
  const [step, setStep] = useState<CheckoutStep>('loading');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', email: '', phone: '' });
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For API call loading

  // Find the offering based on the ID from the URL parameters
  useEffect(() => {
    // Check if we're on a reserved path like success or cancel
    // In that case, hide the component completely
    if (!offeringId || offeringId === 'success' || offeringId === 'cancel') {
      console.warn(`[UnifiedCheckoutFlow] Invalid or missing offeringId (${offeringId}), hiding component.`);
      setStep('hidden');
      return; 
    }

    // Simulating finding the offering. Replace with actual async fetch if needed.
    const foundOffering = [...products, ...services].find(o => o.id === offeringId);
    if (foundOffering) {
      setSelectedOffering(foundOffering);
      setStep('info'); // Move to info step once offering is loaded
    } else {
      setError(`Offering with ID \"${offeringId}\" not found.`);
      setStep('error');
    }
  }, [offeringId]);

  // Handler for when customer info is submitted
  const handleInfoSubmit = (info: CustomerInfo) => {
    // TODO: Add validation (e.g., using zod)
    setCustomerInfo(info);
    setStep('payment');
  };

  // Handler for when a payment method is selected
  const handlePaymentSelection = async (provider: 'stripe' | 'coinbase') => {
    if (!selectedOffering) {
      setError('Cannot proceed without a selected offering.');
      setStep('error');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStep('processing');

    const payload = {
      offeringId: selectedOffering.id,
      name: customerInfo.name,
      email: customerInfo.email,
      // For Coinbase we need different field names
      ...(provider === 'coinbase' ? {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || '',
      } : {}),
    };

    const endpoint = provider === 'stripe' ? '/api/stripe/checkout' : '/api/coinbase/checkout';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to initiate ${provider} checkout.`);
      }

      // Redirect to provider
      const redirectUrl = provider === 'stripe' ? data.url : data.hosted_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        // No need to setLoading(false) as we are navigating away
      } else {
        throw new Error('No redirect URL received from payment provider.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error initiating ${provider} checkout:`, errorMessage);
      setError(errorMessage);
      setStep('payment'); // Revert to payment selection on error
      setIsLoading(false);
    }
  };

  // --- Conditional Rendering Logic ---

  const renderErrorState = () => (
    <Card className="w-full max-w-lg mx-auto border-destructive bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">Checkout Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive-foreground">{error || "An unexpected error occurred."}</p>
        {/* Optionally add a button to retry or go back */}
      </CardContent>
    </Card>
  );

  const renderInfoStep = () => (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Selection</h2>
        {selectedOffering && (
           <Card>
             <CardHeader>
               <CardTitle>{selectedOffering.title}</CardTitle>
               <CardDescription>{selectedOffering.description}</CardDescription>
             </CardHeader>
             <CardContent>
                 <p className="text-xl font-bold">
                   {selectedOffering.price !== null 
                      ? `$${(selectedOffering.price / 100).toFixed(2)}` 
                      : 'Price upon quote'} 
                 </p>
                 {/* Add more offering details if needed */}
             </CardContent>
           </Card>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
        {/* Render the actual CustomerInfoForm placeholder */}
        <CustomerInfoForm onSubmit={handleInfoSubmit} />
      </div>
    </div>
  );

  const renderPaymentStep = () => {
    if (!selectedOffering) {
      return (
        <div className="text-center text-muted-foreground">
          Error: Offering details are missing.
        </div>
      );
    }

    return (
       <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
              <CardTitle>Confirm Details & Select Payment</CardTitle>
              <CardDescription>Please review your information below and choose a payment method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                  <h3 className="font-medium mb-2">Selected Offering:</h3>
                  <p>
                    {selectedOffering?.title} - 
                    {selectedOffering?.price !== null 
                       ? `$${(selectedOffering.price / 100).toFixed(2)}` 
                       : 'Price upon quote'}
                  </p>
              </div>
              <div>
                  <h3 className="font-medium mb-2">Your Information:</h3>
                  <p>{customerInfo.name}</p>
                  <p>{customerInfo.email}</p>
                  {customerInfo.phone && <p>{customerInfo.phone}</p>}
              </div>
              <div>
                  <h3 className="font-medium mb-2">Choose Payment Method:</h3>
                  {/* Render the actual PaymentMethodSelection placeholder */}
                  <PaymentMethodSelection onSelect={handlePaymentSelection} isLoading={isLoading} />
              </div>
          </CardContent>
       </Card>
    );
  };

   const renderProcessingStep = () => (
     <div className="text-center py-10">
        {/* Add a spinner component */}
        <p className="text-xl font-medium">Processing your payment...</p>
        <p className="text-muted-foreground">Please wait, you will be redirected shortly.</p>
     </div>
   );

  // Don't render anything if we're on a success or cancel page
  if (step === 'hidden') {
    return null;
  }

  // Main return statement choosing which step to render
  return (
    <div className="space-y-8">
      {step === 'loading' && <p className="text-center text-muted-foreground">Loading offering details...</p>}
      {step === 'error' && renderErrorState()}
      {step === 'info' && renderInfoStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'processing' && renderProcessingStep()}
    </div>
  );
} 