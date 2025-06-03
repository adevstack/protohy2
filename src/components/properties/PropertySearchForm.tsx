
'use client';

import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import type { PropertyEnumType } from '@/lib/types';

const propertyTypes: PropertyEnumType[] = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Other'];

// Define a schema for search inputs (can be used with zodResolver if strict validation is needed)
interface SearchFormValues {
  keyword?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minAreaSqFt?: number;
  amenities?: string; // Comma-separated
  tags?: string;      // Comma-separated
  isVerified?: boolean;
}

export function PropertySearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultValues: SearchFormValues = {
    keyword: searchParams.get('keyword') || undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    city: searchParams.get('city') || undefined,
    state: searchParams.get('state') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minBedrooms: searchParams.get('minBedrooms') ? parseInt(searchParams.get('minBedrooms')!, 10) : undefined,
    minBathrooms: searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined,
    minAreaSqFt: searchParams.get('minAreaSqFt') ? Number(searchParams.get('minAreaSqFt')) : undefined,
    amenities: searchParams.get('amenities') || undefined,
    tags: searchParams.get('tags') || undefined,
    isVerified: searchParams.get('isVerified') === 'true' ? true : (searchParams.get('isVerified') === 'false' ? false : undefined),
  };

  const form = useForm<SearchFormValues>({
    defaultValues,
  });

  const onSubmit = (data: SearchFormValues) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (typeof value === 'boolean') {
          if (value === true) params.set(key, 'true'); // Only set if true for boolean 'isVerified'
        } else {
          params.set(key, String(value));
        }
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const handleClearFilters = () => {
    form.reset({
        keyword: undefined, propertyType: undefined, city: undefined, state: undefined,
        minPrice: undefined, maxPrice: undefined,
        minBedrooms: undefined, minBathrooms: undefined, minAreaSqFt: undefined,
        amenities: undefined, tags: undefined, isVerified: undefined,
    });
    router.push('/properties');
  };
  
  const hasActiveFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <Card className="mb-8 shadow-lg rounded-lg border border-border/60">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-2xl flex items-center text-primary">
          <Search className="mr-3 h-6 w-6" /> Advanced Property Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Keyword */}
            <div className="space-y-1.5">
              <Label htmlFor="keyword">Keyword (Title, Desc.)</Label>
              <Input id="keyword" placeholder="e.g., luxury villa, waterfront" {...form.register('keyword')} />
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select 
                onValueChange={(value) => form.setValue('propertyType', value === 'all' ? undefined : value)} 
                defaultValue={defaultValues.propertyType || 'all'}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Type</SelectItem>
                  {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="e.g., Miami" {...form.register('city')} />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="e.g., FL" {...form.register('state')} />
            </div>

            {/* Min Price */}
            <div className="space-y-1.5">
              <Label htmlFor="minPrice">Min Price (USD)</Label>
              <Input id="minPrice" type="number" placeholder="100000" {...form.register('minPrice', {setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10))})} />
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <Label htmlFor="maxPrice">Max Price (USD)</Label>
              <Input id="maxPrice" type="number" placeholder="500000" {...form.register('maxPrice', {setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10))})} />
            </div>

            {/* Min Bedrooms */}
            <div className="space-y-1.5">
              <Label htmlFor="minBedrooms">Min Bedrooms</Label>
              <Input id="minBedrooms" type="number" placeholder="2" {...form.register('minBedrooms', {setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10))})} />
            </div>
            
            {/* Min Bathrooms */}
            <div className="space-y-1.5">
              <Label htmlFor="minBathrooms">Min Bathrooms</Label>
              <Input id="minBathrooms" type="number" step="0.5" placeholder="1.5" {...form.register('minBathrooms', {setValueAs: (v) => (v === "" ? undefined : parseFloat(v))})} />
            </div>

            {/* Min Area SqFt */}
            <div className="space-y-1.5">
              <Label htmlFor="minAreaSqFt">Min Area (sq ft)</Label>
              <Input id="minAreaSqFt" type="number" placeholder="1000" {...form.register('minAreaSqFt', {setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10))})} />
            </div>
            
            {/* Amenities */}
            <div className="space-y-1.5">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input id="amenities" placeholder="pool, gym" {...form.register('amenities')} />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="modern, family-friendly" {...form.register('tags')} />
            </div>
            
            {/* Is Verified */}
            <div className="flex items-center space-x-2 pt-5">
                <Checkbox
                    id="isVerified"
                    checked={form.watch('isVerified') || false}
                    onCheckedChange={(checked) => form.setValue('isVerified', !!checked)}
                />
                <Label htmlFor="isVerified" className="font-medium text-sm">Show Only Verified Listings</Label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/60">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" /> Apply Filters
            </Button>
            {hasActiveFilters && (
                <Button type="button" variant="outline" size="lg" onClick={handleClearFilters} className="w-full sm:w-auto">
                    <X className="mr-2 h-5 w-5" /> Clear Filters
                </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
