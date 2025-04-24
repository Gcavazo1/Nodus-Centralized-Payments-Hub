"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { useSocialLinks } from '@/context/SocialLinksContext';

export function Footer() {
  // Get links from context
  const { socialLinks, isLoading, error: isError } = useSocialLinks();

  // Filter links directly from context state
  const activeLinks = socialLinks.filter(link => link?.isActive !== false && link?.id);
  const socialMediaLinks = activeLinks.filter(link => link.category === 'social' || !link.category);
  const businessLinks = activeLinks.filter(link => link.category === 'business');
  const otherLinks = activeLinks.filter(link => link.category === 'other');

  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Image 
            src="/icons/icon-512x512.png" 
            alt="Nodus Payment Hub Logo" 
            width={44}
            height={44}
            className="h-20 w-20"
          />
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            {/* Optional: Add a link to privacy policy or terms */}
            {/* <Link
              href="/privacy"
              className="font-medium underline underline-offset-4 ml-2"
            >
              Privacy Policy
            </Link> */}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Show loading state from context */}
          {isLoading ? (
            <span className="text-sm text-muted-foreground animate-pulse">Loading links...</span>
          ) : isError ? (
            <span className="text-sm text-destructive">Failed to load links</span>
          ) : (
            <>
              {/* Render links from context state */}
              {socialMediaLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
              
              {businessLinks.map((link) => (
                 <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
              
              {otherLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </footer>
  );
} 