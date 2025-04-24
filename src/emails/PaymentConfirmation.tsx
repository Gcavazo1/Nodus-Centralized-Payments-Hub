import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import * as React from 'react';

// Import the type definition (adjust path if necessary)
import type { PaymentConfirmationDetails } from '../lib/email'; 

export const PaymentConfirmationEmail: React.FC<Readonly<Omit<PaymentConfirmationDetails, 'to' | 'subject'>>> = ({
  customerName,
  amount,
  currency,
  provider,
  transactionId,
  transactionUrl,
  items,
  companyName = 'Your Company', // Default values
  supportEmail = 'support@yourdomain.com',
}) => {

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Assuming amount is in cents

  const previewText = `Payment Confirmation from ${companyName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Payment Successful!</Heading>
          <Text style={paragraph}>
            Hi {customerName || 'there'},
          </Text>
          <Text style={paragraph}>
            Thank you for your purchase from {companyName}. We&apos;ve successfully received your payment of {formattedAmount}.
          </Text>

          <Section style={detailsSection}>
            <Row>
              <Column style={detailsLabel}>Payment Provider:</Column>
              <Column style={detailsValue}>{provider}</Column>
            </Row>
            <Row>
              <Column style={detailsLabel}>Transaction ID:</Column>
              <Column style={detailsValue}>{transactionId}</Column>
            </Row>
            {transactionUrl && (
              <Row>
                <Column style={detailsLabel}>View Transaction:</Column>
                <Column style={detailsValue}><Link href={transactionUrl} style={link}>Click Here</Link></Column>
              </Row>
            )}
          </Section>

          {items && items.length > 0 && (
            <Section>
              <Heading as="h2" style={subHeading}>Order Summary</Heading>
              {items.map((item, index) => (
                <Row key={index}>
                  <Column>{item.name} (x{item.quantity})</Column>
                  <Column style={{ textAlign: 'right' }}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency.toUpperCase(),
                    }).format(item.price / 100) /* Assuming price is in cents */}
                  </Column>
                </Row>
              ))}
              <Hr style={hr} />
              <Row>
                <Column style={totalLabel}>Total:</Column>
                <Column style={totalValue}>{formattedAmount}</Column>
              </Row>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={footerText}>
            If you have any questions, please contact our support team at {' '}
            <Link href={`mailto:${supportEmail}`} style={link}>{supportEmail}</Link>.
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

// --- Basic Styles --- (Can be expanded significantly)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  marginBottom: '20px',
  textAlign: 'center' as const,
  color: '#1a1a1a',
};

const subHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginTop: '32px',
  marginBottom: '16px',
  color: '#1a1a1a',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#3c4043',
  padding: '0 20px',
};

const detailsSection = {
  padding: '0 20px',
  margin: '20px 0',
};

const detailsLabel = {
  fontSize: '14px',
  color: '#5f6368',
  width: '150px',
};

const detailsValue = {
  fontSize: '14px',
  color: '#3c4043',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#3c4043',
  textAlign: 'left' as const,
  paddingLeft: '20px',
};

const totalValue = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#3c4043',
  textAlign: 'right' as const,
  paddingRight: '20px',
};

const link = {
  color: '#1a73e8',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa',
  lineHeight: '15px',
  textAlign: 'center' as const,
  marginBottom: '5px',
}; 