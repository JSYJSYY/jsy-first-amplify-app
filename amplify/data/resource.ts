import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User Profile with Spotify data
  UserProfile: a
    .model({
      userId: a.string().required(),
      spotifyId: a.string(),
      displayName: a.string(),
      email: a.email(),
      imageUrl: a.string(),
      spotifyRefreshToken: a.string(),
      listeningData: a.json(), // Stores analyzed music taste
      topArtists: a.json(), // Array of top artists
      topGenres: a.json(), // Array of top genres
      events: a.hasMany('UserEvent', 'userId'),
      recommendations: a.hasMany('Recommendation', 'userId'),
      lastSync: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // EDM Events from EDMTrain API
  Event: a
    .model({
      eventId: a.string().required(),
      name: a.string().required(),
      date: a.date().required(),
      startTime: a.string(),
      endTime: a.string(),
      venue: a.json().required(), // Venue details including coordinates
      artists: a.json().required(), // Array of artist objects
      genres: a.json(), // Array of genre strings
      ages: a.string(),
      festivalInd: a.boolean(),
      electronicGenreInd: a.boolean(),
      otherGenreInd: a.boolean(),
      link: a.string(),
      ticketLink: a.string(),
      imageUrl: a.string(),
      city: a.string(),
      state: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      userEvents: a.hasMany('UserEvent', 'eventId'),
      recommendations: a.hasMany('Recommendation', 'eventId'),
    })
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated().to(['read']),
    ])
    .secondaryIndexes((index) => [
      index('city').sortKeys(['date']),
      index('state').sortKeys(['date']),
    ]),

  // User-Event relationship (attendance/wishlist)
  UserEvent: a
    .model({
      userId: a.string().required(),
      eventId: a.string().required(),
      status: a.enum(['wishlist', 'attended', 'skipped']),
      notes: a.string(),
      rating: a.integer(), // 1-5 star rating
      user: a.belongsTo('UserProfile', 'userId'),
      event: a.belongsTo('Event', 'eventId'),
      addedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
    ])
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['status', 'addedAt']),
    ]),

  // AI-generated recommendations
  Recommendation: a
    .model({
      userId: a.string().required(),
      eventId: a.string().required(),
      matchScore: a.float().required(), // 0-100 match percentage
      matchReasons: a.json(), // Array of matching criteria
      user: a.belongsTo('UserProfile', 'userId'),
      event: a.belongsTo('Event', 'eventId'),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ])
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['matchScore']),
    ]),

  // Location data for event filtering
  Location: a
    .model({
      locationId: a.integer().required(),
      city: a.string().required(),
      state: a.string().required(),
      stateCode: a.string().required(),
      latitude: a.float().required(),
      longitude: a.float().required(),
      radius: a.integer(),
    })
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated().to(['read']),
    ])
    .secondaryIndexes((index) => [
      index('state'),
      index('city'),
    ]),

  // Custom mutations for complex operations
  syncSpotifyData: a
    .mutation()
    .arguments({
      accessToken: a.string().required(),
      refreshToken: a.string(),
    })
    .returns(a.ref('UserProfile'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('syncSpotifyData')),

  fetchEDMEvents: a
    .mutation()
    .arguments({
      city: a.string(),
      state: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      startDate: a.date(),
      endDate: a.date(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()])
    .handler(a.handler.function('fetchEDMEvents')),

  generateRecommendations: a
    .mutation()
    .arguments({
      userId: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('generateRecommendations')),

  // Custom queries
  getUpcomingEvents: a
    .query()
    .arguments({
      city: a.string(),
      state: a.string(),
      limit: a.integer(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()])
    .handler(a.handler.function('getUpcomingEvents')),

  getUserRecommendations: a
    .query()
    .arguments({
      userId: a.string().required(),
      limit: a.integer(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('getUserRecommendations')),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});