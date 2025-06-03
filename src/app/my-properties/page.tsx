
import { getSubmittedPropertiesByOwnerId } from '@/lib/actions/new-property.actions';
import { NewPropertyCard } from '@/components/properties/NewPropertyCard'; 
import type { NewProperty } from '@/lib/types';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ListChecks, PlusCircle } from 'lucide-react';

// Ensure this page is dynamically rendered because it checks auth status and fetches user-specific data
export const dynamic = 'force-dynamic'; 

export default async function MyPropertiesPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to view your listed properties.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login to View Properties</Link>
        </Button>
      </div>
    );
  }

  const properties: NewProperty[] = await getSubmittedPropertiesByOwnerId();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary/90 text-center sm:text-left">
          My Listed Properties
        </h1>
        <Button asChild size="lg">
            <Link href="/add-property">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Property
            </Link>
        </Button>
      </div>
      
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <NewPropertyCard key={property._id || property.id} property={property} /> // Changed property.propertyId to property.id
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ListChecks className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <p className="text-xl text-muted-foreground mb-4">
            You haven&apos;t listed any properties yet.
          </p>
          <p className="text-md text-muted-foreground/80 mb-8">
            Click the button above to add your first property!
          </p>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'My Properties | Estate Envision',
  description: 'Manage and view properties you have listed on Estate Envision.',
};
