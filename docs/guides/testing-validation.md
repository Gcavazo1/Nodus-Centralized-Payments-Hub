# Testing & Validation Guide

This guide provides a comprehensive approach to testing your Payment Hub implementation to ensure it's working correctly before going live.

## Overview

Thorough testing is essential for a payment system to ensure:

1. Payments are processed correctly
2. Order information is stored accurately
3. Customers receive appropriate confirmations
4. Error cases are handled gracefully
5. Security measures are functioning properly

## Test Environment Setup

### Development Environment

Before testing, ensure your development environment is properly configured:

1. **Environment Variables**: Verify all environment variables are set in `.env.local`
2. **Firebase Configuration**: Confirm Firebase is properly set up with security rules deployed
3. **Payment Providers**: Ensure Stripe and/or Coinbase Commerce test accounts are configured
4. **Email Service**: Verify Resend API is configured (if using email confirmations)

### Test Mode for Payment Providers

Always use test mode when testing:

- **Stripe**: Use test API keys that start with `pk_test_` and `sk_test_`
- **Coinbase Commerce**: Coinbase provides a test mode in their checkout interface

## Test Plan

Follow this structured testing approach to validate all aspects of your Payment Hub:

### 1. Basic Functionality Tests

#### Product Display

- Verify all products and services appear correctly on the home page
- Confirm product details (title, description, price) match your configuration
- Test responsive behavior on different screen sizes
- Validate images load correctly

#### Navigation

- Test all navigation links
- Ensure the cart functionality works (if applicable)
- Verify quote request forms are accessible

### 2. Payment Process Testing

#### Stripe Payments

1. **Setup for Testing**:
   - Use Stripe test card numbers: `4242 4242 4242 4242` (successful payment)
   - Set a future expiration date, any 3-digit CVC, and any ZIP code

2. **Test Procedure**:
   - Select a product with Stripe enabled as a payment method
   - Fill out the customer information form
   - Select the Stripe payment option
   - Complete the checkout using test card details
   - Verify you're redirected to the success page

3. **Validation Checks**:
   - Check Stripe Dashboard for the test payment
   - Verify the order is recorded in Firestore (`orders` collection)
   - Confirm payment record exists in Firestore (`payments` collection)
   - Verify customer information is stored correctly (`customers` collection)
   - Check that confirmation email was sent (if configured)

#### Coinbase Commerce Payments

1. **Setup for Testing**:
   - Ensure your Coinbase Commerce account is in test mode

2. **Test Procedure**:
   - Select a product with Coinbase enabled as a payment method
   - Fill out the customer information form
   - Select the cryptocurrency payment option
   - In the Coinbase checkout window, use the test completion option
   - Verify you're redirected to the success page

3. **Validation Checks**:
   - Check Coinbase Commerce Dashboard for the test charge
   - Verify the order is recorded in Firestore
   - Confirm payment record exists in Firestore
   - Verify customer information is stored correctly
   - Check that confirmation email was sent (if configured)

#### Quote Request Form

1. **Test Procedure**:
   - Navigate to the quote request page
   - Fill out all fields in the form
   - Submit the form
   - Verify the success message appears

2. **Validation Checks**:
   - Confirm the quote request is stored in Firestore (`quoteRequests` collection)
   - Verify the acknowledgement email was sent (if configured)

### 3. Webhook Testing

#### Stripe Webhook Testing

1. **Setup**:
   - Configure Stripe CLI for webhook forwarding (see [Webhook Configuration Guide](./webhook-configuration.md))

2. **Test Procedure**:
   - Trigger a test webhook event:
     ```bash
     stripe trigger checkout.session.completed
     ```
   - Monitor server logs for webhook processing

3. **Validation Checks**:
   - Verify the webhook event is recorded in Firestore (`webhookEvents` collection)
   - Confirm that relevant data is updated based on the event
   - Check for any errors in the logs

#### Coinbase Commerce Webhook Testing

1. **Setup**:
   - Configure ngrok or similar tool for webhook forwarding (see [Webhook Configuration Guide](./webhook-configuration.md))

