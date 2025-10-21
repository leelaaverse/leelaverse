/**
 * Database Helper Utilities for Prisma
 * Common operations for maintaining data consistency
 */

const prisma = require('../config/prisma');

/**
 * Update user statistics
 */
const updateUserStats = {
	/**
	 * Increment user's post count
	 */
	async incrementPostCount(userId, value = 1) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				totalCreations: {
					increment: value
				}
			}
		});
	},

	/**
	 * Recalculate all stats for a user
	 */
	async recalculateUserStats(userId) {
		const [postsCount, followersCount, followingCount, totalEarnings] = await Promise.all([
			prisma.post.count({
				where: { authorId: userId }
			}),
			prisma.follow.count({
				where: { followingId: userId }
			}),
			prisma.follow.count({
				where: { followerId: userId }
			}),
			prisma.coinTransaction.aggregate({
				where: {
					userId,
					type: 'earn'
				},
				_sum: {
					amount: true
				}
			})
		]);

		return await prisma.user.update({
			where: { id: userId },
			data: {
				totalCreations: postsCount,
				totalEarnings: totalEarnings._sum.amount || 0
			}
		});
	}
};

/**
 * Update post statistics
 */
const updatePostStats = {
	/**
	 * Increment post's like count
	 */
	async incrementLikeCount(postId, value = 1) {
		return await prisma.post.update({
			where: { id: postId },
			data: {
				likesCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Increment post's comment count
	 */
	async incrementCommentCount(postId, value = 1) {
		return await prisma.post.update({
			where: { id: postId },
			data: {
				commentsCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Increment post's share count
	 */
	async incrementShareCount(postId, value = 1) {
		return await prisma.post.update({
			where: { id: postId },
			data: {
				sharesCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Increment post's save count
	 */
	async incrementSaveCount(postId, value = 1) {
		return await prisma.post.update({
			where: { id: postId },
			data: {
				savesCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Increment post's view count
	 */
	async incrementViewCount(postId, value = 1) {
		return await prisma.post.update({
			where: { id: postId },
			data: {
				viewsCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Recalculate all stats for a post
	 */
	async recalculatePostStats(postId) {
		const [likesCount, commentsCount, savesCount] = await Promise.all([
			prisma.like.count({
				where: { postId }
			}),
			prisma.comment.count({
				where: { postId }
			}),
			prisma.save.count({
				where: { postId }
			})
		]);

		return await prisma.post.update({
			where: { id: postId },
			data: {
				likesCount,
				commentsCount,
				savesCount
			}
		});
	}
};

/**
 * Update comment statistics
 */
const updateCommentStats = {
	/**
	 * Increment comment's like count
	 */
	async incrementLikeCount(commentId, value = 1) {
		return await prisma.comment.update({
			where: { id: commentId },
			data: {
				likesCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Increment comment's reply count
	 */
	async incrementReplyCount(commentId, value = 1) {
		return await prisma.comment.update({
			where: { id: commentId },
			data: {
				repliesCount: {
					increment: value
				}
			}
		});
	},

	/**
	 * Recalculate all stats for a comment
	 */
	async recalculateCommentStats(commentId) {
		const [likesCount, repliesCount] = await Promise.all([
			prisma.like.count({
				where: { commentId }
			}),
			prisma.comment.count({
				where: { parentCommentId: commentId }
			})
		]);

		return await prisma.comment.update({
			where: { id: commentId },
			data: {
				likesCount,
				repliesCount
			}
		});
	}
};

/**
 * Coin transaction helpers
 */
const coinHelpers = {
	/**
	 * Award coins to a user with transaction
	 */
	async awardCoins(userId, amount, description, relatedEntityId = null, relatedEntityType = null) {
		return await prisma.$transaction(async (tx) => {
			// Get current user
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { coinBalance: true }
			});

			const newBalance = user.coinBalance + amount;

			// Update user balance
			await tx.user.update({
				where: { id: userId },
				data: {
					coinBalance: newBalance,
					totalCoinsEarned: {
						increment: amount
					}
				}
			});

			// Create transaction record
			const transactionData = {
				userId,
				type: 'earn',
				amount,
				balanceAfter: newBalance,
				description,
				status: 'completed'
			};

			if (relatedEntityType === 'post' && relatedEntityId) {
				transactionData.postId = relatedEntityId;
			} else if (relatedEntityType === 'aiGeneration' && relatedEntityId) {
				transactionData.aiGenerationId = relatedEntityId;
			}

			const transaction = await tx.coinTransaction.create({
				data: transactionData
			});

			return { user, transaction };
		});
	},

	/**
	 * Deduct coins from a user with transaction
	 */
	async deductCoins(userId, amount, description, relatedEntityId = null, relatedEntityType = null) {
		return await prisma.$transaction(async (tx) => {
			// Get current user
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { coinBalance: true }
			});

			if (user.coinBalance < amount) {
				throw new Error('Insufficient coin balance');
			}

			const newBalance = user.coinBalance - amount;

			// Update user balance
			await tx.user.update({
				where: { id: userId },
				data: {
					coinBalance: newBalance,
					totalCoinsSpent: {
						increment: amount
					}
				}
			});

			// Create transaction record
			const transactionData = {
				userId,
				type: 'spend',
				amount,
				balanceAfter: newBalance,
				description,
				status: 'completed'
			};

			if (relatedEntityType === 'post' && relatedEntityId) {
				transactionData.postId = relatedEntityId;
			} else if (relatedEntityType === 'aiGeneration' && relatedEntityId) {
				transactionData.aiGenerationId = relatedEntityId;
			}

			const transaction = await tx.coinTransaction.create({
				data: transactionData
			});

			return { user, transaction };
		});
	},

	/**
	 * Get user's coin balance
	 */
	async getBalance(userId) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				coinBalance: true,
				totalCoinsEarned: true,
				totalCoinsSpent: true
			}
		});

		return user;
	},

	/**
	 * Get user's transaction history
	 */
	async getTransactionHistory(userId, limit = 50, offset = 0) {
		return await prisma.coinTransaction.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip: offset,
			include: {
				post: {
					select: {
						id: true,
						type: true,
						caption: true
					}
				},
				aiGeneration: {
					select: {
						id: true,
						type: true,
						model: true
					}
				}
			}
		});
	}
};

/**
 * Follow/Unfollow helpers
 */
const followHelpers = {
	/**
	 * Follow a user
	 */
	async followUser(followerId, followingId) {
		// Check if already following
		const existing = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId,
					followingId
				}
			}
		});

		if (existing) {
			throw new Error('Already following this user');
		}

		// Create follow relationship
		return await prisma.follow.create({
			data: {
				followerId,
				followingId
			}
		});
	},

	/**
	 * Unfollow a user
	 */
	async unfollowUser(followerId, followingId) {
		return await prisma.follow.delete({
			where: {
				followerId_followingId: {
					followerId,
					followingId
				}
			}
		});
	},

	/**
	 * Check if user is following another user
	 */
	async isFollowing(followerId, followingId) {
		const follow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId,
					followingId
				}
			}
		});

		return !!follow;
	},

	/**
	 * Get followers
	 */
	async getFollowers(userId, limit = 50, offset = 0) {
		return await prisma.follow.findMany({
			where: { followingId: userId },
			take: limit,
			skip: offset,
			include: {
				follower: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						bio: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		});
	},

	/**
	 * Get following
	 */
	async getFollowing(userId, limit = 50, offset = 0) {
		return await prisma.follow.findMany({
			where: { followerId: userId },
			take: limit,
			skip: offset,
			include: {
				following: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						bio: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		});
	}
};

/**
 * Notification helpers
 */
const notificationHelpers = {
	/**
	 * Create a notification
	 */
	async createNotification(data) {
		return await prisma.notification.create({
			data
		});
	},

	/**
	 * Mark notification as read
	 */
	async markAsRead(notificationId) {
		return await prisma.notification.update({
			where: { id: notificationId },
			data: {
				isRead: true,
				readAt: new Date()
			}
		});
	},

	/**
	 * Mark all user notifications as read
	 */
	async markAllAsRead(userId) {
		return await prisma.notification.updateMany({
			where: {
				recipientId: userId,
				isRead: false
			},
			data: {
				isRead: true,
				readAt: new Date()
			}
		});
	},

	/**
	 * Get user notifications
	 */
	async getUserNotifications(userId, limit = 50, offset = 0, unreadOnly = false) {
		const where = {
			recipientId: userId
		};

		if (unreadOnly) {
			where.isRead = false;
		}

		return await prisma.notification.findMany({
			where,
			take: limit,
			skip: offset,
			orderBy: { createdAt: 'desc' },
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true
					}
				},
				post: {
					select: {
						id: true,
						type: true,
						caption: true,
						mediaUrl: true
					}
				}
			}
		});
	},

	/**
	 * Get unread notification count
	 */
	async getUnreadCount(userId) {
		return await prisma.notification.count({
			where: {
				recipientId: userId,
				isRead: false
			}
		});
	}
};

module.exports = {
	updateUserStats,
	updatePostStats,
	updateCommentStats,
	coinHelpers,
	followHelpers,
	notificationHelpers
};
