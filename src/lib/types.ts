
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

// Renamed PropertyType to PropertyEnumType for clarity to avoid conflict with the interface name
export type PropertyEnumType = 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land' | 'Other';

export interface Property { // This is the AppPropertyType for the original 'properties' collection
  propertyId: string; 
  title: string;
  propertyType: PropertyEnumType; 
  location: {
    address?: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string; 
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  description?: string;
  amenities: string[]; 
  tags: string[]; 
  images: string[]; 
  thumbnailUrl?: string; 
  
  availableFrom?: string; // Date string (ISO 8601)
  isVerified?: boolean;
  
  colorTheme?: string; 
  
  ownerId?: string;
  createdAt?: string; // Date string (ISO 8601)
  updatedAt?: string; // Date string (ISO 8601)
  isFavorite?: boolean; // Added for favorites feature
}

export interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType; 
}

export interface Favorite {
  _id?: string; // MongoDB ObjectId as string
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface Recommendation {
  _id?: string; // MongoDB ObjectId
  recommenderUserId: string;
  recommenderEmail: string; // Denormalized for easy display on recipient side
  recommenderName?: string;  // Denormalized for easy display on recipient side
  recipientEmail: string;
  propertyId: string;
  message?: string;
  createdAt: Date; 
}

// Type for displaying recommendations with full property and enhanced details
export type AppRecommendation = Property & {
  recommendationDetails: {
    recommenderName?: string;
    recommenderEmail: string;
    message?: string;
    recommendedAt: string; // ISO Date string
  };
};

// --- Types for New User-Submitted Properties (stored in 'newproperties' collection) ---

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type ListedByType = 'Builder' | 'Owner' | 'Agent';
export type ListingType = 'sale' | 'rent';

export interface NewProperty {
  _id?: string; // MongoDB ObjectId as string
  id: string; // Custom ID like "PROP1000" (renamed from propertyId)
  title: string;
  propertyType: string; // e.g., "Bungalow", "Villa"
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[]; // From "lift|clubhouse|..."
  furnished: FurnishingStatus;
  availableFrom: string; // Date string (ISO 8601)
  listedBy: ListedByType;
  tags: string[]; // From "gated-community|corner-plot"
  colorTheme?: string; // Hex color, e.g., '#6ab45e'
  rating?: number;
  isVerified: boolean;
  listingType: ListingType;
  ownerId: string; // ID of the user who submitted this property
  createdAt: string; // Date string (ISO 8601)
  updatedAt: string; // Date string (ISO 8601)
}

// Input type for the AddPropertyForm, ownerId, createdAt, updatedAt will be set by the server action.
// _id is also server-generated.
export interface NewPropertyInput extends Omit<NewProperty, '_id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'isVerified' | 'amenities' | 'tags'> {
  // isVerified is set by admin or a system, not typically by user during initial submission in this basic form
  // For amenities and tags, the form will take a single string, to be processed into an array by the action.
  amenitiesString: string;
  tagsString: string;
  isVerified?: boolean; // Keep optional, default to false in action
}
