const prisma = require('../config/prisma');

// Tier thresholds
const TIER_THRESHOLDS = {
	bronze: 0,
	silver: 1000,
	gold: 5000,
	platinum: 15000,
	diamond: 50000,
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

class RewardEngine {

	/**
	 * Get reward config for a specific action. Falls back to defaults if not in DB.
	 */
	async getRewardConfig(key) {
		const config = await prisma.rewardConfig.findUnique({ where: { key } });
		if (config && config.isActive) {
			return { coins: config.coinReward, xp: config.xpReward };
		}
		// Defaults if not configured
		const defaults = {
			post_created: { coins: 5, xp: 10 },
			like_received: { coins: 1, xp: 2 },
			comment_received: { coins: 2, xp: 5 },
			share_received: { coins: 3, xp: 8 },
			daily_login: { coins: 3, xp: 5 },
			streak_bonus: { coins: 1, xp: 2 },
			viral_post: { coins: 25, xp: 50 },
			competition_participation: { coins: 0, xp: 5 },
		};
		return defaults[key] || { coins: 0, xp: 0 };
	}

	/**
	 * Award coins and XP to a user. Creates a CoinTransaction record.
	 */
	async awardReward(userId, coins, xp, description, type = 'reward') {
		if (coins <= 0 && xp <= 0) return;

		const updateData = {
			creatorXP: { increment: xp },
			creatorScore: { increment: Math.floor(xp * 0.1) },
		};

		if (coins > 0) {
			updateData.coinBalance = { increment: coins };
			updateData.totalCoinsEarned = { increment: coins };
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData,
		});

		// Log coin transaction if coins were awarded
		if (coins > 0) {
			await prisma.coinTransaction.create({
				data: {
					userId,
					type,
					amount: coins,
					balanceAfter: updatedUser.coinBalance,
					description,
				},
			});
		}

		return updatedUser;
	}

	/**
	 * Called when a post is created. Awards coins + XP + updates streak.
	 */
	async onPostCreated(userId, postId) {
		try {
			const reward = await this.getRewardConfig('post_created');
			await this.awardReward(userId, reward.coins, reward.xp, 'Reward for creating a post', 'earn');

			// Update streak
			await this.updateStreak(userId);

			// Update totalCreations
			await prisma.user.update({
				where: { id: userId },
				data: { totalCreations: { increment: 1 } },
			});

			// Check badge eligibility
			await this.checkBadges(userId);
		} catch (error) {
			console.error('RewardEngine.onPostCreated error:', error);
		}
	}

	/**
	 * Called when someone likes a user's post.
	 */
	async onLikeReceived(postAuthorId, postId) {
		try {
			const reward = await this.getRewardConfig('like_received');
			await this.awardReward(postAuthorId, reward.coins, reward.xp, 'Reward for receiving a like', 'earn');

			// Check viral badge
			const post = await prisma.post.findUnique({
				where: { id: postId },
				select: { likesCount: true },
			});

			if (post && post.likesCount >= 100) {
				// One-time viral bonus check
				const alreadyAwarded = await prisma.coinTransaction.findFirst({
					where: {
						userId: postAuthorId,
						postId: postId,
						description: { contains: 'viral' },
					},
				});

				if (!alreadyAwarded) {
					const viralReward = await this.getRewardConfig('viral_post');
					await this.awardReward(postAuthorId, viralReward.coins, viralReward.xp, `Viral post bonus! (100+ likes on post)`, 'reward');
				}
			}

			await this.checkBadges(postAuthorId);
		} catch (error) {
			console.error('RewardEngine.onLikeReceived error:', error);
		}
	}

	/**
	 * Called when someone comments on a user's post.
	 */
	async onCommentReceived(postAuthorId, postId) {
		try {
			const reward = await this.getRewardConfig('comment_received');
			await this.awardReward(postAuthorId, reward.coins, reward.xp, 'Reward for receiving a comment', 'earn');
			await this.checkBadges(postAuthorId);
		} catch (error) {
			console.error('RewardEngine.onCommentReceived error:', error);
		}
	}

	/**
	 * Update posting streak for a user.
	 */
	async updateStreak(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { lastPostDate: true, currentStreak: true, longestStreak: true },
			});

			if (!user) return;

			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			let newStreak = 1;

			if (user.lastPostDate) {
				const lastPost = new Date(user.lastPostDate);
				const lastPostDay = new Date(lastPost.getFullYear(), lastPost.getMonth(), lastPost.getDate());
				const diffDays = Math.floor((today - lastPostDay) / (1000 * 60 * 60 * 24));

				if (diffDays === 0) {
					// Same day, streak doesn't change
					return;
				} else if (diffDays === 1) {
					// Consecutive day — increment streak
					newStreak = user.currentStreak + 1;

					// Award streak bonus
					const streakReward = await this.getRewardConfig('streak_bonus');
					await this.awardReward(
						userId,
						streakReward.coins * newStreak,
						streakReward.xp * newStreak,
						`${newStreak}-day posting streak bonus!`,
						'reward'
					);
				}
				// If diffDays > 1, streak resets to 1
			}

			await prisma.user.update({
				where: { id: userId },
				data: {
					currentStreak: newStreak,
					longestStreak: Math.max(newStreak, user.longestStreak),
					lastPostDate: now,
				},
			});
		} catch (error) {
			console.error('RewardEngine.updateStreak error:', error);
		}
	}

	/**
	 * Check and award applicable badges for a user.
	 */
	async checkBadges(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					totalCreations: true,
					currentStreak: true,
					longestStreak: true,
					creatorXP: true,
					competitionsWon: true,
					competitionsEntered: true,
					coinBalance: true,
					_count: {
						select: {
							followers: true,
							templatesCreated: true,
						},
					},
				},
			});

			if (!user) return;

			// Get all active badges the user hasn't earned yet
			const unearnedBadges = await prisma.badge.findMany({
				where: {
					isActive: true,
					earnedBy: {
						none: { userId: userId },
					},
				},
			});

			for (const badge of unearnedBadges) {
				const req = badge.requirement;
				let earned = false;

				switch (req.type) {
					case 'post_count':
						earned = user.totalCreations >= req.value;
						break;
					case 'streak':
						earned = user.longestStreak >= req.value;
						break;
					case 'xp':
						earned = user.creatorXP >= req.value;
						break;
					case 'competitions_entered':
						earned = user.competitionsEntered >= req.value;
						break;
					case 'competitions_won':
						earned = user.competitionsWon >= req.value;
						break;
					case 'followers':
						earned = user._count.followers >= req.value;
						break;
					case 'templates_created':
						earned = user._count.templatesCreated >= req.value;
						break;
					default:
						break;
				}

				if (earned) {
					await this.awardBadge(userId, badge);
				}
			}

			// Recalculate tier based on XP
			await this.recalculateTier(userId);
		} catch (error) {
			console.error('RewardEngine.checkBadges error:', error);
		}
	}

	/**
	 * Award a badge to a user and give its associated rewards.
	 */
	async awardBadge(userId, badge) {
		try {
			await prisma.userBadge.create({
				data: {
					userId,
					badgeId: badge.id,
				},
			});

			// Award badge rewards
			if (badge.coinReward > 0 || badge.xpReward > 0) {
				await this.awardReward(
					userId,
					badge.coinReward,
					badge.xpReward,
					`Badge earned: ${badge.displayName}`,
					'achievement'
				);
			}

			console.log(`🏅 Badge awarded: ${badge.displayName} → User ${userId}`);
		} catch (error) {
			// Unique constraint violation means already earned — ignore
			if (error.code !== 'P2002') {
				console.error('RewardEngine.awardBadge error:', error);
			}
		}
	}

	/**
	 * Recalculate user's tier based on their XP.
	 */
	async recalculateTier(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { creatorXP: true, creatorTier: true },
			});

			if (!user) return;

			let newTier = 'bronze';
			for (const tier of TIER_ORDER) {
				if (user.creatorXP >= TIER_THRESHOLDS[tier]) {
					newTier = tier;
				}
			}

			if (newTier !== user.creatorTier) {
				await prisma.user.update({
					where: { id: userId },
					data: { creatorTier: newTier },
				});
				console.log(`🎖️ Tier upgrade: ${user.creatorTier} → ${newTier} for User ${userId}`);
			}
		} catch (error) {
			console.error('RewardEngine.recalculateTier error:', error);
		}
	}

	/**
	 * Called when a competition is finalized. Distributes prizes.
	 */
	async onCompetitionCompleted(competitionId) {
		try {
			const competition = await prisma.competition.findUnique({
				where: { id: competitionId },
				include: {
					submissions: {
						orderBy: { votesCount: 'desc' },
						include: { user: true },
					},
				},
			});

			if (!competition) return;

			const prizeBreakdown = competition.prizeBreakdown || {};
			const submissions = competition.submissions;

			for (let i = 0; i < submissions.length; i++) {
				const sub = submissions[i];
				const rank = i + 1;
				const prizeKey = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : null;
				const prize = prizeKey ? (prizeBreakdown[prizeKey] || 0) : 0;
				const status = rank <= 3 ? (rank === 1 ? 'winner' : 'runner_up') : 'submitted';

				await prisma.competitionSubmission.update({
					where: { id: sub.id },
					data: { rank, prizeAwarded: prize, status },
				});

				if (prize > 0) {
					await this.awardReward(
						sub.userId,
						prize,
						prize * 2,
						`Competition prize: #${rank} in "${competition.title}"`,
						'reward'
					);
				}

				// Update competition stats on user
				if (rank === 1) {
					await prisma.user.update({
						where: { id: sub.userId },
						data: { competitionsWon: { increment: 1 } },
					});
				}
			}

			// Mark competition as completed
			await prisma.competition.update({
				where: { id: competitionId },
				data: { status: 'completed' },
			});

			console.log(`🏆 Competition "${competition.title}" finalized with ${submissions.length} submissions`);
		} catch (error) {
			console.error('RewardEngine.onCompetitionCompleted error:', error);
		}
	}
}

module.exports = new RewardEngine();
