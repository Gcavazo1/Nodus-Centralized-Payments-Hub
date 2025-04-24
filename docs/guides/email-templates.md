# Email Templates Customization Guide

This guide explains how to customize the email templates used in your Payment Hub.

## Overview

The Payment Hub sends two types of emails to your customers:

1. **Payment Confirmation Emails** - Sent after successful payments
2. **Quote Acknowledgement Emails** - Sent after quote form submissions

These emails help establish trust, confirm transactions, and set expectations for next steps. Both email templates can be customized to match your brand.

## Email Configuration Files

The email templates are located in:

- **Payment Confirmation**: `src/emails/PaymentConfirmation.tsx`
- **Quote Acknowledgement**: `src/lib/email.ts` (Inside the `generateQuoteAckHtml` function)

## Customizing Payment Confirmation Emails

The payment confirmation email uses React Email components for a modern, responsive design.

### Step 1: Edit the Template

Open `src/emails/PaymentConfirmation.tsx` in your code editor.

This file uses React components to build the email template. You can modify the following:

1. **Content**: Update text, headings, and formatting
2. **Structure**: Change the layout or add/remove sections
3. **Styling**: Adjust colors, fonts, spacing, etc.

### Step 2: Modify the Structure

```tsx
// Example of customizing the content
<Heading style={heading}>Your Payment Was Successful!</Heading>
<Text style={paragraph}>
  Hi {customerName || 'valued customer'},
</Text>
<Text style={paragraph}>
  Thank you for your purchase from {companyName}. We've received your payment of {formattedAmount}.
</Text>

// Add your company logo
<Section style={{ textAlign: 'center', marginBottom: '20px' }}>
  <img src="https://yourdomain.com/logo.png" width="150" height="50" alt={companyName} />
</Section>
```

### Step 3: Customize the Styling

At the bottom of the file, you'll find the style definitions. Modify these to match your brand:

```tsx
// Example style customization
const main = {
  backgroundColor: '#f6f9fc', // Change background color
  fontFamily: 'Arial, sans-serif', // Change font
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  marginBottom: '20px',
  textAlign: 'center' as const,
  color: '#4a154b', // Update to your brand color
};

// Add more custom styles as needed
const logo = {
  margin: '0 auto',
  marginBottom: '20px',
};
```

## Customizing Quote Acknowledgement Emails

The quote acknowledgement email uses HTML and CSS embedded in the `generateQuoteAckHtml` function.

### Step 1: Locate the Template Function

Open `src/lib/email.ts` and find the `generateQuoteAckHtml` function (around line 257).

### Step 2: Modify the HTML Template

Edit the HTML template string returned by the function:

```typescript
// Example: Customizing the quote acknowledgement template
return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Quote Request Received</title>
      <style>
        /* Customize your styles here */
        body { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f9f9f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          padding: 30px; 
          border: 1px solid #eee; 
          border-radius: 8px; 
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header img {
          max-width: 200px;
        }
        /* Add more custom styles as needed */
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Add your company logo -->
          <img src="https://yourdomain.com/logo.png" alt="${companyName}" />
          <h1>Quote Request Received</h1>
        </div>

        <p>Hi ${customerName},</p>

        <p>Thank you for reaching out! We've successfully received your quote request for <strong>${projectTypeDisplay}</strong> and will review it shortly.</p>

        <div class="summary">
          <h3>Request Summary:</h3>
          ${summaryHtml || '<p>Details provided in your submission.</p>'}
          <p><strong>Contact Email:</strong> [Your Email Address Was Recorded]</p>
        </div>

        <h3>Next Steps:</h3>
        <p>Our team will review your request and get back to you within 1-2 business days with a detailed proposal. We may reach out if we need any further clarification.</p>

        <p>In the meantime, feel free to browse our portfolio or learn more about our services:</p>
        <ul>
          <li><a href="https://yourdomain.com/portfolio" style="color: #0066cc;">View Our Portfolio</a></li>
          <li><a href="https://yourdomain.com/services" style="color: #0066cc;">Explore Our Services</a></li>
        </ul>

        <div class="footer">
          <p>If you have any immediate questions, please don't hesitate to contact us at <a href="mailto:${supportEmail}" style="color: #0066cc;">${supportEmail}</a>.</p>
          <p>Best regards,<br/>The ${companyName} Team</p>
        </div>
      </div>
    </body>
  </html>
`;
```

## Email Configuration Settings

### Setting Your Company Information

Update your site configuration in `src/config/site.ts` to ensure your correct company information appears in emails:

```typescript
export const siteConfig: SiteConfig = {
  name: "Your Company Name",       // Used in emails
  description: "Your company description",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com",
  ogImage: "/images/og-image.jpg",
  links: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourhandle",
    linkedin: "https://linkedin.com/in/yourhandle",
  },
  contact: {
    email: "support@your-domain.com", // Used as support email in templates
    phone: "+1 (123) 456-7890",
  },
  // Other settings...
};
```

### Configuring Email Sender

Set your sender email address in `.env.local`:

```
RESEND_FROM_EMAIL=orders@your-verified-domain.com
```

## Email Delivery Configuration

Remember to configure [Resend](https://resend.com) as described in the main SETUP.md guide:

1. Sign up for a Resend account
2. Add your API key to the `.env.local` file
3. Verify your domain for better email deliverability

## Testing Your Email Templates

To test your email templates:

1. Make your changes to the template files
2. Restart the development server (`npm run dev`)
3. Trigger emails by:
   - Making a test purchase (for payment confirmation)
   - Submitting a quote request (for quote acknowledgement)

## Troubleshooting

- **Emails not sending**: Check your Resend API key in `.env.local`
- **Styling issues**: Email clients have varying support for CSS. Keep styling simple and inline
- **Images not displaying**: Use absolute URLs for all images (https://yourdomain.com/image.jpg)
- **Changes not reflecting**: Ensure you've restarted the server after making changes

## Advanced Customization

For more advanced email template customization:

1. **React Email Components**: Learn more about the available components at [React Email](https://react.email/docs/components/html)
2. **Email Client Testing**: Test your emails across different email clients using [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/)
3. **Additional Templates**: To add new email templates, create new files in the `src/emails/` directory 