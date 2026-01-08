require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, configure properly in production
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.',
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    logger.error(err.stack);

    res.status(500).render('error', {
        title: 'Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message,
    });
});

// Only start server if not in Vercel (serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    // Start cron jobs only in non-serverless environment
    const dailyArticleJob = require('./jobs/dailyArticle.job');
    const imageCleanupJob = require('./jobs/imageCleanup.job');

    app.listen(PORT, () => {
        logger.info(`========================================`);
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`URL: http://localhost:${PORT}`);
        logger.info(`========================================`);

        // Start cron jobs
        dailyArticleJob.start();
        imageCleanupJob.start();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        dailyArticleJob.stop();
        imageCleanupJob.stop();
        process.exit(0);
    });

    process.on('SIGINT', () => {
        logger.info('SIGINT signal received: closing HTTP server');
        dailyArticleJob.stop();
        imageCleanupJob.stop();
        process.exit(0);
    });
}

// Export for Vercel serverless
module.exports = app;
