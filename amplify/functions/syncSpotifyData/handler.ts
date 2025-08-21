import type { Schema } from '../../data/resource';

type Handler = Schema['syncSpotifyData']['functionHandler'];

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string }>;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images?: Array<{ url: string }>;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

interface SpotifyResponse {
  items?: any[];
}

export const handler: Handler = async (event) => {
  const { accessToken, refreshToken } = event.arguments;
  
  try {
    // Fetch user profile from Spotify
    const profileResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Spotify API error: ${profileResponse.status}`);
    }
    
    const profile = await profileResponse.json() as SpotifyProfile;
    
    // Fetch top artists (short term - last 4 weeks)
    const topArtistsResponse = await fetch(`${SPOTIFY_API_BASE}/me/top/artists?time_range=short_term&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const topArtists = await topArtistsResponse.json() as SpotifyResponse;
    
    // Fetch top tracks (short term)
    const topTracksResponse = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?time_range=short_term&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const topTracks = await topTracksResponse.json() as SpotifyResponse;
    
    // Fetch recently played
    const recentlyPlayedResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const recentlyPlayed = await recentlyPlayedResponse.json() as SpotifyResponse;
    
    // Analyze EDM genres from artists and tracks
    const edmGenres = analyzeEDMGenres(topArtists, topTracks, recentlyPlayed);
    
    // Extract top genres
    const genreMap = new Map<string, number>();
    (topArtists.items as SpotifyArtist[])?.forEach((artist) => {
      artist.genres?.forEach((genre: string) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    
    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre]) => genre);
    
    // Create user profile object matching the schema
    // Note: The mutation returns a UserProfile type which includes id, createdAt, updatedAt
    // These will be added by the GraphQL resolver/DynamoDB
    const userProfile = {
      id: `user-${profile.id}`, // DynamoDB will need an id field
      userId: profile.id,
      spotifyId: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      imageUrl: profile.images?.[0]?.url || '',
      spotifyRefreshToken: refreshToken || '',
      listeningData: {
        topTracks: (topTracks.items as SpotifyTrack[])?.slice(0, 10).map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists?.map((a) => a.name),
        })),
        recentlyPlayed: recentlyPlayed.items?.slice(0, 10).map((item: any) => ({
          trackId: item.track.id,
          trackName: item.track.name,
          artists: item.track.artists?.map((a: any) => a.name),
          playedAt: item.played_at,
        })),
        edmGenres,
      },
      topArtists: (topArtists.items as SpotifyArtist[])?.slice(0, 10).map((artist) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        imageUrl: artist.images?.[0]?.url,
      })),
      topGenres,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return userProfile;
  } catch (error) {
    console.error('Error syncing Spotify data:', error);
    throw error;
  }
};

function analyzeEDMGenres(topArtists: SpotifyResponse, topTracks: SpotifyResponse, recentlyPlayed: SpotifyResponse) {
  const edmKeywords = [
    'house', 'techno', 'trance', 'dubstep', 'bass', 'drum and bass', 
    'trap', 'hardstyle', 'progressive', 'deep house', 'future', 'tech house',
    'melodic', 'minimal', 'acid', 'breaks', 'garage', 'jungle', 'hardcore',
    'edm', 'electronic', 'dance', 'electro', 'ambient', 'downtempo'
  ];
  
  const genreCount = new Map<string, number>();
  
  // Analyze artists
  (topArtists.items as SpotifyArtist[])?.forEach((artist) => {
    artist.genres?.forEach((genre: string) => {
      const lowerGenre = genre.toLowerCase();
      if (edmKeywords.some(keyword => lowerGenre.includes(keyword))) {
        genreCount.set(genre, (genreCount.get(genre) || 0) + 3); // Weight for top artists
      }
    });
  });
  
  // Analyze recently played artists
  const recentArtists = new Set<string>();
  recentlyPlayed.items?.forEach((item: any) => {
    item.track.artists?.forEach((artist: any) => {
      recentArtists.add(artist.name);
    });
  });
  
  // Create EDM genre analysis
  return {
    topEDMGenres: Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count })),
    recentlyPlayed: Array.from(recentArtists).slice(0, 20).map(artist => ({
      genre: artist, // Use artist name as genre identifier for matching
      count: 1,
    })),
  };
}