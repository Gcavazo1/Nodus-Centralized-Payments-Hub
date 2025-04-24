'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { AdminUser } from '@/lib/definitions'; // Import the AdminUser type
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, 'adminUsers');
        const q = query(usersRef); // Fetch all admin users
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: AdminUser[] = [];
        querySnapshot.forEach((doc) => {
          // Ensure the data conforms to the AdminUser type, including the id
          fetchedUsers.push({ id: doc.id, ...doc.data() } as AdminUser);
        });
        setUsers(fetchedUsers);

      } catch (err: unknown) {
        console.error("Error fetching admin users:", err);
        setError("Failed to fetch admin users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Users</h1>
      <p className="text-muted-foreground mb-6">
        Manage users who have access to this admin panel.
      </p>
      
      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>User ID (Auth UID)</TableHead>
                {/* Add actions column later if needed (e.g., edit role, delete) */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No admin users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Add Invite User Button/Functionality later if needed */}
    </div>
  );
} 