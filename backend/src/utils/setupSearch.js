const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupSearch() {
    try {
        console.log('Enabling pg_trgm extension...');
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        console.log('Search extension pg_trgm enabled successfully.');
    } catch (error) {
        console.error('Error enabling pg_trgm:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupSearch();
