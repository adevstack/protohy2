
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { addSubmittedProperty } from '@/lib/actions/new-property.actions';
import type { NewPropertyInput, FurnishingStatus, ListedByType, ListingType } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

const furnishingStatuses: FurnishingStatus[] = ['Unfurnished', 'Semi-Furnished', 'Furnished'];
const listedByTypes: ListedByType[] = ['Owner', 'Agent', 'Builder'];
const listingTypes: ListingType[] = ['sale', 'rent'];
const propertyTypesExamples: string[] = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Bungalow', 'Land', 'Other'];


const formSchema = z.object({
  id: z.string().min(3, { message: 'Property ID must be at least 3 characters (e.g., PROP001).' }), // Renamed from propertyId
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  propertyType: z.string().min(1, { message: 'Please select or enter a property type.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  state: z.string().min(2, { message: 'State is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  areaSqFt: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms cannot be negative.' }),
  bathrooms: z.coerce.number().min(0, { message: 'Bathrooms cannot be negative.' }),
  amenitiesString: z.string().optional().default(""),
  furnished: z.enum(furnishingStatuses, { errorMap: () => ({ message: "Please select a furnishing status."}) }),
  availableFrom: z.date({ required_error: "Available date is required."}),
  listedBy: z.enum(listedByTypes, { errorMap: () => ({ message: "Please select who listed this property."}) }),
  tagsString: z.string().optional().default(""),
  colorTheme: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: 'Must be a valid hex color (e.g., #RRGGBB or #RGB).' }).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  isVerified: z.boolean().default(false).optional(),
  listingType: z.enum(listingTypes, { errorMap: () => ({ message: "Please select a listing type."}) }),
});


export function AddPropertyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '', // Renamed from propertyId
      title: '',
      propertyType: '',
      price: 0,
      state: '',
      city: '',
      areaSqFt: 0,
      bedrooms: 0,
      bathrooms: 0,
      amenitiesString: '',
      furnished: 'Unfurnished',
      availableFrom: new Date(),
      listedBy: 'Owner',
      tagsString: '',
      colorTheme: '#6ab45e', 
      rating: 0,
      isVerified: false,
      listingType: 'sale',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const propertyData: NewPropertyInput = {
      ...values,
      availableFrom: format(values.availableFrom, 'yyyy-MM-dd'), 
    };

    try {
      const result = await addSubmittedProperty(propertyData);
      if (result.success && result.property) {
        toast({
          title: 'Success!',
          description: result.message || `Property "${result.property.title}" added.`,
        });
        form.reset(); 
        router.push('/my-properties'); 
      } else {
        toast({
          title: 'Error Adding Property',
          description: result.message || 'Could not add property. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'An unexpected error occurred during submission.',
        variant: 'destructive',
      });
      console.error("Add property form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id" // Renamed from propertyId
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property ID (e.g., PROP123)</FormLabel>
                <FormControl><Input placeholder="PROP123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Title</FormLabel>
                <FormControl><Input placeholder="Spacious 3BHK Apartment" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyTypesExamples.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl><Input type="number" placeholder="250000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="e.g., Coimbatore" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl><Input placeholder="e.g., Tamil Nadu" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="areaSqFt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (sq ft)</FormLabel>
                <FormControl><Input type="number" placeholder="1200" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl><Input type="number" placeholder="3" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl><Input type="number" step="0.5" placeholder="2.5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="furnished"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Furnishing Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {furnishingStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="availableFrom"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Available From</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="listedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listed By</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select lister type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {listedByTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="listingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select listing type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {listingTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colorTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Theme (Hex)</FormLabel>
                <FormControl><Input type="color" placeholder="#6ab45e" {...field} className="p-1 h-10" /></FormControl>
                <FormDescription>E.g., #FF5733</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="4.5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amenitiesString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl><Textarea placeholder="e.g., pool, gym, parking" {...field} rows={3} /></FormControl>
              <FormDescription>Comma or pipe (|) separated list of amenities.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagsString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl><Textarea placeholder="e.g., luxury, family-friendly, near-park" {...field} rows={3} /></FormControl>
              <FormDescription>Comma or pipe (|) separated list of tags.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="isVerified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Verified Listing?
                  </FormLabel>
                  <FormDescription>
                    Check if this property listing is verified (admin/system controlled).
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Property
        </Button>
      </form>
    </Form>
  );
}
