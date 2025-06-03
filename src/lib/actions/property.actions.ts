
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Property as AppPropertyType, PropertyEnumType } from '@/lib/types';
import { cookies } from 'next/headers'; 
import { verifyAccessToken } from '@/lib/jwt'; 
import { getFavoritePropertyIdsForCurrentUser } from './favorite.actions';

export interface MongoPropertyDocument {
  _id?: ObjectId;
  title: string;
  type: PropertyEnumType;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  city?: string; 
  state?: string; 
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  description?: string;
  amenities?: string | string[];
  tags?: string | string[];
  images?: string[];
  thumbnailUrl?: string;
  availableFrom?: string; 
  isVerified?: boolean;
  colorTheme?: string;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertySearchParams {
  keyword?: string;
  propertyType?: PropertyEnumType | string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minAreaSqFt?: number;
  amenities?: string; 
  tags?: string;      
  isVerified?: boolean | string; 
}


const processStringOrArrayField = (field?: string | string[]): string[] => {
  if (Array.isArray(field)) {
    return field.filter(item => typeof item === 'string');
  }
  if (typeof field === 'string') {
    return field.split(/[|,]/).map(s => s.trim()).filter(s => s.length > 0); // Split by comma or pipe
  }
  return [];
};

const mapDbPropertyToAppProperty = (dbDoc: MongoPropertyDocument, favoritePropertyIds: string[] = []): AppPropertyType => {
  const mappedLocation = {
    address: dbDoc.location?.address,
    city: dbDoc.city || dbDoc.location?.city || 'N/A',
    state: dbDoc.state || dbDoc.location?.state || 'N/A',
    zipCode: dbDoc.location?.zipCode,
    country: dbDoc.location?.country,
  };
  
  const propertyIdStr = dbDoc._id!.toString();

  return {
    propertyId: propertyIdStr,
    title: dbDoc.title,
    propertyType: dbDoc.type,
    location: mappedLocation,
    price: dbDoc.price,
    bedrooms: dbDoc.bedrooms,
    bathrooms: dbDoc.bathrooms,
    areaSqFt: dbDoc.areaSqFt,
    description: dbDoc.description,
    amenities: processStringOrArrayField(dbDoc.amenities),
    tags: processStringOrArrayField(dbDoc.tags),
    images: Array.isArray(dbDoc.images) ? dbDoc.images.filter(s => typeof s === 'string') : [],
    thumbnailUrl: dbDoc.thumbnailUrl,
    availableFrom: dbDoc.availableFrom,
    isVerified: dbDoc.isVerified === true,
    colorTheme: dbDoc.colorTheme,
    ownerId: dbDoc.ownerId,
    createdAt: dbDoc.createdAt?.toISOString(),
    updatedAt: dbDoc.updatedAt?.toISOString(),
    isFavorite: favoritePropertyIds.includes(propertyIdStr),
  };
};

export async function getAllProperties(searchParams?: PropertySearchParams): Promise<AppPropertyType[]> {
  console.log('[PropertyAction getAllProperties] Fetching properties with params:', searchParams);
  try {
    const { db } = await connectToDatabase();
    const propertiesCollection = db.collection<MongoPropertyDocument>('properties');
    
    let favoritePropertyIds: string[] = [];
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) {
      const decodedToken = verifyAccessToken(accessToken);
      const currentUserId = decodedToken?.userId || null;
      if (currentUserId) {
        favoritePropertyIds = await getFavoritePropertyIdsForCurrentUser();
      }
    }

    const mongoConditions: any[] = [];

    if (searchParams) {
      if (searchParams.keyword) {
        const keywordRegex = { $regex: searchParams.keyword, $options: 'i' };
        mongoConditions.push({
          $or: [
            { title: keywordRegex },
            { description: keywordRegex },
            { 'location.address': keywordRegex },
          ],
        });
      }

      if (searchParams.propertyType && searchParams.propertyType !== 'all' && searchParams.propertyType !== '') {
        mongoConditions.push({ type: searchParams.propertyType as PropertyEnumType });
      }

      if (searchParams.city) {
        const cityRegex = { $regex: searchParams.city, $options: 'i' };
        mongoConditions.push({
          $or: [{ 'location.city': cityRegex }, { city: cityRegex }],
        });
      }

      if (searchParams.state) {
        const stateRegex = { $regex: searchParams.state, $options: 'i' };
        mongoConditions.push({
          $or: [{ 'location.state': stateRegex }, { state: stateRegex }],
        });
      }

      const priceCondition: any = {};
      if (searchParams.minPrice !== undefined && !isNaN(searchParams.minPrice)) {
        priceCondition.$gte = searchParams.minPrice;
      }
      if (searchParams.maxPrice !== undefined && !isNaN(searchParams.maxPrice) && searchParams.maxPrice > 0) {
        priceCondition.$lte = searchParams.maxPrice;
      }
      if (Object.keys(priceCondition).length > 0) {
        mongoConditions.push({ price: priceCondition });
      }

      if (searchParams.minBedrooms !== undefined && !isNaN(searchParams.minBedrooms)) {
        mongoConditions.push({ bedrooms: { $gte: searchParams.minBedrooms } });
      }

      if (searchParams.minBathrooms !== undefined && !isNaN(searchParams.minBathrooms)) {
        mongoConditions.push({ bathrooms: { $gte: searchParams.minBathrooms } });
      }

      if (searchParams.minAreaSqFt !== undefined && !isNaN(searchParams.minAreaSqFt)) {
        mongoConditions.push({ areaSqFt: { $gte: searchParams.minAreaSqFt } });
      }
      
      const parseAndAddArrayFieldCondition = (fieldValue?: string, fieldName?: string) => {
        if (fieldValue && fieldName) {
          const itemsArray = fieldValue.split(',').map(item => item.trim().toLowerCase()).filter(item => item);
          if (itemsArray.length > 0) {
            mongoConditions.push({ [fieldName]: { $all: itemsArray.map(item => new RegExp(`^${item}$`, 'i')) } });
          }
        }
      };
      parseAndAddArrayFieldCondition(searchParams.amenities, 'amenities');
      parseAndAddArrayFieldCondition(searchParams.tags, 'tags');

      if (searchParams.isVerified !== undefined && (typeof searchParams.isVerified === 'boolean' || ['true', 'false'].includes(String(searchParams.isVerified).toLowerCase()))) {
        mongoConditions.push({ isVerified: String(searchParams.isVerified).toLowerCase() === 'true' });
      }
    }
    
    const filter = mongoConditions.length > 0 ? { $and: mongoConditions } : {};
    
    console.log("MongoDB Filter:", JSON.stringify(filter, null, 2));
    const propertiesFromDb = await propertiesCollection.find(filter).sort({ createdAt: -1 }).toArray();
    console.log(`[PropertyAction getAllProperties] Found ${propertiesFromDb.length} properties in DB with filter.`);

    const appProperties: AppPropertyType[] = propertiesFromDb.map(doc => mapDbPropertyToAppProperty(doc, favoritePropertyIds));
    
    console.log('[PropertyAction getAllProperties] Successfully fetched and mapped properties with search.');
    return appProperties;

  } catch (error) {
    console.error('[PropertyAction getAllProperties] Outer error fetching properties:', error);
    if (error instanceof Error) {
        console.error(`[PropertyAction getAllProperties] Error Type: ${error.name}, Message: ${error.message}`);
        if (error.stack) console.error(`[PropertyAction getAllProperties] Stack: ${error.stack}`);
    } else {
        console.error('[PropertyAction getAllProperties] An unknown error object was caught:', error);
    }
    return []; 
  }
}

