import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/site";
import { BackgroundImage } from "@/components/ui/background-image";
import { PaymentConfigProvider } from "@/context/PaymentConfigContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { SocialLinksProvider } from "@/context/SocialLinksContext";
import { isStripeConfigured } from "@/lib/stripe";
import { isCoinbaseConfigured } from "@/lib/coinbase";
import { Toaster } from "sonner";
import { ThemeColorApplier } from "@/components/ThemeColorApplier";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paymentConfig = {
    isStripeConfigured,
    isCoinbaseConfigured
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteSettingsProvider>
            <SocialLinksProvider>
              <PaymentConfigProvider config={paymentConfig}>
                <ThemeColorApplier />
                <BackgroundImage 
                    darkImageUrl="/images/centralized-dark-background.jpg"
                    lightImageUrl="/images/centralized-light-background.jpg"
                />
                <div className="relative flex min-h-dvh flex-col backdrop-blur-[2px]">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster position="top-right" />
              </PaymentConfigProvider>
            </SocialLinksProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
