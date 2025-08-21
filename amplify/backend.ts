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