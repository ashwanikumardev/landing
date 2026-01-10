const logger = require('../config/logger');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
        // Use gemini-1.5-flash for more stable free tier (15 RPM)
        this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    }

    /**
     * Make a request to Gemini API with automatic retry on rate limits
     * @param {string} prompt - The prompt to send
     * @param {Object} options - Additional options
     * @returns {Promise<string>} Generated content
     */
    async generateContent(prompt, options = {}) {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const {
                    temperature = 0.7,
                    maxOutputTokens = 2048,
                    systemInstruction = null
                } = options;

                // Build the request body
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
                        }]
                    }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens,
                    }
                };

                const url = `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMessage = data.error?.message || 'Gemini API error';

                    // Check if it's a rate limit error (429 or quota exceeded)
                    if (response.status === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
                        if (attempt < maxRetries) {
                            // Extract wait time from error message or use exponential backoff
                            const waitMatch = errorMessage.match(/retry in (\d+\.?\d*)/);
                            const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) : Math.pow(2, attempt) * 5000;

                            logger.warn(`Rate limit hit, waiting ${(waitTime / 1000).toFixed(1)}s before retry (attempt ${attempt}/${maxRetries})`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue; // Retry
                        }
                    }

                    logger.error(`Gemini API Error: ${errorMessage}`);
                    throw new Error(errorMessage);
                }

                // Extract the generated text
                const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!generatedText) {
                    throw new Error('No content generated from Gemini API');
                }

                return generatedText.trim();
            } catch (error) {
                if (attempt === maxRetries) {
                    logger.error(`Gemini API request failed after ${maxRetries} attempts: ${error.message}`);
                    throw error;
                }
                // If not a rate limit error, throw immediately
                if (!error.message.toLowerCase().includes('quota') && !error.message.toLowerCase().includes('rate limit')) {
                    throw error;
                }
            }
        }
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
- Informational and engaging
- SEO friendly
- No words like today, breaking, live
- Click-worthy
- Complete sentence

Return ONLY the complete title, nothing else.`;

            const systemInstruction = 'You are an expert SEO content strategist.';

            const title = await this.generateContent(prompt, {
                systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 150  // Increased to ensure complete titles
            });

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

            const systemInstruction = 'You are an expert SEO content writer who creates high-quality, human-like articles.';

            const content = await this.generateContent(prompt, {
                systemInstruction,
                temperature: 0.8,
                maxOutputTokens: 4000  // Increased for complete articles
            });

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

            const systemInstruction = 'You are an SEO metadata expert.';

            const response = await this.generateContent(prompt, {
                systemInstruction,
                temperature: 0.5,
                maxOutputTokens: 200
            });

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

module.exports = new GeminiService();
