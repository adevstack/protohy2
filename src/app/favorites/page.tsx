
import { getFavoritePropertiesForCurrentUser } from '@/lib/actions/favorite.actions';
import { PropertyCard } from '@/components/properties/PropertyCard';
import type { Property } from '@/lib/types';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartCrack } from 'lucide-react';

export default async function FavoritesPage() {
  // Check if user is authenticated (simple check, real auth might be more complex)
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <HeartCrack className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to view your favorite properties.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const favoriteProperties: Property[] = await getFavoritePropertiesForCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-primary/90">
        My Favorite Properties
      </h1>
      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard key={property.propertyId} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartCrack className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <p className="text-xl text-muted-foreground mb-4">
            You haven&apos;t added any properties to your favorites yet.
          </p>
          <p className="text-md text-muted-foreground/80 mb-8">
            Start exploring and click the heart icon to save properties you love!
          </p>
          <Button asChild size="lg">
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'My Favorites | Estate Envision',
  description: 'View your saved favorite properties on Estate Envision.',
};
