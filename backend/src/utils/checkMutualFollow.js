const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if two users follow each other (mutual following)
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<boolean>} - True if both users follow each other
 */
async function checkMutualFollow(userId1, userId2) {
	try {
		// Check if user1 follows user2
		const user1FollowsUser2 = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: userId1,
					followingId: userId2
				}
			}
		});

		// Check if user2 follows user1
		const user2FollowsUser1 = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: userId2,
					followingId: userId1
				}
			}
		});

		// Both must exist for mutual following
		return !!(user1FollowsUser2 && user2FollowsUser1);
	} catch (error) {
		console.error('Error checking mutual follow:', error);
		return false;
	}
}

module.exports = { checkMutualFollow };
