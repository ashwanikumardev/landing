require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasMongoUri: !!process.env.MONGODB_URI,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            isVercel: !!process.env.VERCEL,
            mongooseState: mongoose.connection.readyState
        }
    });
});

// Connect to MongoDB (async, non-blocking)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }).then(() => {
        console.log('MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connection error:', err.message);
    });
}

// Load routes with comprehensive error handling
let routesLoaded = false;
try {
    const routes = require('./routes');
    app.use('/', routes);
    routesLoaded = true;
    console.log('Routes loaded successfully');
} catch (error) {
    console.error('Failed to load routes:', error.message);
    console.error('Stack:', error.stack);

    // Minimal fallback homepage
    app.get('/', async (req, res) => {
        try {
            // Try to get articles from database
            const Article = require('./models/Article');
            const articles = await Article.find({ isPublished: true })
                .sort({ publishedAt: -1 })
                .limit(10);

            const categories = ['Technology', 'Health', 'Finance', 'Business', 'Lifestyle', 'Education', 'Travel', 'Food', 'Entertainment'];

            res.render('index', {
                title: 'AugCodex',
                description: 'Your Daily Source for Tech, Business, and Lifestyle News',
                articles,
                categories,
                stats: {
                    totalArticles: await Article.countDocuments({ isPublished: true }),
                    totalViews: await Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]).then(r => r[0]?.total || 0)
                }
            });
        } catch (dbError) {
            res.status(503).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>AugCodex - Loading</title>
                    <style>
                        body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                        h1 { color: #e63946; }
                        .error { background: #f8f9fa; padding: 20px; border-left: 4px solid #e63946; }
                    </style>
                </head>
                <body>
                    <h1>AugCodex</h1>
                    <div class="error">
                        <h2>Database Connection Issue</h2>
                        <p>The site is having trouble connecting to the database.</p>
                        <p><strong>Error:</strong> ${dbError.message}</p>
                        <p><strong>MongoDB State:</strong> ${mongoose.connection.readyState}</p>
                        <p><a href="/api/health">Check Health Status</a></p>
                        <h3>Troubleshooting:</h3>
                        <ul>
                            <li>Verify MongoDB Atlas network access allows 0.0.0.0/0</li>
                            <li>Check MONGODB_URI environment variable</li>
                            <li>Ensure database cluster is running</li>
                        </ul>
                    </div>
                </body>
                </html>
            `);
        }
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).send(`
        <h1>Error</h1>
        <p>${err.message}</p>
        <pre>${process.env.NODE_ENV !== 'production' ? err.stack : ''}</pre>
    `);
});

// Export for Vercel
module.exports = app;
