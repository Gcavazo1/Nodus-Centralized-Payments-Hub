'use client'; // Needs context

import { useState, useEffect } from 'react';
import { usePaymentConfig } from '@/context/PaymentConfigContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CreditCard, Bitcoin, RefreshCw, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

// Interface for payment data from Firestore
interface Payment {
  id: string;
  customerId: string;
  orderId?: string;
  quoteId?: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: string;
  providerPaymentId: string;
  createdAt: Timestamp | Date | string; // Use specific types instead of any
}

export default function AdminPayments() {
  const { isStripeConfigured, isCoinbaseConfigured } = usePaymentConfig();
  const { siteSettings, updateSiteSettings, isLoading: isContextLoading, error: contextError } = useSiteSettings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enableCoinbase, setEnableCoinbase] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Renamed fetchPayments function to avoid conflict and moved inside component scope
  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('createdAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      
      const fetchedPayments: Payment[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPayments.push({ id: doc.id, ...doc.data() } as Payment);
      });
      setPayments(fetchedPayments);
    } catch (err: unknown) { // Use unknown instead of any
      console.error("Error fetching payments:", err);
      const message = err instanceof Error ? err.message : "Unknown error fetching payment data.";
      setError(`Failed to fetch payment data: ${message}`);
    } finally {
      // Only set loading false if context is also loaded
      if (!isContextLoading) {
         setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPayments(); // Call the renamed function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependency array empty to run once on mount

  // Sync local state with context
  useEffect(() => {
    if (!isContextLoading) {
      setEnableCoinbase(siteSettings.payments.enableCoinbase);
      // If payments are still loading, don't set component loading to false yet
      if (!isLoading && payments.length === 0 && !error) {
          // Let loadPayments finish
      } else {
          setIsLoading(false); 
      }
      if (!contextError) {
        // Don't clear payment fetch errors if context loads okay
        // setError(null);
      } else {
         setError(contextError); // Show context error locally if it exists
      }
    } else {
      setIsLoading(true);
    }
  }, [isContextLoading, siteSettings.payments, contextError, isLoading, payments.length, error]); // Added dependencies

  // Check for changes
  useEffect(() => {
     if (!isLoading && !isContextLoading) {
        setHasChanges(
            enableCoinbase !== siteSettings.payments.enableCoinbase
        );
     }
  }, [enableCoinbase, siteSettings.payments, isLoading, isContextLoading]);

  const handleToggleCoinbase = (checked: boolean) => {
      setEnableCoinbase(checked);
  };

  const savePaymentSettings = async () => {
    setIsSaving(true);
    setError(null);
    const paymentUpdate = { enableCoinbase };

    try {
      await updateSiteSettings({ payments: paymentUpdate });
      toast.success('Payment settings saved successfully.');
      setHasChanges(false);
    } catch (err: unknown) { // Use unknown
      const errorMessage = err instanceof Error ? err.message : 'Failed to save payment settings.';
      setError(errorMessage);
      toast.error('Failed to save payment settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format Firestore timestamp
  const formatDate = (timestamp: Timestamp | Date | string): string => { // Use specific types
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'Invalid Date Type'; // More specific error
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date Value'; // More specific error
    }
    
    return format(date, 'PPp'); // Mar 15, 2023, 3:25 PM
  };

  // Format currency (assuming price is in cents)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100); // Convert cents to dollars
  };

  // Get status badge variant based on payment status
  const getStatusBadgeVariant = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  // Get payment method icon
  const getPaymentIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'coinbase': return <Bitcoin className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />; // Default icon
    }
  };

  // If context or payments are still loading, show combined skeleton/placeholder
  if (isLoading || isContextLoading) {
      return (
          <div className="space-y-8">
             {/* Payment Gateway Skeleton */}
             <Card>
                  <CardHeader>
                      <div className="h-6 w-1/2 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mt-2"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                      <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
                  </CardContent>
                  <CardFooter>
                      <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
                  </CardFooter>
            </Card>
            {/* Recent Payments Skeleton */}
            <div className="mt-8">
                 <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-6"></div>
                 <div className="space-y-3 border rounded-lg p-4">
                    {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-md"></div>
                    ))}
                </div>
             </div>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Payment Settings</h1>
      
      {/* Payment Gateway Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stripe</span>
              <Badge variant={isStripeConfigured ? 'success' : 'destructive'}>
                {isStripeConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Handles credit card, debit card, Apple Pay, and Google Pay payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStripeConfigured ? (
              <p className="text-sm text-muted-foreground">
                Stripe integration is active.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Stripe environment variables (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY) are missing or incorrect.
              </p>
            )}
            <Link href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="mt-4">
                Go to Stripe Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Coinbase Commerce</span>
              <Badge variant={isCoinbaseConfigured ? 'success' : 'destructive'}>
                {isCoinbaseConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Handles cryptocurrency payments (e.g., BTC, ETH).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCoinbaseConfigured ? (
              <p className="text-sm text-muted-foreground">
                Coinbase Commerce integration is active.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Coinbase Commerce environment variables (COINBASE_COMMERCE_API_KEY, COINBASE_COMMERCE_WEBHOOK_SECRET) are missing or incorrect.
              </p>
            )}
            <Link href="https://commerce.coinbase.com/dashboard" target="_blank" rel="noopener noreferrer">
               <Button variant="outline" size="sm" className="mt-4">
                 Go to Coinbase Dashboard <ExternalLink className="ml-2 h-4 w-4" />
               </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Enable/Disable Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Configuration</CardTitle>
          <CardDescription>
            Enable or disable specific payment providers for checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Display Error */}
            {(error || contextError) && !isSaving && (
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  {/* Prioritize local component error over context error if both exist */}
                  <AlertDescription>{error || contextError}</AlertDescription>
              </Alert>
            )}

          {/* Coinbase Commerce Section */}
          <div className="space-y-4 rounded-md border p-4">
               <h3 className="font-medium leading-none">Coinbase Commerce (Crypto)</h3>
               <div className="flex items-center justify-between space-x-2 pt-2">
                   <Label htmlFor="enable-coinbase" className="flex flex-col space-y-1 cursor-pointer">
                       <span>Enable Crypto Payments</span>
                       <span className="font-normal leading-snug text-muted-foreground">
                          Allow customers to pay with cryptocurrencies like BTC and ETH.
                       </span>
                  </Label>
                  <Switch
                      id="enable-coinbase"
                      checked={enableCoinbase}
                      onCheckedChange={handleToggleCoinbase}
                      disabled={isSaving || isContextLoading} // Also disable if context is loading
                      aria-labelledby="enable-coinbase-label"
                  />
              </div>
               {/* Vulnerability Warning */}
               {enableCoinbase && (
                  <Alert variant="default" className="mt-4 border-yellow-500/50 text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Security Notice</AlertTitle>
                      <AlertDescription>
                          The currently used Coinbase Commerce SDK (`coinbase-commerce-node`) has known vulnerabilities in its dependencies (e.g., `lodash`, `request`). While the risk might be low for standard use, please review the details in the{' '}
                          <Link href="https://github.com/advisories/GHSA-29mw-wpgm-hmr9" className="font-medium underline underline-offset-4 text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100" target="_blank" rel="noopener noreferrer">
                              GitHub Advisory <ExternalLink className="inline-block h-3 w-3 ml-0.5"/>
                          </Link>{' '}
                          and enable at your own discretion. Consider alternative libraries if concerned.
                      </AlertDescription>
                  </Alert>
              )}
          </div>
          {/* Stripe Section Placeholder */}
        </CardContent>
        <CardFooter>
          <Button
            onClick={savePaymentSettings}
            disabled={isContextLoading || isSaving || !hasChanges} 
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Settings'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Payment Transactions Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Payment Transactions</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadPayments} // Use the renamed function
            disabled={isLoading} // Disable refresh if already loading
          >
            {isLoading && !isContextLoading ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
               <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Error specifically for payments table */}
        {error && !contextError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center mb-4">
            <XCircle className="h-5 w-5 mr-2" />
            {error} 
          </div>
        )}

        {/* Table loading state handled by the main loading check above */}
         <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Order/Quote</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No payment transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.providerPaymentId?.substring(0, 12) || 'N/A'}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPaymentIcon(payment.provider)}
                          <span className="ml-2 capitalize">{payment.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(payment.status)}
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.orderId 
                          ? `Order: ${payment.orderId.substring(0, 8)}...` 
                          : payment.quoteId 
                          ? `Quote: ${payment.quoteId.substring(0, 8)}...` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

    </div>
  );
} 