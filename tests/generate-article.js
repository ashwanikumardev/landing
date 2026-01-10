// Generate article without images
require('dotenv').config();
const connectDB = require('../config/database');
const geminiService = require('../services/gemini.service');
const articleService = require('../services/article.service');
const logger = require('../config/logger');

async function generateArticle() {
    try {
        console.log('========================================');
        console.log('Generating Article (No Images)');
        console.log('========================================\n');

        // Connect to database
        await connectDB();
        console.log('✓ Connected to MongoDB\n');

        // Step 1: Create title
        const topic = 'AI tools and applications 2026';
        console.log(`Topic: ${topic}`);

        const { title, keyword } = await geminiService.convertTrendToTitle(topic);
        console.log(`✓ Title: ${title}`);
        console.log(`✓ Keyword: ${keyword}\n`);

        // Step 2: Generate article
        console.log('Generating article content...');
        const content = await geminiService.generateArticle(title, keyword);
        console.log(`✓ Article generated (${content.length} characters)\n`);

        // Step 3: Generate metadata
        console.log('Generating metadata...');
        const { metaTitle, metaDescription, slug } = await geminiService.generateMetaData(title, content);
        console.log(`✓ Meta title: ${metaTitle}`);
        console.log(`✓ Meta description: ${metaDescription}`);
        console.log(`✓ Slug: ${slug}\n`);

        // Step 4: Extract FAQs
        const faqs = geminiService.extractFAQs(content);
        console.log(`✓ Extracted ${faqs.length} FAQs\n`);

        // Step 5: Save to database
        console.log('Saving to database...');
        const articleData = {
            title,
            slug,
            content,
            category: 'Technology',
            metaTitle,
            metaDescription,
            keyword,
            faqs,
            trendingTopic: topic,
            thumbnail: null, // No image for now
            thumbnailGeneratedAt: null,
            isPublished: true,
            publishedAt: new Date(),
        };

        const article = await articleService.createArticle(articleData);
        console.log(`✓ Article saved with ID: ${article._id}\n`);

        console.log('========================================');
        console.log('✓ SUCCESS!');
        console.log(`✓ Article URL: http://localhost:3000/blog/${article.slug}`);
        console.log('========================================');

        process.exit(0);
    } catch (error) {
        console.error('\n========================================');
        console.error('✗ FAILED');
        console.error(`✗ Error: ${error.message}`);
        console.error('========================================');
        console.error(error);
        process.exit(1);
    }
}

generateArticle();
