const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Don't connect if no URI provided
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not provided, skipping database connection');
      return null;
    }

    // Optimized connection options for Vercel serverless
    const options = {
      maxPoolSize: 1, // Reduced for serverless
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority'
    };

    console.log('Attempting MongoDB connection...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected event fired');
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Full error:', error);

    // In serverless, don't exit - just return null
    if (process.env.VERCEL) {
      console.warn('Continuing without database connection in serverless environment');
      return null;
    }

    throw error;
  }
};

module.exports = connectDB;
