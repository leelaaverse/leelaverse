require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
	try {
		console.log('📊 Checking post categories...\n');

		// Get all unique categories
		const categories = await prisma.post.groupBy({
			by: ['category'],
			_count: {
				category: true
			},
			orderBy: {
				_count: {
					category: 'desc'
				}
			}
		});

		console.log('All categories:');
		categories.forEach(cat => {
			console.log(`  ${cat.category}: ${cat._count.category} posts`);
		});

		// Check for video media types
		const videoTypes = await prisma.post.findMany({
			where: {
				OR: [
					{ mediaType: { startsWith: 'video/' } },
					{ mediaUrl: { contains: '.mp4' } },
					{ mediaUrl: { contains: '.webm' } },
					{ mediaUrl: { contains: '.mov' } }
				]
			},
			select: {
				id: true,
				title: true,
				category: true,
				mediaType: true,
				mediaUrl: true,
				isApproved: true
			},
			take: 10
		});

		console.log(`\n🎥 Posts with video files: ${videoTypes.length}`);
		videoTypes.forEach(post => {
			console.log(`  - ${post.title}`);
			console.log(`    Category: ${post.category}`);
			console.log(`    MediaType: ${post.mediaType}`);
			console.log(`    Approved: ${post.isApproved}`);
			console.log(`    URL: ${post.mediaUrl?.substring(0, 50)}...`);
		});

	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkCategories();
