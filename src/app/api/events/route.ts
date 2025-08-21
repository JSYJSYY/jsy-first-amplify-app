import { NextRequest, NextResponse } from 'next/server';

const EDMTRAIN_API_BASE = 'https://edmtrain.com/api/events';
const EDMTRAIN_API_KEY = process.env.EDMTRAIN_API_KEY || '932533d3-1d7b-49ef-8757-cd22cdae5d11';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city') || 'San Francisco';
  const state = searchParams.get('state') || 'CA';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    // Build query parameters for EDMTrain API
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('state', state);
    
    // Set date range (default to next 30 days)
    const today = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    
    params.append('startDate', startDate || today.toISOString().split('T')[0]);
    params.append('endDate', endDate || defaultEndDate.toISOString().split('T')[0]);
    
    // Add API key
    params.append('client', EDMTRAIN_API_KEY);
    
    // Fetch events from EDMTrain
    const response = await fetch(`${EDMTRAIN_API_BASE}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('EDMTrain API error:', response.status);
      // Return mock data as fallback
      return NextResponse.json(generateMockEvents(city, state));
    }
    
    const data = await response.json();
    
    // Format events for our frontend
    const formattedEvents = (data.data || []).map((event: any) => ({
      id: event.id?.toString() || `edm-${Date.now()}-${Math.random()}`,
      name: event.name || 'EDM Event',
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: {
        id: event.venue?.id,
        name: event.venue?.name,
        address: event.venue?.address,
        city: event.venue?.city,
        state: event.venue?.state,
        latitude: event.venue?.latitude,
        longitude: event.venue?.longitude,
      },
      artists: event.artistList?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        bio: artist.bio,
      })) || [],
      genres: extractGenres(event),
      ages: event.ages,
      festivalInd: event.festivalInd,
      electronicGenreInd: event.electronicGenreInd,
      link: event.link,
      ticketLink: event.ticketLink,
      imageUrl: event.imageUrl || generateEventImage(event.name),
    }));
    
    return NextResponse.json({
      events: formattedEvents,
      total: formattedEvents.length,
      location: { city, state },
    });
  } catch (error) {
    console.error('Error fetching EDM events:', error);
    // Return mock data as fallback
    return NextResponse.json(generateMockEvents(city, state));
  }
}

function extractGenres(event: any): string[] {
  const genres: string[] = [];
  const eventText = `${event.name || ''} ${event.artistList?.map((a: any) => a.name).join(' ') || ''}`.toLowerCase();
  
  // Genre detection based on event/artist names
  const genreMap: Record<string, string[]> = {
    'House': ['house', 'tech house', 'deep house'],
    'Techno': ['techno', 'minimal'],
    'Bass': ['bass', 'dubstep', 'trap'],
    'Trance': ['trance', 'psytrance'],
    'Drum & Bass': ['drum', 'dnb', 'd&b'],
    'Hardstyle': ['hardstyle', 'hardcore'],
    'Melodic': ['melodic'],
    'Progressive': ['progressive'],
  };
  
  for (const [genre, keywords] of Object.entries(genreMap)) {
    if (keywords.some(keyword => eventText.includes(keyword))) {
      genres.push(genre);
    }
  }
  
  // Default genre if none detected
  if (genres.length === 0 && event.electronicGenreInd) {
    genres.push('Electronic');
  }
  
  return genres;
}

function generateEventImage(eventName: string): string {
  const keywords = ['edm', 'concert', 'festival', 'rave', 'electronic', 'music'];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  return `https://source.unsplash.com/400x400/?${keyword},night`;
}

function generateMockEvents(city: string, state: string) {
  const venues: Record<string, any[]> = {
    'San Francisco': [
      { name: 'The Great Northern', address: '119 Utah St', latitude: 37.7680, longitude: -122.4058 },
      { name: 'Public Works', address: '161 Erie St', latitude: 37.7526, longitude: -122.4195 },
      { name: 'Bill Graham Civic', address: '99 Grove St', latitude: 37.7785, longitude: -122.4178 },
    ],
    'Los Angeles': [
      { name: 'Exchange LA', address: '618 S Spring St', latitude: 34.0430, longitude: -118.2516 },
      { name: 'Academy LA', address: '6021 Hollywood Blvd', latitude: 34.1020, longitude: -118.3210 },
    ],
    'New York': [
      { name: 'Brooklyn Mirage', address: '140 Stewart Ave', latitude: 40.7114, longitude: -73.9260 },
      { name: 'Nowadays', address: '56-06 Cooper Ave', latitude: 40.7138, longitude: -73.9242 },
    ],
  };
  
  const cityVenues = venues[city] || [
    { name: 'EDM Club', address: '123 Main St', latitude: 37.7749, longitude: -122.4194 },
  ];
  
  const eventTemplates = [
    {
      name: 'Lane 8 presents This Never Happened',
      artists: [{ name: 'Lane 8' }, { name: 'Yotto' }],
      genres: ['Deep House', 'Progressive House'],
    },
    {
      name: 'Charlotte de Witte: Formula',
      artists: [{ name: 'Charlotte de Witte' }],
      genres: ['Techno'],
    },
    {
      name: 'ODESZA: The Last Goodbye Tour',
      artists: [{ name: 'ODESZA' }],
      genres: ['Future Bass', 'Electronic'],
    },
    {
      name: 'Deadmau5: Retro5pective',
      artists: [{ name: 'Deadmau5' }],
      genres: ['Progressive House', 'Electro'],
    },
    {
      name: 'Anjunadeep Open Air',
      artists: [{ name: 'Ben Böhmer' }, { name: 'Tinlicker' }],
      genres: ['Deep House', 'Melodic'],
    },
  ];
  
  const events = [];
  for (let i = 0; i < eventTemplates.length; i++) {
    const template = eventTemplates[i];
    const venue = cityVenues[i % cityVenues.length];
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + (i + 1) * 7);
    
    events.push({
      id: `mock-${Date.now()}-${i}`,
      name: template.name,
      date: eventDate.toISOString().split('T')[0],
      startTime: '22:00',
      endTime: '03:00',
      venue: {
        ...venue,
        city,
        state,
      },
      artists: template.artists,
      genres: template.genres,
      ages: i % 2 === 0 ? '18+' : '21+',
      festivalInd: false,
      electronicGenreInd: true,
      link: '#',
      ticketLink: 'https://www.ticketmaster.com',
      imageUrl: generateEventImage(template.name),
    });
  }
  
  return {
    events,
    total: events.length,
    location: { city, state },
  };
}