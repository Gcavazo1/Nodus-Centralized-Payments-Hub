import React from 'react';
import { Button } from '@/components/ui/button';
import { Bitcoin } from "lucide-react";

// Define the expected props
interface PaymentMethodSelectionProps {
  onSelect: (provider: 'stripe' | 'coinbase') => void;
  isLoading: boolean;
  // Add props later to conditionally disable options based on configuration
  // isStripeEnabled?: boolean;
  // isCoinbaseEnabled?: boolean;
}

export function PaymentMethodSelection({ 
  onSelect, 
  isLoading, 
  // isStripeEnabled = true, // Default to true for now
  // isCoinbaseEnabled = true 
}: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card">
       <p className="text-sm text-muted-foreground">Payment Method Selection (Placeholder)</p>
       <div className="flex flex-col sm:flex-row gap-4">
         {/* Stripe Button */}
         {/* TODO: Add logic to disable if Stripe isn't configured/enabled */}
          <Button 
            onClick={() => onSelect('stripe')} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Pay with Card (Stripe)'}
          </Button>

         {/* Coinbase Button */}
         {/* TODO: Add logic to disable if Coinbase isn't configured/enabled */}
          <Button 
            onClick={() => onSelect('coinbase')} 
            disabled={isLoading}
            variant="outline" // Example styling
            className="flex-1"
          >
            {isLoading ? 'Processing...' : <><Bitcoin className="mr-2 h-4 w-4" /> Pay with Crypto (Coinbase)</>}
          </Button>
       </div>
    </div>
  );
} 