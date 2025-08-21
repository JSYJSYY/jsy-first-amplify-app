import { defineFunction } from '@aws-amplify/backend';

export const getUpcomingEvents = defineFunction({
  name: 'getUpcomingEvents',
  entry: './handler.ts',
  timeoutSeconds: 15,
});