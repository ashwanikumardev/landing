const trendsService = require('./trends.service');
const geminiService = require('./gemini.service');
const articleService = require('./article.service');
const imageService = require('./image.service');
const logger = require('../config/logger');

class AutomationService {
    constructor() {
        // 9 popular categories for diverse content
        this.categories = [
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

        // Category-specific trending topics
        this.categoryTopics = {
            'Technology': [
                'AI tools and applications',
                'Latest smartphone reviews',
                'Cybersecurity tips',
                'Cloud computing trends',
                'Software development best practices'
            ],
            'Health': [
                'Healthy eating habits',
                'Fitness workout routines',
                'Mental health wellness',
                'Natural remedies',
                'Sleep improvement tips'
            ],
            'Finance': [
                'Personal finance tips',
                'Investment strategies',
                'Cryptocurrency guide',
                'Budgeting techniques',
                'Passive income ideas'
            ],
            'Business': [
                'Digital marketing strategies',
                'Entrepreneurship tips',
                'Remote work productivity',
                'Business growth hacks',
                'Leadership skills'
            ],
            'Lifestyle': [
                'Home improvement ideas',
                'Fashion trends',
                'Minimalist living',
                'Productivity hacks',
                'Self-improvement tips'
            ],
            'Education': [
                'Online learning platforms',
                'Study techniques',
                'Career development',
                'Skill-building resources',
                'Educational technology'
            ],
            'Travel': [
                'Travel destinations guide',
                'Budget travel tips',
                'Travel photography',
                'Adventure activities',
                'Cultural experiences'
            ],
            'Food': [
                'Healthy recipes',
                'Meal prep ideas',
                'Cooking techniques',
                'Food trends',
                'Restaurant reviews'
            ],
            'Entertainment': [
                'Movie recommendations',
                'Music trends',
                'Gaming reviews',
                'Book recommendations',
                'Streaming platform guides'
            ]
        };
    }

    /**
     * Get a topic for a specific category
     * @param {string} category - Category name
     * @returns {string} Topic for the category
     */
    getTopicForCategory(category) {
        const topics = this.categoryTopics[category];
        const randomIndex = Math.floor(Math.random() * topics.length);
        return topics[randomIndex];
    }

    /**
     * Run the complete daily automation workflow
     * Generates article for a specific category
     */
    async runDailyAutomation(category = null) {
        const startTime = Date.now();

        // Select category if not provided
        if (!category) {
            const randomIndex = Math.floor(Math.random() * this.categories.length);
            category = this.categories[randomIndex];
        }

        logger.info('========================================');
        logger.info(`Starting automation for category: ${category}`);
        logger.info('========================================');

        try {
            // Step 1: Get topic for category
            logger.info(`Step 1: Getting topic for ${category}...`);
            const trendingTopic = this.getTopicForCategory(category);
            logger.info(`✓ Topic: ${trendingTopic}`);

            // Step 2: Convert to SEO title
            logger.info('Step 2: Converting to SEO title...');
            const { title, keyword } = await geminiService.convertTrendToTitle(trendingTopic);
            logger.info(`✓ Title: ${title}`);
            logger.info(`✓ Keyword: ${keyword}`);

            // Step 3: Generate full article
            logger.info('Step 3: Generating full article...');
            const content = await geminiService.generateArticle(title, keyword);
            logger.info(`✓ Article generated (${content.length} characters)`);

            // Step 4: Generate meta data
            logger.info('Step 4: Generating meta data...');
            const { metaTitle, metaDescription, slug } = await geminiService.generateMetaData(title, content);
            logger.info(`✓ Meta title: ${metaTitle}`);
            logger.info(`✓ Meta description: ${metaDescription}`);
            logger.info(`✓ Slug: ${slug}`);

            // Step 5: Extract FAQs
            logger.info('Step 5: Extracting FAQs...');
            const faqs = geminiService.extractFAQs(content);
            logger.info(`✓ Extracted ${faqs.length} FAQs`);

            // Step 6: Generate thumbnail image
            logger.info('Step 6: Generating thumbnail image...');
            const thumbnail = await imageService.generateThumbnail(title, category);
            if (thumbnail) {
                logger.info(`✓ Thumbnail generated: ${thumbnail}`);
            } else {
                logger.warn('⚠ Thumbnail generation skipped or failed');
            }

            // Step 7: Save to database
            logger.info('Step 7: Saving to database...');
            const articleData = {
                title,
                slug,
                content,
                category,
                metaTitle,
                metaDescription,
                keyword,
                faqs,
                trendingTopic,
                thumbnail,
                thumbnailGeneratedAt: thumbnail ? new Date() : null,
                isPublished: true,
                publishedAt: new Date(),
            };

            const article = await articleService.createArticle(articleData);
            logger.info(`✓ Article saved with ID: ${article._id}`);

            // Calculate execution time
            const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.info('========================================');
            logger.info('✓ AUTOMATION COMPLETED SUCCESSFULLY');
            logger.info(`✓ Category: ${category}`);
            logger.info(`✓ Article URL: /blog/${article.slug}`);
            logger.info(`✓ Execution time: ${executionTime}s`);
            logger.info('========================================');

            return {
                success: true,
                article: {
                    id: article._id,
                    title: article.title,
                    slug: article.slug,
                    category: article.category,
                    url: `/blog/${article.slug}`,
                },
                executionTime,
            };

        } catch (error) {
            const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.error('========================================');
            logger.error('✗ AUTOMATION FAILED');
            logger.error(`✗ Category: ${category}`);
            logger.error(`✗ Error: ${error.message}`);
            logger.error(`✗ Execution time: ${executionTime}s`);
            logger.error('========================================');

            logger.error(error.stack);

            return {
                success: false,
                category,
                error: error.message,
                executionTime,
            };
        }
    }

    /**
     * Run automation for multiple articles (6 posts daily)
     * @param {number} count - Number of articles to generate
     * @returns {Promise<Array>} Array of results
     */
    async runMultipleArticles(count = 6) {
        logger.info('========================================');
        logger.info(`GENERATING ${count} ARTICLES`);
        logger.info('========================================');

        const results = [];

        // Shuffle categories to ensure variety
        const shuffledCategories = [...this.categories].sort(() => Math.random() - 0.5);

        for (let i = 0; i < count; i++) {
            const category = shuffledCategories[i % shuffledCategories.length];
            logger.info(`\n[${i + 1}/${count}] Starting article generation for ${category}...`);

            try {
                const result = await this.runDailyAutomation(category);
                results.push(result);

                if (result.success) {
                    logger.info(`[${i + 1}/${count}] ✓ Success: ${result.article.title}`);
                } else {
                    logger.error(`[${i + 1}/${count}] ✗ Failed: ${result.error}`);
                }

                // Small delay between articles to avoid rate limiting
                if (i < count - 1) {
                    logger.info('Waiting 15 seconds before next article to avoid rate limits...');
                    await new Promise(resolve => setTimeout(resolve, 15000));
                }

            } catch (error) {
                logger.error(`[${i + 1}/${count}] ✗ Error: ${error.message}`);
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
        logger.info('BATCH GENERATION COMPLETE');
        logger.info(`✓ Successful: ${successful}/${count}`);
        logger.info(`✗ Failed: ${failed}/${count}`);
        logger.info('========================================');

        return results;
    }

    /**
     * Run automation with retry logic
     * @param {number} maxRetries - Maximum number of retries
     * @returns {Promise<Object>} Automation result
     */
    async runWithRetry(maxRetries = 3, category = null) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`Automation attempt ${attempt}/${maxRetries}`);
                const result = await this.runDailyAutomation(category);

                if (result.success) {
                    return result;
                }

                lastError = result.error;
            } catch (error) {
                lastError = error.message;
                logger.warn(`Attempt ${attempt} failed: ${error.message}`);
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000;
                logger.info(`Waiting ${waitTime / 1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        logger.error(`All ${maxRetries} attempts failed. Last error: ${lastError}`);
        throw new Error(`Automation failed after ${maxRetries} attempts: ${lastError}`);
    }

    /**
     * Get automation status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isRunning: this.isRunning || false,
            lastRun: this.lastRun || null,
            lastResult: this.lastResult || null,
            categories: this.categories,
        };
    }
}

module.exports = new AutomationService();
