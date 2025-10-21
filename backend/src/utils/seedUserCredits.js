/**
 * User Credit Seeder
 *
 * This script adds initial credits to existing users or creates test users with credits
 * Run with: node src/utils/seedUserCredits.js
 */

require('dotenv').config();
const prisma = require('../models');

const seedCredits = async () => {
	try {
		console.log('🌱 Starting credit seeding...\n');

		// Update all existing users with default credits if needed
		const updateResult = await prisma.user.updateMany({
			where: {
				coinBalance: 0
			},
			data: {
				coinBalance: 500,
				monthlyGenerationsLimit: 50,
				dailyGenerationsLimit: 10
			}
		});

		console.log(`✅ Updated ${updateResult.count} users with default credits\n`);

		// Display all users with their credits
		const users = await prisma.user.findMany({
			select: {
				username: true,
				email: true,
				coinBalance: true,
				totalCoinsEarned: true,
				totalCoinsSpent: true,
				monthlyGenerationsLimit: true
			}
		});

		if (users.length === 0) {
			console.log('⚠️  No users found. Creating a test user...\n');

			const testUser = await prisma.user.create({
				data: {
					username: 'testuser',
					email: 'test@leelaverse.com',
					password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7EqE8y.2J2', // Test123!@#
					firstName: 'Test',
					lastName: 'User',
					coinBalance: 500,
					totalCoinsEarned: 500,
					monthlyGenerationsLimit: 50,
					dailyGenerationsLimit: 10
				}
			});

			console.log('✅ Test user created:');
			console.log(`   Email: ${testUser.email}`);
			console.log(`   Password: Test123!@#`);
			console.log(`   Coins: ${testUser.coinBalance}`);
			console.log(`   Monthly Generations: ${testUser.monthlyGenerationsLimit}\n`);
		} else {
			console.log('📊 Current User Credits:\n');
			users.forEach((user, index) => {
				console.log(`${index + 1}. ${user.username} (${user.email})`);
				console.log(`   Coin Balance: ${user.coinBalance}`);
				console.log(`   Total Earned: ${user.totalCoinsEarned}`);
				console.log(`   Total Spent: ${user.totalCoinsSpent}`);
				console.log(`   Monthly Limit: ${user.monthlyGenerationsLimit}\n`);
			});
		}

		console.log('✅ Credit seeding completed successfully!');

	} catch (error) {
		console.error('❌ Error seeding credits:', error);
	} finally {
		await prisma.$disconnect();
		console.log('\n👋 Database connection closed');
		process.exit(0);
	}
};

// Run the seeder
seedCredits();

(async () => {
	await connectDB();
	await seedCredits();
})();
