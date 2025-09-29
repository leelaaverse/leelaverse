const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGODB_URI is provided
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not found in environment variables. Using local MongoDB...');
            process.env.MONGODB_URI = 'mongodb://localhost:27017/leelaverse';
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
        });

        // Graceful close
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Make sure MongoDB is running or check your MONGODB_URI');
        // Don't exit in development, continue without database
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;