require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check (must work without database)
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
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    }).then(() => {
        logger.info('MongoDB connected successfully');
    }).catch(err => {
        logger.error('MongoDB connection error:', err.message);
    });
}

// Load routes
try {
    const routes = require('./routes');
    app.use('/', routes);
    logger.info('Routes loaded successfully');
} catch (error) {
    logger.error('Failed to load routes:', error.message);

    // Fallback homepage
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

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Global error:', err);
    res.status(500).send('Internal Server Error');
});

// Start server (MUST listen on 0.0.0.0 for Railway)
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('========================================');
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('========================================');

    // Start cron jobs only if not on Vercel
    if (!process.env.VERCEL) {
        try {
            const dailyArticleJob = require('./jobs/dailyArticle.job');
            const imageCleanupJob = require('./jobs/imageCleanup.job');

            dailyArticleJob.start();
            imageCleanupJob.start();
            logger.info('Cron jobs started successfully');
        } catch (error) {
            logger.error('Failed to start cron jobs:', error.message);
        }
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server...');
    server.close(() => {
        logger.info('Server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, closing server...');
    server.close(() => {
        logger.info('Server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Export for Vercel
module.exports = app;
