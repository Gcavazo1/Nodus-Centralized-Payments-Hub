'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
// Optional: Import a Loading component if you have one
// import { LoadingSpinner } from '@/components/ui/loading-spinner'; 

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        // Only redirect if not already on the login page
        if (pathname !== '/admin/login') { 
          router.push('/admin/login');
        }
      }
      // Optional: Add role check here if needed after fetching user data from Firestore
      // e.g., if (currentUser) { checkAdminRole(currentUser.uid); }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    // Optional: Show a loading indicator while checking auth state
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <LoadingSpinner /> */}
        <p>Loading Admin...</p> 
      </div>
    );
  }

  // If user is authenticated (or if we add role check, is an admin), render the children
  // If user is not authenticated, the useEffect hook will have already triggered a redirect
  if (user) {
    return <>{children}</>;
  }

  // If not loading and no user, likely being redirected, show minimal content or null
  return null; 
} 