import type { Schema } from '../../data/resource';

type Handler = Schema['generateRecommendations']['functionHandler'];

export const handler: Handler = async (event) => {
  const { userId } = event.arguments;
  
  try {
    // In a real implementation, this would:
    // 1. Fetch user's listening data from UserProfile
    // 2. Fetch upcoming events from Event table
    // 3. Calculate match scores based on genre overlap, artist similarity, etc.
    // 4. Store recommendations in Recommendation table
    
    // For now, return mock recommendations
    const mockRecommendations = [
      {
        userId,
        eventId: 'event-1',
        matchScore: 92.5,
        matchReasons: [
          'Artist Lane 8 matches your top artists',
          'Deep House is your #1 genre',
          'Similar to 5 events you attended',
        ],
        createdAt: new Date().toISOString(),
      },
      {
        userId,
        eventId: 'event-2',
        matchScore: 85.0,
        matchReasons: [
          'Techno is in your top 3 genres',
          'Charlotte de Witte played at 2 events you liked',
          'Venue matches your preferences',
        ],
        createdAt: new Date().toISOString(),
      },
      {
        userId,
        eventId: 'event-3',
        matchScore: 78.5,
        matchReasons: [
          'Progressive House matches your listening history',
          'Similar to artists you follow on Spotify',
        ],
        createdAt: new Date().toISOString(),
      },
    ];
    
    return {
      recommendations: mockRecommendations,
      total: mockRecommendations.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

// Helper function to calculate match score
function calculateMatchScore(
  userGenres: string[],
  userArtists: string[],
  eventGenres: string[],
  eventArtists: string[]
): number {
  let score = 0;
  const maxScore = 100;
  
  // Genre matching (40% of score)
  const genreOverlap = userGenres.filter(g => 
    eventGenres.some(eg => eg.toLowerCase().includes(g.toLowerCase()))
  );
  score += (genreOverlap.length / Math.max(userGenres.length, 1)) * 40;
  
  // Artist matching (40% of score)
  const artistOverlap = userArtists.filter(a =>
    eventArtists.some(ea => ea.toLowerCase().includes(a.toLowerCase()))
  );
  score += (artistOverlap.length / Math.max(userArtists.length, 1)) * 40;
  
  // Bonus for exact matches (20% of score)
  if (genreOverlap.length > 0 || artistOverlap.length > 0) {
    score += 20;
  }
  
  return Math.min(score, maxScore);
}

// Helper function to generate match reasons
function generateMatchReasons(
  userProfile: any,
  event: any,
  score: number
): string[] {
  const reasons: string[] = [];
  
  if (score > 80) {
    reasons.push('Highly matches your music taste');
  }
  
  // Add specific genre/artist matches
  const genreMatches = userProfile.topGenres?.filter((g: string) =>
    event.genres?.includes(g)
  );
  
  if (genreMatches?.length > 0) {
    reasons.push(`${genreMatches[0]} is in your top genres`);
  }
  
  const artistMatches = userProfile.topArtists?.filter((a: any) =>
    event.artists?.some((ea: any) => ea.name === a.name)
  );
  
  if (artistMatches?.length > 0) {
    reasons.push(`${artistMatches[0].name} is one of your top artists`);
  }
  
  return reasons;
}