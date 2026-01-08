const express = require('express');
const router = express.Router();
const articleService = require('../services/article.service');
const automationService = require('../services/automation.service');
const dailyArticleJob = require('../jobs/dailyArticle.job');
const { marked } = require('marked');
const logger = require('../config/logger');

/**
 * Homepage - Display latest articles
 */
router.get('/', async (req, res) => {
    try {
        const articles = await articleService.getLatestArticles(12);
        const stats = await articleService.getStats();
        const categories = ['Technology', 'Health', 'Finance', 'Business', 'Lifestyle', 'Education', 'Travel', 'Food', 'Entertainment'];

        res.render('index', {
            title: process.env.SITE_NAME || 'SEO Blog',
            description: process.env.SITE_DESCRIPTION || 'Automated SEO content generation',
            articles,
            stats,
            categories,
        });
    } catch (error) {
        logger.error(`Error rendering homepage: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Category page - Display articles by category
 */
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const articles = await articleService.getArticlesByCategory(category, 20);
        const stats = await articleService.getStats();
        const categories = ['Technology', 'Health', 'Finance', 'Business', 'Lifestyle', 'Education', 'Travel', 'Food', 'Entertainment'];

        res.render('category', {
            title: `${category} Articles - ${process.env.SITE_NAME}`,
            description: `Browse ${category} articles on ${process.env.SITE_NAME}`,
            category,
            articles,
            stats,
            categories,
        });
    } catch (error) {
        logger.error(`Error rendering category page: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Individual blog article page
 */
router.get('/blog/:slug', async (req, res) => {
    try {
        const article = await articleService.getArticleBySlug(req.params.slug);

        if (!article) {
            return res.status(404).render('404', {
                title: 'Article Not Found',
                message: 'The article you are looking for does not exist.',
            });
        }

        // Convert markdown to HTML
        const contentHtml = marked(article.content);

        res.render('article', {
            title: article.metaTitle,
            description: article.metaDescription,
            article: {
                ...article.toObject(),
                contentHtml,
            },
            siteUrl: process.env.SITE_URL || 'http://localhost:3000',
        });
    } catch (error) {
        logger.error(`Error rendering article: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Dynamic sitemap.xml generation
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const articles = await articleService.getAllPublishedArticles();
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Homepage
        sitemap += '  <url>\n';
        sitemap += `    <loc>${siteUrl}/</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';

        // Articles
        articles.forEach(article => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${siteUrl}/blog/${article.slug}</loc>\n`;
            sitemap += `    <lastmod>${article.publishedAt.toISOString()}</lastmod>\n`;
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '    <priority>0.8</priority>\n';
            sitemap += '  </url>\n';
        });

        sitemap += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        logger.error(`Error generating sitemap: ${error.message}`);
        res.status(500).send('Error generating sitemap');
    }
});

/**
 * Robots.txt
 */
router.get('/robots.txt', (req, res) => {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

/**
 * API: Manual article generation trigger (for testing)
 */
router.post('/api/generate', async (req, res) => {
    try {
        logger.info('Manual article generation triggered via API');

        const result = await dailyArticleJob.trigger();

        res.json(result);
    } catch (error) {
        logger.error(`API generation error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * API: Get automation status
 */
router.get('/api/status', (req, res) => {
    const jobStatus = dailyArticleJob.getStatus();
    const automationStatus = automationService.getStatus();

    res.json({
        job: jobStatus,
        automation: automationStatus,
    });
});

module.exports = router;
