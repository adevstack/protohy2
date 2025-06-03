
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, UserCircle } from "lucide-react"; 
import { getAllProperties } from "@/lib/actions/property.actions";
import { PropertyCard } from "@/components/properties/PropertyCard";
import AuthStatusIndicator from "@/components/shared/AuthStatusIndicator";

export const dynamic = "force-dynamic"; // Ensures the page is dynamically rendered

export default async function HomePage() {
  const properties = await getAllProperties();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to <span className="text-accent">Estate Envision</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/80 sm:text-xl md:text-2xl">
            Discover your next home or investment property. Our platform offers comprehensive listings and smart tools to simplify your search.
          </p>
          <div className="mt-12 mb-10">
            <img
              src="https://images.unsplash.com/photo-1582647509711-c8aa8a8bda71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwcm9wZXJ0eXxlbnwwfHx8fDE3NDgzNTA3OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Modern house exterior with a beautiful landscape"
              width={600}
              height={338}
              className="mx-auto rounded-xl shadow-2xl w-full max-w-[600px] h-auto"
              data-ai-hint="modern house"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href="/properties">View Listings</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary text-primary hover:bg-primary/10">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Auth Status Section */}
      <section className="py-8 bg-secondary/10 dark:bg-secondary/5">
        <div className="container mx-auto px-4">
          <AuthStatusIndicator />
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 sm:py-24 bg-secondary/20 dark:bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-primary/90">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="h-8 w-8 text-primary" />}
              title="Advanced Search"
              description="Filter properties by price, location, amenities, and more with precision."
            />
            <FeatureCard
              icon={<UserCircle className="h-8 w-8 text-primary" />}
              title="Personalized Hub"
              description="Save favorites, manage your listings, view recommendations, and tailor your experience."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="AI-Powered Assistance"
              description="Utilize AI for tasks like generating engaging property descriptions for your listings."
            />
          </div>
        </div>
      </section>

      {/* Property Listings Section - Updated to use PropertyCard */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-primary/90">
            Featured Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties.slice(0, 4).map((property) => ( 
                <PropertyCard key={property.propertyId} property={property} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No properties found yet. Check back soon!</p>
            )}
          </div>
          {properties.length > 4 && (
            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/properties">View All Properties</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-8 bg-card rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-primary/10 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
