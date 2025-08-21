'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import type { Schema } from '../../../amplify/data/resource';

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [selectedCity, setSelectedCity] = useState('San Francisco');

  useEffect(() => {
    checkAuth();
    fetchEvents();
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

  const fetchEvents = async () => {
    try {
      // Call our Lambda function to fetch EDM events
      const result = await client.mutations.fetchEDMEvents({
        city: selectedCity,
        state: 'CA',
      });
      
      if (result.data) {
        const eventsData = JSON.parse(result.data as string);
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Use mock data as fallback
      setEvents(generateMockEvents());
    }
  };

  const generateMockEvents = () => {
    return [
      {
        id: '1',
        name: 'Lane 8 presents This Never Happened',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        venue: { name: 'The Great Northern', city: 'San Francisco', state: 'CA' },
        artists: [{ name: 'Lane 8' }, { name: 'Yotto' }],
        genres: ['Deep House', 'Progressive House'],
        imageUrl: 'https://source.unsplash.com/400x400/?concert,edm',
      },
      {
        id: '2',
        name: 'Charlotte de Witte: Formula',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        venue: { name: 'Public Works', city: 'San Francisco', state: 'CA' },
        artists: [{ name: 'Charlotte de Witte' }],
        genres: ['Techno'],
        imageUrl: 'https://source.unsplash.com/400x400/?techno,rave',
      },
      {
        id: '3',
        name: 'ODESZA: The Last Goodbye Tour',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        venue: { name: 'Bill Graham Civic', city: 'San Francisco', state: 'CA' },
        artists: [{ name: 'ODESZA' }],
        genres: ['Future Bass', 'Electronic'],
        imageUrl: 'https://source.unsplash.com/400x400/?festival,music',
      },
    ];
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="cyber-neon text-2xl font-mono" style={{color: 'var(--cyber-cyan)'}}>
          LOADING PULSE DATA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="scan-line"></div>
      
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-sm cyber-border border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-mono">
                <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
              </h1>
              <div className="ml-4 text-xs font-mono" style={{color: 'var(--cyber-magenta)'}}>
                {'>> PULSE INTERFACE ACTIVE'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="cyber-border bg-black/50 p-1 flex">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 font-mono transition-all ${
                    activeView === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  LIST VIEW
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-4 py-2 font-mono transition-all ${
                    activeView === 'map' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  MAP VIEW
                </button>
              </div>
              
              {user && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="p-2 cyber-border hover:bg-purple-500/20 transition-all"
                    style={{color: 'var(--cyber-magenta)'}}
                    title="Settings"
                  >
                    ⚙️
                  </button>
                  <div className="cyber-border px-3 py-1 bg-black/50">
                    <span className="text-sm font-mono" style={{color: 'var(--cyber-neon-green)'}}>
                      USER: {user.username?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 cyber-border hover:bg-red-500/20 transition-all"
                    style={{color: 'var(--cyber-hot-pink)'}}
                  >
                    DISCONNECT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-black/80 backdrop-blur-sm cyber-border border-r relative z-10 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-cyan)'}}>
                LOCATION
              </h3>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-black cyber-border text-white font-mono"
              >
                <option value="San Francisco">San Francisco</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="New York">New York</option>
                <option value="Miami">Miami</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-hot-pink)'}}>
                FILTERS
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 cyber-border hover:bg-gray-800/50 transition-all font-mono" style={{color: 'var(--cyber-neon-green)'}}>
                  THIS WEEK
                </button>
                <button className="w-full text-left px-4 py-2 cyber-border hover:bg-gray-800/50 transition-all font-mono" style={{color: 'var(--cyber-orange)'}}>
                  WISHLIST
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-electric-blue)'}}>
                STATS
              </h3>
              <div className="cyber-border bg-black/70 p-4 space-y-2 text-sm">
                <div className="flex justify-between font-mono">
                  <span style={{color: 'var(--cyber-magenta)'}}>EVENTS</span>
                  <span style={{color: 'var(--cyber-cyan)'}}>{events.length}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span style={{color: 'var(--cyber-magenta)'}}>ATTENDED</span>
                  <span style={{color: 'var(--cyber-neon-green)'}}>0</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 overflow-hidden relative">
          {activeView === 'list' ? (
            <div className="h-full overflow-y-auto p-6 bg-black/50 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto">
                <div className="cyber-border bg-black/50 p-4 mb-6">
                  <h2 className="text-xl font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>
                    {'>> UPCOMING EVENTS'}
                  </h2>
                </div>
                
                <div className="grid gap-4">
                  {events.map((event) => (
                    <div key={event.id} className="cyber-card p-6 hover:scale-[1.02] transition-transform">
                      <div className="flex gap-6">
                        <img
                          src={event.imageUrl || 'https://source.unsplash.com/200x200/?edm,concert'}
                          alt={event.name}
                          className="w-32 h-32 object-cover cyber-border"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{color: 'var(--cyber-cyan)'}}>
                            {event.name}
                          </h3>
                          <div className="space-y-1 text-sm font-mono">
                            <p style={{color: 'var(--cyber-magenta)'}}>
                              📅 {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p style={{color: 'var(--cyber-neon-green)'}}>
                              📍 {event.venue?.name} - {event.venue?.city}, {event.venue?.state}
                            </p>
                            <p style={{color: 'var(--cyber-electric-blue)'}}>
                              🎵 {event.artists?.map((a: any) => a.name).join(', ')}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {event.genres?.map((genre: string) => (
                                <span
                                  key={genre}
                                  className="px-2 py-1 text-xs cyber-border"
                                  style={{background: 'var(--cyber-gradient-1)', color: '#000'}}
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="px-4 py-2 cyber-border font-mono text-sm hover:bg-cyan-500/20 transition-all" style={{color: 'var(--cyber-cyan)'}}>
                            ADD TO WISHLIST
                          </button>
                          <button className="px-4 py-2 cyber-border font-mono text-sm hover:bg-pink-500/20 transition-all" style={{color: 'var(--cyber-hot-pink)'}}>
                            GET TICKETS
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {events.length === 0 && (
                  <div className="text-center py-12 cyber-border bg-black/50">
                    <p className="font-mono text-xl" style={{color: 'var(--cyber-magenta)'}}>
                      NO EVENTS FOUND
                    </p>
                    <p className="font-mono text-sm mt-2" style={{color: 'var(--cyber-cyan)'}}>
                      Try changing your location or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-black/50 backdrop-blur-sm p-6">
              <div className="cyber-border bg-black/70 p-4 mb-4">
                <h2 className="text-xl font-mono font-bold" style={{color: 'var(--cyber-electric-blue)'}}>
                  {'>> GEOSPATIAL EVENT MATRIX'}
                </h2>
              </div>
              <div className="h-[calc(100%-5rem)] cyber-border bg-black/50 flex items-center justify-center">
                <p className="font-mono" style={{color: 'var(--cyber-cyan)'}}>
                  MAP VIEW COMING SOON
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}