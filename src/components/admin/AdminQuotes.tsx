'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { QuoteRequest } from '@/lib/definitions'; // Import the QuoteRequest type
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

// Helper function to format Firestore Timestamp or Date to string (can be reused or moved to utils)
const formatTimestamp = (timestamp: unknown): string => {
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

// Helper function to get Badge variant based on status
const getStatusVariant = (status: QuoteRequest['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
        case 'new': return 'success';
        case 'viewed': return 'default';
        case 'in-progress': return 'secondary';
        case 'completed': return 'outline';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const quotesRef = collection(db, 'quoteRequests');
        // Query the last 50 quote requests, ordered by creation date descending
        const q = query(quotesRef, orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const fetchedQuotes: QuoteRequest[] = [];
        querySnapshot.forEach((doc) => {
          // Ensure the data conforms to the QuoteRequest type, including the id
          fetchedQuotes.push({ id: doc.id, ...doc.data() } as QuoteRequest);
        });
        setQuotes(fetchedQuotes);

      } catch (err: unknown) {
        console.error("Error fetching quote requests:", err);
        setError("Failed to fetch quote requests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Recent Quote Requests</h1>
      
      {isLoading && <p>Loading quotes...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                {/* Add more columns if needed, e.g., Budget, Timeline */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No quote requests found.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.name}</TableCell>
                    <TableCell>{quote.email}</TableCell>
                    <TableCell className="capitalize">{quote.projectType}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(quote.status)}
                        className="capitalize"
                      >
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(quote.createdAt)}</TableCell>
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