/**
 * Database Helper Utilities
 * Common operations for maintaining data consistency
 */

const { User, Post, Comment, Like, Follow, Save } = require('../models');
const mongoose = require('mongoose');

/**
 * Update user statistics
 */
const updateUserStats = {
	/**
	 * Increment user's post count
	 */
	async incrementPostCount(userId, value = 1) {
		return await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.postsCount': value } },
			{ new: true }
		);
	},

	/**
	 * Increment user's follower count
	 */
	async incrementFollowerCount(userId, value = 1) {
		return await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.followersCount': value } },
			{ new: true }
		);
	},

	/**
	 * Increment user's following count
	 */
	async incrementFollowingCount(userId, value = 1) {
		return await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.followingCount': value } },
			{ new: true }
		);
	},

	/**
	 * Increment user's likes received count
	 */
	async incrementLikesReceivedCount(userId, value = 1) {
		return await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.likesReceivedCount': value } },
			{ new: true }
		);
	},

	/**
	 * Recalculate all stats for a user
	 */
	async recalculateUserStats(userId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const postsCount = await Post.countDocuments({
				author: userId,
				deletedAt: null
			});

			const followersCount = await Follow.countDocuments({
				following: userId
			});

			const followingCount = await Follow.countDocuments({
				follower: userId
			});

			// Count likes on user's posts
			const posts = await Post.find({
				author: userId,
				deletedAt: null
			}).select('_id');

			const postIds = posts.map(p => p._id);
			const likesReceivedCount = await Like.countDocuments({
				targetModel: 'Post',
				targetId: { $in: postIds }
			});

			await User.findByIdAndUpdate(
				userId,
				{
					$set: {
						'stats.postsCount': postsCount,
						'stats.followersCount': followersCount,
						'stats.followingCount': followingCount,
						'stats.likesReceivedCount': likesReceivedCount
					}
				},
				{ session }
			);

			await session.commitTransaction();
			return { postsCount, followersCount, followingCount, likesReceivedCount };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}
};

/**
 * Update post statistics
 */
const updatePostStats = {
	/**
	 * Increment post's like count
	 */
	async incrementLikes(postId, value = 1) {
		return await Post.findByIdAndUpdate(
			postId,
			{ $inc: { 'stats.likes': value } },
			{ new: true }
		);
	},

	/**
	 * Increment post's comment count
	 */
	async incrementComments(postId, value = 1) {
		return await Post.findByIdAndUpdate(
			postId,
			{ $inc: { 'stats.comments': value } },
			{ new: true }
		);
	},

	/**
	 * Increment post's share count
	 */
	async incrementShares(postId, value = 1) {
		return await Post.findByIdAndUpdate(
			postId,
			{ $inc: { 'stats.shares': value } },
			{ new: true }
		);
	},

	/**
	 * Increment post's save count
	 */
	async incrementSaves(postId, value = 1) {
		return await Post.findByIdAndUpdate(
			postId,
			{ $inc: { 'stats.saves': value } },
			{ new: true }
		);
	},

	/**
	 * Increment post's view count
	 */
	async incrementViews(postId, value = 1) {
		return await Post.findByIdAndUpdate(
			postId,
			{ $inc: { 'stats.views': value } },
			{ new: true }
		);
	},

	/**
	 * Recalculate all stats for a post
	 */
	async recalculatePostStats(postId) {
		const likes = await Like.countDocuments({
			targetModel: 'Post',
			targetId: postId
		});

		const comments = await Comment.countDocuments({
			post: postId,
			deletedAt: null
		});

		const saves = await Save.countDocuments({
			post: postId
		});

		return await Post.findByIdAndUpdate(
			postId,
			{
				$set: {
					'stats.likes': likes,
					'stats.comments': comments,
					'stats.saves': saves
				}
			},
			{ new: true }
		);
	}
};

/**
 * Like/Unlike operations with transaction
 */
