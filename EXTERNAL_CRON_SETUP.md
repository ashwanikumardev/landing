# Setting Up Automatic Article Generation on Vercel

## 🎯 The Problem

Vercel doesn't support cron jobs (automatic scheduling) because it uses serverless functions. Your articles won't auto-generate on their own.

## ✅ The Solution: External Cron Service

Use **cron-job.org** (free service) to trigger your Vercel site to generate articles at scheduled times.

---

## 📋 Step-by-Step Setup

### Step 1: Create Account on Cron-Job.org

1. Go to https://cron-job.org
2. Click **"Sign Up"** (top right)
3. Create a free account
4. Verify your email
5. Log in

### Step 2: Create Cron Jobs

You need to create **6 cron jobs** (one for each time of day):

#### Job 1: 6 AM Daily

1. Click **"Create Cronjob"** button
2. **Title**: `AugCodex - 6 AM Article`
3. **URL**: `https://www.augcodex.site/api/generate`
4. **Request Method**: `POST`
5. **Schedule**:
   - Every day
   - At: `06:00` (6 AM)
   - Timezone: Select your timezone (Asia/Kolkata)
6. Click **"Create"**

#### Job 2: 9 AM Daily

Repeat above with:
- **Title**: `AugCodex - 9 AM Article`
- **Time**: `09:00`

#### Job 3: 12 PM Daily

- **Title**: `AugCodex - 12 PM Article`
- **Time**: `12:00`

#### Job 4: 3 PM Daily

- **Title**: `AugCodex - 3 PM Article`
- **Time**: `15:00`

#### Job 5: 6 PM Daily

- **Title**: `AugCodex - 6 PM Article`
- **Time**: `18:00`

#### Job 6: 9 PM Daily

- **Title**: `AugCodex - 9 PM Article`
- **Time**: `21:00`

---

## 🧪 Testing

### Test Single Article Generation

Visit this URL in your browser:
```
https://www.augcodex.site/api/generate
```

**Note**: This is a POST endpoint, so use:
- Postman
- Or curl: `curl -X POST https://www.augcodex.site/api/generate`

**Expected Response:**
```json
{
  "success": true,
  "message": "Article generated successfully",
  "article": {
    "title": "...",
    "category": "Technology",
    "url": "/blog/article-slug"
  }
}
```

### Test Batch Generation (6 Articles)

```bash
curl -X POST https://www.augcodex.site/api/generate-batch \
  -H "Content-Type: application/json" \
  -d '{"count": 6}'
```

---

## 📊 Monitor Your Cron Jobs

### Check Status

Visit: `https://www.augcodex.site/api/status`

Shows:
- Total articles
- Total views
- Recent articles
- Last generation time

### Cron-Job.org Dashboard

1. Log in to cron-job.org
2. View **"Cronjobs"** page
3. See execution history
4. Check success/failure status

---

## ⚙️ Advanced: Generate 12 Articles Tomorrow

If you want to generate 12 articles tomorrow instead of 6:

**Option A: Manually trigger batch**
```bash
curl -X POST https://www.augcodex.site/api/generate-batch \
  -H "Content-Type: application/json" \
  -d '{"count": 12}'
```

**Option B: Create 12 cron jobs**
Add 6 more jobs at different times:
- 7 AM, 8 AM, 10 AM, 11 AM, 1 PM, 2 PM

---

## 🎯 What Happens Now

**Every Day:**
1. 6 AM - Cron-job.org calls your API
2. Your Vercel site generates 1 article
3. Article is saved to MongoDB
4. Appears on your website
5. Repeat at 9 AM, 12 PM, 3 PM, 6 PM, 9 PM

**Result:** 6 new articles daily, automatically!

---

## ✅ Checklist

- [ ] Sign up for cron-job.org
- [ ] Create 6 cron jobs (6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM)
- [ ] Test with `/api/generate` endpoint
- [ ] Verify articles appear on site
- [ ] Monitor cron execution logs

---

## 🔧 Troubleshooting

### Cron Job Fails

**Check:**
1. URL is correct: `https://www.augcodex.site/api/generate`
2. Method is POST
3. Vercel site is running
4. MongoDB is connected

### No Articles Generated

**Check:**
1. `/api/status` shows recent activity
2. MongoDB has articles
3. OpenAI API key is valid
4. Check Vercel function logs

### Want More Articles

**Option 1**: Add more cron jobs
**Option 2**: Use `/api/generate-batch` with higher count

---

## 💰 Cost

**cron-job.org**: FREE
- Up to 50 cron jobs
- Unlimited executions
- Email notifications

**Your Setup**: 6 cron jobs = Well within free tier!

---

## 🎉 Summary

After setup:
- ✅ 6 articles generated daily
- ✅ Fully automated
- ✅ No manual intervention needed
- ✅ Works perfectly with Vercel
- ✅ Completely free

Your AugCodex site will now auto-generate content 24/7! 🚀
