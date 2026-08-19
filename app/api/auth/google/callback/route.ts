import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, isAllowedEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/admin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin?error=missing_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/admin?error=server_misconfigured`);
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('OAuth token exchange failed:', tokenData);
      return NextResponse.redirect(`${baseUrl}/admin?error=token_exchange_failed`);
    }

    // 2. Fetch user profile
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userinfoResponse.json();

    if (!userinfoResponse.ok || !userData.email) {
      return NextResponse.redirect(`${baseUrl}/admin?error=failed_to_fetch_profile`);
    }

    const email = userData.email.toLowerCase().trim();

    // 3. Strict authorization check - ONLY ramasaiahemanth@gmail.com
    if (!isAllowedEmail(email)) {
      return NextResponse.redirect(
        `${baseUrl}/admin?error=unauthorized&attempted_email=${encodeURIComponent(email)}`
      );
    }

    // 4. Create signed session token
    const sessionToken = createSessionToken({
      email: email,
      name: userData.name || 'Hemanth',
      picture: userData.picture || '',
      loginAt: Date.now(),
    });

    // 5. Redirect to admin with cookie
    const response = NextResponse.redirect(`${baseUrl}/admin`);
    response.cookies.set('admin_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
    });

    // Also clear oauth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/admin?error=internal_auth_error`);
  }
}
