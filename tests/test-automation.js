// Test complete automation workflow
require('dotenv').config();
const connectDB = require('../config/database');
const automationService = require('../services/automation.service');
const logger = require('../config/logger');

async function testAutomation() {
    try {
        logger.info('Testing complete automation workflow...');

        // Connect to database
        await connectDB();

        // Run automation
        logger.info('\n=== Running Daily Automation ===');
        logger.info('This will take 1-2 minutes...\n');

        const result = await automationService.runDailyAutomation();

        if (result.success) {
            logger.info('\n✓ Automation test PASSED!');
            logger.info(`Article created: ${result.article.title}`);
            logger.info(`URL: ${result.article.url}`);
            logger.info(`Execution time: ${result.executionTime}s`);
        } else {
            logger.error('\n✗ Automation test FAILED!');
            logger.error(`Error: ${result.error}`);
            process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        logger.error(`Test failed: ${error.message}`);
        process.exit(1);
    }
}

testAutomation();
