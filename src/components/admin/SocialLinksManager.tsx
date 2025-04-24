'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SocialLink, addSocialLink, updateSocialLink, removeSocialLink } from '@/lib/firestore';
import { useSocialLinks } from '@/context/SocialLinksContext'; // Import the context hook

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface ValidationError {
  type: 'name' | 'url';
  message: string;
}

export function SocialLinksManager() {
  // Use state from context
  const { socialLinks, isLoading, error: contextError } = useSocialLinks();

  // Local state for the form and submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLink, setNewLink] = useState<Omit<SocialLink, 'id'>>({
    name: '',
    url: '',
    category: 'social',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);

  // No need for local error or fetchSocialLinks, context handles it

  // Validate form data
  const validateLink = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    if (!newLink.name.trim()) {
      newErrors.push({ type: 'name', message: 'Name is required' });
    } else if (newLink.name.length > 30) {
      newErrors.push({ type: 'name', message: 'Name must be 30 characters or less' });
    }
    
    if (!newLink.url.trim()) {
      newErrors.push({ type: 'url', message: 'URL is required' });
    } else if (!URL_REGEX.test(newLink.url)) {
      newErrors.push({ type: 'url', message: 'Please enter a valid URL' });
    }
    
    // Check for duplicate names (against context state)
    if (newLink.name.trim() && socialLinks.some(link => 
        link.id !== undefined && // Ensure link has an ID (skip comparing against potential new link if added locally)
        link.name.toLowerCase() === newLink.name.toLowerCase()
    )) {
      newErrors.push({ type: 'name', message: 'A link with this name already exists' });
    }
    
    // Check for duplicate URLs (normalized, against context state)
    const normalizedNewUrl = normalizeUrl(newLink.url);
    if (newLink.url.trim() && normalizedNewUrl && socialLinks.some(link => 
        link.id !== undefined && // Ensure link has an ID
        normalizeUrl(link.url) === normalizedNewUrl
    )) {
      newErrors.push({ type: 'url', message: 'A link with this URL already exists' });
    }
    
    setFormErrors(newErrors);
    return newErrors.length === 0;
  };
  
  const normalizeUrl = (url: string): string | null => {
     try {
       if (!url.trim()) return null;
       let normalizedUrl = url;
       if (!/^https?:\/\//i.test(normalizedUrl)) {
         normalizedUrl = 'https://' + normalizedUrl;
       }
       const urlObj = new URL(normalizedUrl);
       return (urlObj.host + urlObj.pathname).replace(/\/$/, '').toLowerCase();
     } catch (_e) {
       return url.toLowerCase();
     }
   };

  const handleAddLink = async () => {
    setFormErrors([]);
    if (!validateLink()) return;

    let url = newLink.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    setIsSubmitting(true);
    try {
      // Call Firestore function directly - context listener will update UI
      await addSocialLink({...newLink, url}); 
      setNewLink({ name: '', url: '', category: 'social', isActive: true });
      toast.success('Social link added successfully');
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLink = async (id: string, updatedData: Partial<Omit<SocialLink, 'id'>>) => {
    if (!id) {
      toast.error("Cannot update link: Missing ID");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Call Firestore function directly - context listener will update UI
      await updateSocialLink(id, updatedData);
      toast.success('Social link updated');
    } catch (error) {
      console.error('Error updating social link:', error);
      toast.error('Failed to update social link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLink = async (id: string) => {
    if (!id) {
      toast.error("Cannot remove link: Missing ID");
      return;
    }
    if (!confirm('Are you sure you want to remove this link?')) return;
    
    setIsSubmitting(true);
    try {
      // Call Firestore function directly - context listener will update UI
      await removeSocialLink(id);
      toast.success('Social link removed');
    } catch (error) {
      console.error('Error removing social link:', error);
      toast.error('Failed to remove social link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldType: 'name' | 'url'): string | null => {
    const fieldError = formErrors.find(err => err.type === fieldType);
    return fieldError ? fieldError.message : null;
  };

  // Use socialLinks from context for filtering
  const socialMediaLinks = socialLinks.filter(link => link.category === 'social' || !link.category);
  const businessLinks = socialLinks.filter(link => link.category === 'business');
  const otherLinks = socialLinks.filter(link => link.category === 'other');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Manage the social media links that appear in the footer of your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {contextError && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  {contextError}
                </div>
              )}
              
              {/* Sections remain the same, using links from context */}
              {/* Social Media Links Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Social Media</h3>
                <div className="space-y-4">
                  {socialMediaLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No social media links added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {socialMediaLinks.map(link => (
                        <LinkItem 
                          key={link.id} 
                          link={link} 
                          onUpdate={handleUpdateLink}
                          onRemove={handleRemoveLink}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Business Links Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Business</h3>
                 <div className="space-y-4">
                  {businessLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No business links added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {businessLinks.map(link => (
                        <LinkItem 
                          key={link.id} 
                          link={link} 
                          onUpdate={handleUpdateLink}
                          onRemove={handleRemoveLink}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Other Links Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Other</h3>
                 <div className="space-y-4">
                  {otherLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No other links added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {otherLinks.map(link => (
                        <LinkItem 
                          key={link.id} 
                          link={link} 
                          onUpdate={handleUpdateLink}
                          onRemove={handleRemoveLink}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add New Link Form - uses local form state */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Add New Link</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="linkName" className={getFieldError('name') ? 'text-destructive' : ''}>
                      Link Name
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="linkName"
                        placeholder="e.g., LinkedIn, Portfolio"
                        value={newLink.name}
                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        disabled={isSubmitting}
                        className={getFieldError('name') ? 'border-destructive' : ''}
                      />
                      {getFieldError('name') && (
                        <p className="mt-1 text-xs text-destructive flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {getFieldError('name')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkUrl" className={getFieldError('url') ? 'text-destructive' : ''}>
                      URL
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="linkUrl"
                        placeholder="e.g., https://linkedin.com/in/yourprofile"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        disabled={isSubmitting}
                        className={getFieldError('url') ? 'border-destructive' : ''}
                      />
                      {getFieldError('url') && (
                        <p className="mt-1 text-xs text-destructive flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {getFieldError('url')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkCategory">Category</Label>
                    <Select
                      onValueChange={(value) => setNewLink({ ...newLink, category: value as 'social' | 'business' | 'other' })}
                      value={newLink.category}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="linkCategory">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleAddLink}
                      disabled={isSubmitting || !newLink.name || !newLink.url}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {/* Footer remains largely the same, maybe remove refresh button */}
         <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">
            Links will appear in the footer of your site.
          </p>
          {/* Refresh button is less critical now due to real-time updates - removing */}
        </CardFooter>
      </Card>
    </div>
  );
}

// LinkItem component remains the same
interface LinkItemProps {
  link: SocialLink;
  onUpdate: (id: string, data: Partial<Omit<SocialLink, 'id'>>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  disabled: boolean;
}

const LinkItem = ({ link, onUpdate, onRemove, disabled }: LinkItemProps) => {
  if (!link.id) {
    return null; // Don't render if ID is missing (shouldn't happen with context)
  }
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="font-medium truncate mr-2">{link.name}</p>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor={`active-${link.id}`} className="text-xs sr-only">
            Active
          </Label>
          <Switch
            id={`active-${link.id}`}
            checked={link.isActive !== false} // Default to true if undefined
            onCheckedChange={(checked) => onUpdate(link.id!, { isActive: checked })}
            disabled={disabled}
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(link.id!)}
          disabled={disabled}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 