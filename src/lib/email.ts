import { Resend } from 'resend';
// import { render } from '@react-email/render';

// Define the structure for payment confirmation details
export interface PaymentConfirmationDetails {
  to: string; // Customer email
  subject?: string;
  customerName?: string;
  amount: number;
  currency: string;
  provider: 'Stripe' | 'Coinbase';
  transactionId: string; // Stripe Session ID or Coinbase Charge Code
  transactionUrl?: string; // Optional link to Stripe receipt or block explorer
  items?: { name: string; quantity: number; price: number }[]; // Optional line items
  companyName?: string; // From site config or env
  supportEmail?: string; // From site config or env
}

// Define the structure for quote acknowledgement details
export interface QuoteAcknowledgementDetails {
  to: string;
  customerName?: string;
  projectType?: string;
  companyName?: string;
  supportEmail?: string;
  // Add new fields for the enhanced template
  description?: string;
  budget?: string;
  timeline?: string;
  phone?: string;
}

let resend: Resend | null = null;

// Initialize Resend client only if API key exists
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  // console.log('Resend client initialized.'); // Removed - not critical for production
} else {
  console.warn('RESEND_API_KEY not found. Email confirmations will be disabled.');
}

/**
 * Generates a simple HTML email template string
 */
function generateEmailHtml(details: Omit<PaymentConfirmationDetails, 'to' | 'subject'>): string {
  // Format the amount (assuming it's in cents)
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: details.currency.toUpperCase(),
  });
  const formattedAmount = formatter.format(details.amount / 100);
  
  // Build a simple but attractive email
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
          }
          .success-icon {
            display: block;
            width: 60px;
            height: 60px;
            margin: 0 auto 15px;
            background-color: #4caf50;
            border-radius: 50%;
            position: relative;
          }
          .success-icon:after {
            content: "";
            display: block;
            width: 30px;
            height: 15px;
            border-left: 5px solid #fff;
            border-bottom: 5px solid #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%) rotate(-45deg);
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin: 0;
          }
          .details {
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #555;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 12px;
          }
          a {
            color: #2196f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon"></div>
            <h1>Payment Successful!</h1>
          </div>
          
          <p>Hi ${details.customerName || 'there'},</p>
          
          <p>Thank you for your purchase from ${details.companyName || 'Your Company'}. We've successfully received your payment of ${formattedAmount}.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Payment Provider:</span>
              <span>${details.provider}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span>${details.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span>${formattedAmount}</span>
            </div>
            ${details.transactionUrl ? 
              `<div class="detail-row">
                <span class="detail-label">View Transaction:</span>
                <span><a href="${details.transactionUrl}" target="_blank">View Details</a></span>
              </div>` : ''}
          </div>
          
          ${details.items && details.items.length > 0 ? 
            `<div class="order-summary">
              <h2>Order Summary</h2>
              ${details.items.map(item => 
                `<div class="detail-row">
                  <span>${item.name} (x${item.quantity})</span>
                  <span>${formatter.format(item.price / 100)}</span>
                </div>`
              ).join('')}
              <div class="total">
                Total: ${formattedAmount}
              </div>
            </div>` : ''}
          
          <div class="footer">
            <p>If you have any questions, please contact our support team at <a href="mailto:${details.supportEmail || 'support@example.com'}">${details.supportEmail || 'support@example.com'}</a>.</p>
            <p>© ${new Date().getFullYear()} ${details.companyName || 'Your Company'}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a payment confirmation email using Resend.
 * Only attempts to send if the Resend client was successfully initialized.
 * @param details - The payment confirmation details.
 */
export async function sendPaymentConfirmationEmail(
  details: PaymentConfirmationDetails
): Promise<void> {
  if (!resend) {
    console.log(
      'Skipping payment confirmation email: Resend client not initialized (API key likely missing).'
    );
    return;
  }

  const defaultSubject = `Payment Confirmation - Order ${details.transactionId}`;
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Use sandbox for testing if no specific FROM is set

  try {
    // Generate the HTML directly instead of using React Email components
    const emailHtml = generateEmailHtml(details);

    // Log the type for verification
    // console.log(`Generated email HTML type: ${typeof emailHtml}, length: ${emailHtml.length}`); // Removed
    
    // console.log(`Sending email from: ${fromAddress} to: ${details.to}`); // Removed

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: details.to,
      subject: details.subject || defaultSubject,
      html: emailHtml,
    });

    if (error) {
      console.error(`Resend API Error sending confirmation email to ${details.to}:`, JSON.stringify(error, null, 2));
      // Optionally: Add more robust error handling/logging here
      return;
    }

    // console.log(`Payment confirmation email sent successfully to ${details.to}. Email ID: ${data?.id}`); // Removed
  } catch (error) {
    console.error(`Failed to send payment confirmation email to ${details.to}:`, error);
    // Handle unexpected errors during sending or rendering
  }
}

