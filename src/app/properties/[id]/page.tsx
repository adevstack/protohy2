
import { getPropertyById } from '@/lib/actions/property.actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Bed, Bath, Maximize, CalendarDays, ShieldCheck, Tag, Home, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RecommendPropertyForm } from '@/components/recommendations/RecommendPropertyForm'; // Added import

interface PropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  let displayLocation = '';
  const addressPart = property.location.address;
  const cityPart = property.location.city !== 'N/A' ? property.location.city : '';
  const statePart = property.location.state !== 'N/A' ? property.location.state : '';
  const zipCodePart = property.location.zipCode;

  const locationParts = [];
  if (addressPart) locationParts.push(addressPart);
  
  const cityStateZip = [];
  if (cityPart) cityStateZip.push(cityPart);
  if (statePart) cityStateZip.push(statePart);
  if (zipCodePart) cityStateZip.push(zipCodePart);
  
  if (cityStateZip.length > 0) locationParts.push(cityStateZip.join(statePart ? ', ' : ' '));

  displayLocation = locationParts.join(', ');

  if (!displayLocation.trim()) {
    displayLocation = 'Location details not available';
  }
  
  const propertyTypeHint = property.propertyType ? property.propertyType.toLowerCase() : "property";

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="p-0">
          <div className="relative w-full h-72 md:h-96"> {/* Fixed height for image container */}
            <Image
              src={property.images?.[0] || property.thumbnailUrl || `https://placehold.co/1200x800.png?text=${encodeURIComponent(property.title)}`}
              alt={`Image of ${property.title}`}
              fill
              className="object-cover"
              priority
              data-ai-hint={`${propertyTypeHint} interior`}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {property.isVerified && (
                <Badge variant="default" className="bg-green-500 text-white shadow-md">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Verified
                </Badge>
              )}
              <FavoriteButton propertyId={property.propertyId} initialIsFavorite={property.isFavorite} className="bg-background/70 hover:bg-background/90" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary mb-1">{property.title}</CardTitle>
              <div className="flex items-center text-lg text-muted-foreground mb-2">
                <MapPin size={20} className="mr-2 flex-shrink-0 text-accent" />
                <span>{displayLocation}</span>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-primary mt-2 md:mt-0 whitespace-nowrap">
              {formattedPrice}
            </div>
          </div>

          {property.description && (
            <CardDescription className="text-base text-foreground/80 mb-6 leading-relaxed">
              {property.description}
            </CardDescription>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <InfoItem icon={<Home className="text-accent" />} label="Property Type" value={property.propertyType} />
            <InfoItem icon={<Bed className="text-accent" />} label="Bedrooms" value={`${property.bedrooms}`} />
            <InfoItem icon={<Bath className="text-accent" />} label="Bathrooms" value={`${property.bathrooms}`} />
            <InfoItem icon={<Maximize className="text-accent" />} label="Area" value={`${property.areaSqFt.toLocaleString()} sq ft`} />
            {property.availableFrom && (
              <InfoItem 
                icon={<CalendarDays className="text-accent" />} 
                label="Available From" 
                value={format(new Date(property.availableFrom), 'PPP')} 
              />
            )}
             <InfoItem 
                icon={<ListChecks className="text-accent" />} 
                label="Status" 
                value={property.isVerified ? 'Verified Listing' : 'Not Verified'} 
              />
          </div>
          
          {property.tags && property.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-primary/90 flex items-center">
                <Tag className="mr-2 h-5 w-5 text-accent" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm capitalize" style={{ backgroundColor: property.colorTheme ? `hsl(var(--${property.colorTheme}-tag-bg))` : undefined, color: property.colorTheme ? `hsl(var(--${property.colorTheme}-tag-fg))` : undefined }}>
                    {tag.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-primary/90 flex items-center">
                 <ListChecks className="mr-2 h-5 w-5 text-accent" /> Amenities
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 list-inside text-foreground/80">
                {property.amenities.map(amenity => (
                  <li key={amenity} className="flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" /> 
                    <span className="capitalize">{amenity.replace(/-/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {property.images && property.images.length > 1 && (
             <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-primary/90">Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {property.images.slice(1).map((img, index) => ( // Start from the second image
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Image 
                      src={img} 
                      alt={`${property.title} - Image ${index + 2}`} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      data-ai-hint={`${propertyTypeHint} room`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RecommendPropertyForm propertyId={property.propertyId} propertyTitle={property.title} />
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center p-3 bg-card-foreground/5 dark:bg-card-foreground/10 rounded-lg shadow">
      <div className="mr-3 p-2 bg-accent/10 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-card-foreground">{value}</p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PropertyDetailsPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.title} | Estate Envision`,
    description: property.description?.substring(0, 160) || `Details for ${property.title}`,
  };
}
