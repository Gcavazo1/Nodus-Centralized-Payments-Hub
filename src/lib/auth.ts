import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminFirestoreInstance } from "./firebase-admin";

// Placeholder for a password comparison function
// In production, use a secure library like bcrypt: `import bcrypt from 'bcrypt';`
async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // IMPORTANT: Replace this with actual password hashing comparison (e.g., bcrypt.compare)
  console.warn("[Auth] Using insecure plain text password comparison. Replace with bcrypt in production.");
  return plainPassword === hashedPassword; 
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          const db = await getAdminFirestoreInstance();
          const usersRef = db.collection('adminUsers');
          const q = usersRef.where('email', '==', credentials.email).limit(1);
          const snapshot = await q.get();

          if (snapshot.empty) {
            console.log(`[Auth] No user found for email: ${credentials.email}`);
            return null;
          }

          const userDoc = snapshot.docs[0];
          const userData = userDoc.data();

          // --- IMPORTANT: Password Hashing --- 
          // userData.password should be the HASHED password from Firestore
          // Replace the comparePasswords call below with your actual secure comparison
          const passwordsMatch = await comparePasswords(credentials.password, userData.passwordHash || userData.password); // Adapt field name as needed
          // Example with bcrypt: const passwordsMatch = await bcrypt.compare(credentials.password, userData.passwordHash);

          if (passwordsMatch) {
            console.log(`[Auth] User authenticated: ${credentials.email}`);
            // Return user object expected by NextAuth, including id and role
            return {
              id: userDoc.id,
              email: userData.email,
              name: userData.name, // Optional: if you store name
              role: userData.role, // Include the role
            } as NextAuthUser;
          } else {
            console.log(`[Auth] Invalid password for email: ${credentials.email}`);
            return null;
          }
        } catch (error) {
          console.error("[Auth] Error during authorization:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt", // Using JWT strategy is common for credentials
  },
  callbacks: {
    // Include role and id in the JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Include role and id in the session object
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  // Add secret for JWT encryption (required in production)
  secret: process.env.NEXTAUTH_SECRET, 
  // Add pages configuration if needed (e.g., custom sign-in page)
  // pages: {
  //   signIn: '/admin/login',
  // }
}; 