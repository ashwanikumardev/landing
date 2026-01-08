# Vercel Deployment Guide for AugCodex

## Quick Deploy

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

## Environment Variables

Add these in Vercel Dashboard (Settings → Environment Variables):

```
MONGODB_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openrouter_api_key
OPENAI_MODEL=openai/gpt-3.5-turbo
SITE_NAME=AugCodex
SITE_DESCRIPTION=Your Daily Source for Tech, Business, and Lifestyle News
SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## Important Notes

### Cron Jobs on Vercel
⚠️ **Vercel doesn't support cron jobs in serverless functions.**

**Solutions:**
1. **Use Vercel Cron (Recommended):**
   - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/generate",
       "schedule": "0 6,9,12,15,18,21 * * *"
     }]
   }
   ```

2. **Use External Cron Service:**
   - [cron-job.org](https://cron-job.org)
   - [EasyCron](https://www.easycron.com)
   - Set up to hit: `https://your-domain.vercel.app/api/generate`

### File Storage
⚠️ **Vercel filesystem is read-only and ephemeral.**

**For images, use:**
- Cloudinary (free tier)
- AWS S3
- Vercel Blob Storage

## Deployment Steps

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Set up Cron:**
   - Use Vercel Cron or external service
   - Point to `/api/generate` endpoint

## Alternative: VPS Deployment

For full cron job support, deploy to a VPS:

### Recommended VPS Providers
- DigitalOcean ($5/month)
- Linode ($5/month)
- Vultr ($5/month)

### VPS Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/ashwanikumardev/landing.git
cd landing
npm install

# Configure environment
nano .env
# Add your environment variables

# Start with PM2
pm2 start server.js --name augcodex
pm2 save
pm2 startup

# Setup Nginx (optional)
sudo apt install nginx
# Configure reverse proxy
```

## Troubleshooting

### 404 Error
- Check `vercel.json` is present
- Verify `server.js` exports app
- Check build logs in Vercel dashboard

### Database Connection
- Whitelist Vercel IPs in MongoDB Atlas
- Or use `0.0.0.0/0` for all IPs (less secure)

### Cron Not Working
- Vercel: Use Vercel Cron or external service
- VPS: Check PM2 logs with `pm2 logs`

## Production Checklist

- [ ] Environment variables set
- [ ] MongoDB connection working
- [ ] Cron jobs configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Backup strategy in place
