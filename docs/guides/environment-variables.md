# Environment Variables Guide

This guide explains all the environment variables used in the Payment Hub template, their purpose, and how to configure them properly.

## Overview

Environment variables are used to store sensitive information like API keys, database credentials, and other configuration settings that shouldn't be committed to your code repository. The Payment Hub template uses environment variables for:

1. API keys for payment processors (Stripe, Coinbase)
2. Firebase configuration
3. Email service configuration
4. Site URL and other deployment-specific settings

## Setting Up Environment Variables

### Step 1: Create Your Environment File

1. Locate the `.env.example` file in the root directory of the project
2. Create a copy named `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` to add your specific configuration values

### Step 2: Required Environment Variables

Below is a comprehensive list of all environment variables used in the Payment Hub template:

## Core Configuration

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of your application | Yes | `https://your-domain.com` |

## Firebase Configuration

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Yes | `AIzaSyC1a2b3c4d5e6f7g8h9i0jKlM` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes | `your-project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes | `1:123456789012:web:a1b2c3d4e5f6g7h8` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK credentials | Yes | `{'type': 'service_account', ...}` |

## Stripe Configuration

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key (client-side) | Yes, if using Stripe | `pk_test_a1b2c3d4e5f6g7h8i9j0` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (server-side) | Yes, if using Stripe | `sk_test_a1b2c3d4e5f6g7h8i9j0` |
| `STRIPE_WEBHOOK_SECRET` | Secret for validating Stripe webhook signatures | Yes, if using Stripe | `whsec_a1b2c3d4e5f6g7h8i9j0` |

## Coinbase Commerce Configuration

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_COINBASE_COMMERCE_KEY` | Coinbase API Key (client-side) | Yes, if using Coinbase | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |
| `COINBASE_COMMERCE_API_KEY` | Coinbase API Key (server-side) | Yes, if using Coinbase | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Secret for validating Coinbase webhook signatures | Yes, if using Coinbase | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

## Email Configuration (Resend)

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `RESEND_API_KEY` | API key for Resend email service | No, but required for emails | `re_a1b2c3d4e5f6g7h8i9j0` |
| `RESEND_FROM_EMAIL` | Email address to send from | No, but recommended for production | `orders@your-domain.com` |

## Security Notes

### Client-Side vs. Server-Side Variables

- Variables prefixed with `NEXT_PUBLIC_` are embedded in the client-side JavaScript bundle and are **visible to users**
- Use `NEXT_PUBLIC_` prefix only for variables that are safe to be public
- Keep all sensitive API keys and secrets (like Stripe Secret Key) as server-side variables (without the `NEXT_PUBLIC_` prefix)

### Firebase Service Account Security

The `FIREBASE_SERVICE_ACCOUNT_JSON` variable contains your Firebase Admin SDK service account credentials, which grant significant access to your Firebase project. This is a particularly sensitive secret:

1. Never expose this value in client-side code
2. Ensure it's properly escaped in your `.env.local` file (use single quotes around the JSON string)
3. Verify that `.env.local` is listed in your `.gitignore` file
4. Do not share this value with others

## Example `.env.local` File

Here's an example of a complete `.env.local` file with all variables:

```
# Core Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1a2b3c4d5e6f7g8h9i0jKlM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8

# Firebase Admin SDK (Note the single quotes around the JSON)
FIREBASE_SERVICE_ACCOUNT_JSON='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAA...rest-of-your-private-key...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-a1b2c@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-a1b2c%40your-project-id.iam.gserviceaccount.com"
}'

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_a1b2c3d4e5f6g7h8i9j0
STRIPE_SECRET_KEY=sk_test_a1b2c3d4e5f6g7h8i9j0
STRIPE_WEBHOOK_SECRET=whsec_a1b2c3d4e5f6g7h8i9j0

# Coinbase Commerce Configuration
NEXT_PUBLIC_COINBASE_COMMERCE_KEY=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
COINBASE_COMMERCE_API_KEY=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
COINBASE_COMMERCE_WEBHOOK_SECRET=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6

# Email Configuration
RESEND_API_KEY=re_a1b2c3d4e5f6g7h8i9j0
RESEND_FROM_EMAIL=orders@your-domain.com
```

## Different Environments

For different environments (development, staging, production), you may want to create separate environment files:

- `.env.local` - For local development
- `.env.development` - For development deployments
- `.env.staging` - For staging deployments
- `.env.production` - For production deployments

## Environment Variables in Production

When deploying to production:

### Vercel

If deploying to Vercel, add all your environment variables in the Vercel dashboard:
1. Go to your project settings
2. Navigate to the "Environment Variables" section
3. Add each variable and value
4. Choose which environments (Production, Preview, Development) each variable applies to

### Other Hosting Providers

For other hosting providers, consult their documentation on how to set environment variables.

## Troubleshooting

- **Variables not available at runtime**: Restart your development server after changing `.env.local`
- **Changes not taking effect**: Ensure you're not using cached values; clear browser cache or restart the application
- **Firebase Admin SDK errors**: Check that the `FIREBASE_SERVICE_ACCOUNT_JSON` value is correctly formatted with escaped newlines
- **Client-side errors accessing server-only variables**: Ensure you're not trying to access non-NEXT_PUBLIC variables in client components

## Next Steps

After configuring your environment variables, proceed to set up:

1. Firebase project and security rules
2. Payment processor accounts (Stripe, Coinbase)
3. Email service (Resend) 