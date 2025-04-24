'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, FileText, Users, AlertCircle, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import RevenueChart from '@/components/admin/charts/RevenueChart';

interface StatsData {
  totalOrders: number;
  totalQuotes: number;
  newQuotes: number;
  totalAdminUsers: number;
  recentOrders?: { id: string; createdAt: unknown; totalAmount: number }[];
  loading: boolean;
  error: string | null;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue,
  loading,
  className = '', 
  iconClassName = ''
}: { 
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading: boolean;
  className?: string;
  iconClassName?: string;
}) => {
  const trendIcon = trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : 
                   trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> : null;

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-muted ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {trendValue && (
        <CardFooter className="p-2">
          <div className="flex items-center text-xs">
            {trendIcon}
            <span className={`ml-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}`}>
              {trendValue}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default function AdminOverview() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalQuotes: 0,
    newQuotes: 0,
    totalAdminUsers: 0,
    recentOrders: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total orders
        const ordersRef = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersRef);
        const totalOrders = ordersSnapshot.size;

        // Fetch recent orders for potential display
        const recentOrdersQuery = query(
          ordersRef, 
          orderBy('createdAt', 'desc'), 
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          createdAt: doc.data().createdAt,
          totalAmount: doc.data().totalAmount || 0
        }));

        // Fetch total quote requests
        const quotesRef = collection(db, 'quoteRequests');
        const quotesSnapshot = await getDocs(quotesRef);
        const totalQuotes = quotesSnapshot.size;

        // Fetch new quote requests
        const newQuotesQuery = query(
          quotesRef,
          where('status', '==', 'new')
        );
        const newQuotesSnapshot = await getDocs(newQuotesQuery);
        const newQuotes = newQuotesSnapshot.size;

        // Fetch total admin users
        const adminUsersRef = collection(db, 'adminUsers');
        const adminUsersSnapshot = await getDocs(adminUsersRef);
        const totalAdminUsers = adminUsersSnapshot.size;

        setStats({
          totalOrders,
          totalQuotes,
          newQuotes,
          totalAdminUsers,
          recentOrders,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard statistics. Please try again later.'
        }));
      }
    };

    fetchStats();
  }, []);

  // Format Firestore timestamp
  const formatDate = (timestamp: unknown) => {
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
    
    return format(date, 'MMM d, yyyy');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your centralized payment hub admin panel.</p>
      </div>

      {stats.error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {stats.error}
        </div>
      )}
      
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.loading ? '...' : stats.totalOrders}
          description="All time order count"
          icon={ShoppingCart}
          loading={stats.loading}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        
        <StatCard
          title="Quote Requests"
          value={stats.loading ? '...' : stats.totalQuotes}
          description="All time quote requests"
          icon={FileText}
          loading={stats.loading}
          iconClassName="bg-yellow-500/10 text-yellow-600"
        />
        
        <StatCard
          title="New Quotes"
          value={stats.loading ? '...' : stats.newQuotes}
          description="Awaiting review"
          icon={AlertCircle}
          trend={stats.newQuotes > 0 ? 'up' : 'neutral'}
          trendValue={stats.newQuotes > 0 ? `${stats.newQuotes} new` : 'None pending'}
          loading={stats.loading}
          iconClassName="bg-green-500/10 text-green-600"
        />
        
        <StatCard
          title="Admin Users"
          value={stats.loading ? '...' : stats.totalAdminUsers}
          description="Users with admin access"
          icon={Users}
          loading={stats.loading}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mt-8">
        <RevenueChart />
      </div>

      {/* Recent Orders Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        
        {stats.loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <Card key={order.id} className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-muted">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Order #{order.id.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No recent orders found.</p>
          </Card>
        )}
      </div>

      {/* Quick Tips or Action Items (can be enhanced later) */}
      <div className="mt-6">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Check the <span className="font-semibold text-primary">Quotes</span> section for any new requests</p>
            <p>• View <span className="font-semibold text-primary">Orders</span> for detailed payment history</p>
            <p>• Manage <span className="font-semibold text-primary">Users</span> to control admin access</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 