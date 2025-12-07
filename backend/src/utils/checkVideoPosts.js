const prisma = require('../models');

async function checkVideoPosts() {
	try {
		console.log('🔍 Checking for video posts in database...\n');

		// Check all posts
		const allPosts = await prisma.post.findMany({
			select: {
				id: true,
				category: true,
				mediaType: true,
				title: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 10
		});

		console.log('📊 Total posts in database:', await prisma.post.count());
		console.log('\n📝 Recent posts:');
		allPosts.forEach(post => {
			console.log(`  - ${post.title} | Category: ${post.category} | Type: ${post.mediaType}`);
		});

		// Check specifically for video-post category
		const videoPosts = await prisma.post.findMany({
			where: {
				category: 'video-post'
			},
			select: {
				id: true,
				title: true,
				category: true,
				mediaType: true,
				mediaUrl: true,
				isApproved: true,
				visibility: true,
				createdAt: true
			}
		});

		console.log('\n🎬 Video posts (category: "video-post"):', videoPosts.length);
		if (videoPosts.length > 0) {
			videoPosts.forEach(post => {
				console.log(`  - ${post.title}`);
				console.log(`    Approved: ${post.isApproved}`);
				console.log(`    Visibility: ${post.visibility}`);
				console.log(`    Media URL: ${post.mediaUrl ? 'Yes' : 'No'}`);
			});
		}

		// Check for any video mediaType
		const videoMediaType = await prisma.post.findMany({
			where: {
				mediaType: {
					startsWith: 'video/'
				}
			},
			select: {
				id: true,
				title: true,
				category: true,
				mediaType: true,
				isApproved: true
			}
		});

		console.log('\n🎥 Posts with video mediaType:', videoMediaType.length);
		if (videoMediaType.length > 0) {
			videoMediaType.forEach(post => {
				console.log(`  - ${post.title} | Category: ${post.category} | Approved: ${post.isApproved}`);
			});
		}

		// Check distinct categories
		const categories = await prisma.post.groupBy({
			by: ['category'],
			_count: {
				category: true
			}
		});

		console.log('\n📂 All categories in database:');
		categories.forEach(cat => {
			console.log(`  - ${cat.category}: ${cat._count.category} posts`);
		});

	} catch (error) {
		console.error('❌ Error checking video posts:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkVideoPosts();
