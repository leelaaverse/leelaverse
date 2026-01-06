const prisma = require('../config/prisma');
const { createNotification } = require('../utils/notificationService');

/**
 * Get Public User Profile
 * GET /api/users/:userId/profile
 */
exports.getPublicProfile = async (req, res) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.user?.id;

		console.log('📋 Getting public profile for user:', userId);

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				avatar: true,
				coverImage: true,
				bio: true,
				location: true,
				website: true,
				twitterLink: true,
				instagramLink: true,
				linkedinLink: true,
				githubLink: true,
				discordLink: true,
				verificationStatus: true,
				totalCreations: true,
				createdAt: true,
				_count: {
					select: {
						followers: true,
						following: true,
						posts: true
					}
				}
			}
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Check if current user is following this user
		let isFollowing = false;
		if (currentUserId && currentUserId !== userId) {
			const follow = await prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: currentUserId,
						followingId: userId
					}
				}
			});
			isFollowing = !!follow;
		}

		// Get user's public posts
		const posts = await prisma.post.findMany({
			where: {
				authorId: userId,
				visibility: 'public',
				isApproved: true
			},
			orderBy: { createdAt: 'desc' },
			take: 30,
			select: {
				id: true,
				title: true,
				caption: true,
				mediaUrl: true,
				thumbnailUrl: true,
				aiGenerated: true,
				createdAt: true,
				likesCount: true,
				commentsCount: true,
				_count: {
					select: {
						likes: true,
						comments: true
					}
				}
			}
		});

		res.json({
			success: true,
			user: {
				...user,
				isFollowing,
				isOwnProfile: currentUserId === userId
			},
			posts
		});

	} catch (error) {
		console.error('❌ Get public profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get user profile',
			error: error.message
		});
	}
};

/**
 * Follow a User
 * POST /api/users/:userId/follow
 */
exports.followUser = async (req, res) => {
	try {
		const { userId: targetUserId } = req.params;
		const followerId = req.user?.id;

		if (!followerId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		// Can't follow yourself
		if (followerId === targetUserId) {
			return res.status(400).json({
				success: false,
				message: "You can't follow yourself"
			});
		}

		// Check if target user exists
		const targetUser = await prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true, username: true }
		});

		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Check if already following
		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: followerId,
					followingId: targetUserId
				}
			}
		});

		if (existingFollow) {
			return res.status(400).json({
				success: false,
				message: 'Already following this user'
			});
		}

		// Create follow relationship
		const follow = await prisma.follow.create({
			data: {
				followerId: followerId,
				followingId: targetUserId,
				notificationsEnabled: true
			}
		});

		console.log('✅ User followed:', { followerId, targetUserId });

		// Create notification for the followed user
		await prisma.notification.create({
			data: {
				recipientId: targetUserId,
				senderId: followerId,
				type: 'follow',
				message: 'started following you'
			}
		});

		res.json({
			success: true,
			message: `Now following @${targetUser.username}`,
			follow: {
				id: follow.id,
				followingId: targetUserId,
				createdAt: follow.createdAt
			}
		});

	} catch (error) {
		console.error('❌ Follow user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to follow user',
			error: error.message
		});
	}
};

/**
 * Unfollow a User
 * DELETE /api/users/:userId/follow
 */
exports.unfollowUser = async (req, res) => {
	try {
		const { userId: targetUserId } = req.params;
		const followerId = req.user?.id;

		if (!followerId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		// Can't unfollow yourself
		if (followerId === targetUserId) {
			return res.status(400).json({
				success: false,
				message: "You can't unfollow yourself"
			});
		}

		// Check if follow relationship exists
		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: followerId,
					followingId: targetUserId
				}
			}
		});

		if (!existingFollow) {
			return res.status(400).json({
				success: false,
				message: 'Not following this user'
			});
		}

		// Delete follow relationship
		await prisma.follow.delete({
			where: {
				followerId_followingId: {
					followerId: followerId,
					followingId: targetUserId
				}
			}
		});

		console.log('✅ User unfollowed:', { followerId, targetUserId });

		res.json({
			success: true,
			message: 'Unfollowed user successfully'
		});

	} catch (error) {
		console.error('❌ Unfollow user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to unfollow user',
			error: error.message
		});
	}
};

/**
 * Check Follow Status
 * GET /api/users/:userId/follow-status
 */
exports.checkFollowStatus = async (req, res) => {
	try {
		const { userId: targetUserId } = req.params;
		const currentUserId = req.user?.id;

		if (!currentUserId) {
			return res.json({
				success: true,
				isFollowing: false,
				isOwnProfile: false
			});
		}

		// Check if viewing own profile
		if (currentUserId === targetUserId) {
			return res.json({
				success: true,
				isFollowing: false,
				isOwnProfile: true
			});
		}

		// Check follow status
		const follow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: currentUserId,
					followingId: targetUserId
				}
			}
		});

		res.json({
			success: true,
			isFollowing: !!follow,
			isOwnProfile: false
		});

	} catch (error) {
		console.error('❌ Check follow status error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to check follow status',
			error: error.message
		});
	}
};

/**
 * Get Following List
 * GET /api/users/following
 */
exports.getFollowing = async (req, res) => {
	try {
		const currentUserId = req.user?.id;

		if (!currentUserId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const following = await prisma.follow.findMany({
			where: {
				followerId: currentUserId
			},
			select: {
				following: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true
					}
				}
			}
		});

		const followingUsers = following.map(f => f.following);

		res.json({
			success: true,
			following: followingUsers
		});

	} catch (error) {
		console.error('❌ Get following error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get following list',
			error: error.message
		});
	}
};
