
'use server';

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import type { NewProperty, NewPropertyInput, FurnishingStatus, ListedByType, ListingType } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export interface MongoNewPropertyDocument {
  _id?: ObjectId;
  id: string; // Renamed from propertyId
  title: string;
  propertyType: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: FurnishingStatus;
  availableFrom: string;
  listedBy: ListedByType;
  tags: string[];
  colorTheme?: string;
  rating?: number;
  isVerified: boolean;
  listingType: ListingType;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const NEW_PROPERTIES_COLLECTION = 'newproperties';

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) return null;
  const decodedToken = verifyAccessToken(accessToken);
  return decodedToken?.userId || null;
}

const mapMongoNewPropertyToApp = (doc: MongoNewPropertyDocument): NewProperty => {
  return {
    _id: doc._id!.toString(),
    id: doc.id, // Renamed from propertyId
    title: doc.title,
    propertyType: doc.propertyType,
    price: doc.price,
    state: doc.state,
    city: doc.city,
    areaSqFt: doc.areaSqFt,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    amenities: doc.amenities || [],
    furnished: doc.furnished,
    availableFrom: doc.availableFrom, 
    listedBy: doc.listedBy,
    tags: doc.tags || [],
    colorTheme: doc.colorTheme,
    rating: doc.rating,
    isVerified: doc.isVerified,
    listingType: doc.listingType,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export async function addSubmittedProperty(
  data: NewPropertyInput
): Promise<{ success: boolean; message?: string; property?: NewProperty }> {
  const ownerId = await getCurrentUserId();
  if (!ownerId) {
    return { success: false, message: 'User not authenticated. Please log in.' };
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<MongoNewPropertyDocument>(NEW_PROPERTIES_COLLECTION);

    // Validate or ensure id is unique if it's user-provided and meant to be unique
    const existingPropertyById = await collection.findOne({ id: data.id });
    if (existingPropertyById) {
      return { success: false, message: `Property ID "${data.id}" already exists. Please use a unique ID.` };
    }
    
    const now = new Date();
    const newDocument: MongoNewPropertyDocument = {
      id: data.id, // Renamed from propertyId
      title: data.title,
      propertyType: data.propertyType,
      price: Number(data.price),
      state: data.state,
      city: data.city,
      areaSqFt: Number(data.areaSqFt),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      amenities: data.amenitiesString.split(/[,|]/).map(s => s.trim()).filter(s => s),
      furnished: data.furnished,
      availableFrom: data.availableFrom, 
      listedBy: data.listedBy,
      tags: data.tagsString.split(/[,|]/).map(s => s.trim()).filter(s => s),
      colorTheme: data.colorTheme,
      rating: data.rating ? Number(data.rating) : undefined,
      isVerified: data.isVerified || false, 
      listingType: data.listingType,
      ownerId: ownerId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newDocument);
    if (!result.insertedId) {
      throw new Error('Failed to insert property into database.');
    }

    const insertedProperty = mapMongoNewPropertyToApp({ ...newDocument, _id: result.insertedId });
    
    revalidatePath('/my-properties'); 

    return { success: true, message: 'Property added successfully!', property: insertedProperty };

  } catch (error) {
    console.error('Error in addSubmittedProperty:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}

export async function getSubmittedPropertiesByOwnerId(): Promise<NewProperty[]> {
  const ownerId = await getCurrentUserId();
  if (!ownerId) {
    return []; 
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<MongoNewPropertyDocument>(NEW_PROPERTIES_COLLECTION);
    const documents = await collection.find({ ownerId: ownerId }).sort({ createdAt: -1 }).toArray();
    return documents.map(mapMongoNewPropertyToApp);
  } catch (error) {
    console.error('Error in getSubmittedPropertiesByOwnerId:', error);
    return [];
  }
}

export async function getAllSubmittedProperties(): Promise<NewProperty[]> {
   try {
    const { db } = await connectToDatabase();
    const collection = db.collection<MongoNewPropertyDocument>(NEW_PROPERTIES_COLLECTION);
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return documents.map(mapMongoNewPropertyToApp);
  } catch (error) {
    console.error('Error in getAllSubmittedProperties:', error);
    return [];
  }
}
