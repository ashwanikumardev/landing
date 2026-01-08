const OpenAI = require('openai');
const logger = require('../config/logger');

class OpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
                'X-Title': process.env.SITE_NAME || 'SEO Blog',
            }
        });
        this.model = process.env.OPENAI_MODEL || 'openai/gpt-3.5-turbo';
    }

    /**
     * Convert trending topic to SEO-friendly blog title
     * @param {string} topic - Trending topic from Google Trends
     * @returns {Promise<Object>} Object with title and keyword
     */
    async convertTrendToTitle(topic) {
        try {
            logger.info(`Converting trend to SEO title: ${topic}`);

            const prompt = `You are an SEO expert.

Convert this trending topic into an evergreen blog title.

Trending topic: "${topic}"

Rules:
- Add year (2026)
- Informational
- SEO friendly
- No words like today, breaking, live
- Click-worthy

Return ONLY one title.`;

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert SEO content strategist.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 100,
            });

            const title = completion.choices[0].message.content.trim();

            // Extract keyword (simplified - remove year and common words)
            const keyword = topic.toLowerCase()
                .replace(/\b(2026|2025|the|a|an|in|on|at|for)\b/g, '')
                .trim();

            logger.info(`Generated title: ${title}`);

            return { title, keyword };
        } catch (error) {
            logger.error(`Error converting trend to title: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate full SEO-optimized article
     * @param {string} title - Article title
     * @param {string} keyword - Primary keyword
     * @returns {Promise<string>} Full article content in markdown
     */
    async generateArticle(title, keyword) {
        try {
            logger.info(`Generating article for: ${title}`);

            const prompt = `You are a professional human SEO content writer.

Write a long-form blog article.

TITLE: ${title}
PRIMARY KEYWORD: ${keyword}

CONTENT RULES:
- Minimum 1200 words
- Write like a real human expert
- Simple English
- Short paragraphs (2–3 lines)
- No AI mention
- No plagiarism

STRUCTURE:
- H1 title
- H2 main sections
- H3 sub-sections
- Bullet points
- Table if helpful

SEO RULES:
- Keyword in first 100 words
- Keyword in at least 3 H2 headings
- Use related keywords naturally

EXTRA:
- 5 FAQs at the end
- Conclusion with CTA

OUTPUT FORMAT:
- Clean Markdown
- Use ## for H2, ### for H3
- Start with the H1 title

Write the complete article now:`;

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert SEO content writer who creates high-quality, human-like articles.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 3000,
            });

            const content = completion.choices[0].message.content.trim();

            logger.info(`Generated article (${content.length} characters)`);

            return content;
        } catch (error) {
            logger.error(`Error generating article: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate SEO meta data
     * @param {string} title - Article title
     * @param {string} content - Article content
     * @returns {Promise<Object>} Meta title, description, and slug
     */
    async generateMetaData(title, content) {
        try {
            logger.info(`Generating meta data for: ${title}`);

            const prompt = `Generate SEO metadata for this article:

Title: ${title}

First 200 words: ${content.substring(0, 500)}

Generate:
1. SEO meta title (max 60 characters)
2. Meta description (max 160 characters)
3. URL slug (lowercase, hyphens, no special chars)

Return in this exact format:
META_TITLE: [your meta title]
META_DESC: [your meta description]
SLUG: [your-url-slug]`;

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an SEO metadata expert.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 200,
            });

            const response = completion.choices[0].message.content.trim();

            // Parse response
            const metaTitleMatch = response.match(/META_TITLE:\s*(.+)/);
            const metaDescMatch = response.match(/META_DESC:\s*(.+)/);
            const slugMatch = response.match(/SLUG:\s*(.+)/);

            const metaData = {
                metaTitle: metaTitleMatch ? metaTitleMatch[1].trim() : title.substring(0, 60),
                metaDescription: metaDescMatch ? metaDescMatch[1].trim() : content.substring(0, 160),
                slug: slugMatch ? slugMatch[1].trim() : title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            };

            logger.info(`Generated meta data: ${JSON.stringify(metaData)}`);

            return metaData;
        } catch (error) {
            logger.error(`Error generating meta data: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extract FAQs from article content
     * @param {string} content - Article content
     * @returns {Array} Array of FAQ objects
     */
    extractFAQs(content) {
        const faqs = [];
        const faqSection = content.match(/##\s*FAQ[s]?[\s\S]*$/i);

        if (faqSection) {
            const faqText = faqSection[0];
            const questions = faqText.match(/###\s*(.+?)[\s\S]*?(?=###|$)/g);

            if (questions) {
                questions.forEach(q => {
                    const lines = q.split('\n').filter(l => l.trim());
                    if (lines.length >= 2) {
                        const question = lines[0].replace(/###\s*/, '').trim();
                        const answer = lines.slice(1).join(' ').trim();
                        faqs.push({ question, answer });
                    }
                });
            }
        }

        return faqs.slice(0, 5); // Limit to 5 FAQs
    }
}

module.exports = new OpenAIService();
