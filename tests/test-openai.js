// Test OpenAI API integration
require('dotenv').config();
const openaiService = require('../services/openai.service');
const logger = require('../config/logger');

async function testOpenAI() {
    try {
        logger.info('Testing OpenAI API...');

        const testTopic = 'AI tools for students';

        // Test 1: Convert trend to title
        logger.info('\n=== Test 1: Convert Trend to Title ===');
        const { title, keyword } = await openaiService.convertTrendToTitle(testTopic);
        logger.info(`Original topic: ${testTopic}`);
        logger.info(`Generated title: ${title}`);
        logger.info(`Keyword: ${keyword}`);

        // Test 2: Generate article (shortened for testing)
        logger.info('\n=== Test 2: Generate Article ===');
        logger.info('Generating article... (this may take 30-60 seconds)');
        const content = await openaiService.generateArticle(title, keyword);
        logger.info(`Article length: ${content.length} characters`);
        logger.info(`First 200 characters: ${content.substring(0, 200)}...`);

        // Test 3: Generate meta data
        logger.info('\n=== Test 3: Generate Meta Data ===');
        const metaData = await openaiService.generateMetaData(title, content);
        logger.info(`Meta title: ${metaData.metaTitle}`);
        logger.info(`Meta description: ${metaData.metaDescription}`);
        logger.info(`Slug: ${metaData.slug}`);

        // Test 4: Extract FAQs
        logger.info('\n=== Test 4: Extract FAQs ===');
        const faqs = openaiService.extractFAQs(content);
        logger.info(`Extracted ${faqs.length} FAQs`);
        faqs.forEach((faq, index) => {
            logger.info(`${index + 1}. ${faq.question}`);
        });

        logger.info('\n✓ All OpenAI tests passed!');
    } catch (error) {
        logger.error(`Test failed: ${error.message}`);
        process.exit(1);
    }
}

testOpenAI();
