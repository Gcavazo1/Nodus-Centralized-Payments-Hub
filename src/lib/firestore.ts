import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { 
  QuoteRequest, 
  QuoteRequestStatus,
  AdminUser,
} from './definitions';

// ==============================
// Quote Requests
// ==============================

/**
 * Adds a new quote request document to Firestore
 * 
 * @param requestData - The quote request data without id, createdAt, and status
 * @returns Promise containing the ID of the newly created document
 */
export const addQuoteRequest = async (
  requestData: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quoteRequests'), {
      ...requestData,
      status: 'new', // Default status
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: unknown) {
    console.error("Error adding quote request: ", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit quote request: ${message}`);
  }
};

/**
 * Retrieves a specific quote request document
 * 
 * @param requestId - ID of the quote request to retrieve
 * @returns Promise containing the quote request data or null if not found
 */
export const getQuoteRequest = async (requestId: string): Promise<QuoteRequest | null> => {
  try {
    const docRef = doc(db, 'quoteRequests', requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      } as QuoteRequest;
    } else {
      return null;
    }
  } catch (error: unknown) {
    console.error(`Error retrieving quote request ${requestId}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve quote request ${requestId}: ${message}`);
  }
};

/**
 * Updates the status of a quote request
 * 
 * @param requestId - ID of the quote request to update
 * @param status - New status to set
 * @returns Promise that resolves when the update is complete
 */
export const updateQuoteRequestStatus = async (
  requestId: string, 
  status: QuoteRequestStatus
): Promise<void> => {
  try {
    const docRef = doc(db, 'quoteRequests', requestId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: Timestamp.now()
    });
  } catch (error: unknown) {
    console.error(`Error updating quote request ${requestId} status:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update status for quote request ${requestId}: ${message}`);
  }
};

// ==============================
// Quotes
// ==============================

/**
 * Retrieves a specific quote document
 * 
 * @param quoteId - ID of the quote to retrieve
 * @returns Promise containing the quote data or null if not found
 */
export const getQuote = async (quoteId: string) => {
  try {
    const docRef = doc(db, 'quotes', quoteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        validUntil: data.validUntil?.toDate?.() || data.validUntil,
      };
    } else {
      return null;
    }
  } catch (error: unknown) {
    console.error(`Error retrieving quote ${quoteId}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve quote ${quoteId}: ${message}`);
}
};

// ==============================
// Admin Users
// ==============================

/**
 * Retrieves an admin user by ID
 * 
 * @param userId - ID of the admin user to retrieve
 * @returns Promise containing the admin user data or null if not found
 */
export const getAdminUser = async (userId: string): Promise<AdminUser | null> => {
  try {
    const docRef = doc(db, 'adminUsers', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
      } as AdminUser;
    } else {
      return null;
    }
  } catch (error: unknown) {
    console.error(`Error fetching admin user ${userId}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch admin user: ${message}`);
  }
};

// ==============================
// Site Settings - Social Links
// ==============================

/**
 * Social link data structure
 */
export interface SocialLink {
  id?: string;
  name: string;
  url: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  category?: 'social' | 'business' | 'other';
}

/**
 * Fetches all social link documents from Firestore.
 *
 * @returns Promise containing an array of social links.
 */
export const getSocialLinks = async (): Promise<SocialLink[]> => {
  try {
    // Use client 'db' instance
    const socialLinksCollection = collection(db, 'siteSettings', 'socialLinks', 'links');
    const q = query(socialLinksCollection, orderBy('displayOrder', 'asc'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const links: SocialLink[] = [];
      querySnapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() } as SocialLink);
      });
      return links;
    } else {
      console.warn("[firestore] Client: No social links found, returning empty array.");
      return [];
    }
  } catch (error: unknown) {
    console.error("Error fetching social links:", error);
    // Throw a more specific error message
    const message = error instanceof Error ? error.message : "Unknown error fetching social links.";
    throw new Error(`Failed to fetch social links: ${message}`);
  }
};

/**
 * Add a new social link
 * 
 * @param link Social link data to add
 * @returns Promise containing the ID of the new link
 */
export const addSocialLink = async (link: Omit<SocialLink, 'id'>): Promise<string> => {
  try {
    // Use client 'db' instance
    const socialLinksCollection = collection(db, 'socialLinks');
    
    // Get current highest display order
    const links = await getSocialLinks();
    const highestOrder = links.length > 0 
      ? Math.max(...links.map(l => l.displayOrder || 0)) 
      : 0;
    
    const docRef = await addDoc(socialLinksCollection, {
      ...link,
      displayOrder: link.displayOrder || highestOrder + 1,
      isActive: link.isActive !== undefined ? link.isActive : true,
      category: link.category || 'social',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error: unknown) {
    console.error('Error adding social link:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add social link: ${message}`);
  }
};

/**
 * Update an existing social link
 * 
 * @param id ID of the link to update
 * @param linkData Updated link data
 * @returns Promise that resolves when update is complete
 */
export const updateSocialLink = async (
  id: string, 
  linkData: Partial<Omit<SocialLink, 'id'>>
): Promise<void> => {
  try {
    const linkRef = doc(db, 'socialLinks', id);
    await updateDoc(linkRef, {
      ...linkData,
      updatedAt: serverTimestamp()
    });
  } catch (error: unknown) {
    console.error(`Error updating social link ${id}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update social link: ${message}`);
  }
};

/**
 * Remove a social link
 * 
 * @param id ID of the link to remove
 * @returns Promise that resolves when deletion is complete
 */
export const removeSocialLink = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'socialLinks', id));
  } catch (error: unknown) {
    console.error(`Error removing social link ${id}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to remove social link: ${message}`);
  }
};

/**
 * Reorder social links
 * 
 * @param linkOrders Object mapping link IDs to new display orders
 * @returns Promise that resolves when all updates are complete
 */
export const reorderSocialLinks = async (
  linkOrders: Record<string, number>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    for (const [id, order] of Object.entries(linkOrders)) {
      const linkRef = doc(db, 'socialLinks', id);
      batch.update(linkRef, { 
        displayOrder: order,
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
  } catch (error: unknown) {
    console.error('Error reordering social links:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to reorder social links: ${message}`);
  }
}; 