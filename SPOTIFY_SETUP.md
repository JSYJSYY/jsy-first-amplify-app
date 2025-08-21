# Spotify Integration Setup Guide

## Development Setup (Local Testing)

1. **Create a Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App"
   - Fill in:
     - App Name: "RavePulse" (or your app name)
     - App Description: "Real-time EDM event recommendations"
     - Website: http://localhost:3001
     - Redirect URI: http://localhost:3001/api/spotify/callback
   - Select "Web API" as the API/SDK
   - Accept the terms and create

2. **Get Your Credentials**:
   - In your app dashboard, you'll see:
     - Client ID (public)
     - Client Secret (keep private)

3. **Add to .env.local**:
   ```bash
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

## Production Setup (AWS Amplify Deployment)

### Option 1: Using Amplify Environment Variables (Recommended)

1. **In Spotify Developer Dashboard**:
   - Add your production redirect URI:
     ```
     https://main.d1234567890abc.amplifyapp.com/api/spotify/callback
     ```
   - You can have multiple redirect URIs for dev/staging/prod

2. **In AWS Amplify Console**:
   - Go to your app in AWS Amplify Console
   - Navigate to "App settings" → "Environment variables"
   - Add:
     ```
     NEXT_PUBLIC_SPOTIFY_CLIENT_ID = your_client_id
     SPOTIFY_CLIENT_SECRET = your_client_secret
     ```

### Option 2: Using AWS Secrets Manager (More Secure)

1. **Store secrets in AWS Secrets Manager**:
   ```typescript
   // amplify/backend.ts
   import { defineBackend } from '@aws-amplify/backend';
   import { auth } from './auth/resource';
   import { data } from './data/resource';
   import { secret } from '@aws-amplify/backend';

   const backend = defineBackend({
     auth,
     data,
   });

   // Define secrets
   const spotifyClientId = secret('SPOTIFY_CLIENT_ID');
   const spotifyClientSecret = secret('SPOTIFY_CLIENT_SECRET');

   // Grant access to Lambda functions
   backend.syncSpotifyData.resources.lambda.addEnvironment(
     'SPOTIFY_CLIENT_ID',
     spotifyClientId.value
   );
   backend.syncSpotifyData.resources.lambda.addEnvironment(
     'SPOTIFY_CLIENT_SECRET',
     spotifyClientSecret.value
   );
   ```

2. **Set secrets via Amplify CLI**:
   ```bash
   npx ampx sandbox secret set SPOTIFY_CLIENT_ID
   npx ampx sandbox secret set SPOTIFY_CLIENT_SECRET
   ```

### Option 3: For Multiple Environments

Create separate Spotify apps for each environment:

1. **Development App**:
   - Redirect URI: http://localhost:3001/api/spotify/callback
   - Client ID: dev_client_id

2. **Staging App**:
   - Redirect URI: https://staging.yourdomain.com/api/spotify/callback
   - Client ID: staging_client_id

3. **Production App**:
   - Redirect URI: https://yourdomain.com/api/spotify/callback
   - Client ID: prod_client_id

Then use environment-specific variables:
```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.AMPLIFY_ENV === 'prod' 
      ? process.env.PROD_SPOTIFY_CLIENT_ID 
      : process.env.DEV_SPOTIFY_CLIENT_ID,
  },
};
```

## Important Security Notes

1. **Never commit secrets to Git**
2. **Use HTTPS in production** (Amplify provides this automatically)
3. **Validate redirect URIs** to prevent OAuth attacks
4. **Store tokens securely** (HTTP-only cookies or encrypted database)
5. **Implement token refresh** for expired access tokens

## User Flow Architecture

```
1. User signs up with email (Cognito)
   ↓
2. User accesses dashboard
   ↓
3. User goes to Settings
   ↓
4. Two options:
   a. Connect Spotify → Enhanced recommendations
   b. Select genres manually → Basic recommendations
   ↓
5. Both can be used together for best results
```

## Handling Mixed Authentication

The app supports:
- **Email-only users**: Manual genre selection
- **Email + Spotify users**: Automatic + manual genres
- **Future**: Social logins (Google, Facebook)

Users maintain a single account (Cognito) with optional Spotify data enrichment.