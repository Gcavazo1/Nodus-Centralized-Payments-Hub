# Firebase Setup Guide

This guide provides detailed instructions on setting up Firebase for your Payment Hub template.

## Overview

The Payment Hub template uses Firebase for several critical functions:

1. **Authentication** - For admin users
2. **Firestore Database** - To store orders, payments, customers, and settings
3. **Security Rules** - To protect sensitive data
4. **Firebase Admin SDK** - For secure server-side operations

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g., "payment-hub")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click **Create project**
6. Wait for the project to be provisioned

## Step 2: Register Your Web App

1. In your new Firebase project, click the web icon (`</>`) to add a web app
2. Enter a nickname for your app (e.g., "Payment Hub Web")
3. Check the box for "Also set up Firebase Hosting" if you plan to use it
4. Click **Register app**
5. You'll be shown your Firebase configuration. Copy these values for your `.env.local` file:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
6. Add these values to your `.env.local` file (see the [Environment Variables Guide](./environment-variables.md))

## Step 3: Set Up Firestore Database

1. In the Firebase Console, navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a data center location closest to your target audience
5. Click **Enable**

## Step 4: Set Up Required Collections

The Payment Hub uses several collections in Firestore. While collections are created automatically when data is first written, you should understand the data structure:

### Core Collections

- **`customers`** - Customer information
  - **Fields**: id, name, email, phone (optional), createdAt, updatedAt
  
- **`orders`** - Order information
  - **Fields**: id, customerId, status, amount, currency, paymentProvider, paymentId, createdAt, updatedAt
  - **Subcollection**: `items` (details of items in the order)
  
- **`payments`** - Payment transaction records
  - **Fields**: id, customerId, orderId, amount, currency, provider, status, providerPaymentId, metadata, createdAt, updatedAt
  
- **`webhookEvents`** - Record of incoming webhook events from payment providers
  - **Fields**: id, provider, eventType, payload, processed, createdAt

- **`quoteRequests`** - Customer quote requests
  - **Fields**: id, name, email, company, phone, projectType, description, budget, timeline, status, createdAt, updatedAt

- **`adminUsers`** - Admin user permissions
  - **Fields**: uid, email, role, name, createdAt, updatedAt

- **`siteSettings`** - Site configuration settings
  - **Fields**: id, name, value
  - **Subcollection**: `links` (footer and social links)

## Step 5: Create Firebase Admin SDK Service Account

For secure server-side operations, you need a Firebase Admin SDK service account:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **IAM & Admin > Service Accounts**
4. Click **Create Service Account**
5. Enter a name (e.g., "payment-hub-backend")
6. Add a description (e.g., "Service account for Payment Hub backend operations")
7. Click **Create and Continue**
8. In the "Grant this service account access to project" section, add the following roles:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Cloud Datastore User** (for Firestore access)
9. Click **Continue** and then **Done**
10. Find the new service account in the list and click on it
11. Go to the **Keys** tab
12. Click **Add Key > Create new key**
13. Select **JSON** format
14. Click **Create**

A JSON file will be downloaded to your computer. This file contains private credentials, so handle it securely:

1. Open the downloaded JSON file
2. Copy the entire content
3. Add it to your `.env.local` file as the `FIREBASE_SERVICE_ACCOUNT_JSON` value (see the [Environment Variables Guide](./environment-variables.md))
4. Delete the downloaded JSON file after adding it to your environment variables

## Step 6: Configure Firebase Security Rules

The Payment Hub includes pre-configured security rules in the `firebase.rules` file. These rules are essential for protecting your data. 

### Understanding the Security Rules

The security rules follow these general principles:

1. **Default deny**: Access is denied by default
2. **Admin SDK access**: Certain collections can only be written to by the server-side Admin SDK
3. **Public data**: Some data is publicly readable (e.g., site settings)
4. **User-specific access**: Quote requests can be created by anyone but only read by admins

### Deploying the Security Rules

To deploy the security rules:

1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project directory (if not already done):
   ```bash
   firebase init
   ```
   - Select Firestore (and any other services you want)
   - Choose your project
   - For Firestore Rules, use the default option

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 7: Set Up Firebase Authentication

The admin features of the Payment Hub require authentication:

1. In the Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable the **Email/Password** sign-in method
4. Go to the **Users** tab and click **Add user**
5. Enter the email and password for your admin user
6. Click **Add user**

## Step 8: Create Admin User in Firestore

After creating a user in Firebase Authentication, you need to add them to the `adminUsers` collection with appropriate permissions:

1. Go to **Firestore Database** in the Firebase Console
2. Create a new collection called `adminUsers`
3. Add a new document with the following fields:
   - **uid**: (string) The UID from Firebase Authentication
   - **email**: (string) The admin user's email
   - **role**: (string) Either "admin" or "viewer"
   - **name**: (string) The admin user's display name
   - **createdAt**: (timestamp) Current timestamp
   - **updatedAt**: (timestamp) Current timestamp

You can also use the provided helper script to create an admin user:

```bash
node create-admin-user.js your-email@example.com "Your Name" admin
```

## Step 9: Initialize Site Settings

For the Payment Hub to function properly, you need to initialize some site settings:

1. Go to **Firestore Database** in the Firebase Console
2. Create a collection called `siteSettings` if it doesn't exist
3. Add a document with ID `general` containing:
   - **enableStripe**: (boolean) `true` if you're using Stripe
   - **enableCoinbase**: (boolean) `true` if you're using Coinbase Commerce
   - **currencyCode**: (string) Your primary currency code (e.g., "USD")
   - **currencySymbol**: (string) Your currency symbol (e.g., "$")
   - **siteName**: (string) Your site name
   - **companyName**: (string) Your company name
   - **supportEmail**: (string) Your support email address
   - **privacyUrl**: (string) URL to your privacy policy
   - **termsUrl**: (string) URL to your terms of service

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK Initialization Error**
   - Check that your `FIREBASE_SERVICE_ACCOUNT_JSON` is correctly formatted in `.env.local`
   - Ensure the service account has the correct permissions

2. **Permission Denied Errors**
   - Verify that your security rules are deployed correctly
   - Check that you're using the Admin SDK for operations that require it

3. **Authentication Issues**
   - Ensure the user exists in both Firebase Authentication and the `adminUsers` collection
   - Verify the role is set correctly ("admin" or "viewer")

4. **Missing Collections**
   - Collections are created automatically when data is first written
   - You don't need to manually create collections except for initial setup of `adminUsers` and `siteSettings`

## Next Steps

After setting up Firebase, you should:

1. Configure your payment providers (Stripe, Coinbase)
2. Set up email notifications with Resend
3. Customize your product offerings
4. Test the complete payment flow

See the [Payment Providers Guide](./payment-providers.md) for details on setting up Stripe and Coinbase Commerce. 