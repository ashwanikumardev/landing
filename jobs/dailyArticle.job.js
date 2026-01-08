const cron = require('node-cron');
const automationService = require('../services/automation.service');
const logger = require('../config/logger');

class DailyArticleJob {
    constructor() {
        // 6 staggered times throughout the day
        this.schedules = [
            { time: '0 6 * * *', label: '6 AM' },
            { time: '0 9 * * *', label: '9 AM' },
            { time: '0 12 * * *', label: '12 PM' },
            { time: '0 15 * * *', label: '3 PM' },
            { time: '0 18 * * *', label: '6 PM' },
            { time: '0 21 * * *', label: '9 PM' }
        ];
        this.jobs = [];
    }

    /**
     * Start all cron jobs
     */
    start() {
        logger.info('========================================');
        logger.info('Initializing staggered article cron jobs');
        logger.info(`Total schedules: ${this.schedules.length}`);
        logger.info('========================================');

        this.schedules.forEach((schedule, index) => {
            const job = cron.schedule(schedule.time, async () => {
                logger.info(`\n[${schedule.label}] Cron job triggered - Generating 1 article...`);

                try {
                    const result = await automationService.runDailyAutomation();

                    if (result.success) {
                        logger.info(`[${schedule.label}] ✓ Article generated: ${result.article.title}`);
                    } else {
                        logger.error(`[${schedule.label}] ✗ Failed: ${result.error}`);
                    }
                } catch (error) {
                    logger.error(`[${schedule.label}] Cron job error: ${error.message}`);
                }
            });

            this.jobs.push(job);
            logger.info(`✓ Cron job ${index + 1}/6 scheduled for ${schedule.label} (${schedule.time})`);
        });

        logger.info('========================================');
        logger.info('✓ All 6 staggered cron jobs started successfully');
        logger.info('Articles will be generated at: 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM');
        logger.info('========================================\n');
    }

    /**
     * Stop all cron jobs
     */
    stop() {
        this.jobs.forEach((job, index) => {
            job.stop();
            logger.info(`Stopped cron job ${index + 1}/6`);
        });
        logger.info('All daily article cron jobs stopped');
    }

    /**
     * Manually trigger article generation (for testing)
     * @param {number} count - Number of articles to generate
     */
    async trigger(count = 1) {
        logger.info(`Manually triggering generation of ${count} article(s)...`);

        try {
            if (count === 1) {
                const result = await automationService.runDailyAutomation();
                return [result];
            } else {
                const results = await automationService.runMultipleArticles(count);
                return results;
            }
        } catch (error) {
            logger.error(`Manual trigger error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get job status
     */
    getStatus() {
        return {
            schedules: this.schedules,
            totalJobs: this.jobs.length,
            isRunning: this.jobs.length > 0,
            articlesPerDay: this.schedules.length,
        };
    }
}

module.exports = new DailyArticleJob();
