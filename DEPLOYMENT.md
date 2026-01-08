# Deployment Guide

Complete guide for deploying the Automated SEO Content Generation Platform to production.

## 🚀 Deployment Options

### Option 1: VPS Deployment (Recommended for Full Control)

#### Prerequisites
- VPS with Ubuntu 20.04+ (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name
- SSH access to VPS

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install -y nginx
```

#### Step 2: Deploy Application

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/yourusername/seo-blog.git
cd seo-blog

# Install dependencies
sudo npm install --production

# Create .env file
sudo nano .env
```

Add your production environment variables:

```env
PORT=3000
NODE_ENV=production

MONGODB_URI=mongodb://localhost:27017/seo-blog

OPENAI_API_KEY=your_production_openai_key

TRENDS_GEO=US
CRON_SCHEDULE=0 9 * * *

SITE_URL=https://yourdomain.com
SITE_NAME=Your Blog Name
SITE_DESCRIPTION=Your blog description
```

#### Step 3: Start Application with PM2

```bash
# Start application
pm2 start server.js --name seo-blog

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Monitor application
pm2 status
pm2 logs seo-blog
```

#### Step 4: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/seo-blog
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/seo-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

---

### Option 2: MongoDB Atlas (Cloud Database)

If you prefer cloud database instead of local MongoDB:

#### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier available)

#### Step 2: Configure Database

1. Create database user with password
2. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
3. Get connection string

#### Step 3: Update .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seo-blog?retryWrites=true&w=majority
```

---

### Option 3: Vercel Deployment (Serverless)

**Note**: Vercel is great for frontend but has limitations for cron jobs. You'll need to use Vercel Cron or external service.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Create vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy

```bash
vercel
```

#### Step 4: Configure Environment Variables

In Vercel dashboard, add:
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `SITE_URL`
- etc.

#### Step 5: Setup Cron (Vercel Cron)

Create `vercel.json` with cron configuration:

```json
{
  "crons": [{
    "path": "/api/generate",
    "schedule": "0 9 * * *"
  }]
}
```

---

## 🔍 Google Search Console Setup

### Step 1: Verify Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain or URL prefix)
3. Verify ownership (DNS, HTML file, or meta tag)

### Step 2: Submit Sitemap

1. In Search Console, go to "Sitemaps"
2. Add new sitemap: `https://yourdomain.com/sitemap.xml`
3. Submit

### Step 3: Request Indexing

1. Use URL Inspection tool
2. Enter your homepage URL
3. Click "Request Indexing"

### Step 4: Monitor Performance

- Check "Coverage" for crawl errors
- Monitor "Performance" for search analytics
- Review "Enhancements" for structured data

---

## 🔒 Security Best Practices

### 1. Environment Variables

Never commit `.env` file to Git. Use environment variables for:
- API keys
- Database credentials
- Secrets

### 2. Rate Limiting

Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

In `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Helmet Configuration

Already included, but ensure proper CSP in production:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 4. MongoDB Security

- Use strong passwords
- Enable authentication
- Use SSL/TLS connections
- Regular backups

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs seo-blog

# Monitor resources
pm2 monit

# View detailed info
pm2 info seo-blog
```

### Log Rotation

PM2 handles log rotation automatically, but you can configure:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Logs

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/seo-blog
            git pull
            npm install --production
            pm2 restart seo-blog
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] OpenAI API key valid and has credits
- [ ] Cron schedule configured correctly
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Sitemap accessible
- [ ] Test article generation works
- [ ] Error logging working
- [ ] PM2 configured to restart on failure
- [ ] Backup strategy in place

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs seo-blog --lines 100

# Check if port is in use
sudo lsof -i :3000

# Restart application
pm2 restart seo-blog
```

### MongoDB Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Cron Job Not Running

```bash
# Check PM2 logs for cron execution
pm2 logs seo-blog | grep "Cron"

# Manually trigger
curl -X POST http://localhost:3000/api/generate

# Verify cron schedule
pm2 info seo-blog
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

Already included via `compression` middleware.

### 2. Database Indexing

Indexes are already created in the Article model.

### 3. Caching (Optional)

Add Redis for caching:

```bash
npm install redis
```

### 4. CDN (Optional)

Use Cloudflare or similar CDN for static assets.

---

## 💾 Backup Strategy

### MongoDB Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db seo-blog --out /backups/mongodb_$DATE
find /backups -mtime +7 -delete
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-mongodb.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-mongodb.sh
```

---

## 🎉 Post-Deployment

1. Monitor logs for first 24 hours
2. Check first automated article generation
3. Verify sitemap in Google Search Console
4. Test all pages load correctly
5. Monitor OpenAI API usage and costs
6. Set up uptime monitoring (UptimeRobot, Pingdom)

---

**Deployment complete! Your automated SEO blog is now live! 🚀**
