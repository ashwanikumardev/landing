// Test generating 6 articles across different categories
require('dotenv').config();
const connectDB = require('../config/database');
const automationService = require('../services/automation.service');
const logger = require('../config/logger');

async function testMultipleArticles() {
    try {
        logger.info('Testing 6-article generation across categories...');

        // Connect to database
        await connectDB();

        // Generate 6 articles
        logger.info('\n=== Generating 6 Articles ===\n');

        const results = await automationService.runMultipleArticles(6);

        // Summary
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        logger.info('\n========================================');
        logger.info('TEST COMPLETE');
        logger.info(`✓ Successful: ${successful.length}/6`);
        logger.info(`✗ Failed: ${failed.length}/6`);
        logger.info('========================================');

        if (successful.length > 0) {
            logger.info('\nSuccessful Articles:');
            successful.forEach((result, index) => {
                logger.info(`${index + 1}. [${result.article.category}] ${result.article.title}`);
                logger.info(`   URL: ${result.article.url}`);
            });
        }

        process.exit(0);
    } catch (error) {
        logger.error(`Test failed: ${error.message}`);
        process.exit(1);
    }
}

testMultipleArticles();
