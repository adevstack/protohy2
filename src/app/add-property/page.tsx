
import { AddPropertyForm } from '@/components/properties/AddPropertyForm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

// Ensure this page is dynamically rendered because it checks auth status
export const dynamic = 'force-dynamic'; 

export default async function AddPropertyPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Authentication Required</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to add a new property.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login to Add Property</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center p-6">
          <CardTitle className="text-3xl font-bold text-primary">List Your Property</CardTitle>
          <CardDescription>Fill in the details below to add your property to our platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <AddPropertyForm />
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'Add New Property | Estate Envision',
  description: 'List your property on Estate Envision and reach potential buyers or renters.',
};
