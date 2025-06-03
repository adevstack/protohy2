
import jwt from 'jsonwebtoken';
import type { User } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h';

// Enhanced initial log for JWT_SECRET
console.log(
  '[JWT Module Loaded] JWT_SECRET status:',
  JWT_SECRET && JWT_SECRET.length > 0
    ? `DEFINED and NOT EMPTY. Starts with: '${JWT_SECRET.substring(0, Math.min(5, JWT_SECRET.length))}'...`
    : 'NOT DEFINED or EMPTY. This is a critical configuration issue.'
);

if (!JWT_SECRET || JWT_SECRET.length === 0) {
  console.error('[FATAL JWT ERROR] JWT_SECRET is not defined or is empty in .env. Authentication will not work. Please set JWT_SECRET and restart the server.');
  // In a real production app, you might throw an error here to stop the server from starting.
  // For development, this console error should be a strong warning.
}

interface AccessTokenPayload {
  userId: string;
  email: string;
  // Add any other fields you want in the token payload
}

export function generateAccessToken(user: Pick<User, 'id' | 'email'>): string {
  console.log('[JWT generateAccessToken] Attempting token generation for user:', user.email);

  if (!JWT_SECRET || JWT_SECRET.length === 0) {
    console.error('[JWT generateAccessToken] CRITICAL: JWT_SECRET is undefined or empty at the point of token generation. Cannot proceed. Payload:', user);
    throw new Error('JWT_SECRET is not available for token signing. Server configuration issue.');
  }
  // This log is safe because of the check above. JWT_SECRET is a non-empty string here.
  console.log(`[JWT generateAccessToken] Using JWT_SECRET (first 5 chars): '${JWT_SECRET.substring(0, Math.min(5, JWT_SECRET.length))}'...`);

  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
  };
  console.log('[JWT generateAccessToken] Payload to sign:', payload);
  console.log(`[JWT generateAccessToken] Expires in: ${JWT_ACCESS_TOKEN_EXPIRES_IN}`);

  let token: string | undefined;
  try {
    // JWT_SECRET is confirmed to be a non-empty string here.
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions);

    // Explicit check for token validity after signing
    if (typeof token !== 'string' || token.length === 0) {
      console.error('[JWT generateAccessToken] jwt.sign did not return a valid string token. Returned value:', token, '(type:', typeof token, ')');
      // This path indicates jwt.sign returned something other than a valid token string but didn't throw.
      throw new Error('Token generation failed: jwt.sign returned invalid or empty data.');
    }

    console.log('[JWT generateAccessToken] Token generated successfully (first 15 chars):', token.substring(0, 15) + '...');
    return token;

  } catch (error) {
    // This block catches errors from jwt.sign() itself or the explicit check above.
    console.error('[JWT generateAccessToken] Error during jwt.sign or subsequent processing:');
    if (error instanceof Error) {
      console.error(`  Error Name: ${error.name}`);
      console.error(`  Error Message: ${error.message}`);
    } else {
      console.error('  An unknown error occurred during signing:', error);
    }
    // Log context at the time of error
    // JWT_SECRET is known to be a non-empty string if this part of the try block is reached.
    console.error(`  Context: JWT_SECRET used (first 5 chars): '${JWT_SECRET.substring(0, Math.min(5, JWT_SECRET.length))}'...`);
    console.error(`  Context: JWT_ACCESS_TOKEN_EXPIRES_IN used: ${JWT_ACCESS_TOKEN_EXPIRES_IN}`);
    console.error(`  Context: Payload attempted:`, payload);
    
    throw new Error(`Failed to generate access token. Original error: ${error instanceof Error ? error.message : 'Internal server error.'}`);
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  console.log('[JWT verifyAccessToken] Attempting to verify token (first 15 chars):', token ? token.substring(0, 15) + '...' : 'Token is undefined/null/empty');

  if (!JWT_SECRET || JWT_SECRET.length === 0) {
    console.error('[JWT verifyAccessToken] CRITICAL: JWT_SECRET is undefined or empty. Cannot verify token.');
    return null;
  }
  if (!token) {
    console.log('[JWT verifyAccessToken] Token provided is invalid (null, undefined, or empty). Verification skipped.');
    return null;
  }
  // This log is safe because of the check above for JWT_SECRET.
  console.log(`[JWT verifyAccessToken] Using JWT_SECRET (first 5 chars): '${JWT_SECRET.substring(0, Math.min(5, JWT_SECRET.length))}'...`);

  try {
    // JWT_SECRET is confirmed to be a non-empty string here.
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    console.log('[JWT verifyAccessToken] Token verified successfully. Decoded payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('[JWT verifyAccessToken] Error verifying access token:');
    if (error instanceof Error) {
      console.error(`  Error Name: ${error.name}`); // e.g., JsonWebTokenError, TokenExpiredError
      console.error(`  Error Message: ${error.message}`);
    } else {
      console.error('  An unknown error occurred during verification:', error);
    }
    return null; // Return null on verification failure
  }
}
