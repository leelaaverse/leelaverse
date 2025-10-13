/**
 * User Credit Seeder
 *
 * This script adds initial credits to existing users or creates test users with credits
 * Run with: node src/utils/seedUserCredits.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('✅ MongoDB Connected');
	} catch (error) {
		console.error('❌ MongoDB Connection Error:', error);
		process.exit(1);
	}
};

const seedCredits = async () => {
	try {
		console.log('🌱 Starting credit seeding...\n');

		// Update all existing users with default credits if they don't have them
		const updateResult = await User.updateMany(
			{
				$or: [
					{ coins: { $exists: false } },
					{ 'aiCredits.imageGeneration': { $exists: false } }
				]
			},
			{
				$set: {
					coins: 500,
					'aiCredits.imageGeneration': 10,
					'aiCredits.videoGeneration': 5,
					'credits.total': 500,
					'credits.used': 0,
					'credits.remaining': 500
				}
			}
		);

		console.log(`✅ Updated ${updateResult.modifiedCount} users with default credits\n`);

		// Display all users with their credits
		const users = await User.find({}, 'username email coins aiCredits credits').lean();

		if (users.length === 0) {
			console.log('⚠️  No users found. Creating a test user...\n');

			const testUser = await User.create({
				username: 'testuser',
				email: 'test@leelaverse.com',
				password: 'Test123!@#',
				firstName: 'Test',
				lastName: 'User',
				coins: 500,
				aiCredits: {
					imageGeneration: 10,
					videoGeneration: 5
				},
				credits: {
					total: 500,
					used: 0,
					remaining: 500
				}
			});

			console.log('✅ Test user created:');
			console.log(`   Email: ${testUser.email}`);
			console.log(`   Password: Test123!@#`);
			console.log(`   Coins: ${testUser.coins}`);
			console.log(`   Image Generation Credits: ${testUser.aiCredits.imageGeneration}`);
			console.log(`   Video Generation Credits: ${testUser.aiCredits.videoGeneration}\n`);
		} else {
			console.log('📊 Current User Credits:\n');
			users.forEach((user, index) => {
				console.log(`${index + 1}. ${user.username} (${user.email})`);
				console.log(`   Coins: ${user.coins || 0}`);
				console.log(`   Image Gen: ${user.aiCredits?.imageGeneration || 0}`);
				console.log(`   Video Gen: ${user.aiCredits?.videoGeneration || 0}`);
				console.log(`   Credits Remaining: ${user.credits?.remaining || 0}\n`);
			});
		}

		console.log('✅ Credit seeding completed successfully!');

	} catch (error) {
		console.error('❌ Error seeding credits:', error);
	} finally {
		await mongoose.connection.close();
		console.log('\n👋 Database connection closed');
		process.exit(0);
	}
};

// Run the seeder
(async () => {
	await connectDB();
	await seedCredits();
})();
