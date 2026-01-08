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

// Health check endpoint
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

// Try to load routes with error handling
try {
    const routes = require('./routes');
    app.use('/', routes);
} catch (error) {
    console.error('Error loading routes:', error);

    // Fallback route
    app.get('/', (req, res) => {
        res.send(`
            <h1>AugCodex</h1>
            <p>Server is running but routes failed to load.</p>
            <p>Error: ${error.message}</p>
            <p><a href="/api/health">Check Health</a></p>
        `);
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
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
