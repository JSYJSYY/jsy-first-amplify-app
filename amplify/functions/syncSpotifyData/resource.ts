import { defineFunction } from '@aws-amplify/backend';

export const syncSpotifyData = defineFunction({
  name: 'syncSpotifyData',
  entry: './handler.ts',
  environment: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '',
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '',
  },
  timeoutSeconds: 30,
});