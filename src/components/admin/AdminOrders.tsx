'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { Order } from '@/lib/definitions'; // Import the Order type
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns'; // For date formatting
import { CreditCard, Bitcoin } from 'lucide-react'; // Import icons for payment methods

// Helper function to format Firestore Timestamp or Date to string
const formatTimestamp = (timestamp: Timestamp | Date | string): string => {
  if (!timestamp) return 'N/A';
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
      return 'Invalid Date';
  }
  
  if (isNaN(date.getTime())) {
      return 'Invalid Date';
  }
  
  try {
      return format(date, 'PPpp'); // Format like: Aug 16, 2023 at 3:30:00 PM
  } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
  }
};

// Helper to format currency (assuming price is in cents)
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  return `$${(amount / 100).toFixed(2)}`;
};

// Helper to get provider icon and display name
const getProviderDisplay = (provider: string | undefined) => {
  if (!provider) return { name: 'Unknown', icon: null };
  
  switch (provider.toLowerCase()) {
    case 'stripe':
      return { name: 'Stripe', icon: <CreditCard className="h-4 w-4" /> };
    case 'coinbase':
      return { name: 'Coinbase', icon: <Bitcoin className="h-4 w-4" /> };
    default:
      return { name: provider, icon: <CreditCard className="h-4 w-4" /> };
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ordersRef = collection(db, 'orders');
        // Query the last 50 orders, ordered by creation date descending
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          // Ensure the data conforms to the Order type, including the id
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);

      } catch (err: unknown) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Recent Orders</h1>
      
      {isLoading && <p>Loading orders...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate max-w-xs">{order.id}</TableCell>
                    <TableCell className="truncate max-w-xs">{order.customerId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === 'completed' ? 'success' : (order.status === 'canceled' || order.status === 'refunded' ? 'destructive' : 'secondary')}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.provider && (
                        <div className="flex items-center gap-1.5">
                          {getProviderDisplay(order.provider).icon}
                          <span>{getProviderDisplay(order.provider).name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>{formatTimestamp(order.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 