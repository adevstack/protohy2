
import { getReceivedRecommendations } from '@/lib/actions/recommendation.actions';
import { PropertyCard } from '@/components/properties/PropertyCard';
import type { AppRecommendation } from '@/lib/types';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Send, ServerCrash } from 'lucide-react'; // Using Send icon for consistency
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export default async function RecommendationsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Send className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to view your property recommendations.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const recommendations: AppRecommendation[] = await getReceivedRecommendations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-primary/90">
        Properties Recommended For You
      </h1>
      {recommendations.length > 0 ? (
        <div className="space-y-8">
          {recommendations.map((rec) => (
            <Card key={rec.propertyId + rec.recommendationDetails.recommendedAt} className="overflow-hidden shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary/80">
                  Recommended by: {rec.recommendationDetails.recommenderName || rec.recommendationDetails.recommenderEmail}
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(rec.recommendationDetails.recommendedAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              {rec.recommendationDetails.message && (
                <CardContent className="pb-0">
                  <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded-md">
                    &quot;{rec.recommendationDetails.message}&quot;
                  </p>
                </CardContent>
              )}
              <CardContent className="pt-4">
                 {/* Passing the base property object to PropertyCard */}
                <PropertyCard property={{
                    propertyId: rec.propertyId,
                    title: rec.title,
                    propertyType: rec.propertyType,
                    location: rec.location,
                    price: rec.price,
                    bedrooms: rec.bedrooms,
                    bathrooms: rec.bathrooms,
                    areaSqFt: rec.areaSqFt,
                    description: rec.description,
                    amenities: rec.amenities,
                    tags: rec.tags,
                    images: rec.images,
                    thumbnailUrl: rec.thumbnailUrl,
                    availableFrom: rec.availableFrom,
                    isVerified: rec.isVerified,
                    colorTheme: rec.colorTheme,
                    ownerId: rec.ownerId,
                    createdAt: rec.createdAt,
                    updatedAt: rec.updatedAt,
                    isFavorite: rec.isFavorite, // PropertyCard expects this
                }} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Send className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <p className="text-xl text-muted-foreground mb-4">
            No recommendations for you yet.
          </p>
          <p className="text-md text-muted-foreground/80 mb-8">
            When someone recommends a property to you, it will appear here.
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
  title: 'My Recommendations | Estate Envision',
  description: 'View properties recommended to you on Estate Envision.',
};
