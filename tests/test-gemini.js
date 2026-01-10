require('dotenv').config();
const geminiService = require('../services/gemini.service');
const logger = require('../config/logger');

async function testGeminiAPI() {
    console.log('========================================');
    console.log('Testing Google Gemini API Integration');
    console.log('========================================\n');

    try {
        // Test 1: Convert trend to title
        console.log('Test 1: Converting trend to SEO title...');
        const topic = 'AI tools and applications';
        const { title, keyword } = await geminiService.convertTrendToTitle(topic);
        console.log('✓ Title:', title);
        console.log('✓ Keyword:', keyword);
        console.log('');

        // Test 2: Generate article (shorter for testing)
        console.log('Test 2: Generating article...');
        const content = await geminiService.generateArticle(title, keyword);
        console.log('✓ Article generated');
        console.log('✓ Length:', content.length, 'characters');
        console.log('✓ Preview:', content.substring(0, 200) + '...');
        console.log('');

        // Test 3: Generate metadata
        console.log('Test 3: Generating metadata...');
        const { metaTitle, metaDescription, slug } = await geminiService.generateMetaData(title, content);
        console.log('✓ Meta Title:', metaTitle);
        console.log('✓ Meta Description:', metaDescription);
        console.log('✓ Slug:', slug);
        console.log('');

        // Test 4: Extract FAQs
        console.log('Test 4: Extracting FAQs...');
        const faqs = geminiService.extractFAQs(content);
        console.log('✓ FAQs found:', faqs.length);
        if (faqs.length > 0) {
            console.log('✓ First FAQ:', faqs[0].question);
        }
        console.log('');

        console.log('========================================');
        console.log('✓ ALL TESTS PASSED!');
        console.log('✓ Gemini API is working correctly');
        console.log('========================================');

    } catch (error) {
        console.error('========================================');
        console.error('✗ TEST FAILED');
        console.error('✗ Error:', error.message);
        console.error('========================================');
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the test
testGeminiAPI();
