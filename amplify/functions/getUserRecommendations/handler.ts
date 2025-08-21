import type { Schema } from '../../data/resource';

type Handler = Schema['getUserRecommendations']['functionHandler'];

export const handler: Handler = async (event) => {
  const { userId, limit } = event.arguments;
  const actualLimit = limit ?? 10;
  
  try {
    // In production, this would query the Recommendation table joined with Event table
    // For now, return mock recommendations
    const mockRecommendations = [];
    
    for (let i = 0; i < actualLimit; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + i * 4);
      
      mockRecommendations.push({
        recommendationId: `rec-${i}`,
        userId,
        eventId: `event-${i}`,
        matchScore: 95 - (i * 5),
        matchReasons: [
          `Reason 1 for event ${i + 1}`,
          `Reason 2 for event ${i + 1}`,
        ],
        event: {
          eventId: `event-${i}`,
          name: `Recommended Event ${i + 1}`,
          date: eventDate.toISOString().split('T')[0],
          venue: {
            name: `Venue ${i + 1}`,
            city: 'San Francisco',
            state: 'CA',
          },
          artists: [
            { name: `Artist ${i + 1}` },
          ],
          genres: ['House', 'Techno', 'Trance'][i % 3] ? [`${['House', 'Techno', 'Trance'][i % 3]}`] : ['EDM'],
        },
        createdAt: new Date().toISOString(),
      });
    }
    
    return {
      recommendations: mockRecommendations,
      total: mockRecommendations.length,
      userId,
    };
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }
};