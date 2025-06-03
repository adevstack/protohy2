
'use server';

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import type { Recommendation, Property, AppRecommendation } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { getUserById } from './auth.actions';
import { getPropertyById } from './property.actions';
import { revalidatePath } from 'next/cache';

const RECOMMENDATIONS_COLLECTION_NAME = 'recommendations';

async function getCurrentAuthenticatedUser(): Promise<{ id: string; email: string; name?: string } | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) {
    return null;
  }
  const decodedToken = verifyAccessToken(accessToken);
  if (!decodedToken) {
    return null;
  }
  // Fetch full user details to get name as well
  const user = await getUserById(decodedToken.userId);
  if (!user) return null;

  return { id: user.id, email: user.email, name: user.name };
}

export async function createRecommendation({
  propertyId,
  recipientEmail,
  message,
}: {
  propertyId: string;
  recipientEmail: string;
  message?: string;
}): Promise<{ success: boolean; message: string }> {
  const recommender = await getCurrentAuthenticatedUser();
  if (!recommender) {
    return { success: false, message: 'You must be logged in to send recommendations.' };
  }

  if (!propertyId || !ObjectId.isValid(propertyId)) {
    return { success: false, message: 'Invalid property ID.' };
  }

  if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
    return { success: false, message: 'Invalid recipient email address.' };
  }

  if (recommender.email.toLowerCase() === recipientEmail.toLowerCase()) {
    return { success: false, message: 'You cannot recommend a property to yourself.' };
  }

  try {
    const { db } = await connectToDatabase();
    const recommendationsCollection = db.collection<Omit<Recommendation, '_id'>>(RECOMMENDATIONS_COLLECTION_NAME);

    // Optional: Check if this exact recommendation already exists (e.g., same user, same property, same recipient)
    // For now, we'll allow multiple recommendations if the user chooses to send again.

    const newRecommendation: Omit<Recommendation, '_id'> = {
      recommenderUserId: recommender.id,
      recommenderEmail: recommender.email,
      recommenderName: recommender.name,
      recipientEmail: recipientEmail.toLowerCase(), // Store recipient email in lowercase for consistent matching
      propertyId,
      message: message?.trim() || undefined,
      createdAt: new Date(),
    };

    await recommendationsCollection.insertOne(newRecommendation);

    // Potentially revalidate paths if there's a page listing "sent recommendations" in future
    // revalidatePath('/my-sent-recommendations'); 

    return { success: true, message: 'Recommendation sent successfully!' };
  } catch (error) {
    console.error('[RecommendationAction] Error creating recommendation:', error);
    return { success: false, message: 'Failed to send recommendation. Please try again.' };
  }
}

export async function getReceivedRecommendations(): Promise<AppRecommendation[]> {
  const currentUser = await getCurrentAuthenticatedUser();
  if (!currentUser) {
    return [];
  }

  try {
    const { db } = await connectToDatabase();
    const recommendationsCollection = db.collection<Recommendation>(RECOMMENDATIONS_COLLECTION_NAME);

    const received = await recommendationsCollection
      .find({ recipientEmail: currentUser.email.toLowerCase() }) // Match by lowercase email
      .sort({ createdAt: -1 })
      .toArray();

    if (received.length === 0) {
      return [];
    }

    const enrichedRecommendations: AppRecommendation[] = [];

    for (const rec of received) {
      const property = await getPropertyById(rec.propertyId);
      if (property) {
        // Recommender user details might already be denormalized in `rec.recommenderName` and `rec.recommenderEmail`
        // If not, or if you want fresh data:
        // const recommenderUser = await getUserById(rec.recommenderUserId); 
        
        enrichedRecommendations.push({
          ...property,
          recommendationDetails: {
            recommenderName: rec.recommenderName || 'A user',
            recommenderEmail: rec.recommenderEmail,
            message: rec.message,
            recommendedAt: rec.createdAt.toISOString(),
          },
        });
      }
    }
    return enrichedRecommendations;
  } catch (error) {
    console.error('[RecommendationAction] Error fetching received recommendations:', error);
    return [];
  }
}
