// Test Google Trends API integration
require('dotenv').config();
const trendsService = require('../services/trends.service');
const logger = require('../config/logger');

async function testTrends() {
    try {
        logger.info('Testing Google Trends API...');

        // Test 1: Get daily trends
        logger.info('\n=== Test 1: Get Daily Trends ===');
        const trends = await trendsService.getDailyTrends();
        logger.info(`Found ${trends.length} trending topics`);
        trends.slice(0, 5).forEach((trend, index) => {
            logger.info(`${index + 1}. ${trend.title} (Traffic: ${trend.traffic})`);
        });

        // Test 2: Get top trend
        logger.info('\n=== Test 2: Get Top Trend ===');
        const topTrend = await trendsService.getTopTrend();
        logger.info(`Top trend: ${topTrend}`);

        // Test 3: Get multiple trends
        logger.info('\n=== Test 3: Get Multiple Trends ===');
        const multipleTrends = await trendsService.getMultipleTrends(3);
        multipleTrends.forEach((trend, index) => {
            logger.info(`${index + 1}. ${trend}`);
        });

        logger.info('\n✓ All Google Trends tests passed!');
    } catch (error) {
        logger.error(`Test failed: ${error.message}`);
        process.exit(1);
    }
}

testTrends();