/**
 * Generates the HTML for the quote acknowledgement email.
 */
function generateQuoteAckHtml(details: Omit<QuoteAcknowledgementDetails, 'to'>): string {
  // Use fallback values if details are not provided
  const customerName = details.customerName || 'there';
  const companyName = details.companyName || 'Our Team';
  const supportEmail = details.supportEmail || 'support@example.com'; // Fallback support email
  const projectTypeDisplay = details.projectType || 'General Inquiry';

  // Build the summary section dynamically, only including provided fields
  let summaryHtml = '';
  if (details.description) {
    summaryHtml += `<p><strong>Project/Inquiry Description:</strong><br/>${details.description}</p>`;
  }
  if (details.projectType) {
    summaryHtml += `<p><strong>Project Type:</strong> ${projectTypeDisplay}</p>`;
  }
  if (details.budget) {
    summaryHtml += `<p><strong>Budget:</strong> ${details.budget}</p>`;
  }
  if (details.timeline) {
    summaryHtml += `<p><strong>Timeline:</strong> ${details.timeline}</p>`;
  }
  if (details.phone) {
    summaryHtml += `<p><strong>Phone:</strong> ${details.phone}</p>`;
  }
  // Always include email
  // Note: 'details.to' is not available here, but we know the email address was provided
  // We could pass 'to' into this function, or just state it was received.
  // Let's assume the 'to' email is the one used for sending, confirmed elsewhere.

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Quote Request Received</title>
        <style>
          /* Basic styles for readability */
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
          .summary { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hi ${customerName},</p>

          <p>Thank you for reaching out! We've successfully received your quote request for <strong>${projectTypeDisplay}</strong> and will review it shortly.</p>

          <div class="summary">
            <h3>Request Summary:</h3>
            ${summaryHtml || '<p>Details provided in your submission.</p>'}
             <p><strong>Contact Email:</strong> [Your Email Address Was Recorded]</p>
          </div>

          <h3>Next Steps:</h3>
          <p>Our team will review your request and get back to you within 1-2 business days. We may reach out if we need any further clarification.</p>

          <p>In the meantime, feel free to browse our portfolio or learn more about our services:</p>
          <ul>
            <li><a href="<link>>" target="_blank">View Our Portfolio</a></li>
            <li><a href="<link>>" target="_blank">Explore Our Services</a></li>
          </ul>

          <div class="footer">
            <p>If you have any immediate questions, please don't hesitate to contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
            <p>Best regards,<br/>The ${companyName} Team</p>
            <p><a href="<link>" target="_blank">${companyName}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a quote acknowledgement email using Resend.
 */
export async function sendQuoteAcknowledgementEmail(
  details: QuoteAcknowledgementDetails // Use updated interface
): Promise<void> {
  if (!resend) {
    console.log(
      '[Email Lib] Skipping quote acknowledgement email: Resend client not initialized.'
    );
    return;
  }

  // Construct the subject line dynamically
  const subject = `We've received your quote request, ${details.customerName || 'there'}!`;
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    // Generate the specific HTML for the quote acknowledgement
    const emailHtml = generateQuoteAckHtml(details); // Pass all details

    // console.log(`[Email Lib] Sending quote acknowledgement from: ${fromAddress} to: ${details.to}`); // Removed

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: details.to,
      subject: subject, // Use the dynamic subject
      html: emailHtml,
    });

    if (error) {
      console.error(`[Email Lib] Resend API Error sending quote ack email to ${details.to}:`, JSON.stringify(error, null, 2));
      return; // Exit on error
    }

    // console.log(`[Email Lib] Quote acknowledgement email sent successfully to ${details.to}. Email ID: ${data?.id}`); // Removed

  } catch (err) {
    console.error(`[Email Lib] Unexpected error sending quote acknowledgement email to ${details.to}:`, err);
  }
} 