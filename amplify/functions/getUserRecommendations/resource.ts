import { defineFunction } from '@aws-amplify/backend';

export const getUserRecommendations = defineFunction({
  name: 'getUserRecommendations',
  entry: './handler.ts',
  timeoutSeconds: 15,
});