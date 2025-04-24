# Deployment Guide

This guide walks you through the process of deploying your Payment Hub to a production environment.

## Overview

Deploying a payment application requires careful planning to ensure security, reliability, and performance. This guide covers:

1. Preparing your application for production
2. Setting up production environments
3. Deploying to various hosting platforms
4. Post-deployment verification

## Pre-Deployment Checklist

Before deploying, ensure you've completed these critical steps:

### 1. Environment Variables

- [ ] Replace all test API keys with production keys
- [ ] Generate new secure secrets for production
- [ ] Verify all environment variables are documented

### 2. Security Checks

- [ ] Deploy Firebase security rules to production
- [ ] Ensure all sensitive API keys are server-side only
- [ ] Verify HTTPS is enforced for all URLs
- [ ] Complete Stripe account verification (if applicable)
- [ ] Set up production webhook endpoints with proper signatures

### 3. Configuration Updates

- [ ] Update email templates with production domain
- [ ] Configure production URLs in payment callbacks
- [ ] Update site config with production settings
- [ ] Configure proper error logging

### 4. Testing

- [ ] Complete all tests in the [Testing & Validation Guide](./testing-validation.md)
- [ ] Perform a security review
- [ ] Test with production configurations (using test mode)
- [ ] Validate email deliverability from production domain

## Deployment Options

The Payment Hub template can be deployed to various hosting platforms. Below are instructions for the most common options.

### Option 1: Vercel (Recommended)

[Vercel](https://vercel.com) is the recommended platform for Next.js applications like the Payment Hub.

#### Step 1: Prepare Your Repository

1. Ensure your project is in a Git repository (GitHub, GitLab, or Bitbucket)
2. Remove any sensitive information from the repository
3. Commit all your changes to the main branch

#### Step 2: Set Up Vercel

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install the Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

#### Step 3: Deploy to Vercel

**Option A: Deploy via Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add all required environment variables
   - Configure your custom domain (if available)
4. Click "Deploy"

**Option B: Deploy via Vercel CLI**

1. Run the deploy command:
   ```bash
   vercel
   ```
2. Answer the prompts
3. When asked, add your environment variables
4. For subsequent deploys, use:
   ```bash
   vercel --prod
   ```

#### Step 4: Configure Vercel Environment Variables

1. Go to your project in the Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add all required environment variables from your `.env.local` file:
   - Firebase configuration
   - Stripe API keys (production keys)
   - Coinbase Commerce keys (production keys)
   - Resend API key
   - Firebase service account JSON (use single quotes around the JSON)
   - App URL (`NEXT_PUBLIC_APP_URL`)
4. Ensure you've set separate environment variables for Preview and Production environments if needed

#### Step 5: Set Up Custom Domain

1. In the Vercel Dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your custom domain
4. Configure DNS settings as instructed by Vercel

### Option 2: Firebase Hosting

Firebase Hosting is another excellent option, especially since the Payment Hub already uses Firebase services.

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Initialize Firebase Hosting

```bash
firebase login
firebase init hosting
```

When prompted:
- Select your Firebase project
- Specify `out` as your public directory
- Configure as a single-page app
- Set up GitHub Action deployments (optional)

#### Step 3: Update next.config.js

Add the output configuration for static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations
  output: 'export',
};
export default nextConfig;
```

#### Step 4: Build Your Application

```bash
npm run build
```

#### Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

#### Step 6: Set Up Cloud Functions (for API Routes)

Since static exports don't support API routes, you'll need to migrate your API routes to Firebase Cloud Functions:

1. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```

2. Move your API logic from `/app/api/*` to Firebase Functions
3. Update frontend code to call the new function URLs

### Option 3: Traditional Node.js Hosting

You can also deploy your Payment Hub to any platform that supports Node.js applications.

#### Step 1: Build Your Application

```bash
npm run build
```

#### Step 2: Start the Server

```bash
npm start
```

#### Step 3: Deploy to Your Chosen Platform

Follow the deployment instructions for your chosen hosting platform:

- **Digital Ocean**: Deploy using App Platform or Droplets
- **AWS**: Deploy to Elastic Beanstalk, EC2, or ECS
- **GCP**: Deploy to App Engine or Compute Engine
- **Heroku**: Deploy using the Heroku CLI or GitHub integration

## Production Environment Configuration

### Setting Up Production Webhooks

#### Stripe Production Webhooks

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/) > Developers > Webhooks
2. Add a new endpoint with your production URL: `https://your-domain.com/api/stripe/webhook`
3. Select the necessary events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the signing secret and add it to your production environment variables

#### Coinbase Commerce Production Webhooks

