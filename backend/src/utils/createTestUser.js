const prisma = require('../models');

async function createTestUser() {
	try {
		// Check if test user already exists
		let testUser = await prisma.user.findUnique({
			where: { id: 'test-user-id' }
		});

		if (testUser) {
			console.log('✅ Test user already exists:');
			console.log({
				id: testUser.id,
				username: testUser.username,
				email: testUser.email
			});
			return testUser;
		}

		// Check if there are any existing users
		const existingUsers = await prisma.user.findMany({
			take: 5,
			select: {
				id: true,
				username: true,
				email: true
			}
		});

		console.log(`Found ${existingUsers.length} existing user(s):`);
		existingUsers.forEach(user => {
			console.log(`  - ${user.username} (${user.id})`);
		});

		if (existingUsers.length > 0) {
			console.log('\n💡 You can use an existing user ID instead of "test-user-id"');
			console.log(`   For example: "${existingUsers[0].id}"`);
			return null;
		}

		// Create test user if none exist
		console.log('\n📝 Creating test user...');
		testUser = await prisma.user.create({
			data: {
				id: 'test-user-id',
				email: 'test@leelaverse.com',
				username: 'testuser',
				firstName: 'Test',
				lastName: 'User',
				password: '$2b$10$DummyHashForTestUser', // Hashed placeholder
				verificationStatus: 'verified',
				coinBalance: 1000,
				isActive: true
			}
		});

		console.log('✅ Test user created successfully:');
		console.log({
			id: testUser.id,
			username: testUser.username,
			email: testUser.email
		});

		return testUser;

	} catch (error) {
		console.error('❌ Error:', error.message);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run if called directly
if (require.main === module) {
	createTestUser()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}

module.exports = createTestUser;