const likeOperations = {
	/**
	 * Like a post or comment
	 */
	async likeTarget(userId, targetModel, targetId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Check if already liked
			const existingLike = await Like.findOne({
				user: userId,
				targetModel,
				targetId
			});

			if (existingLike) {
				throw new Error('Already liked');
			}

			// Create like
			await Like.create([{ user: userId, targetModel, targetId }], { session });

			// Update stats
			if (targetModel === 'Post') {
				await Post.findByIdAndUpdate(
					targetId,
					{ $inc: { 'stats.likes': 1 } },
					{ session }
				);

				// Update author's likes received count
				const post = await Post.findById(targetId).session(session);
				if (post) {
					await User.findByIdAndUpdate(
						post.author,
						{ $inc: { 'stats.likesReceivedCount': 1 } },
						{ session }
					);
				}
			} else if (targetModel === 'Comment') {
				await Comment.findByIdAndUpdate(
					targetId,
					{ $inc: { likes: 1 } },
					{ session }
				);
			}

			await session.commitTransaction();
			return { success: true };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	},

	/**
	 * Unlike a post or comment
	 */
	async unlikeTarget(userId, targetModel, targetId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Remove like
			const like = await Like.findOneAndDelete({
				user: userId,
				targetModel,
				targetId
			}).session(session);

			if (!like) {
				throw new Error('Like not found');
			}

			// Update stats
			if (targetModel === 'Post') {
				await Post.findByIdAndUpdate(
					targetId,
					{ $inc: { 'stats.likes': -1 } },
					{ session }
				);

				// Update author's likes received count
				const post = await Post.findById(targetId).session(session);
				if (post) {
					await User.findByIdAndUpdate(
						post.author,
						{ $inc: { 'stats.likesReceivedCount': -1 } },
						{ session }
					);
				}
			} else if (targetModel === 'Comment') {
				await Comment.findByIdAndUpdate(
					targetId,
					{ $inc: { likes: -1 } },
					{ session }
				);
			}

			await session.commitTransaction();
			return { success: true };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}
};

/**
 * Follow/Unfollow operations with transaction
 */
const followOperations = {
	/**
	 * Follow a user
	 */
	async followUser(followerId, followingId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Check if already following
			const existingFollow = await Follow.findOne({
				follower: followerId,
				following: followingId
			});

			if (existingFollow) {
				throw new Error('Already following');
			}

			// Create follow
			await Follow.create([{
				follower: followerId,
				following: followingId
			}], { session });

			// Update stats
			await User.findByIdAndUpdate(
				followerId,
				{ $inc: { 'stats.followingCount': 1 } },
				{ session }
			);

			await User.findByIdAndUpdate(
				followingId,
				{ $inc: { 'stats.followersCount': 1 } },
				{ session }
			);

			await session.commitTransaction();
			return { success: true };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	},

	/**
	 * Unfollow a user
	 */
	async unfollowUser(followerId, followingId) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Remove follow
			const follow = await Follow.findOneAndDelete({
				follower: followerId,
				following: followingId
			}).session(session);

			if (!follow) {
				throw new Error('Not following');
			}

			// Update stats
			await User.findByIdAndUpdate(
				followerId,
				{ $inc: { 'stats.followingCount': -1 } },
				{ session }
			);

			await User.findByIdAndUpdate(
				followingId,
				{ $inc: { 'stats.followersCount': -1 } },
				{ session }
			);

			await session.commitTransaction();
			return { success: true };
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}
};

/**
 * Soft delete operations
 */
const softDelete = {
	/**
	 * Soft delete a post
	 */
	async deletePost(postId, userId) {
		const post = await Post.findOne({ _id: postId, author: userId });

		if (!post) {
			throw new Error('Post not found or unauthorized');
		}

		post.deletedAt = new Date();
		await post.save();

		// Decrement user's post count
		await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.postsCount': -1 } }
		);

		return post;
	},

	/**
	 * Restore a soft-deleted post
	 */
	async restorePost(postId, userId) {
		const post = await Post.findOne({ _id: postId, author: userId });

		if (!post) {
			throw new Error('Post not found or unauthorized');
		}

		post.deletedAt = null;
		await post.save();

		// Increment user's post count
		await User.findByIdAndUpdate(
			userId,
			{ $inc: { 'stats.postsCount': 1 } }
		);

		return post;
	}
};

module.exports = {
	updateUserStats,
	updatePostStats,
	likeOperations,
	followOperations,
	softDelete
};
