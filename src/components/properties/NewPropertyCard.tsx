
'use client';

import type { NewProperty } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Maximize, CalendarDays, Tag, CheckCircle, Building, UserCheck, Star } from 'lucide-react'; // Removed DollarSign, Palette as price/color are handled directly
import { format } from 'date-fns';

interface NewPropertyCardProps {
  property: NewProperty;
}

export function NewPropertyCard({ property }: NewPropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg bg-card">
      {property.colorTheme && (
         <div style={{ backgroundColor: property.colorTheme, height: '8px' }} className="w-full" />
      )}
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold mb-1 text-primary truncate" title={property.title}>
                {property.title}
            </CardTitle>
            {property.isVerified && (
                <Badge variant="default" className="bg-green-500 text-white text-xs shrink-0 ml-2">
                <CheckCircle className="mr-1 h-3 w-3" /> Verified
                </Badge>
            )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          ID: {property.id} {/* Changed from property.propertyId */}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin size={14} className="mr-1.5 flex-shrink-0 text-accent" />
          <span className="truncate">{property.city}, {property.state}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Building size={14} className="mr-1.5 flex-shrink-0 text-accent" />
          <span>{property.propertyType} - <span className="capitalize">{property.listingType}</span></span>
        </div>
         <div className="text-2xl font-bold text-primary">
          {formattedPrice}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <InfoPill icon={<Bed size={14} />} label={`${property.bedrooms} Beds`} />
            <InfoPill icon={<Bath size={14} />} label={`${property.bathrooms} Baths`} />
            <InfoPill icon={<Maximize size={14} />} label={`${property.areaSqFt.toLocaleString()} sqft`} />
            <InfoPill icon={<CalendarDays size={14} />} label={`Avail: ${format(new Date(property.availableFrom), 'MMM dd, yyyy')}`} />
            <InfoPill icon={<UserCheck size={14} />} label={`By: ${property.listedBy}`} />
            <InfoPill icon={<Star size={14} />} label={`Rating: ${property.rating || 'N/A'}`} />
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Amenities:</h4>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map(amenity => (
                <Badge key={amenity} variant="secondary" className="text-xs capitalize bg-secondary/50 text-secondary-foreground/80">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && <Badge variant="outline" className="text-xs">+{property.amenities.length - 4} more</Badge>}
            </div>
          </div>
        )}

        {property.tags && property.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Tags:</h4>
            <div className="flex flex-wrap gap-1">
              {property.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs capitalize border-primary/50 text-primary/80">
                  <Tag className="mr-1 h-3 w-3" />{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
         <p className="text-sm text-muted-foreground">Furnishing: {property.furnished}</p>


      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button variant="outline" size="sm" className="w-full" disabled>
            View/Edit (Coming Soon)
        </Button>
      </CardFooter>
    </Card>
  );
}

interface InfoPillProps {
    icon: React.ReactNode;
    label: string;
}
function InfoPill({icon, label}: InfoPillProps) {
    return (
        <div className="flex items-center text-muted-foreground">
            <span className="text-accent mr-1.5">{icon}</span>
            <span>{label}</span>
        </div>
    )
}
