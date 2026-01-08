const googleTrends = require('google-trends-api');
const logger = require('../config/logger');

class TrendsService {
    constructor() {
        this.geo = process.env.TRENDS_GEO || 'US';
        // Fallback trending topics when API fails
        this.fallbackTopics = [
            'AI tools for productivity',
            'Best smartphones 2026',
            'Healthy meal prep ideas',
            'Remote work tips',
            'Cryptocurrency investing',
            'Fitness workout routines',
            'Digital marketing strategies',
            'Python programming tutorials',
            'Travel destinations 2026',
            'Home improvement ideas',
            'Personal finance tips',
            'Electric vehicles comparison',
            'Social media marketing',
            'Web development trends',
            'Mental health wellness',
        ];
    }

    /**
     * Get a fallback trending topic
     * @returns {string} Random trending topic
     */
    getFallbackTopic() {
        const randomIndex = Math.floor(Math.random() * this.fallbackTopics.length);
        const topic = this.fallbackTopics[randomIndex];
        logger.info(`Using fallback topic: ${topic}`);
        return topic;
    }

    /**
     * Fetch daily trending topics from Google Trends
     * @param {string} geo - Geographic location (US, GB, IN, etc.)
     * @returns {Promise<Array>} Array of trending topics
     */
    async getDailyTrends(geo = this.geo) {
        try {
            logger.info(`Fetching daily trends for ${geo}...`);

            const results = await googleTrends.dailyTrends({
                geo: geo,
            });

            const data = JSON.parse(results);
            const trends = data.default.trendingSearchesDays[0].trendingSearches;

            logger.info(`Found ${trends.length} trending topics`);

            return trends.map(trend => ({
                title: trend.title.query,
                traffic: trend.formattedTraffic,
                articles: trend.articles || [],
            }));
        } catch (error) {
            logger.warn(`Google Trends API error: ${error.message}`);
            logger.info('Using fallback topic instead');

            // Return fallback topic in same format
            const fallbackTopic = this.getFallbackTopic();
            return [{
                title: fallbackTopic,
                traffic: 'N/A',
                articles: [],
            }];
        }
    }

    /**
     * Get the top trending topic suitable for blog content
     * Filters out news-specific and time-sensitive topics
     * @returns {Promise<string>} Top trending topic
     */
    async getTopTrend() {
        try {
            const trends = await this.getDailyTrends();

            // Filter out unsuitable topics
            const filteredTrends = trends.filter(trend => {
                const title = trend.title.toLowerCase();

                // Exclude news-specific terms
                const excludeTerms = [
                    'breaking',
                    'live',
                    'today',
                    'yesterday',
                    'tonight',
                    'now',
                    'latest',
                    'update',
                    'news',
                    'dies',
                    'dead',
                    'killed',
                    'arrested',
                ];

                return !excludeTerms.some(term => title.includes(term));
            });

            if (filteredTrends.length === 0) {
                logger.warn('No suitable trends found after filtering');
                return this.getFallbackTopic();
            }

            const topTrend = filteredTrends[0].title;
            logger.info(`Selected trending topic: ${topTrend}`);

            return topTrend;
        } catch (error) {
            logger.error(`Error getting top trend: ${error.message}`);
            return this.getFallbackTopic();
        }
    }

    /**
     * Get multiple trending topics
     * @param {number} count - Number of trends to return
     * @returns {Promise<Array>} Array of trending topics
     */
    async getMultipleTrends(count = 5) {
        try {
            const trends = await this.getDailyTrends();
            return trends.slice(0, count).map(t => t.title);
        } catch (error) {
            logger.error(`Error getting multiple trends: ${error.message}`);
            return this.fallbackTopics.slice(0, count);
        }
    }
}

module.exports = new TrendsService();
