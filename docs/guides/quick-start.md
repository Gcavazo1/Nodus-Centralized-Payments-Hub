# Quick Start Guide

This guide provides a condensed setup process for experienced developers who want to get the Payment Hub up and running quickly.

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account
- (Optional) Stripe and/or Coinbase Commerce accounts

## 1. Clone & Install

```bash
# Clone repository (replace with your actual repository)
git clone https://github.com/yourusername/payment-hub.git
cd payment-hub

# Install dependencies
npm install
# or
yarn install
```

## 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (service account JSON inside single quotes)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... entire JSON ... }'

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Coinbase (optional)
NEXT_PUBLIC_COINBASE_COMMERCE_KEY=your_coinbase_key
COINBASE_COMMERCE_API_KEY=your_coinbase_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret

# Resend Email (optional)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@your-domain.com
```

## 3. Firebase Setup

### Firestore Database

1. Create a new Firebase project
2. Enable Firestore Database in production mode
3. Create a service account for Admin SDK:
   - Go to Google Cloud Console > IAM & Admin > Service Accounts
   - Create service account with Cloud Datastore User role
   - Generate JSON key and add to .env.local as shown above

### Deploy Security Rules

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Create Admin User

```bash
# Create first admin user
node create-admin-user.js admin@yourdomain.com "Admin Name" admin
```

## 4. Payment Provider Setup

### Stripe Setup (Optional)

1. Create account at stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhook:
   - Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### Coinbase Commerce Setup (Optional)

1. Create account at commerce.coinbase.com
2. Get API key from Settings > API keys
3. Set up webhook:
   - Endpoint: `https://your-domain.com/api/coinbase/webhook`
   - Copy webhook secret to .env.local

## 5. Customize Your Offerings

Edit `src/config/offerings.ts` to set your products and services.

## 6. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Your Payment Hub will be running at [http://localhost:3000](http://localhost:3000)

## 7. Access Admin Panel

Visit [http://localhost:3000/admin](http://localhost:3000/admin) and login with the admin user you created.

## 8. Test Payments

- **Stripe Test Card**: 4242 4242 4242 4242, any future date, any CVC, any ZIP
- **Coinbase Commerce**: Use the test mode in the hosted checkout

## 9. Production Deployment

1. Update your production environment variables
2. Build and deploy:
   ```bash
   npm run build
   # Deploy to your hosting service of choice
   ```

## What's Next?

- [Complete Setup Guide](../SETUP.md) - More detailed setup instructions
- [Firebase Setup Guide](./firebase-setup.md) - Detailed Firebase configuration
- [Payment Providers Guide](./payment-providers.md) - In-depth payment setup
- [Email Templates Guide](./email-templates.md) - Customize your email notifications
- [Offerings Configuration Guide](./offerings-configuration.md) - Configure your products/services 