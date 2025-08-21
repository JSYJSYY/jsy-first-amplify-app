import { defineFunction } from '@aws-amplify/backend';

export const fetchEDMEvents = defineFunction({
  name: 'fetchEDMEvents',
  entry: './handler.ts',
  environment: {
    EDMTRAIN_API_KEY: process.env.EDMTRAIN_API_KEY || '',
  },
  timeoutSeconds: 30,
});