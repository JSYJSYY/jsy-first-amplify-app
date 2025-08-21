'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

const EDM_GENRES = [
  { id: 'house', name: 'House', color: '#FF6B6B' },
  { id: 'techno', name: 'Techno', color: '#4ECDC4' },
  { id: 'trance', name: 'Trance', color: '#45B7D1' },
  { id: 'dubstep', name: 'Dubstep', color: '#96CEB4' },
  { id: 'drum-and-bass', name: 'Drum & Bass', color: '#FFEAA7' },
  { id: 'hardstyle', name: 'Hardstyle', color: '#DDA0DD' },
  { id: 'trap', name: 'Trap', color: '#FF69B4' },
  { id: 'future-bass', name: 'Future Bass', color: '#00CED1' },
  { id: 'progressive', name: 'Progressive', color: '#FFD700' },
  { id: 'deep-house', name: 'Deep House', color: '#FF1493' },
  { id: 'tech-house', name: 'Tech House', color: '#00FF00' },
  { id: 'melodic', name: 'Melodic', color: '#FF4500' },
  { id: 'minimal', name: 'Minimal', color: '#708090' },
  { id: 'psytrance', name: 'Psytrance', color: '#9370DB' },
  { id: 'hardcore', name: 'Hardcore', color: '#DC143C' },
  { id: 'electro', name: 'Electro', color: '#00BFFF' },
  { id: 'breaks', name: 'Breaks', color: '#FF8C00' },
  { id: 'garage', name: 'Garage', color: '#8B4513' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadUserPreferences();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    // Load from localStorage or database
    const saved = localStorage.getItem('userGenres');
    if (saved) {
      setSelectedGenres(JSON.parse(saved));
    }
    
    const spotifyToken = localStorage.getItem('spotifyAccessToken');
    setSpotifyConnected(!!spotifyToken);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      const updated = prev.includes(genreId)
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId];
      
      // Save to localStorage
      localStorage.setItem('userGenres', JSON.stringify(updated));
      return updated;
    });
  };

  const connectSpotify = () => {
    // Store current user session
    sessionStorage.setItem('pendingSpotifyConnect', 'true');
    
    // Check if we have Spotify credentials configured
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_CLIENT_ID') {
      alert('Spotify integration is not configured yet. Please follow the setup guide to add your Spotify app credentials.');
      return;
    }
    
    // Use environment variable for production URL or current origin for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const redirectUri = `${baseUrl}/api/spotify/callback`;
    
    const scopes = [
      'user-read-recently-played',
      'user-top-read',
      'user-read-private',
      'user-read-email'
    ].join(' ');
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    
    console.log('Spotify Auth URL:', authUrl);
    console.log('Redirect URI:', redirectUri);
    
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="cyber-neon text-2xl font-mono" style={{color: 'var(--cyber-cyan)'}}>
          LOADING PREFERENCES...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="scan-line"></div>
      
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-sm cyber-border border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-2xl font-bold font-mono flex items-center gap-2"
            >
              <span style={{color: 'var(--cyber-cyan)'}}>←</span>
              <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
            </button>
            
            <div className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              {'>> PREFERENCE MATRIX'}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Spotify Connection Section */}
        <div className="cyber-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 cyber-neon" style={{color: 'var(--cyber-cyan)'}}>
            SPOTIFY INTEGRATION
          </h2>
          
          {spotifyConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono" style={{color: 'var(--cyber-neon-green)'}}>
                    ✓ SPOTIFY CONNECTED
                  </p>
                  <p className="text-sm font-mono text-gray-400 mt-1">
                    Your listening data enhances recommendations
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('spotifyAccessToken');
                    setSpotifyConnected(false);
                  }}
                  className="px-4 py-2 cyber-border font-mono text-sm hover:bg-red-500/20 transition-all"
                  style={{color: 'var(--cyber-hot-pink)'}}
                >
                  DISCONNECT
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-mono text-gray-400">
                Connect Spotify to automatically analyze your music taste
              </p>
              <button
                onClick={connectSpotify}
                className="px-6 py-3 font-mono font-bold cyber-border transition-all transform hover:scale-105 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1DB954, #191414)',
                  color: '#FFFFFF',
                }}
              >
                <span className="text-2xl">🎵</span>
                CONNECT SPOTIFY
              </button>
            </div>
          )}
        </div>

        {/* Genre Selection Section */}
        <div className="cyber-card p-8">
          <h2 className="text-2xl font-bold mb-2 cyber-neon" style={{color: 'var(--cyber-hot-pink)'}}>
            EDM GENRE PREFERENCES
          </h2>
          <p className="font-mono text-sm text-gray-400 mb-6">
            {spotifyConnected 
              ? 'Fine-tune your preferences in addition to Spotify data'
              : 'Select your favorite EDM sub-genres for personalized recommendations'
            }
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {EDM_GENRES.map(genre => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`p-4 cyber-border font-mono text-sm transition-all transform hover:scale-105 ${
                  selectedGenres.includes(genre.id) 
                    ? 'cyber-hologram' 
                    : 'hover:bg-gray-800/50'
                }`}
                style={{
                  background: selectedGenres.includes(genre.id) 
                    ? `linear-gradient(135deg, ${genre.color}40, ${genre.color}20)`
                    : 'transparent',
                  borderColor: selectedGenres.includes(genre.id) ? genre.color : 'var(--cyber-cyan)',
                  color: selectedGenres.includes(genre.id) ? genre.color : 'var(--cyber-cyan)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{genre.name}</span>
                  {selectedGenres.includes(genre.id) && (
                    <span style={{color: 'var(--cyber-neon-green)'}}>✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="font-mono text-sm" style={{color: 'var(--cyber-magenta)'}}>
              {selectedGenres.length} genres selected
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 font-mono font-bold cyber-border cyber-hologram transition-all transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00FFFF, #FF69B4)',
              color: '#000000',
            }}
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
}