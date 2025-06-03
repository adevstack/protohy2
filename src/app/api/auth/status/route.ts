
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { getUserById } from '@/lib/actions/auth.actions';

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

export async function GET() {
  console.log('[API /auth/status ENTRY] Received GET request.');
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    console.log('[API /auth/status] No accessToken cookie found.');
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 });
  }
  console.log('[API /auth/status] AccessToken cookie found (first 15 chars):', accessToken.substring(0, 15) + '...');

  console.log('[API /auth/status] Attempting to verify AccessToken...');
  const decodedToken = verifyAccessToken(accessToken);

  if (!decodedToken) {
    console.log('[API /auth/status] AccessToken verification failed (verifyAccessToken returned null). Clearing cookie.');
    cookieStore.delete('accessToken');
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 });
  }
  console.log('[API /auth/status] AccessToken verified. Decoded User ID:', decodedToken.userId, 'Email:', decodedToken.email);

  try {
    console.log(`[API /auth/status] Attempting to fetch user from DB with ID: ${decodedToken.userId}`);
    const user = await getUserById(decodedToken.userId);
    if (user) {
      console.log(`[API /auth/status] User found in DB for ID: ${decodedToken.userId}. User details:`, {id: user.id, email: user.email, name: user.name});
      return NextResponse.json({ isAuthenticated: true, user }, { status: 200 });
    } else {
      console.log(`[API /auth/status] User ID from token (${decodedToken.userId}) not found in DB. Clearing cookie.`);
      cookieStore.delete('accessToken');
      return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 });
    }
  } catch (error) {
    console.error('[API /auth/status] Server error during getUserById or subsequent processing:', error);
    return NextResponse.json({ isAuthenticated: false, user: null, error: 'Server error checking auth status' }, { status: 500 });
  }
}
