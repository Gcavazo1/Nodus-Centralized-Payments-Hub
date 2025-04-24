"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full p-3 w-fit dark:bg-red-900">
             <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">Payment Canceled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was canceled or could not be processed.
          </p>
          <p className="text-sm text-muted-foreground">
            If you were having trouble, please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/" passHref>
              <Button variant="outline">Return to Homepage</Button>
            </Link>
            <Link href="/#products" passHref>
              <Button>View Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 