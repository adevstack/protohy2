
'use server';

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import type { Favorite } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getPropertyById } from './property.actions'; // For getFavoritePropertiesForCurrentUser
import type { Property } from '@/lib/types';

const FAVORITES_COLLECTION_NAME = 'favourites';

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) {
    console.log('[FavoriteAction] getCurrentUserId: No accessToken cookie found.');
    return null;
  }
  const decodedToken = verifyAccessToken(accessToken);
  if (!decodedToken) {
    console.log('[FavoriteAction] getCurrentUserId: AccessToken verification failed.');
    return null;
  }
  console.log('[FavoriteAction] getCurrentUserId: User ID from token:', decodedToken.userId);
  return decodedToken.userId;
}

export async function addFavorite(propertyId: string): Promise<{ success: boolean; message?: string; isFavorite?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }

  if (!ObjectId.isValid(propertyId)) {
    return { success: false, message: 'Invalid property ID format.' };
  }

  try {
    const { db } = await connectToDatabase();
    const favoritesCollection = db.collection<Omit<Favorite, '_id'>>(FAVORITES_COLLECTION_NAME);

    const existingFavorite = await favoritesCollection.findOne({ 
      userId: userId, 
      propertyId: propertyId 
    });

    if (existingFavorite) {
      return { success: true, message: 'Property already in favorites.', isFavorite: true };
    }

    await favoritesCollection.insertOne({
      userId: userId,
      propertyId: propertyId,
      createdAt: new Date(),
    });
    
    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/favorites');

    return { success: true, message: 'Property added to favorites.', isFavorite: true };
  } catch (error) {
    console.error('[FavoriteAction] Error adding favorite:', error);
    return { success: false, message: 'Failed to add property to favorites.' };
  }
}

export async function removeFavorite(propertyId: string): Promise<{ success: boolean; message?: string; isFavorite?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }

  if (!ObjectId.isValid(propertyId)) {
    return { success: false, message: 'Invalid property ID format.' };
  }

  try {
    const { db } = await connectToDatabase();
    const favoritesCollection = db.collection(FAVORITES_COLLECTION_NAME);
    
    const result = await favoritesCollection.deleteOne({ 
      userId: userId, 
      propertyId: propertyId 
    });

    if (result.deletedCount === 0) {
        return { success: false, message: 'Favorite not found or already removed.', isFavorite: false };
    }
    
    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/favorites');

    return { success: true, message: 'Property removed from favorites.', isFavorite: false };
  } catch (error) {
    console.error('[FavoriteAction] Error removing favorite:', error);
    return { success: false, message: 'Failed to remove property from favorites.' };
  }
}

export async function isPropertyFavoriteForCurrentUser(propertyId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }
  if (!ObjectId.isValid(propertyId)) {
    return false;
  }

  try {
    const { db } = await connectToDatabase();
    const favoritesCollection = db.collection(FAVORITES_COLLECTION_NAME);
    const favorite = await favoritesCollection.findOne({ 
      userId: userId, 
      propertyId: propertyId
    });
    return !!favorite;
  } catch (error) {
    console.error('[FavoriteAction] Error checking if property is favorite:', error);
    return false;
  }
}

export async function getFavoritePropertyIdsForCurrentUser(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const { db } = await connectToDatabase();
    const favoritesCollection = db.collection<Favorite>(FAVORITES_COLLECTION_NAME);
    const favorites = await favoritesCollection.find({ userId: userId }).sort({ createdAt: -1 }).toArray();
    return favorites.map(fav => fav.propertyId);
  } catch (error) {
    console.error('[FavoriteAction] Error fetching favorite property IDs:', error);
    return [];
  }
}

export async function getFavoritePropertiesForCurrentUser(): Promise<Property[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return []; // Or handle as an error/redirect if page requires auth
  }

  const favoritePropertyIds = await getFavoritePropertyIdsForCurrentUser();
  if (favoritePropertyIds.length === 0) {
    return [];
  }

  const properties: Property[] = [];
  for (const propId of favoritePropertyIds) {
    const property = await getPropertyById(propId);
    if (property) {
      properties.push({ ...property, isFavorite: true }); // Mark as favorite
    }
  }
  return properties;
}

