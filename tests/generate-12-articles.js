// Generate 12 articles immediately
require('dotenv').config();
const connectDB = require('../config/database');
const automationService = require('../services/automation.service');
const logger = require('../config/logger');

async function generate12Articles() {
    try {
        logger.info('Starting generation of 12 articles...');

        // Connect to database
        await connectDB();

        // Generate 12 articles
        const results = await automationService.runMultipleArticles(12);

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        logger.info('\n========================================');
        logger.info('GENERATION COMPLETE');
        logger.info(`✓ Successful: ${successful}/12`);
        logger.info(`✗ Failed: ${failed}/12`);
        logger.info('========================================');

        if (successful > 0) {
            logger.info('\nSuccessful Articles:');
            results.filter(r => r.success).forEach((result, index) => {
                logger.info(`${index + 1}. [${result.article.category}] ${result.article.title}`);
            });
        }

        logger.info('\n✓ Done! Visit http://localhost:3000 or https://www.augcodex.site to see articles!');
        process.exit(0);
    } catch (error) {
        logger.error(`Generation failed: ${error.message}`);
        process.exit(1);
    }
}

generate12Articles();
