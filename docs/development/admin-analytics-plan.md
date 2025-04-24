# Admin Analytics & Table Enhancement Plan

## Goal

Enhance the Admin Dashboard by adding visual analytics for revenue trends and improving the clarity of data in the Orders/Payments tables.

## Feature 1: Revenue Trend Chart

### Objective
Display a line chart in the Admin Overview section showing the total revenue from completed orders aggregated daily for the past 30 days.

### Location
- Target Component: `src/components/admin/AdminOverview.tsx`
- New Component: `src/components/admin/charts/RevenueChart.tsx` (Create `charts` directory if needed)

### Technology
- Charting Library: Recharts (`recharts`)

### Data Source
- Firestore Collection: `orders`
- Filtering Criteria: Orders with `status: 'completed'` within the last 30 days.

### Implementation Steps
1.  **Install Recharts:** Add `recharts` as a project dependency.
    ```bash
    npm install recharts
    # or yarn add recharts or pnpm add recharts
    ```
2.  **Create `RevenueChart.tsx` Component:**
    - Set up a client component (`'use client'`).
    - Implement state for loading, error, and chart data.
    - Create a function to fetch order data from Firestore for the last 30 days, filtering for completed orders.
    - Implement logic to process fetched data:
        - Group orders by date.
        - Sum the `totalAmount` for each day.
        - Format data for Recharts (e.g., `[{ date: 'YYYY-MM-DD', revenue: number }, ...]`).
    - Use Recharts components (`ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`) to render the chart.
    - Include loading and error states presentation.
3.  **Integrate into `AdminOverview.tsx`:**
    - Import the `RevenueChart` component.
    - Place the chart component within the overview layout (e.g., in a new `Card` component).

## Feature 2: Provider Column in Orders Table

### Objective
Add a "Provider" column to the main Orders table in the admin dashboard to clearly indicate whether an order was processed via Stripe or Coinbase Commerce.

### Location
- Target Component: `src/components/admin/tables/OrdersTable.tsx`

### Data Source
- Firestore Collection: `orders`
- Field: Verify the existence and consistency of a field indicating the payment method (e.g., `paymentMethod: 'stripe'` or `paymentMethod: 'coinbase'`) on each Order document. This field should have been populated during the checkout process.

### Implementation Steps
1.  **Verify Data Field:** Confirm that the `paymentMethod` (or equivalent) field exists and is reliably populated in the `orders` collection documents.
2.  **Modify Table Columns:**
    - Open `src/components/admin/tables/OrdersTable.tsx`.
    - Locate the `columns` definition used by `DataTable`.
    - Add a new column definition object to the `columns` array.
    - Configure the column:
        - `accessorKey`: `paymentMethod` (or the actual field name).
        - `header`: "Provider".
        - `cell`: Use a function to format the output (e.g., display "Stripe" if value is 'stripe', "Coinbase" if 'coinbase'). Add handling for potential missing/different values.
3.  **Adjust Layout (Optional):** Review the table appearance and adjust column widths or styling if necessary to accommodate the new column.

## Confirmation
Please review this plan. Once confirmed, I will proceed with the implementation steps, starting with installing Recharts and creating the Revenue Chart component. 