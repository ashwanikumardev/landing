const express = require('express');
const router = express.Router();
const articleService = require('../services/article.service');
const automationService = require('../services/automation.service');

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

// Homepage
router.get('/', async (req, res) => {
    try {
        const articles = await articleService.getRecentArticles(12);
        const stats = await articleService.getStats();

        res.render('index', {
            title: process.env.SITE_NAME || 'AugCodex',
            description: process.env.SITE_DESCRIPTION || 'Your Daily Source for News',
            articles,
            categories,
            stats
        });
    } catch (error) {
        console.error('Homepage error:', error);
        res.status(500).send('Error loading homepage');
    }
});

// Category page
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const articles = await articleService.getArticlesByCategory(category);

        res.render('category', {
            title: `${category} - ${process.env.SITE_NAME}`,
            description: `Latest ${category} articles`,
            category,
            categories,
            articles
        });
    } catch (error) {
        console.error('Category page error:', error);
        res.status(500).send('Error loading category');
    }
});

// Article page
router.get('/blog/:slug', async (req, res) => {
    try {
        const article = await articleService.getArticleBySlug(req.params.slug);

        if (!article) {
            return res.status(404).render('404', {
                title: '404 - Article Not Found',
                message: 'The article you are looking for does not exist.'
            });
        }

        // Increment views
        await articleService.incrementViews(article._id);

        // Convert markdown to HTML
        const marked = require('marked');
        article.contentHtml = marked.parse(article.content || '');

        res.render('article', {
            title: article.metaTitle,
            description: article.metaDescription,
            article,
            siteUrl: process.env.SITE_URL || 'http://localhost:3000'
        });
    } catch (error) {
        console.error('Article page error:', error);
        res.status(500).send('Error loading article');
    }
});

// API: Generate single article (POST)
router.post('/api/generate', async (req, res) => {
    try {
        const { category } = req.body;

        const result = await automationService.runDailyAutomation(category);

        res.json({
            success: result.success,
            article: result.article ? {
                title: result.article.title,
                slug: result.article.slug,
                category: result.article.category,
                url: `/blog/${result.article.slug}`
            } : null,
            error: result.error
        });
    } catch (error) {
        console.error('Generate article error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Generate single article (GET - for easy testing)
router.get('/api/generate', async (req, res) => {
    try {
        console.log('GET /api/generate called');
        const result = await automationService.runDailyAutomation();

        res.json({
            success: result.success,
            message: result.success ? 'Article generated successfully' : 'Failed to generate article',
            article: result.article ? {
                title: result.article.title,
                slug: result.article.slug,
                category: result.article.category,
                url: `/blog/${result.article.slug}`
            } : null,
            error: result.error
        });
    } catch (error) {
        console.error('Generate article error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Generate multiple articles
router.post('/api/generate-multiple', async (req, res) => {
    try {
        const { count = 6 } = req.body;

        const results = await automationService.runMultipleArticles(count);

        const successful = results.filter(r => r.success);

        res.json({
            success: true,
            total: results.length,
            successful: successful.length,
            failed: results.length - successful.length,
            articles: successful.map(r => ({
                title: r.article.title,
                category: r.article.category,
                url: `/blog/${r.article.slug}`
            }))
        });
    } catch (error) {
        console.error('Generate multiple articles error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Cron endpoint for Vercel Cron
router.get('/api/cron/generate-articles', async (req, res) => {
    try {
        // Verify cron secret for security
        const cronSecret = req.headers['authorization'];
        if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Generate 2 articles
        const results = await automationService.runMultipleArticles(2);

        const successful = results.filter(r => r.success);

        res.json({
            success: true,
            generated: successful.length,
            articles: successful.map(r => r.article.title)
        });
    } catch (error) {
        console.error('Cron generate error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        const articles = await articleService.getRecentArticles(1000); // Get all articles
        const baseUrl = process.env.SITE_URL || 'http://localhost:3000';

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Homepage
        xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

        // Categories
        categories.forEach(category => {
            xml += `  <url>\n    <loc>${baseUrl}/category/${category}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        // Articles
        articles.forEach(article => {
            const lastmod = article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString();
            xml += `  <url>\n    <loc>${baseUrl}/blog/${article.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`);
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
