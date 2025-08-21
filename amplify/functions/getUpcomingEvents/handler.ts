import type { Schema } from '../../data/resource';

type Handler = Schema['getUpcomingEvents']['functionHandler'];

export const handler: Handler = async (event) => {
  const { city, state, limit } = event.arguments;
  const actualLimit = limit ?? 20;
  
  try {
    // In production, this would query the Event table
    // For now, return mock data
    const mockEvents = generateMockEvents(city || 'San Francisco', state || 'CA', actualLimit);
    
    return {
      events: mockEvents,
      total: mockEvents.length,
      location: {
        city: city || 'San Francisco',
        state: state || 'CA',
      },
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

function generateMockEvents(city: string, state: string, limit: number) {
  const events = [];
  const today = new Date();
  
  for (let i = 0; i < limit; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i * 3);
    
    events.push({
      eventId: `upcoming-${i}`,
      name: `EDM Night ${i + 1}`,
      date: eventDate.toISOString().split('T')[0],
      startTime: '22:00',
      endTime: '03:00',
      venue: {
        name: `Venue ${i + 1}`,
        city,
        state,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      },
      artists: [
        { name: `DJ ${i + 1}` },
        { name: `Artist ${i + 1}` },
      ],
      genres: ['House', 'Techno', 'Bass'][i % 3] ? [`${['House', 'Techno', 'Bass'][i % 3]}`] : ['EDM'],
      ages: i % 2 === 0 ? '18+' : '21+',
      electronicGenreInd: true,
    });
  }
  
  return events;
}