export async function getPropertyById(id: string): Promise<AppPropertyType | null> {
  console.log(`[PropertyAction getPropertyById] Fetching property by ID: ${id}`);
  if (!ObjectId.isValid(id)) {
    console.warn(`[PropertyAction getPropertyById] Invalid ID format: ${id}`);
    return null;
  }

  try {
    const { db } = await connectToDatabase();
    const propertiesCollection = db.collection<MongoPropertyDocument>('properties');
    
    let favoritePropertyIds: string[] = [];
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) {
      const decodedToken = verifyAccessToken(accessToken);
      const currentUserId = decodedToken?.userId || null;
      if (currentUserId) {
        favoritePropertyIds = await getFavoritePropertyIdsForCurrentUser();
      }
    }
    
    const propertyFromDb = await propertiesCollection.findOne({ _id: new ObjectId(id) });

    if (!propertyFromDb) {
      console.log(`[PropertyAction getPropertyById] Property with ID ${id} not found.`);
      return null;
    }

    console.log(`[PropertyAction getPropertyById] Found property: ${propertyFromDb.title}`);
    return mapDbPropertyToAppProperty(propertyFromDb, favoritePropertyIds);
  } catch (error) {
    console.error(`[PropertyAction getPropertyById] Outer error fetching property ID ${id}:`, error);
    if (error instanceof Error) {
        console.error(`[PropertyAction getPropertyById ID: ${id}] Error Type: ${error.name}, Message: ${error.message}`);
        if (error.stack) console.error(`[PropertyAction getPropertyById ID: ${id}] Stack: ${error.stack}`);
    } else {
        console.error(`[PropertyAction getPropertyById ID: ${id}] An unknown error object was caught:`, error);
    }
    return null;
  }
}
