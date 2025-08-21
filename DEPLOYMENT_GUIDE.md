# Deployment Guide for RavePulse with Spotify Integration

## Step 1: Deploy to Amplify Hosting

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial RavePulse app"
   git remote add origin https://github.com/YOUR_USERNAME/ravepulse.git
   git push -u origin main
   ```

2. **Connect to Amplify Hosting**:
   ```bash
   npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
   ```

3. **Or use AWS Console**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select branch (main)
   - Amplify will auto-detect Next.js settings
   - Click "Save and deploy"

### Option B: Manual Deploy (Quick Testing)

1. **Build your app**:
   ```bash
   npm run build
   ```

2. **Deploy to Amplify**:
   ```bash
   npx ampx hosting add
   npx ampx publish
   ```

## Step 2: Get Your Deployed URL

After deployment, you'll get a URL like:
- `https://main.d1234567890abc.amplifyapp.com`
- Or custom domain if configured

## Step 3: Configure Spotify App with Real URL

1. **Go to Spotify Developer Dashboard**:
   - https://developer.spotify.com/dashboard
   - Select your app (or create new one)

2. **Update App Settings**:
   ```
   App name: RavePulse
   App description: Real-time EDM event recommendations
   Website: https://main.d1234567890abc.amplifyapp.com
   ```

3. **Add Redirect URIs** (you can have multiple):
   ```
   # For development
   http://localhost:3001/api/spotify/callback
   
   # For production (replace with your actual URL)
   https://main.d1234567890abc.amplifyapp.com/api/spotify/callback
   
   # Optional: staging
   https://staging.d1234567890abc.amplifyapp.com/api/spotify/callback
   ```

4. **Save the settings**

## Step 4: Set Environment Variables in Amplify

1. **In AWS Amplify Console**:
   - Go to your app
   - Click "App settings" → "Environment variables"
   - Add variables:

   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID = your_spotify_client_id
   SPOTIFY_CLIENT_SECRET = your_spotify_client_secret
   NEXT_PUBLIC_APP_URL = https://main.d1234567890abc.amplifyapp.com
   ```

2. **Trigger a new build** to apply environment variables

## Step 5: Update Your Code for Production

Create a `.env.production` file:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_APP_URL=https://main.d1234567890abc.amplifyapp.com
```

Update your Spotify redirect logic to use the APP_URL:
```typescript
// src/app/dashboard/settings/page.tsx
const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`
  : `${window.location.origin}/api/spotify/callback`;
```

## Example URLs After Deployment

If your Amplify app URL is: `https://main.d3abc123xyz.amplifyapp.com`

Then your Spotify settings should be:
- **Website**: `https://main.d3abc123xyz.amplifyapp.com`
- **Redirect URI**: `https://main.d3abc123xyz.amplifyapp.com/api/spotify/callback`

## Quick Deploy Commands

```bash
# 1. Initialize git and push to GitHub
git init
git add .
git commit -m "RavePulse EDM recommendation app"
gh repo create ravepulse --public --source=. --remote=origin --push

# 2. Deploy to Amplify (if you have AWS CLI configured)
aws amplify create-app --name ravepulse --region us-east-1
aws amplify create-branch --app-id YOUR_APP_ID --branch-name main
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type RELEASE

# 3. Get your app URL
aws amplify get-app --app-id YOUR_APP_ID --query 'app.defaultDomain'
```

## Testing Flow

1. **Local Development**:
   - Use `http://localhost:3001` URLs
   - Test with dev Spotify app

2. **Staging**:
   - Deploy to staging branch
   - Use staging URLs in separate Spotify app

3. **Production**:
   - Deploy to main branch
   - Use production URLs in production Spotify app

## Important Notes

- ✅ You can have multiple redirect URIs in one Spotify app
- ✅ Amplify provides HTTPS automatically (required by Spotify)
- ✅ Your deployed URL will work immediately after adding to Spotify
- ✅ No need to wait for DNS propagation (using Amplify domain)

## Custom Domain (Optional)

If you want `ravepulse.com` instead of `*.amplifyapp.com`:

1. Buy domain from Route53 or other registrar
2. In Amplify Console → Domain management → Add domain
3. Follow DNS configuration steps
4. Update Spotify redirect URI to use custom domain

## Troubleshooting

**"Invalid redirect URI" error**:
- Ensure exact match including `https://` and trailing paths
- No trailing slashes unless specified
- Check for typos in Spotify dashboard

**"Environment variables not working"**:
- Trigger new build after adding variables
- Check build logs in Amplify Console
- Verify variable names match exactly

**"CORS errors"**:
- Spotify handles CORS automatically
- If issues, check your API route configuration
- Ensure using server-side route for token exchange