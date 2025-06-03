
'use client';

import { useState, useEffect, startTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { addFavorite, removeFavorite, isPropertyFavoriteForCurrentUser } from '@/lib/actions/favorite.actions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  showText?: boolean;
}

export function FavoriteButton({ propertyId, initialIsFavorite, className, size = "icon", showText = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);
  const [isLoading, setIsLoading] = useState(!initialIsFavorite === undefined); // Load if initial state not provided
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (initialIsFavorite !== undefined) {
      setIsFavorite(initialIsFavorite);
      setIsLoading(false);
      return;
    }

    if (isAuthenticated && propertyId) {
      setIsLoading(true);
      isPropertyFavoriteForCurrentUser(propertyId)
        .then(status => {
          setIsFavorite(status);
        })
        .catch(err => {
          console.error("Failed to fetch favorite status", err);
          // Optionally, show a toast or keep it as not favorited
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading && !isAuthenticated) {
      // If user is not authenticated and we've checked, set loading to false.
      setIsLoading(false);
      setIsFavorite(false); // Not authenticated users can't have favorites
    }
  }, [propertyId, isAuthenticated, authLoading, initialIsFavorite]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add properties to your favorites.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (isFavorite) {
        result = await removeFavorite(propertyId);
      } else {
        result = await addFavorite(propertyId);
      }

      if (result.success) {
        toast({
          title: result.message || (result.isFavorite ? 'Added to Favorites' : 'Removed from Favorites'),
        });
        // Use startTransition for smoother UI updates if revalidation is involved
        startTransition(() => {
            setIsFavorite(result.isFavorite ?? false);
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update favorites.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    // You might want a skeleton or a disabled button while auth is loading
    return <Button variant="ghost" size={size} className={cn("text-muted-foreground", className)} disabled><Heart className={cn("h-5 w-5", {"mr-2": showText})} />{showText && "Loading..."}</Button>;
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading || authLoading}
      className={cn(
        'transition-colors duration-200',
        {
          'text-red-500 hover:text-red-600': isFavorite,
          'text-muted-foreground hover:text-primary': !isFavorite,
        },
        className
      )}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("h-5 w-5", {"fill-current": isFavorite, "mr-2": showText})} />
      {showText && (isFavorite ? "Favorited" : "Favorite")}
    </Button>
  );
}
