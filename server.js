require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint (always works)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasMongoUri: !!process.env.MONGODB_URI,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            isVercel: !!process.env.VERCEL
        }
    });
});

// Initialize database connection with error handling
let dbConnected = false;
const connectDB = require('./config/database');

connectDB()
    .then(() => {
        dbConnected = true;
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        dbConnected = false;
    });

// Load routes with error handling
try {
    const routes = require('./routes');
    app.use('/', routes);
} catch (error) {
    console.error('Error loading routes:', error);

    // Fallback routes if main routes fail
    app.get('/', (req, res) => {
        if (!dbConnected) {
            return res.status(503).send(`
                <h1>AugCodex - Database Connection Error</h1>
                <p>The database is not connected. Please check:</p>
                <ul>
                    <li>MongoDB Atlas is accessible</li>
                    <li>Network access is configured (0.0.0.0/0)</li>
                    <li>MONGODB_URI environment variable is correct</li>
                </ul>
                <p><a href="/api/health">Check Health Status</a></p>
            `);
        }

        res.status(500).send(`
            <h1>AugCodex - Server Error</h1>
            <p>Routes failed to load: ${error.message}</p>
            <p><a href="/api/health">Check Health Status</a></p>
        `);
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Go Home</a></p>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Only start server locally
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
