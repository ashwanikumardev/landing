# Google Gemini API Setup Guide

## Getting Your Free Gemini API Key

Google provides a **free tier** for the Gemini API through Google AI Studio. Here's how to get started:

### Step 1: Access Google AI Studio
1. Go to [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your Google account

### Step 2: Get Your API Key
1. Click on **"Get API Key"** in the left sidebar
2. Click **"Create API Key"**
3. Select a Google Cloud project (or create a new one)
4. Copy your API key

### Step 3: Add to Your Environment Variables

Add the following to your `.env` file:

```bash
GEMINI_API_KEY=AIzaSyBDhR9DEF8csUCSRTbzrErcYbXHKrCQzyM
GEMINI_MODEL=gemini-1.5-flash
```

## Free Tier Limits

The free tier includes:
- **15 requests per minute (RPM)**
- **1 million tokens per minute (TPM)**
- **1,500 requests per day (RPD)**

This is perfect for automated blog generation!

## Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `gemini-1.5-flash` | Fast, efficient | Blog articles (recommended) |
| `gemini-1.5-pro` | More capable | Complex content |
| `gemini-2.0-flash-exp` | Latest experimental | Testing new features |

## Rate Limiting

The automation service includes built-in delays (15 seconds between articles) to respect the free tier limits and avoid rate limit errors.

## API Documentation

For more details, visit:
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Troubleshooting

### Error: "429 Rate limit exceeded"
- **Solution**: The automation service already includes 15-second delays between articles
- If you still hit limits, increase the delay in `automation.service.js` (line 252)

### Error: "Invalid API key"
- **Solution**: Make sure your API key is correctly copied to `.env`
- Verify the key is active in Google AI Studio

### Error: "Model not found"
- **Solution**: Use one of the available models listed above
- Default: `gemini-1.5-flash`
