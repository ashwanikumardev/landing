const Article = require('../models/Article');
const logger = require('../config/logger');

class ArticleService {
    /**
     * Create and save a new article
     * @param {Object} articleData - Article data
     * @returns {Promise<Object>} Saved article
     */
    async createArticle(articleData) {
        try {
            logger.info(`Creating article: ${articleData.title}`);

            // Check for duplicate slug
            const existingArticle = await Article.findOne({ slug: articleData.slug });
            if (existingArticle) {
                // Append timestamp to make unique
                articleData.slug = `${articleData.slug}-${Date.now()}`;
                logger.warn(`Duplicate slug detected, using: ${articleData.slug}`);
            }

            const article = new Article(articleData);
            await article.save();

            logger.info(`Article created successfully: ${article.slug}`);
            return article;
        } catch (error) {
            logger.error(`Error creating article: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get article by slug
     * @param {string} slug - Article slug
     * @returns {Promise<Object>} Article object
     */
    async getArticleBySlug(slug) {
        try {
            const article = await Article.findOne({ slug, isPublished: true });

            if (article) {
                // Increment view count
                article.views += 1;
                await article.save();
            }

            return article;
        } catch (error) {
            logger.error(`Error getting article by slug: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get latest published articles
     * @param {number} limit - Number of articles to return
     * @returns {Promise<Array>} Array of articles
     */
    async getLatestArticles(limit = 10) {
        try {
            const articles = await Article.find({ isPublished: true })
                .sort({ publishedAt: -1 })
                .limit(limit)
                .select('title slug metaDescription publishedAt views');

            return articles;
        } catch (error) {
            logger.error(`Error getting latest articles: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all published articles (for sitemap)
     * @returns {Promise<Array>} Array of all published articles
     */
    async getAllPublishedArticles() {
        try {
            const articles = await Article.find({ isPublished: true })
                .sort({ publishedAt: -1 })
                .select('slug publishedAt');

            return articles;
        } catch (error) {
            logger.error(`Error getting all published articles: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if slug already exists
     * @param {string} slug - Slug to check
     * @returns {Promise<boolean>} True if exists
     */
    async checkDuplicateSlug(slug) {
        try {
            const article = await Article.findOne({ slug });
            return !!article;
        } catch (error) {
            logger.error(`Error checking duplicate slug: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get article statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStats() {
        try {
            const totalArticles = await Article.countDocuments({ isPublished: true });
            const totalViews = await Article.aggregate([
                { $match: { isPublished: true } },
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]);

            return {
                totalArticles,
                totalViews: totalViews[0]?.total || 0,
            };
        } catch (error) {
            logger.error(`Error getting stats: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete article by slug (for testing)
     * @param {string} slug - Article slug
     * @returns {Promise<boolean>} Success status
     */
    async deleteArticle(slug) {
        try {
            const result = await Article.deleteOne({ slug });
            logger.info(`Article deleted: ${slug}`);
            return result.deletedCount > 0;
        } catch (error) {
            logger.error(`Error deleting article: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ArticleService();
