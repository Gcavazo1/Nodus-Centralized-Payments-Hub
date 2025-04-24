# Payment Hub Template - Setup Guide

This guide will walk you through setting up the necessary environment variables and Firebase configuration to run the Payment Hub Template locally and prepare it for deployment.

## Introduction

The Payment Hub Template is a complete solution for accepting payments through multiple providers (Stripe and Coinbase Commerce) in a single, unified platform. This setup guide covers the core configuration needed to get your payment hub running.

> **For additional details, see our specialized guides in the [docs/guides](./guides) directory.**

## Quick Navigation

- [Environment Variables](#1-environment-variables-file-envlocal) - Setting up your API keys and secrets
- [Firebase Admin SDK](#2-firebase-admin-sdk-setup-critical-for-security) - Configuring secure database access
- [Server-Side Keys](#3-server-side-keys--nextconfigmjs) - Next.js configuration
- [Firebase Setup](#4-firebase-setup) - Database and security rules
- [Restarting Your Server](#5-restart-your-server) - Applying configuration changes
- [Admin Features](#6-admin-features) - Setting up admin users and dashboard
- [Important Notes](#7-important-notes) - Security considerations and tips
- [Email Confirmation Setup](#8-optional-email-confirmation-setup-resend) - Configuring automated emails

For more detailed information on specific topics, please refer to these specialized guides:

- [Environment Variables Guide](./guides/environment-variables.md) - Detailed explanation of all environment variables
- [Firebase Setup Guide](./guides/firebase-setup.md) - Complete Firebase configuration instructions
- [Payment Providers Guide](./guides/payment-providers.md) - Setting up Stripe and Coinbase Commerce
- [Offerings Configuration Guide](./guides/offerings-configuration.md) - Customizing products and services
- [Email Templates Guide](./guides/email-templates.md) - Customizing email notifications

## 1. Environment Variables File (`.env.local`)

The primary way to configure your API keys and other secrets is through an environment variables file.

1.  **Find the Example:** Locate the `.env.example` file in the root of the project.
2.  **Create Your Local File:** Make a copy of `.env.example` and rename it to `.env.local`. This file is listed in `.gitignore`, so your sensitive keys won't be accidentally committed to version control.
    ```bash
    cp .env.example .env.local
    ```
3.  **Fill in Your Keys:** Open `.env.local` and replace the placeholder values with your actual keys. See the [Environment Variables Guide](./guides/environment-variables.md) for details on all required and optional keys.

    **Important:**
    *   Keys starting with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_FIREBASE_...`) will be available in the browser (client-side).
    *   Keys *without* the `NEXT_PUBLIC_` prefix are **server-side only** for security. This includes:
        *   `STRIPE_SECRET_KEY`
        *   `STRIPE_WEBHOOK_SECRET`
        *   `COINBASE_COMMERCE_API_KEY` (if used)
        *   `COINBASE_COMMERCE_WEBHOOK_SECRET` (if used)
        *   `FIREBASE_SERVICE_ACCOUNT_JSON` (See Section 2 below - **CRITICAL for security**)

## 2. Firebase Admin SDK Setup (CRITICAL for Security)

This template uses the **Firebase Admin SDK** within Next.js API Routes (`/src/app/api/...`) to securely handle sensitive Firestore database operations triggered by payment provider webhooks (Stripe, Coinbase).

**Why is this necessary?**
Directly writing payment, order, or customer data from the client-side (browser) is insecure. Using the Admin SDK on the server:
*   Bypasses Firestore security rules, allowing controlled writes from a trusted environment.
*   Prevents malicious users from manipulating critical financial data.
*   Ensures data integrity.

To enable the Admin SDK, you need a **Service Account Key**:

1.  **Go to Google Cloud Console:** Navigate to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) for your Firebase project.
2.  **Select or Create Service Account:**
    *   Use an existing relevant account (often ends in `@appspot.gserviceaccount.com`) OR
    *   Click **+ CREATE SERVICE ACCOUNT**. Name it (e.g., `payment-hub-backend`), click **CREATE AND CONTINUE**.
    *   **Grant Role:** Assign the **`Cloud Datastore User`** role (this allows Firestore access). Click **CONTINUE**, then **DONE**.
3.  **Generate Key:**
    *   Click on the email address of your chosen service account.
    *   Go to the **KEYS** tab.
    *   Click **ADD KEY** > **Create new key**.
    *   Select **JSON** as the key type and click **CREATE**.
    *   A JSON file will download. **Treat this file like a password!**
4.  **Configure Environment Variable:**
    *   Open the downloaded JSON file.
    *   **Copy the ENTIRE content** of the file.
    *   Open your `.env.local` file.
    *   Add the following line, pasting the **complete JSON content** as the value (using single quotes around the JSON is recommended):
        ```dotenv
        FIREBASE_SERVICE_ACCOUNT_JSON='{
          "type": "service_account",
          "project_id": "your-project-id",
          "private_key_id": "...",
          "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
          "client_email": "...",
          "client_id": "...",
          # ... other fields ...
        }'
        ```
    *   **Important:** Ensure the JSON is pasted exactly, including newlines (`\n`) within the private key.
5.  **Verify `.gitignore`:** Ensure `.env.local` is listed in your `.gitignore` file to prevent accidentally committing this secret key.
6.  **(Optional but Recommended):** Delete the original downloaded JSON key file from your computer.

For more detailed Firebase setup instructions, see the [Firebase Setup Guide](./guides/firebase-setup.md).

## 3. Server-Side Keys & `next.config.mjs`

Some server-side environment variables *might* need to be exposed during the Next.js build process, especially if used directly in Server Components or certain API route configurations outside of runtime functions.

*   **Public Keys:** `NEXT_PUBLIC_` variables are handled automatically.
*   **Server-Side Keys:**
    *   **`FIREBASE_SERVICE_ACCOUNT_JSON`**: This variable is read **at runtime** by the Admin SDK initializer (`src/lib/firebase-admin.ts`) using `process.env.FIREBASE_SERVICE_ACCOUNT_JSON`. It **does NOT need** to be added to the `env` block in `next.config.mjs`.
    *   **Other Server Keys (Stripe/Coinbase Secrets):** If you were to use `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc., directly within the body of Server Components or require them during the build phase, you *would* need to list them in `next.config.mjs` as shown in the example below. However, in this template, these are typically read at runtime within the API routes, so adding them to `next.config.mjs` may not be strictly necessary unless your specific usage changes.

**Example (Only if needed for build-time access):**
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations ...
  env: {
    // Only list server keys needed during build/render
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY, 
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    // FIREBASE_SERVICE_ACCOUNT_JSON is NOT needed here
  },
};
export default nextConfig;
```

## 4. Firebase Setup

### 4.1 Database Structure

The template uses Firebase Firestore. The basic collection structure includes:

*   `customers`
*   `orders` (with `items` subcollection)
*   `payments`
*   `webhookEvents` (Tracks incoming webhooks)
*   `quoteRequests`
*   `quotes` (with `items` subcollection)
*   `adminUsers`
*   `siteSettings` (with `links` subcollection for footer links)

For detailed schema information, see the [Firebase Setup Guide](./guides/firebase-setup.md).

### 4.2 Security Rules

**This template uses secure Firestore rules (`firebase.rules`) that are essential for protecting your data.**

*   **Default Deny:** Access is denied by default.
*   **Admin SDK Writes:** Writes to sensitive collections like `payments`, `orders`, `customers` (created via webhooks), and `webhookEvents` are **blocked** for client-side applications. These writes are handled **securely** by the Firebase Admin SDK running on the server within the API routes.
*   **Client Access:** Rules explicitly grant necessary read access (e.g., for public site settings) or limited write access (e.g., logged-in users creating quote requests).

**Action Required:** You **must** deploy these rules to your Firebase project before going to production:
```bash
firebase deploy --only firestore:rules
```
Review the `firebase.rules` file to understand the specific permissions.

## 5. Restart Your Server

After modifying `.env.local`, you **must restart** your development server for the changes to take effect:
```bash
npm run dev
# or yarn dev or pnpm dev
```

## 6. Admin Features

The template includes several admin features that require proper setup:

### 6.1 Admin Authentication

1. Create admin users in Firebase Authentication
2. Add corresponding documents in the `adminUsers` collection with appropriate roles (admin/viewer)
3. Use the admin login page to access the admin dashboard

See the [Firebase Setup Guide](./guides/firebase-setup.md) for detailed instructions on setting up admin users.

### 6.2 Social Links Management

Social links are managed through the admin dashboard in the Appearance section. These links appear in the site footer and are categorized as:
- Social media links (e.g., Twitter, GitHub)
- Business links (e.g., portfolio, company website)
- Other links (e.g., blog, documentation)

## 7. Important Notes

*   **Restart Server:** Remember to restart your development server (`npm run dev`) after making any changes to `.env.local`.
*   **Security Rules:** The Firestore security rules in `firebase.rules` are **critical** for security. Deploy them before production and understand they restrict client-side writes to sensitive data, relying on the server-side Admin SDK.
*   **Service Account Key Security:** Treat your `FIREBASE_SERVICE_ACCOUNT_JSON` value as highly sensitive. Do not commit it to Git or share it publicly.
*   **Coinbase Vulnerabilities:** The `coinbase-commerce-node` package currently used for Coinbase Commerce integration has known security vulnerabilities reported by `npm audit` in its dependencies (`lodash`, `request`, `tough-cookie`). While these may pose a low risk for typical use cases, users should be aware and consider the implications or look for alternative libraries if concerned.
*   **Client Components:** Components using React hooks (like `useState`) must include the `"use client"` directive at the top of the file.

## 8. Optional Email Confirmation Setup (Resend)

The template includes built-in support for sending automated email confirmations to customers after successful payments via either Stripe or Coinbase Commerce. This feature uses [Resend](https://resend.com), a developer-friendly email API service.

### 8.1 Why Email Confirmations?

Email confirmations provide several benefits for you and your customers:
- Customers receive a permanent record of their purchase
- Enhances trust and professionalism of your service
- Provides payment details, receipts, and any necessary follow-up information
- Especially important for crypto payments, where confirmation may not be immediate

### 8.2 Setup Steps

1. **Sign up for Resend:**
   - Visit [Resend](https://resend.com/) and create an account.
   - It offers a free tier (3,000 emails/month) which is sufficient for most small to medium-sized implementations.

2. **Get your API Key:**
   - In your Resend dashboard, navigate to the API Keys section.
   - Generate a new API Key.
   - Copy the key (starts with `re_`).

3. **Add to Environment Variables:**
   - Open your `.env.local` file.
   - Add the following line:
     ```
     RESEND_API_KEY=re_your_api_key_here
     ```

4. **Domain Verification (Important for Production):**
   - For testing, you can use Resend's sandbox mode with `onboarding@resend.dev` as the sender.
   - For production, you **must** verify your domain:
     - In Resend dashboard, go to Domains section.
     - Add and verify your domain by adding the required DNS records.
     - This step is crucial for good email deliverability - without it, emails may go to spam folders or be rejected.
   - See [Resend's Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction) for detailed instructions.

5. **Configure Sender Email (Production):**
   - Once your domain is verified, update your code in `src/lib/email.ts` to use your verified domain:
     ```typescript
     // Change this line:
     const fromAddress = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
     ```
   - Alternatively, add `RESEND_FROM_EMAIL` to your environment variables:
     ```
     RESEND_FROM_EMAIL=orders@your-verified-domain.com
     ```

### 8.3 How It Works

With Resend configured, the template will:
1. Automatically detect successful payments in the Stripe and Coinbase webhook handlers.
2. Gather customer email, payment details, and transaction information.
3. Send a professionally formatted confirmation email using the design in `src/emails/PaymentConfirmation.tsx`.

If the `RESEND_API_KEY` is not provided, email confirmation is simply skipped without affecting payment processing.

### 8.4 Customizing Email Templates

You can modify the email templates to match your branding and messaging needs. For detailed instructions, see the [Email Templates Guide](./guides/email-templates.md).

## Next Steps

After completing the basic setup:

1. **Customize Your Offerings** - Edit the products and services in [Offerings Configuration](./guides/offerings-configuration.md)
2. **Configure Payment Providers** - Set up [Stripe and/or Coinbase Commerce](./guides/payment-providers.md)
3. **Customize Email Templates** - Modify the [Email Templates](./guides/email-templates.md) to match your brand
4. **Test Your Payment Flow** - Make test purchases to verify everything works
5. **Deploy to Production** - When ready, deploy your Payment Hub to a production environment

By following these steps, you can securely configure and customize the template for your specific needs. 