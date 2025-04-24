'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useTheme } from 'next-themes';
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react';

interface ChartData {
  date: string;
  revenue: number;
  formattedRevenue: string;
}

export default function RevenueChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { siteSettings } = useSiteSettings();
  const { resolvedTheme } = useTheme();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // State for date range selection
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = subDays(end, 29); // Default to last 30 days (incl. today)
    return { from: start, to: end };
  });

  // Get theme colors for the chart
  const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => siteSettings?.theme?.colors?.[themeMode] || {
    primary: '#3182CE',
    background: '#FFFFFF',
    mutedForeground: '#718096'
  }, [siteSettings?.theme?.colors, themeMode]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100); // Assuming amount is in cents
  };
  
  // Fetch data based on selected date range
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      // Don't fetch if the date range isn't fully defined
      return;
    }
    
    const fetchRevenueData = async (startDate: Date, endDate: Date) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use start of the start day and end of the end day for the query
        const queryStartDate = startOfDay(startDate);
        const queryEndDate = endOfDay(endDate);
        
        const paymentsRef = collection(db, 'payments');
        const successfulPaymentsQuery = query(
          paymentsRef,
          where('status', '==', 'succeeded'),
          where('createdAt', '>=', queryStartDate),
          where('createdAt', '<=', queryEndDate),
          orderBy('createdAt', 'asc')
        );
        
        const paymentsSnapshot = await getDocs(successfulPaymentsQuery);
        
        // Process payments and aggregate by date
        const dateMap: Record<string, number> = {};
        let runningTotal = 0;
        
        paymentsSnapshot.forEach((doc) => {
          const payment = doc.data();
          let paymentDate: Date;
          
          if (payment.createdAt instanceof Timestamp) {
            paymentDate = payment.createdAt.toDate();
          } else if (payment.createdAt instanceof Date) {
            paymentDate = payment.createdAt;
          } else if (typeof payment.createdAt === 'string') {
            paymentDate = new Date(payment.createdAt);
          } else {
            return;
          }
          
          const dateStr = format(paymentDate, 'yyyy-MM-dd');
          if (dateMap[dateStr] === undefined) {
            dateMap[dateStr] = 0;
          }
          dateMap[dateStr] += payment.amount || 0;
          runningTotal += payment.amount || 0;
        });
        
        // Convert to array format for Recharts, ensuring all days in the range are present
        const chartData: ChartData[] = [];
        let currentDate = queryStartDate;
        while (currentDate <= queryEndDate) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const revenue = dateMap[dateStr] || 0;
          chartData.push({
            date: dateStr,
            revenue,
            formattedRevenue: formatCurrency(revenue)
          });
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        setData(chartData);
        setTotalRevenue(runningTotal);
        
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRevenueData(dateRange.from, dateRange.to);
  }, [dateRange]); // Refetch when dateRange changes
  
  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        revenue: number;
        formattedRevenue: string;
      };
    }>;
    label?: string;
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-primary">{`Revenue: ${payload[0].payload.formattedRevenue}`}</p>
        </div>
      );
    }
    return null;
  };

  // Date Range Picker Button
  const DatePickerWithRange = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
    const handleDateSelect = (selectedRange: DateRange | undefined) => {
      setDateRange(selectedRange);
      // Close the popover only if both dates are selected
      if (selectedRange?.from && selectedRange?.to) {
        setIsDatePickerOpen(false);
      }
    };
  
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")}
                    {" - "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateSelect} // Use the custom handler
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "Selected Period";
    if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
      return format(dateRange.from, "MMM d, yyyy");
    }
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div>
          <CardTitle className="text-xl font-semibold">Revenue Trend</CardTitle>
          <CardDescription>Revenue for {formattedDateRange}</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
           <DatePickerWithRange />
           {/* Optional: Add preset buttons here later */}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Loading revenue data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No revenue data for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total revenue for {formattedDateRange}</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.mutedForeground + '40'} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke={colors.mutedForeground}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Math.round(value / 100)}`}
                    stroke={colors.mutedForeground}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.primary }}
                    activeDot={{ r: 5, fill: colors.primary }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 