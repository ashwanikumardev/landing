# Vercel Environment Variables Setup

## Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

### 1. MongoDB Connection
```
MONGODB_URI=mongodb+srv://augment9572_db_user:4gVlzpXRuqZDdbnd@cluster0.tqvhsle.mongodb.net/?appName=Cluster0
```

### 2. OpenRouter API Key
```
OPENAI_API_KEY=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
```

### 3. OpenAI Model
```
OPENAI_MODEL=openai/gpt-3.5-turbo
```

### 4. Site Configuration
```
SITE_NAME=AugCodex
SITE_DESCRIPTION=Your Daily Source for Tech, Business, and Lifestyle News
SITE_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

## Steps to Add Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings" tab
4. Click "Environment Variables"
5. Add each variable above
6. Select "Production", "Preview", and "Development"
7. Click "Save"
8. Redeploy your project

## After Adding Variables

Vercel will automatically redeploy. Your site should work within 1-2 minutes.

## MongoDB Atlas Configuration

**Important:** Whitelist Vercel's IP addresses in MongoDB Atlas:

1. Go to MongoDB Atlas
2. Network Access
3. Add IP Address
4. Use `0.0.0.0/0` (allow from anywhere) OR
5. Add Vercel's specific IP ranges

## Verify Deployment

After redeployment, check:
- Homepage: `https://your-domain.vercel.app/`
- Health: `https://your-domain.vercel.app/api/health`

The health endpoint should now show:
```json
{
  "hasMongoUri": true,
  "hasOpenAIKey": true
}
```
