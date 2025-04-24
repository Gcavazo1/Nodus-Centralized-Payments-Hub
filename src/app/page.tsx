"use client"; // Make this a Client Component

import Link from "next/link";
import { useState, useMemo } from "react";
import { siteConfig } from "@/config/site";
import { products, services, Offering, ProductType } from "@/config/offerings";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentConfig } from "@/context/PaymentConfigContext";
import { useSiteSettings } from "@/context/SiteSettingsContext"; // Import site settings context

// Combine product and service types for filtering
const OFFERING_TYPES: ProductType[] = ['digital', 'service', 'consultation'];

export default function Home() {
  // Get config status from context
  const { isStripeConfigured, isCoinbaseConfigured } = usePaymentConfig();
  const { siteSettings, isLoading: isSettingsLoading } = useSiteSettings();
  
  // State for filtering
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');

  // Combine products and services
  const allOfferings: Offering[] = useMemo(() => [...products, ...services], []);

  // Filtered offerings based on selected type
  const filteredOfferings = useMemo(() => {
    if (selectedType === 'all') {
      return allOfferings;
    }
    return allOfferings.filter(offering => offering.type === selectedType);
  }, [allOfferings, selectedType]);

  // Determine if Coinbase should be shown (configured AND enabled in admin settings)
  const showCoinbaseOption = useMemo(() => {
    const isEnabled = siteSettings?.payments?.enableCoinbase === true;
    return isCoinbaseConfigured && !isSettingsLoading && isEnabled;
  }, [isCoinbaseConfigured, isSettingsLoading, siteSettings?.payments?.enableCoinbase]);

    return (
    <div className="flex flex-col gap-16 py-10">
      {/* Hero Section */}
      <section className="container px-4 md:px-6 pt-10 md:pt-14 flex flex-col items-center text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          {siteConfig.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          {siteConfig.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/#offerings">
            <Button size="lg">View Offerings</Button>
          </Link>
          <Link href="/quote">
            <Button variant="outline" size="lg">Request Custom Quote</Button>
          </Link>
        </div>
      </section>

      {/* Combined Offerings Section with Filtering */}
      <section id="offerings" className="container px-4 md:px-6 py-10">
        {/* Section Header */}
        <div className="flex flex-col gap-2 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">Our Offerings</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Explore our range of digital products and professional services.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex justify-center flex-wrap gap-2 mb-10">
                  <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
                  >
            All
                  </Button>
          {OFFERING_TYPES.map(type => (
                  <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              className="capitalize" // Capitalize the first letter
            >
              {type}
                  </Button>
          ))}
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.length > 0 ? (
            filteredOfferings.map(offering => (
              <Card key={offering.id} className="flex flex-col">
              <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{offering.title}</CardTitle>
                    {offering.popular && <Badge variant="secondary">Popular</Badge>}
                  </div>
                  <CardDescription>{offering.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc pl-5 space-y-2">
                    {offering.features?.slice(0, 3).map((feature, i) => (
                    <li key={i} className="text-sm">{feature}</li>
                  ))}
                </ul>
                  <div className={`mt-4 ${offering.type === 'digital' ? 'text-2xl font-bold' : 'text-lg font-semibold'}`}>
                    {offering.price === null 
                      ? "Custom Quote"
                      : `$${(offering.price / 100).toFixed(2)}${offering.priceUnit ? `/${offering.priceUnit}` : ''}`
                    }
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
                  {offering.price === null ? (
                  <Link href="/quote" className="w-full">
                    <Button variant="default" className="w-full">
                      Request Quote
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/checkout/${offering.id}`} className="w-full">
                     <Button variant="default" className="w-full">
                        Proceed to Checkout
                     </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground col-span-full">
              No offerings found for the selected type.
            </p>
          )}
        </div>
        {(!isStripeConfigured || !showCoinbaseOption) && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            (Note: Payment options may be limited as some providers are not fully configured or enabled in admin settings.)
          </p>
        )}
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6 py-10 text-center">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Have questions or need something custom? Reach out for a personalized quote.
        </p>
        <Link href="/quote">
          <Button size="lg">Request a Quote</Button>
        </Link>
      </section>
    </div>
  );
}
