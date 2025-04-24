'use client';

import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { WebhookEventData, WebhookProcessingStatus } from '@/lib/definitions';
import { toast } from 'sonner';

// Define a simple Skeleton component if not available
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className || ''}`}></div>
);

// Map status to badge variants that match the Badge component's accepted variants
const getStatusBadge = (status: WebhookProcessingStatus): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" => {
  const statusMap: Record<WebhookProcessingStatus, "default" | "destructive" | "outline" | "secondary" | "success" | "warning"> = {
    'received': 'secondary',
    'processing': 'warning',
    'completed': 'success',
    'failed': 'destructive',
    'retrying': 'warning',
    'abandoned': 'outline'
  };
  return statusMap[status] || 'default';
};

// Format date for display
const formatDate = (date: Date | string | Timestamp | null | undefined) => {
  if (!date) return 'N/A';
  
  // Convert Firestore Timestamp to Date
  if (typeof date === 'object' && 'toDate' in date) {
    date = date.toDate();
  }
  
  // Convert string to Date
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Format the date
  if (date instanceof Date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  return 'Invalid Date';
};

export default function AdminWebhookEvents() {
  const [events, setEvents] = useState<WebhookEventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WebhookProcessingStatus | 'all'>('all');
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});

  // Fetch webhook events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const webhooksCollection = collection(db, 'webhook_events');
      let webhookQuery = query(
        webhooksCollection,
        orderBy('receivedAt', 'desc'),
        limit(50)
      );
      
      // Apply filter if not 'all'
      if (filter !== 'all') {
        webhookQuery = query(
          webhooksCollection,
          where('status', '==', filter),
          orderBy('receivedAt', 'desc'),
          limit(50)
        );
      }
      
      const snapshot = await getDocs(webhookQuery);
      
      const fetchedEvents: WebhookEventData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          ...data,
        } as WebhookEventData);
      });
      
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching webhook events:', err);
      setError('Failed to load webhook events');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Handle retry webhook
  const handleRetry = async (eventId: string) => {
    setRetrying(prev => ({ ...prev, [eventId]: true }));
    
    try {
      // Call API endpoint to retry the webhook
      const response = await fetch(`/api/admin/webhooks/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookEventId: eventId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry webhook');
      }
      
      toast.success('Webhook queued for retry');
      // Refresh the list
      fetchEvents();
    } catch (err) {
      console.error('Error retrying webhook:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to retry webhook');
    } finally {
      setRetrying(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // Loading skeleton
  if (loading && !events.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>View and manage webhook events from payment providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Events</CardTitle>
        <CardDescription>View and manage webhook events from payment providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as WebhookProcessingStatus | 'all')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="retrying">Retrying</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchEvents} variant="outline">
            Refresh
          </Button>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No webhook events found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {event.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.eventType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(event.status as WebhookProcessingStatus)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(event.receivedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.alert(`Details for event ${event.id}`)}
                        >
                          Details
                        </Button>
                        
                        {event.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRetry(event.id)}
                            disabled={retrying[event.id]}
                          >
                            {retrying[event.id] ? 'Retrying...' : 'Retry'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {events.length} of {events.length} webhook events
        </div>
        {/* Pagination could be added here in the future */}
      </CardFooter>
    </Card>
  );
} 