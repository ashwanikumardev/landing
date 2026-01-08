# AugCodex - Automated SEO News Platform

Professional news platform with automated content generation, Times of India inspired design, and intelligent scheduling.

## 🚀 Features

- **Automated Content Generation**: 6 articles daily at staggered times
- **9 Content Categories**: Technology, Health, Finance, Business, Lifestyle, Education, Travel, Food, Entertainment
- **Professional Theme**: Times of India inspired design with red accents
- **SEO Optimized**: Dynamic sitemaps, meta tags, structured data
- **Smart Scheduling**: Posts at 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
- **Image Management**: Auto-cleanup after 25 days
- **Responsive Design**: Mobile-first approach

## 📦 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **AI**: OpenRouter API (GPT-3.5-turbo)
- **Template Engine**: EJS
- **Styling**: Custom CSS (TOI-inspired)

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/ashwanikumardev/landing.git
cd landing

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm start
```

## ⚙️ Configuration

Required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openrouter_api_key
OPENAI_MODEL=openai/gpt-3.5-turbo
SITE_NAME=AugCodex
SITE_URL=http://localhost:3000
```

## 📊 Project Structure

```
├── config/          # Database and logger configuration
├── models/          # MongoDB schemas
├── services/        # Business logic (automation, AI, images)
├── jobs/            # Cron jobs (article generation, cleanup)
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static assets (CSS, images)
└── tests/           # Test scripts
```

## 🎯 Usage

### Start Server
```bash
npm start
```

### Generate Test Articles
```bash
node tests/generate-category-articles.js
```

### Manual Article Generation
```bash
node tests/test-automation.js
```

## 📈 SEO Features

- Dynamic sitemap.xml
- Robots.txt
- Meta tags (title, description, keywords)
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD)

## 🔄 Automation

- **6 Daily Posts**: Staggered throughout the day
- **Category Rotation**: Ensures diverse content
- **Image Cleanup**: Automatic deletion after 25 days
- **Error Handling**: Graceful fallbacks

## 💰 Cost

- **Content Generation**: ~$0/month (OpenRouter free tier)
- **Database**: Free (MongoDB Atlas)
- **Hosting**: $0-10/month (VPS or Vercel)

**Total**: Less than $1/month!

## 📝 License

MIT License

## 👨‍💻 Author

Ashwani Kumar

## 🙏 Acknowledgments

- Times of India for design inspiration
- OpenRouter for AI API
- MongoDB for database hosting
