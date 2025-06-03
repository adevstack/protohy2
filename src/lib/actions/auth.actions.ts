
'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { connectToDatabase, type MongoUserDocument } from '@/lib/mongodb';
import type { User } from '@/lib/types';
import { generateAccessToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

interface AuthResult {
  success: boolean;
  message?: string;
  user?: Omit<User, 'hashedPassword'>;
}

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';

export async function loginUser(credentials: { email: string; password: string }): Promise<AuthResult> {
  // Absolute first log to confirm entry
  console.log(`[AuthAction loginUser SERVER LOG - ENTRY POINT] Function called for email: ${credentials.email}`);

  if (!process.env.JWT_SECRET) {
    console.error("[AuthAction loginUser SERVER LOG] CRITICAL: JWT_SECRET is not available in process.env within loginUser action!");
    return { success: false, message: 'Server configuration error (JWT_SECRET missing).' };
  } else {
    console.log("[AuthAction loginUser SERVER LOG] JWT_SECRET is available in process.env within loginUser action.");
  }

  try {
    console.log("[AuthAction loginUser SERVER LOG] Attempting to connect to database...");
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<MongoUserDocument>('users');
    console.log("[AuthAction loginUser SERVER LOG] Database connected. Collection 'users' obtained.");

    console.log(`[AuthAction loginUser SERVER LOG] Searching for user with email: ${credentials.email}`);
    const userRecord = await usersCollection.findOne({ email: credentials.email });

    if (userRecord) {
      console.log(`[AuthAction loginUser SERVER LOG] Raw userRecord from DB for email ${credentials.email}:`, JSON.stringify(userRecord).substring(0, 500) + '...');
      console.log(`[AuthAction loginUser SERVER LOG] All keys in userRecord: ${Object.keys(userRecord).join(', ')}`);
    } else {
      console.warn(`[AuthAction loginUser SERVER LOG] User not found in DB for email: ${credentials.email}`);
      return { success: false, message: 'Invalid email or password. (User not found)' };
    }
    
    if (typeof userRecord.hashedPassword !== 'string' || !userRecord.hashedPassword) {
      console.warn(`[AuthAction loginUser SERVER LOG] User ${userRecord.email} found, but hashedPassword field is missing, not a string, or empty.`);
      console.log(`[AuthAction loginUser SERVER LOG] Value of userRecord.hashedPassword: ${userRecord.hashedPassword}`);
      console.log(`[AuthAction loginUser SERVER LOG] Type of userRecord.hashedPassword: ${typeof userRecord.hashedPassword}`);
      return { success: false, message: 'Invalid email or password. (User data integrity issue)' };
    }
    console.log(`[AuthAction loginUser SERVER LOG] Found valid hashedPassword for user: ${userRecord.email}. Comparing provided password (length: ${credentials.password.length}) with stored hash (first 10 chars: ${userRecord.hashedPassword.substring(0, 10)}...).`);

    const isPasswordMatch = await bcrypt.compare(credentials.password, userRecord.hashedPassword);
    console.log(`[AuthAction loginUser SERVER LOG] Password match result for user ${userRecord.email}: ${isPasswordMatch}`);

    if (isPasswordMatch) {
      const appUser: User = {
        id: userRecord._id!.toString(),
        email: userRecord.email,
        name: userRecord.name,
        avatarUrl: userRecord.avatarUrl,
      };
      console.log(`[AuthAction loginUser SERVER LOG] Password match for ${appUser.email}. Generating access token...`);
      const accessToken = generateAccessToken(appUser);
      console.log(`[AuthAction loginUser SERVER LOG] Access token generated. Setting cookie: ${ACCESS_TOKEN_COOKIE_NAME}`);

      cookies().set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
      
      // DEBUG LOG: Confirm cookie is set
      const cookieHeader = cookies().get(ACCESS_TOKEN_COOKIE_NAME);
      if (cookieHeader) {
        console.log(`[AuthAction loginUser SERVER LOG] DEBUG: Cookie '${ACCESS_TOKEN_COOKIE_NAME}' was set. Value (first 15 chars): ${cookieHeader.value.substring(0, 15)}...`);
      } else {
        console.error(`[AuthAction loginUser SERVER LOG] DEBUG: FAILED to retrieve cookie '${ACCESS_TOKEN_COOKIE_NAME}' immediately after setting.`);
      }
      
      console.log(`[AuthAction loginUser SERVER LOG] Login successful, token cookie set for user: ${appUser.email}`);
      const { ...userToReturn } = appUser;
      return {
        success: true,
        message: 'Logged in successfully!',
        user: userToReturn,
      };
    } else {
      console.warn(`[AuthAction loginUser SERVER LOG] Password mismatch for user: ${userRecord.email}`);
      return { success: false, message: 'Invalid email or password. (Password mismatch)' };
    }
  } catch (error) {
    console.error(`[AuthAction loginUser SERVER LOG] ========= ERROR DURING LOGIN PROCESS =========`);
    console.error(`[AuthAction loginUser SERVER LOG] Email attempted: ${credentials.email}`);
    if (error instanceof Error) {
        console.error(`[AuthAction loginUser SERVER LOG] Error Type: ${error.name}`);
        console.error(`[AuthAction loginUser SERVER LOG] Error Message: ${error.message}`);
        if (error.stack) {
            console.error(`[AuthAction loginUser SERVER LOG] Stack Trace:\n${error.stack}`);
        } else {
            console.error(`[AuthAction loginUser SERVER LOG] No stack trace available.`);
        }
    } else {
        console.error('[AuthAction loginUser SERVER LOG] An unknown error object was caught:', error);
    }
    console.error(`[AuthAction loginUser SERVER LOG] ============================================`);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login.';
    return {
      success: false,
      message: `Login failed: ${errorMessage}`,
    };
  }
}

export async function registerUser(userData: { name: string; email: string; password: string }): Promise<Omit<AuthResult, 'user'>> {
  console.log('[AuthAction registerUser SERVER LOG - ENTRY POINT] Registration attempt for email:', userData.email);
  
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<MongoUserDocument>('users');

    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      console.warn('[AuthAction registerUser SERVER LOG] Email already in use:', userData.email);
      return { success: false, message: 'Email already in use.' };
    }
    console.log('[AuthAction registerUser SERVER LOG] Hashing password for:', userData.email);
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    console.log('[AuthAction registerUser SERVER LOG] Password hashed. Creating new user document.');
    
    const newUserDocument: Omit<MongoUserDocument, '_id'> = {
      email: userData.email,
      name: userData.name,
      hashedPassword: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUserDocument);

    if (!result.insertedId) {
      console.error('[AuthAction registerUser SERVER LOG] Failed to insert user into database.');
      return { success: false, message: 'Failed to register user due to a database error.' };
    }
    
    console.log('[AuthAction registerUser SERVER LOG] Registration successful for user:', userData.email, 'ID:', result.insertedId.toString());
    return {
      success: true,
      message: 'Account created successfully! Please log in.',
    };
  } catch (error) {
    console.error('[AuthAction registerUser SERVER LOG] Error during registration process for email', userData.email, ':', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during registration: ${errorMessage}`,
    };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  console.log('[AuthAction logoutUser SERVER LOG - ENTRY POINT] Logout attempt');
  try {
    cookies().delete(ACCESS_TOKEN_COOKIE_NAME);
    console.log('[AuthAction logoutUser SERVER LOG] Logout successful: Access token cookie deleted.');
    return { success: true };
  } catch (error) {
    console.error('[AuthAction logoutUser SERVER LOG] Error during logout process:', error);
    return { success: false };
  }
}

export async function getUserById(userId: string): Promise<Omit<User, 'hashedPassword'> | null> {
  console.log(`[AuthAction getUserById SERVER LOG - ENTRY POINT] Attempting to fetch user with ID: ${userId}`);
  if (!ObjectId.isValid(userId)) {
    console.warn(`[AuthAction getUserById SERVER LOG] Invalid user ID format: ${userId}`);
    return null;
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<MongoUserDocument>('users');
    const userRecord = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!userRecord) {
      console.log(`[AuthAction getUserById SERVER LOG] User not found for ID: ${userId}`);
      return null;
    }

     const appUser: User = {
        id: userRecord._id!.toString(), 
        email: userRecord.email,
        name: userRecord.name,
        avatarUrl: userRecord.avatarUrl,
      };

    console.log(`[AuthAction getUserById SERVER LOG] User found for ID: ${userId}. Email: ${appUser.email}`);
    return appUser;
  } catch (error) {
    console.error(`[AuthAction getUserById SERVER LOG] Error fetching user by ID ${userId}:`, error);
    return null;
  }
}

export async function loginDemoUser(): Promise<AuthResult> {
  console.log('[AuthAction loginDemoUser SERVER LOG - ENTRY POINT] Demo Login attempt');
  const demoCredentials = {
    email: 'demo@gmail.com', 
    password: '123456789',  
  };
  console.log('[AuthAction loginDemoUser SERVER LOG] Calling loginUser with demo credentials:', demoCredentials.email);
  const result = await loginUser(demoCredentials);
  if (result.success) {
    console.log('[AuthAction loginDemoUser SERVER LOG] Demo login successful.');
    return { ...result, message: "Logged in as Demo User!" };
  }
  console.error('[AuthAction loginDemoUser SERVER LOG] Demo Login Failed. Reason from loginUser:', result.message);
  return result;
}
