const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

class ImageService {
    constructor() {
        // Make OpenAI optional - if not configured, image generation will be skipped
        const apiKey = process.env.OPENAI_API_KEY;

        if (apiKey) {
            try {
                this.client = new OpenAI({
                    apiKey: apiKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                    defaultHeaders: {
                        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
                        'X-Title': process.env.SITE_NAME || 'AugCodex',
                    }
                });
                this.imageModel = 'black-forest-labs/flux-schnell';
                this.enabled = true;
                logger.info('Image service initialized with OpenRouter');
            } catch (error) {
                logger.warn(`Image service initialization failed: ${error.message}`);
                this.enabled = false;
            }
        } else {
            logger.info('Image service disabled (OPENAI_API_KEY not set)');
            this.enabled = false;
        }

        this.imageSize = '512x512';
        this.thumbnailDir = path.join(__dirname, '../public/images/thumbnails');
    }

    /**
     * Ensure thumbnails directory exists
     */
    async ensureThumbnailDir() {
        try {
            await fs.access(this.thumbnailDir);
        } catch {
            await fs.mkdir(this.thumbnailDir, { recursive: true });
            logger.info('Created thumbnails directory');
        }
    }

    /**
     * Generate thumbnail image for article
     * @param {string} title - Article title
     * @param {string} category - Article category
     * @returns {Promise<string>} Filename of generated image
     */
    async generateThumbnail(title, category) {
        try {
            // Skip if image service is not enabled
            if (!this.enabled) {
                logger.info('Image generation skipped (service disabled)');
                return null;
            }

            await this.ensureThumbnailDir();

            logger.info(`Generating thumbnail for: ${title}`);

            // Create prompt for image generation
            const prompt = `Professional news article thumbnail image for "${title}". 
Category: ${category}. 
Style: Modern, clean, professional news photography. 
High quality, sharp focus, relevant to the topic.
No text overlay.`;

            // Generate image using OpenRouter
            const response = await this.client.images.generate({
                model: this.imageModel,
                prompt: prompt,
                n: 1,
                size: this.imageSize,
                response_format: 'url',
            });

            const imageUrl = response.data[0].url;

            // Download and save image
            const filename = await this.downloadAndSaveImage(imageUrl, title);

            logger.info(`✓ Thumbnail generated: ${filename}`);
            return filename;

        } catch (error) {
            logger.error(`Error generating thumbnail: ${error.message}`);
            // Return null if image generation fails - article can still be created
            return null;
        }
    }

    /**
     * Download image from URL and save as WebP
     * @param {string} url - Image URL
     * @param {string} title - Article title (for filename)
     * @returns {Promise<string>} Saved filename
     */
    async downloadAndSaveImage(url, title) {
        try {
            // Generate filename from title
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50);

            const timestamp = Date.now();
            const filename = `${slug}-${timestamp}.webp`;
            const filepath = path.join(this.thumbnailDir, filename);

            // Download image
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(url);
            const buffer = await response.buffer();

            // Save as WebP (if sharp is available, otherwise save as-is)
            try {
                const sharp = require('sharp');
                await sharp(buffer)
                    .webp({ quality: 80 })
                    .toFile(filepath);
            } catch {
                // If sharp not available, save buffer directly
                await fs.writeFile(filepath, buffer);
            }

            logger.info(`Image saved: ${filename} (${buffer.length} bytes)`);
            return filename;

        } catch (error) {
            logger.error(`Error downloading image: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete thumbnail image
     * @param {string} filename - Filename to delete
     */
    async deleteThumbnail(filename) {
        try {
            if (!filename) return;

            const filepath = path.join(this.thumbnailDir, filename);
            await fs.unlink(filepath);
            logger.info(`Deleted thumbnail: ${filename}`);
        } catch (error) {
            logger.warn(`Could not delete thumbnail ${filename}: ${error.message}`);
        }
    }

    /**
     * Get all thumbnails older than specified days
     * @param {number} days - Number of days
     * @returns {Promise<Array>} Array of old thumbnail filenames
     */
    async getOldThumbnails(days = 25) {
        try {
            await this.ensureThumbnailDir();

            const files = await fs.readdir(this.thumbnailDir);
            const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
            const oldFiles = [];

            for (const file of files) {
                const filepath = path.join(this.thumbnailDir, file);
                const stats = await fs.stat(filepath);

                if (stats.mtimeMs < cutoffDate) {
                    oldFiles.push(file);
                }
            }

            return oldFiles;
        } catch (error) {
            logger.error(`Error getting old thumbnails: ${error.message}`);
            return [];
        }
    }
}

module.exports = new ImageService();
