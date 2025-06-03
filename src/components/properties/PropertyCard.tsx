
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, MapPin } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/FavoriteButton'; // Added import

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  const city = property.location?.city;
  const state = property.location?.state;
  let displayLocation = 'Location N/A';

  if (city && city !== 'N/A' && state && state !== 'N/A') {
    displayLocation = `${city}, ${state}`;
  } else if (city && city !== 'N/A') {
    displayLocation = city;
  } else if (state && state !== 'N/A') {
    displayLocation = state;
  }

  const propertyTypeHint = property.propertyType ? property.propertyType.toLowerCase() : "property";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/properties/${property.propertyId}`} className="block">
          <Image
            src={property.thumbnailUrl || property.images?.[0] || `https://placehold.co/600x400.png?text=${encodeURIComponent(property.title)}`}
            alt={`Image of ${property.title}`}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={`${propertyTypeHint} exterior`}
          />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
            {property.isVerified && (
            <Badge variant="default" className="bg-green-500 text-white shadow-sm">
                Verified
            </Badge>
            )}
            <FavoriteButton 
                propertyId={property.propertyId} 
                initialIsFavorite={property.isFavorite} 
                className="bg-background/70 hover:bg-background/90 backdrop-blur-sm"
                size="sm"
            />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.propertyId}`} className="block">
          <CardTitle className="text-lg font-semibold mb-1 hover:text-primary transition-colors truncate">
            {property.title}
          </CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin size={14} className="mr-1.5 flex-shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Home size={14} className="mr-1.5 flex-shrink-0" />
          <span>{property.propertyType || 'N/A'}</span>
        </div>
        
        <div className="text-xl font-bold text-primary mb-3">
          {formattedPrice}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.areaSqFt.toLocaleString()} sqft</span>
        </div>

        {property.tags && Array.isArray(property.tags) && property.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {property.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize" style={{ backgroundColor: property.colorTheme ? `hsl(var(--${property.colorTheme}-tag-bg))` : undefined, color: property.colorTheme ? `hsl(var(--${property.colorTheme}-tag-fg))` : undefined }}>
                {tag.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full" size="sm">
          <Link href={`/properties/${property.propertyId}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
