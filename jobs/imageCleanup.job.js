const cron = require('node-cron');
const Article = require('../models/Article');
const imageService = require('../services/image.service');
const logger = require('../config/logger');

class ImageCleanupJob {
    constructor() {
        this.schedule = '0 0 * * *'; // Run daily at midnight
        this.retentionDays = 25; // Delete images older than 25 days
        this.job = null;
    }

    /**
     * Start the cleanup cron job
     */
    start() {
        logger.info('========================================');
        logger.info('Initializing image cleanup cron job');
        logger.info(`Schedule: Daily at midnight (${this.schedule})`);
        logger.info(`Retention: ${this.retentionDays} days`);
        logger.info('========================================');

        this.job = cron.schedule(this.schedule, async () => {
            logger.info('\n[Image Cleanup] Cron job triggered...');
            await this.runCleanup();
        });

        logger.info('✓ Image cleanup cron job started successfully\n');
    }

    /**
     * Stop the cron job
     */
    stop() {
        if (this.job) {
            this.job.stop();
            logger.info('Image cleanup cron job stopped');
        }
    }

    /**
     * Run the cleanup process
     */
    async runCleanup() {
        const startTime = Date.now();

        try {
            logger.info('========================================');
            logger.info('Starting image cleanup process...');
            logger.info('========================================');

            // Get all old thumbnails from filesystem
            const oldThumbnails = await imageService.getOldThumbnails(this.retentionDays);

            if (oldThumbnails.length === 0) {
                logger.info('No old images found to delete');
                return {
                    success: true,
                    deleted: 0,
                    executionTime: ((Date.now() - startTime) / 1000).toFixed(2)
                };
            }

            logger.info(`Found ${oldThumbnails.length} images older than ${this.retentionDays} days`);

            let deletedCount = 0;
            let errorCount = 0;

            // Delete each old thumbnail
            for (const filename of oldThumbnails) {
                try {
                    // Delete from filesystem
                    await imageService.deleteThumbnail(filename);

                    // Update articles that reference this thumbnail
                    const result = await Article.updateMany(
                        { thumbnail: filename },
                        {
                            $set: {
                                thumbnail: null,
                                thumbnailGeneratedAt: null
                            }
                        }
                    );

                    if (result.modifiedCount > 0) {
                        logger.info(`Updated ${result.modifiedCount} article(s) referencing ${filename}`);
                    }

                    deletedCount++;
                } catch (error) {
                    logger.error(`Error deleting ${filename}: ${error.message}`);
                    errorCount++;
                }
            }

            const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.info('========================================');
            logger.info('✓ CLEANUP COMPLETED');
            logger.info(`✓ Deleted: ${deletedCount}/${oldThumbnails.length} images`);
            if (errorCount > 0) {
                logger.warn(`⚠ Errors: ${errorCount}`);
            }
            logger.info(`✓ Execution time: ${executionTime}s`);
            logger.info('========================================\n');

            return {
                success: true,
                deleted: deletedCount,
                errors: errorCount,
                executionTime
            };

        } catch (error) {
            const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.error('========================================');
            logger.error('✗ CLEANUP FAILED');
            logger.error(`✗ Error: ${error.message}`);
            logger.error(`✗ Execution time: ${executionTime}s`);
            logger.error('========================================\n');

            return {
                success: false,
                error: error.message,
                executionTime
            };
        }
    }

    /**
     * Manually trigger cleanup (for testing)
     */
    async trigger() {
        logger.info('Manually triggering image cleanup...');
        return await this.runCleanup();
    }

    /**
     * Get job status
     */
    getStatus() {
        return {
            schedule: this.schedule,
            retentionDays: this.retentionDays,
            isRunning: this.job ? true : false,
            nextRun: 'Daily at midnight',
        };
    }
}

module.exports = new ImageCleanupJob();
