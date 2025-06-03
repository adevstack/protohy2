
import { getAllProperties, type PropertySearchParams } from '@/lib/actions/property.actions';
import { PropertyCard } from '@/components/properties/PropertyCard';
import type { Property } from '@/lib/types';
import { PropertySearchForm } from '@/components/properties/PropertySearchForm';

interface PropertiesPageProps {
  searchParams: PropertySearchParams; 
}

// Ensure the page is dynamically rendered based on search params
export const dynamic = 'force-dynamic'; 

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  // Parse searchParams to ensure correct types are passed to the action
  const parsedSearchParams: PropertySearchParams = {
    keyword: searchParams.keyword,
    propertyType: searchParams.propertyType,
    city: searchParams.city,
    state: searchParams.state,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    minBedrooms: searchParams.minBedrooms ? Number(searchParams.minBedrooms) : undefined,
    minBathrooms: searchParams.minBathrooms ? Number(searchParams.minBathrooms) : undefined,
    minAreaSqFt: searchParams.minAreaSqFt ? Number(searchParams.minAreaSqFt) : undefined,
    amenities: searchParams.amenities,
    tags: searchParams.tags,
    isVerified: typeof searchParams.isVerified === 'string' 
                  ? searchParams.isVerified.toLowerCase() === 'true' 
                  : searchParams.isVerified, // Keep as boolean if already
  };

  const properties: Property[] = await getAllProperties(parsedSearchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-primary/90">
        Explore Properties
      </h1>
      
      <PropertySearchForm />

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {properties.map((property) => (
            <PropertyCard key={property.propertyId} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mt-8 bg-card border rounded-lg shadow">
          <p className="text-xl text-muted-foreground mb-4">
            No properties found matching your criteria.
          </p>
          <p className="text-md text-muted-foreground/80">
            Try adjusting your filters or view all properties.
          </p>
        </div>
      )}
    </div>
  );
}

export const metadata = {
    title: 'Browse Properties | Estate Envision',
    description: 'Find your perfect property with advanced search and filtering options on Estate Envision.',
};
