const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const connectDB = async () => {
    try {
        // Check if DATABASE_URL is provided
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️  DATABASE_URL not found in environment variables.');
            throw new Error('DATABASE_URL is required for Prisma connection');
        }

        // Test the connection
        await prisma.$connect();
        console.log('✅ PostgreSQL Connected via Prisma (Supabase)');

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            console.log(`\n🔌 ${signal} received, closing Prisma connection...`);
            await prisma.$disconnect();
            console.log('🔌 Prisma connection closed');
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Make sure your DATABASE_URL is correct and Supabase is accessible');

        // Don't exit in development, but log the error
        if (process.env.NODE_ENV === 'production') {
            await prisma.$disconnect();
            process.exit(1);
        }
    }
};

module.exports = connectDB;
module.exports.prisma = prisma;
