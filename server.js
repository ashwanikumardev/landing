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
let dbConnected = false;
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 1,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    }).then(() => {
        dbConnected = true;
        console.log('MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connection error:', err.message);
        dbConnected = false;
    });
}

// Load routes with error handling
try {
    const routes = require('./routes');
    app.use('/', routes);
} catch (error) {
    console.error('Failed to load routes:', error.message);

    // Fallback homepage
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AugCodex - Automated News Platform</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        background: #f8f9fa;
                        padding: 20px;
                    }
                    .container {
                        max-width: 800px;
                        margin: 50px auto;
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #e63946;
                        margin-bottom: 20px;
                    }
                    .logo { font-size: 2rem; font-weight: bold; margin-bottom: 30px; }
                    .logo span { color: #1d3557; }
                    .status {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .info {
                        background: #d1ecf1;
                        border-left: 4px solid #0c5460;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    ul { margin: 15px 0 15px 30px; }
                    li { margin: 8px 0; }
                    a { color: #e63946; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    .btn {
                        display: inline-block;
                        padding: 10px 20px;
                        background: #e63946;
                        color: white;
                        border-radius: 4px;
                        margin: 10px 10px 10px 0;
                    }
                    .btn:hover { background: #c5303e; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">Aug<span>Codex</span></div>
                    <h1>Database Connection Issue</h1>
                    
                    <div class="status">
                        <strong>⚠️ Status:</strong> The site is having trouble connecting to MongoDB Atlas.
                    </div>
                    
                    <div class="info">
                        <strong>ℹ️ What's happening:</strong>
                        <p>Vercel's serverless functions are unable to maintain a persistent connection to MongoDB Atlas. This is a known limitation of serverless platforms.</p>
                    </div>
                    
                    <h2>Solutions:</h2>
                    
                    <h3>Option 1: Deploy to Railway (Recommended)</h3>
                    <ul>
                        <li>✅ Supports persistent MongoDB connections</li>
                        <li>✅ Free tier available</li>
                        <li>✅ Cron jobs work (automatic article generation)</li>
                        <li>✅ 5-minute setup</li>
                    </ul>
                    <a href="https://railway.app" class="btn" target="_blank">Deploy to Railway</a>
                    
                    <h3>Option 2: Use MongoDB Data API</h3>
                    <ul>
                        <li>Works with Vercel serverless</li>
                        <li>Requires MongoDB Atlas Data API setup</li>
                        <li>HTTP-based access (no persistent connection needed)</li>
                    </ul>
                    
                    <h3>Option 3: Local Development</h3>
                    <p>The site works perfectly when run locally:</p>
                    <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; margin: 10px 0;">npm start</pre>
                    
                    <h2>Quick Links:</h2>
                    <ul>
                        <li><a href="/api/health">Health Check</a></li>
                        <li><a href="https://github.com/ashwanikumardev/landing">GitHub Repository</a></li>
                    </ul>
                    
                    <p style="margin-top: 30px; color: #666;">
                        <strong>MongoDB State:</strong> ${mongoose.connection.readyState} (0=disconnected, 1=connected)<br>
                        <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                        <strong>Platform:</strong> ${process.env.VERCEL ? 'Vercel Serverless' : 'Local'}
                    </p>
                </div>
            </body>
            </html>
        `);
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).send(`
        <h1>Error</h1>
        <p>${err.message}</p>
        <p><a href="/">Go Home</a></p>
    `);
});

// Export for Vercel
module.exports = app;