2. **Test Procedure**:
   - Create a test charge through your application
   - Complete the payment in the Coinbase Commerce checkout
   - Monitor server logs for webhook processing

3. **Validation Checks**:
   - Verify the webhook event is recorded in Firestore
   - Confirm that order status is updated correctly
   - Check for any errors in the logs

### 4. Error Handling Tests

Testing how your application handles errors is as important as testing the happy path.

#### Failed Payments

1. **Stripe Failed Payment**:
   - Use test card number `4000 0000 0000 0002` (fails with generic decline)
   - Attempt to complete a payment
   - Verify the error is handled gracefully with an appropriate message
   - Check that no order is created for failed payments

2. **Coinbase Abandoned Payment**:
   - Start a Coinbase payment but close the window without completing
   - Verify the system handles the abandonment gracefully
   - Confirm no permanent order record is created (or is marked as abandoned)

#### Form Validation

1. **Customer Information Form**:
   - Try submitting with empty required fields
   - Enter invalid email formats
   - Enter extremely long text in fields
   - Verify all validation errors are shown appropriately

2. **Quote Request Form**:
   - Test all validation rules on the form
   - Try submitting with minimal required fields
   - Try submitting with all optional fields

#### API Error Handling

1. **Missing API Keys**:
   - Temporarily remove an API key from your environment variables
   - Attempt a payment that requires that API
   - Verify your application handles the error gracefully
   - Restore the API key when done

2. **Network Issues**:
   - Use browser developer tools to simulate offline status
   - Attempt to submit a form or make a payment
   - Verify appropriate error messages are shown

### 5. Security Testing

#### CSRF Protection

Next.js includes CSRF protection by default, but verify it's working:

1. Attempt to submit forms from an external origin (can be simulated with tools like Postman)
2. Verify the request is rejected

#### Data Validation

1. **Input Sanitization**:
   - Attempt to submit forms with potential XSS payloads (`<script>alert('xss')</script>`)
   - Verify the input is properly sanitized or escaped when displayed

2. **API Request Validation**:
   - Use tools like Postman to send malformed requests to your API endpoints
   - Verify they're properly validated and rejected

#### Firebase Security Rules

1. **Authentication Rules**:
   - Attempt to read or write data that should be protected when not authenticated
   - Verify access is denied as expected

2. **Data Access Rules**:
   - Authenticate as a regular user and attempt to access admin-only data
   - Verify access is denied as expected

### 6. Admin Features Testing

#### Admin Authentication

1. **Login Process**:
   - Test admin login with valid credentials
   - Test with invalid credentials
   - Verify proper error messages

2. **Admin Access Control**:
   - Test access with different admin roles
   - Verify role-based permissions are enforced

#### Admin Dashboard

1. **Order Management**:
   - Verify orders are displayed correctly
   - Test any order status update functionality
   - Confirm order details are accurate

2. **Quote Request Management**:
   - Verify quote requests appear in the dashboard
   - Test the quote response functionality (if implemented)

3. **Settings Management**:
   - Test updating site settings
   - Verify changes are reflected in the site

### 7. Performance Testing

#### Load Time Testing

1. **Initial Load**:
   - Measure the time for the initial page load
   - Use browser developer tools to identify any bottlenecks

2. **Checkout Flow**:
   - Time the entire checkout process
   - Identify any slow steps

#### Concurrent Users

For production readiness, consider testing with simulated concurrent users:

