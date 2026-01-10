# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed ✅ (Already done)
- MongoDB (local or Atlas account)
- Google Gemini API key (FREE)

### Step 1: Configure Environment (REQUIRED)

Create a `.env` file in the project root:

```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and add your credentials:

```env
# MongoDB - Choose one:
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/seo-blog

# Option 2: MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seo-blog

# Google Gemini API Key (REQUIRED - FREE)
GEMINI_API_KEY=AIzaSyBDhR9DEF8csUCSRTbzrErcYbXHKrCQzyM
GEMINI_MODEL=gemini-2.5-flash

# Other settings (optional, defaults are fine)
PORT=3000
TRENDS_GEO=US
SITE_NAME=My SEO Blog
```

### Step 2: Install MongoDB (if using local)

**Option A: Local MongoDB**
- Download from [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

**Option B: MongoDB Atlas (Recommended)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster
4. Get connection string
5. Add to `.env`

### Step 3: Get FREE Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create new API key
5. Copy and add to `.env`

**Free Tier Includes:**
- 15 requests per minute
- 1,500 requests per day
- Perfect for automated blogging!

### Step 4: Start the Server

```bash
npm start
```

Visit: `http://localhost:3000`

### Step 5: Generate First Article (Manual Test)

```bash
# Run the automation test
npm run test:automation
```

This will:
- Fetch a trending topic
- Generate an SEO article
- Save to database
- Publish on your site

Then refresh `http://localhost:3000` to see your first article!

## 🧪 Testing Individual Components

```bash
# Test Google Trends API
npm run test:trends

# Test Gemini API
npm run test:openai

# Test database connection
npm run test:db
```

## ⏰ Automatic Daily Articles

The cron job is configured to run daily at 9 AM. You can change this in `.env`:

```env
# Run every 6 hours
CRON_SCHEDULE=0 */6 * * *

# Run twice daily (9 AM and 9 PM)
CRON_SCHEDULE=0 9,21 * * *
```

## 🔍 Important URLs

- Homepage: `http://localhost:3000`
- Sitemap: `http://localhost:3000/sitemap.xml`
- Robots: `http://localhost:3000/robots.txt`
- Health Check: `http://localhost:3000/health`
- Manual Generate: `POST http://localhost:3000/api/generate`

## 📊 Monitoring

Check logs in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Errors only

## 🚨 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP

### Gemini API Error
- Verify API key is correct in `.env`
- Check free tier limits (15 RPM, 1,500 RPD)
- Visit [aistudio.google.com](https://aistudio.google.com)

### Port Already in Use
Change port in `.env`:
```env
PORT=3001
```

## 📚 Full Documentation

- [README.md](file:///c:/Users/ashwi/Desktop/BLOG/README.md) - Complete user guide
- [DEPLOYMENT.md](file:///c:/Users/ashwi/Desktop/BLOG/DEPLOYMENT.md) - Production deployment

## 🎯 Next Steps

1. ✅ Configure `.env` with your credentials
2. ✅ Start MongoDB
3. ✅ Run `npm start`
4. ✅ Test with `npm run test:automation`
5. ✅ Visit `http://localhost:3000`
6. 🚀 Deploy to production (see DEPLOYMENT.md)

---

**Need help? Check the logs in `logs/combined.log`**
