const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Don't connect if no URI provided
    if (!process.env.MONGODB_URI) {
      logger.warn('MONGODB_URI not provided, skipping database connection');
      return null;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown (only in non-serverless environments)
    if (!process.env.VERCEL) {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);

    // In serverless, don't exit - just return null
    if (process.env.VERCEL) {
      logger.warn('Continuing without database connection in serverless environment');
      return null;
    }

    // In traditional server, exit
    process.exit(1);
  }
};

module.exports = connectDB;
