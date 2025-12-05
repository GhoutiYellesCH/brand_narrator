
import { getFirebase } from '@/firebase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const { auth: adminAuth } = getFirebase();

/**
 * Creates a session cookie from a Firebase ID token.
 * This is used for server-side rendering and API routes to maintain user sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}


/**
 * Clears the session cookie, effectively signing the user out on the server side.
 */
export async function DELETE(request: NextRequest) {
  try {
    cookies().delete('__session');
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
