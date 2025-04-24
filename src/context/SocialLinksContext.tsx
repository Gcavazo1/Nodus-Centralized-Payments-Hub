'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase'; // Assuming client-side Firestore instance
import { collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { SocialLink } from '@/lib/firestore'; // Reuse the type from firestore lib

interface SocialLinksContextType {
  socialLinks: SocialLink[];
  isLoading: boolean;
  error: string | null;
}

const SocialLinksContext = createContext<SocialLinksContextType>({
  socialLinks: [],
  isLoading: true,
  error: null,
});

export function useSocialLinks() {
  return useContext(SocialLinksContext);
}

interface SocialLinksProviderProps {
  children: ReactNode;
}

export function SocialLinksProvider({ children }: SocialLinksProviderProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[SocialLinksContext] Setting up Firestore listener...");
    setIsLoading(true);
    setError(null);

    const socialLinksCollection = collection(db, 'socialLinks'); // Using top-level collection
    const q = query(socialLinksCollection, orderBy('displayOrder', 'asc'));

    const unsubscribe: Unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log("[SocialLinksContext] Received snapshot update.");
        const links: SocialLink[] = [];
        querySnapshot.forEach((doc) => {
          links.push({ id: doc.id, ...doc.data() } as SocialLink);
        });
        console.log("[SocialLinksContext] Parsed links:", links);
        setSocialLinks(links);
        setIsLoading(false);
        setError(null); // Clear error on successful update
      },
      (err) => {
        console.error("[SocialLinksContext] Firestore listener error:", err);
        setError("Failed to load social links in real-time.");
        setSocialLinks([]); // Clear links on error
        setIsLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      console.log("[SocialLinksContext] Cleaning up Firestore listener.");
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const value = {
    socialLinks,
    isLoading,
    error,
  };

  return (
    <SocialLinksContext.Provider value={value}>
      {children}
    </SocialLinksContext.Provider>
  );
} 