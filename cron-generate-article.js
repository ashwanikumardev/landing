#!/usr/bin/env node

require('dotenv').config();
const automationService = require('./services/automation.service');
const mongoose = require('mongoose');

async function generateArticle() {
    try {
        console.log('Starting article generation...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Generate article
        const result = await automationService.runDailyAutomation();

        if (result.success) {
            console.log(`✓ Article generated: ${result.article.title}`);
            console.log(`  Category: ${result.article.category}`);
            console.log(`  Slug: ${result.article.slug}`);
        } else {
            console.error(`✗ Failed: ${result.error}`);
            process.exit(1);
        }

        await mongoose.connection.close();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

generateArticle();
