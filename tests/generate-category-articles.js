// Generate one article for each of the 9 categories
require('dotenv').config();
const connectDB = require('../config/database');
const automationService = require('../services/automation.service');
const logger = require('../config/logger');

async function generateCategoryArticles() {
    try {
        logger.info('Generating one article for each category...');

        // Connect to database
        await connectDB();

        const categories = [
            'Technology',
            'Health',
            'Finance',
            'Business',
            'Lifestyle',
            'Education',
            'Travel',
            'Food',
            'Entertainment'
        ];

        logger.info('\n=== Generating 9 Category Articles ===\n');

        const results = [];

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            logger.info(`\n[${i + 1}/9] Generating article for ${category}...`);

            try {
                const result = await automationService.runDailyAutomation(category);
                results.push(result);

                if (result.success) {
                    logger.info(`[${i + 1}/9] ✓ Success: ${result.article.title}`);
                    logger.info(`   Category: ${result.article.category}`);
                    logger.info(`   URL: ${result.article.url}`);
                } else {
                    logger.error(`[${i + 1}/9] ✗ Failed: ${result.error}`);
                }

                // Small delay between articles
                if (i < categories.length - 1) {
                    logger.info('Waiting 3 seconds before next article...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            } catch (error) {
                logger.error(`[${i + 1}/9] ✗ Error: ${error.message}`);
                results.push({
                    success: false,
                    category,
                    error: error.message,
                });
            }
        }

        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        logger.info('\n========================================');
        logger.info('CATEGORY GENERATION COMPLETE');
        logger.info(`✓ Successful: ${successful}/9`);
        logger.info(`✗ Failed: ${failed}/9`);
        logger.info('========================================');

        if (successful > 0) {
            logger.info('\nSuccessful Articles:');
            results.filter(r => r.success).forEach((result, index) => {
                logger.info(`${index + 1}. [${result.article.category}] ${result.article.title}`);
            });
        }

        logger.info('\n✓ All categories now have at least one article!');
        logger.info('Visit http://localhost:3000 to see your populated site!');

        process.exit(0);
    } catch (error) {
        logger.error(`Test failed: ${error.message}`);
        process.exit(1);
    }
}

generateCategoryArticles();
