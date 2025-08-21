import type { Schema } from '../../data/resource';

type Handler = Schema['fetchEDMEvents']['functionHandler'];

const EDMTRAIN_API_BASE = 'https://edmtrain.com/api/events';

export const handler: Handler = async (event) => {
  const { city, state, latitude, longitude, startDate, endDate } = event.arguments;
  
  try {
    // Build query parameters for EDMTrain API
    const params = new URLSearchParams();
    
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
      params.append('radius', '50'); // 50 mile radius
    }
    
    // Set date range (default to next 30 days)
    const today = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    
    params.append('startDate', startDate || today.toISOString().split('T')[0]);
    params.append('endDate', endDate || defaultEndDate.toISOString().split('T')[0]);
    
    // Add API key if available
    if (process.env.EDMTRAIN_API_KEY) {
      params.append('client', process.env.EDMTRAIN_API_KEY);
    }
    
    // Fetch events from EDMTrain
    const response = await fetch(`${EDMTRAIN_API_BASE}?${params.toString()}`);
    
    if (!response.ok) {
      console.warn('EDMTrain API error, using mock data');
      return generateMockEvents(city || 'San Francisco', state || 'CA');
    }
    
    const data = await response.json() as any;
    
    // Format events for our schema
    const formattedEvents = (data.data as any[])?.map((event: any) => ({
      eventId: event.id?.toString() || `edm-${Date.now()}-${Math.random()}`,
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
      otherGenreInd: event.otherGenreInd,
      link: event.link,
      ticketLink: event.ticketLink,
      imageUrl: event.imageUrl || generateEventImage(event.name),
      city: event.venue?.city,
      state: event.venue?.state,
      latitude: event.venue?.latitude,
      longitude: event.venue?.longitude,
    })) || [];
    
    return {
      events: formattedEvents,
      total: formattedEvents.length,
      location: {
        city: city || formattedEvents[0]?.city || 'Unknown',
        state: state || formattedEvents[0]?.state || 'Unknown',
      },
    };
  } catch (error) {
    console.error('Error fetching EDM events:', error);
    // Return mock data as fallback
    return generateMockEvents(city || 'San Francisco', state || 'CA');
  }
};

function extractGenres(event: any): string[] {
  const genres: string[] = [];
  const eventText = `${event.name || ''} ${event.artistList?.map((a: any) => a.name).join(' ') || ''}`.toLowerCase();
  
  // Genre detection based on event/artist names
  if (eventText.includes('house') || eventText.includes('tech house')) genres.push('House');
  if (eventText.includes('techno')) genres.push('Techno');
  if (eventText.includes('bass') || eventText.includes('dubstep')) genres.push('Bass');
  if (eventText.includes('trance')) genres.push('Trance');
  if (eventText.includes('drum') || eventText.includes('dnb')) genres.push('Drum & Bass');
  if (eventText.includes('hardstyle')) genres.push('Hardstyle');
  if (eventText.includes('melodic')) genres.push('Melodic');
  if (eventText.includes('progressive')) genres.push('Progressive');
  
  // Default genre if none detected
  if (genres.length === 0 && event.electronicGenreInd) {
    genres.push('Electronic Dance Music');
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
      artists: [{ name: 'Lane 8' }, { name: 'Yotto' }],
      genres: ['Deep House', 'Progressive House'],
    },
    {
      artists: [{ name: 'Charlotte de Witte' }, { name: 'Amelie Lens' }],
      genres: ['Techno', 'Minimal Techno'],
    },
    {
      artists: [{ name: 'Porter Robinson' }, { name: 'Madeon' }],
      genres: ['Future Bass', 'Melodic Dubstep'],
    },
  ];
  
  const events = [];
  for (let i = 0; i < 5; i++) {
    const template = eventTemplates[i % eventTemplates.length];
    const venue = cityVenues[i % cityVenues.length];
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + i * 7);
    
    events.push({
      eventId: `mock-${Date.now()}-${i}`,
      name: `${template.artists[0].name} presents ${template.genres[0]} Night`,
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
      otherGenreInd: false,
      link: '#',
      ticketLink: '#',
      imageUrl: generateEventImage(template.artists[0].name),
      city,
      state,
      latitude: venue.latitude,
      longitude: venue.longitude,
    });
  }
  
  return {
    events,
    total: events.length,
    location: { city, state },
  };
}