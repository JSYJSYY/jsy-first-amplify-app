import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { syncSpotifyData } from './functions/syncSpotifyData/resource.js';
import { fetchEDMEvents } from './functions/fetchEDMEvents/resource.js';
import { generateRecommendations } from './functions/generateRecommendations/resource.js';
import { getUpcomingEvents } from './functions/getUpcomingEvents/resource.js';
import { getUserRecommendations } from './functions/getUserRecommendations/resource.js';

export const backend = defineBackend({
  auth,
  data,
  syncSpotifyData,
  fetchEDMEvents,
  generateRecommendations,
  getUpcomingEvents,
  getUserRecommendations,
});

// Add EDMTrain API key to fetchEDMEvents Lambda
backend.fetchEDMEvents.resources.lambda.environment = {
  ...backend.fetchEDMEvents.resources.lambda.environment,
  EDMTRAIN_API_KEY: process.env.EDMTRAIN_API_KEY || '932533d3-1d7b-49ef-8757-cd22cdae5d11',
};