1. Go to the [Coinbase Commerce Dashboard](https://commerce.coinbase.com/) > Settings > Webhooks
2. Add a new endpoint with your production URL: `https://your-domain.com/api/coinbase/webhook`
3. Save the endpoint and copy the webhook secret
4. Add the webhook secret to your production environment variables

### Database Configuration

#### Firestore Production Setup

1. Ensure your Firebase security rules are properly configured for production
2. Set up automated backups for your Firestore database:
   ```bash
   gcloud firestore export gs://your-backup-bucket
   ```
3. Consider setting up a scheduled backup using Cloud Scheduler

### Email Configuration

For production email delivery:

1. Verify your domain in Resend:
   - Go to the [Resend Dashboard](https://resend.com/domains)
   - Add your domain and verify it by adding the provided DNS records
2. Update the `RESEND_FROM_EMAIL` environment variable to use your verified domain
3. Send a test email to verify deliverability

## Post-Deployment Verification

After deploying, verify that everything is working correctly:

### 1. Functionality Verification

- [ ] Visit your production site and ensure all pages load correctly
- [ ] Test navigation and responsive design
- [ ] Verify images and assets are loading properly
- [ ] Check that site configuration is correct

### 2. Payment Processing Verification

- [ ] Make a test purchase using Stripe (in test mode)
- [ ] Make a test purchase using Coinbase Commerce (in test mode)
- [ ] Verify webhooks are being received and processed
- [ ] Confirm that order records are created in Firestore
- [ ] Check that confirmation emails are delivered

### 3. Admin Functionality Verification

- [ ] Test admin login
- [ ] Verify access to admin dashboard
- [ ] Check that order management works
- [ ] Test quote request management
- [ ] Verify settings can be updated

## Monitoring and Maintenance

### Setting Up Monitoring

1. **Error Tracking**:
   - Implement a service like [Sentry](https://sentry.io/) for error monitoring
   - Add the Sentry SDK to your Next.js application

2. **Performance Monitoring**:
   - Set up [Next.js Analytics](https://nextjs.org/analytics) if using Vercel
   - Implement [Google Analytics](https://analytics.google.com/) for user behavior tracking

3. **Server Monitoring**:
   - Set up [Uptime Robot](https://uptimerobot.com/) or similar service to monitor site availability
   - Configure alerts for downtime

### Regular Maintenance Tasks

1. **Security Updates**:
   - Regularly update dependencies:
     ```bash
     npm audit
     npm update
     ```
   - Review and update Firebase security rules as needed

2. **Backup Verification**:
   - Periodically verify that backups are working
   - Test the restoration process

3. **Performance Optimization**:
   - Monitor page load times
   - Optimize images and assets
   - Implement caching strategies

## Scaling Considerations

As your Payment Hub grows, consider these scaling strategies:

### 1. Database Scaling

- Implement caching for frequently accessed data
- Consider Firebase sharding for very large datasets
- Monitor Firestore usage and quotas

### 2. Performance Scaling

- Implement edge caching using Vercel Edge or Cloudflare
- Optimize API routes for performance
- Consider serverless functions for API endpoints

### 3. Geographic Expansion

- Set up Firestore in multi-region mode for global availability
- Configure CDN for static assets
- Consider regional deployments for reduced latency

## Troubleshooting Production Issues

### Common Deployment Issues

1. **Missing Environment Variables**:
   - Check that all required environment variables are set in your production environment
   - Verify format of complex variables (like JSON strings)

2. **Webhook Delivery Failures**:
   - Ensure your production domain is accessible
   - Verify webhook signatures and secrets
   - Check server logs for webhook processing errors

3. **Payment Processing Issues**:
   - Verify API keys are in production mode
   - Check that webhooks are properly configured
   - Ensure Stripe/Coinbase accounts are fully verified

### Rollback Procedure

If you encounter critical issues after deployment:

1. **Revert to Previous Version**:
   - In Vercel: Use the "Deployments" tab to revert to a previous version
   - In Firebase: Use `firebase hosting:clone` to restore a previous version

2. **Database Rollback**:
   - Restore from the most recent backup
   - Use Firebase exports to restore to a previous state

## Going Live

When you're ready to start accepting real payments:

1. **Switch to Live Mode**:
   - Ensure Stripe/Coinbase are in live mode
   - Update webhooks for live mode if needed
   - Configure proper tax settings in payment processors

2. **Compliance Checks**:
   - Ensure your Terms of Service and Privacy Policy are up-to-date
   - Verify compliance with relevant regulations (GDPR, CCPA, etc.)
   - Implement necessary cookie consent mechanisms

3. **Final Verification**:
   - Make a small real payment to verify the entire flow
   - Check that the funds are properly received
   - Verify the complete customer experience

## Conclusion

Congratulations! Your Payment Hub should now be successfully deployed to production. By following this guide, you've set up a secure, reliable payment processing system that's ready to accept real payments.

For ongoing support, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Coinbase Commerce Documentation](https://commerce.coinbase.com/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs) 