1. Use tools like [Artillery](https://artillery.io/) or [k6](https://k6.io/) to simulate multiple users
2. Focus on critical paths like checkout and payment processing
3. Monitor server performance during the test

### 8. Email Delivery Testing

#### Confirmation Emails

1. **Payment Confirmation**:
   - Complete a test payment
   - Verify the confirmation email is received
   - Check that all details in the email are correct

2. **Quote Acknowledgement**:
   - Submit a quote request
   - Verify the acknowledgement email is received
   - Check that all details in the email are correct

#### Email Content and Formatting

1. **Email Appearance**:
   - Verify emails display correctly on different email clients
   - Test on mobile email apps
   - Check that all links in emails work correctly

## Test Tracking Worksheet

Use the following checklist to track your testing progress:

```markdown
# Payment Hub Testing Checklist

## Basic Functionality
- [ ] Products display correctly
- [ ] Navigation works properly
- [ ] Responsive design checks

## Stripe Payments
- [ ] Successful payment with test card
- [ ] Order recorded in database
- [ ] Payment recorded in database
- [ ] Customer info stored correctly
- [ ] Confirmation email sent

## Coinbase Commerce Payments
- [ ] Successful payment in test mode
- [ ] Order recorded in database
- [ ] Payment recorded in database
- [ ] Customer info stored correctly
- [ ] Confirmation email sent

## Quote Requests
- [ ] Form submits successfully
- [ ] Request stored in database
- [ ] Acknowledgement email sent

## Webhooks
- [ ] Stripe webhooks process correctly
- [ ] Coinbase webhooks process correctly
- [ ] Events recorded in database

## Error Handling
- [ ] Failed payments handled gracefully
- [ ] Form validation works properly
- [ ] API errors handled appropriately

## Security
- [ ] CSRF protection verified
- [ ] Input sanitization checked
- [ ] Firebase security rules enforced

## Admin Features
- [ ] Admin authentication works
- [ ] Order management functions properly
- [ ] Quote management functions properly
- [ ] Settings can be updated

## Performance
- [ ] Page load times acceptable
- [ ] Checkout process performs well

## Emails
- [ ] Payment confirmation emails delivered
- [ ] Quote acknowledgement emails delivered
- [ ] Email formatting is correct
```

## Troubleshooting Common Test Issues

### Payment Processing Issues

1. **Stripe Payments Not Processing**:
   - Check Stripe API keys in environment variables
   - Verify webhook configuration
   - Look for errors in server logs and Stripe Dashboard

2. **Coinbase Payments Not Completing**:
   - Verify API keys and webhook configuration
   - Check Coinbase Commerce Dashboard for events
   - Confirm webhook endpoint is accessible

### Database Issues

1. **Data Not Being Stored**:
   - Check Firebase credentials
   - Verify security rules allow the writes
   - Look for database connection errors in logs

2. **Permission Denied Errors**:
   - Review Firebase security rules
   - Verify service account has proper permissions
   - Check if using Admin SDK for operations that require it

### Email Delivery Issues

1. **Emails Not Sending**:
   - Verify Resend API key is correct
   - Check server logs for email sending errors
   - Confirm email templates are correctly formatted

2. **Emails Going to Spam**:
   - Verify domain is properly set up in Resend
   - Check for spam trigger words in email content
   - Test with different email providers

## Pre-Production Checklist

Before going live with your Payment Hub, perform these final checks:

1. **Environment Variables**:
   - Switch to production API keys for all services
   - Remove any test-only configuration

2. **Security Verification**:
   - Ensure all API keys are kept secret
   - Verify Firebase security rules are appropriate for production
   - Confirm HTTPS is enforced for all URLs

3. **Email Configuration**:
   - Verify domain is properly set up for email deliverability
   - Test emails from production environment
   - Update any test email addresses in templates

4. **Payment Provider Production Setup**:
   - Complete Stripe account verification if required
   - Set up production webhooks with proper event subscriptions
   - Configure Coinbase Commerce production settings

5. **Backup Strategy**:
   - Ensure Firestore database backup is configured
   - Document recovery procedures

## Monitoring and Ongoing Testing

After deployment, implement monitoring to catch issues quickly:

1. **Error Tracking**:
   - Set up error logging and notifications
   - Regularly review server logs

2. **Transaction Monitoring**:
   - Reconcile orders with payment provider transactions
   - Set up alerts for payment failures

3. **Regular Testing**:
   - Perform periodic test purchases
   - Update testing procedures as you add features

## Next Steps

After completing your testing:

1. Go through the [Deployment Guide](./deployment.md) to prepare for production
2. Set up monitoring and alerting for your live system
3. Consider implementing A/B testing to optimize conversion rates 