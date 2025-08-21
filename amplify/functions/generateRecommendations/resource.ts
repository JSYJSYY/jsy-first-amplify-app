import { defineFunction } from '@aws-amplify/backend';

export const generateRecommendations = defineFunction({
  name: 'generateRecommendations',
  entry: './handler.ts',
  timeoutSeconds: 30,
});