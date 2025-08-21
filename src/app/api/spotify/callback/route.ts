import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=spotify_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    const redirectUri = `${request.nextUrl.origin}/api/spotify/callback`;
    
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      console.error('Spotify token error:', await response.text());
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_failed', request.url));
    }

    const tokenData = await response.json();
    
    // Store tokens in cookies (in production, store in database)
    const redirectResponse = NextResponse.redirect(new URL('/dashboard/settings?spotify=connected', request.url));
    
    // Set secure HTTP-only cookies
    redirectResponse.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
    });
    
    redirectResponse.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return redirectResponse;
  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=unknown', request.url));
  }
}