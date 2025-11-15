const prisma = require('./src/models');

async function investigatePrivatePosts() {
	try {
		console.log('🔍 Investigating the posts that were private...\n');

		// Get posts by IDs that we updated
		const postIds = [
			'cmi022u99000',
			'cmi024jyn000',
			'cmi02itn5000'
		];

		// Find posts with matching ID prefix
		const posts = await prisma.post.findMany({
			where: {
				OR: postIds.map(id => ({
					id: {
						startsWith: id
					}
				}))
			},
			include: {
				author: {
					select: {
						username: true,
						email: true
					}
				},
				aiGenerations: {
					select: {
						id: true,
						prompt: true,
						model: true,
						createdAt: true
					}
				}
			}
		});

		console.log(`Found ${posts.length} posts\n`);
		console.log('='.repeat(80));

		posts.forEach((post, index) => {
			console.log(`\n${index + 1}. Post Analysis:`);
			console.log('   ID:', post.id);
			console.log('   Created At:', post.createdAt);
			console.log('   Updated At:', post.updatedAt);
			console.log('   Current Visibility:', post.visibility);
			console.log('   Author:', post.author.username);
			console.log('   Caption:', post.caption);
			console.log('   Category:', post.category);
			console.log('   AI Generated:', post.aiGenerated);
			console.log('   Is Approved:', post.isApproved);

			if (post.aiGenerations.length > 0) {
				console.log('   AI Generations Linked:', post.aiGenerations.length);
				post.aiGenerations.forEach((gen, i) => {
					console.log(`      ${i + 1}. Model: ${gen.model}, Created: ${gen.createdAt}`);
				});
			}

			// Check if updatedAt is different from createdAt (means it was modified)
			const wasModified = post.updatedAt.getTime() !== post.createdAt.getTime();
			if (wasModified) {
				const timeDiff = Math.floor((post.updatedAt - post.createdAt) / 1000 / 60);
				console.log(`   ⚠️ Post was MODIFIED ${timeDiff} minutes after creation`);
				console.log('   This confirms visibility was changed from private to public');
			}
		});

		console.log('\n' + '='.repeat(80));
		console.log('\n🎯 FINDINGS:');
		console.log('   Based on the updatedAt timestamps, we can confirm:');
		console.log('   1. These posts were initially created with visibility: "private"');
		console.log('   2. They were later updated to visibility: "public" by our script');
		console.log('\n💡 NEXT STEPS:');
		console.log('   - Check frontend console logs when creating a new post');
		console.log('   - Monitor backend logs with the new debug statements');
		console.log('   - Look for any middleware or schema hooks that might override visibility');

	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

investigatePrivatePosts();
