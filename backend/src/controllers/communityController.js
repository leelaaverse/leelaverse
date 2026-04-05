const prisma = require('../config/prisma');
const rewardEngine = require('../services/rewardEngine');

// ============================================
// LEADERBOARD
// ============================================

/**
 * GET /api/community/leaderboard
 * Get ranked creators with optional filters
 */
exports.getLeaderboard = async (req, res) => {
	try {
		const { period = 'all-time', category, page = 1, limit = 20, search } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const where = {};

		// Search filter
		if (search) {
			where.OR = [
				{ username: { contains: search, mode: 'insensitive' } },
				{ firstName: { contains: search, mode: 'insensitive' } },
				{ lastName: { contains: search, mode: 'insensitive' } },
			];
		}

		// Only users with some activity
		where.creatorXP = { gt: 0 };

		const users = await prisma.user.findMany({
			where,
			select: {
				id: true,
				username: true,
				firstName: true,
				lastName: true,
				avatar: true,
				creatorXP: true,
				creatorScore: true,
				creatorTier: true,
				totalCreations: true,
				competitionsWon: true,
				competitionsEntered: true,
				currentStreak: true,
				verificationStatus: true,
				_count: {
					select: {
						followers: true,
						posts: true,
					},
				},
			},
			orderBy: { creatorScore: 'desc' },
			skip,
			take: parseInt(limit),
		});

		const total = await prisma.user.count({ where });

		// Add rank to each user
		const rankedUsers = users.map((user, index) => ({
			...user,
			rank: skip + index + 1,
		}));

		res.json({
			success: true,
			data: {
				users: rankedUsers,
				total,
				page: parseInt(page),
				hasMore: skip + users.length < total,
			},
		});
	} catch (error) {
		console.error('getLeaderboard error:', error);
		res.status(500).json({ success: false, message: 'Failed to get leaderboard' });
	}
};

/**
 * GET /api/community/leaderboard/me
 * Get current user's rank and stats
 */
exports.getMyRank = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				firstName: true,
				lastName: true,
				avatar: true,
				creatorXP: true,
				creatorScore: true,
				creatorTier: true,
				totalCreations: true,
				competitionsWon: true,
				competitionsEntered: true,
				currentStreak: true,
				longestStreak: true,
				coinBalance: true,
				_count: {
					select: {
						followers: true,
						following: true,
						posts: true,
						earnedBadges: true,
					},
				},
			},
		});

		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		// Calculate rank
		const rank = await prisma.user.count({
			where: {
				creatorScore: { gt: user.creatorScore },
			},
		}) + 1;

		res.json({
			success: true,
			data: { ...user, rank },
		});
	} catch (error) {
		console.error('getMyRank error:', error);
		res.status(500).json({ success: false, message: 'Failed to get rank' });
	}
};

// ============================================
// COMPETITIONS
// ============================================

/**
 * GET /api/community/competitions
 */
exports.getCompetitions = async (req, res) => {
	try {
		const { status = 'live', category, page = 1, limit = 10 } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const where = { isApproved: true };

		if (status && status !== 'all') {
			where.status = status;
		}
		if (category) {
			where.category = category;
		}

		const competitions = await prisma.competition.findMany({
			where,
			include: {
				creator: {
					select: { id: true, username: true, avatar: true, verificationStatus: true },
				},
				_count: { select: { submissions: true, participants: true } },
			},
			orderBy: [{ isFeatured: 'desc' }, { startsAt: 'asc' }],
			skip,
			take: parseInt(limit),
		});

		const total = await prisma.competition.count({ where });

		res.json({
			success: true,
			data: { competitions, total, page: parseInt(page), hasMore: skip + competitions.length < total },
		});
	} catch (error) {
		console.error('getCompetitions error:', error);
		res.status(500).json({ success: false, message: 'Failed to get competitions' });
	}
};

/**
 * GET /api/community/competitions/:id
 */
exports.getCompetitionDetails = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		const competition = await prisma.competition.findUnique({
			where: { id },
			include: {
				creator: {
					select: { id: true, username: true, avatar: true, firstName: true, lastName: true },
				},
				submissions: {
					orderBy: { votesCount: 'desc' },
					take: 10,
					include: {
						user: { select: { id: true, username: true, avatar: true } },
						post: { select: { id: true, mediaUrl: true, mediaUrls: true, thumbnailUrl: true, caption: true } },
						_count: { select: { votes: true } },
					},
				},
				_count: { select: { submissions: true, participants: true } },
			},
		});

		if (!competition) {
			return res.status(404).json({ success: false, message: 'Competition not found' });
		}

		// Check if current user has joined/submitted
		let userStatus = null;
		if (userId) {
			const participant = await prisma.competitionParticipant.findUnique({
				where: { competitionId_userId: { competitionId: id, userId } },
			});
			const submission = await prisma.competitionSubmission.findUnique({
				where: { competitionId_userId: { competitionId: id, userId } },
			});
			userStatus = {
				hasJoined: !!participant,
				hasSubmitted: !!submission,
				submission: submission || null,
			};
		}

		res.json({
			success: true,
			data: { competition, userStatus },
		});
	} catch (error) {
		console.error('getCompetitionDetails error:', error);
		res.status(500).json({ success: false, message: 'Failed to get competition details' });
	}
};

/**
 * POST /api/community/competitions
 * Create a competition (admin or verified creator)
 */
exports.createCompetition = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true, verificationStatus: true, creatorTier: true },
		});

		const isAdmin = user.role === 'admin';
		const isVerifiedCreator = user.verificationStatus === 'verified' || ['platinum', 'diamond'].includes(user.creatorTier);

		if (!isAdmin && !isVerifiedCreator) {
			return res.status(403).json({
				success: false,
				message: 'Only admins and verified/platinum+ creators can create competitions',
			});
		}

		const {
			title, description, rules, coverImage, category,
			submissionType, maxSubmissions, startsAt, endsAt,
			prizePool, prizeBreakdown, prizeBadge, tags,
		} = req.body;

		if (!title || !description || !category || !submissionType || !startsAt || !endsAt) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

		const competition = await prisma.competition.create({
			data: {
				creatorId: userId,
				title,
				description,
				rules: rules || null,
				coverImage: coverImage || null,
				category,
				submissionType,
				maxSubmissions: maxSubmissions || 1,
				startsAt: new Date(startsAt),
				endsAt: new Date(endsAt),
				prizePool: prizePool || 0,
				prizeBreakdown: prizeBreakdown || null,
				prizeBadge: prizeBadge || null,
				tags: tags || [],
				isApproved: isAdmin, // Admin-created = auto-approved
				createdByRole: isAdmin ? 'admin' : 'creator',
			},
			include: {
				creator: { select: { id: true, username: true, avatar: true } },
			},
		});

		res.status(201).json({
			success: true,
			message: isAdmin ? 'Competition created and published' : 'Competition created — pending admin approval',
			data: competition,
		});
	} catch (error) {
		console.error('createCompetition error:', error);
		res.status(500).json({ success: false, message: 'Failed to create competition' });
	}
};

/**
 * POST /api/community/competitions/:id/join
 */
exports.joinCompetition = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const competition = await prisma.competition.findUnique({ where: { id } });
		if (!competition || competition.status !== 'live') {
			return res.status(400).json({ success: false, message: 'Competition is not active' });
		}

		const participant = await prisma.competitionParticipant.create({
			data: { competitionId: id, userId },
		});

		await prisma.competition.update({
			where: { id },
			data: { participantsCount: { increment: 1 } },
		});

		await prisma.user.update({
			where: { id: userId },
			data: { competitionsEntered: { increment: 1 } },
		});

		res.json({ success: true, message: 'Joined competition', data: participant });
	} catch (error) {
		if (error.code === 'P2002') {
			return res.status(400).json({ success: false, message: 'Already joined this competition' });
		}
		console.error('joinCompetition error:', error);
		res.status(500).json({ success: false, message: 'Failed to join competition' });
	}
};

/**
 * POST /api/community/competitions/:id/submit
 */
exports.submitEntry = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		const { postId, mediaUrl, caption, prompt } = req.body;

		const competition = await prisma.competition.findUnique({ where: { id } });
		if (!competition || competition.status !== 'live') {
			return res.status(400).json({ success: false, message: 'Competition is not active' });
		}

		// Auto-join if not already
		await prisma.competitionParticipant.upsert({
			where: { competitionId_userId: { competitionId: id, userId } },
			create: { competitionId: id, userId, status: 'submitted' },
			update: { status: 'submitted' },
		});

		const submission = await prisma.competitionSubmission.create({
			data: {
				competitionId: id,
				userId,
				postId: postId || null,
				mediaUrl: mediaUrl || null,
				caption: caption || null,
				prompt: prompt || null,
			},
			include: {
				user: { select: { id: true, username: true, avatar: true } },
				post: { select: { id: true, mediaUrl: true, caption: true } },
			},
		});

		await prisma.competition.update({
			where: { id },
			data: { submissionsCount: { increment: 1 } },
		});

		res.status(201).json({ success: true, message: 'Entry submitted', data: submission });
	} catch (error) {
		if (error.code === 'P2002') {
			return res.status(400).json({ success: false, message: 'Already submitted to this competition' });
		}
		console.error('submitEntry error:', error);
		res.status(500).json({ success: false, message: 'Failed to submit entry' });
	}
};

/**
 * POST /api/community/competitions/:id/vote/:submissionId
 */
exports.voteSubmission = async (req, res) => {
	try {
		const { id, submissionId } = req.params;
		const userId = req.user.id;

		const submission = await prisma.competitionSubmission.findUnique({
			where: { id: submissionId },
		});

		if (!submission || submission.competitionId !== id) {
			return res.status(404).json({ success: false, message: 'Submission not found' });
		}

		// Can't vote for your own submission
		if (submission.userId === userId) {
			return res.status(400).json({ success: false, message: 'Cannot vote for your own submission' });
		}

		await prisma.competitionVote.create({
			data: { submissionId, voterId: userId },
		});

		await prisma.competitionSubmission.update({
			where: { id: submissionId },
			data: { votesCount: { increment: 1 } },
		});

		await prisma.competition.update({
			where: { id },
			data: { votesCount: { increment: 1 } },
		});

		res.json({ success: true, message: 'Vote recorded' });
	} catch (error) {
		if (error.code === 'P2002') {
			return res.status(400).json({ success: false, message: 'Already voted for this submission' });
		}
		console.error('voteSubmission error:', error);
		res.status(500).json({ success: false, message: 'Failed to vote' });
	}
};

/**
 * GET /api/community/competitions/:id/submissions
 */
exports.getSubmissions = async (req, res) => {
	try {
		const { id } = req.params;
		const { page = 1, limit = 20 } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const submissions = await prisma.competitionSubmission.findMany({
			where: { competitionId: id },
			include: {
				user: { select: { id: true, username: true, avatar: true, creatorTier: true } },
				post: { select: { id: true, mediaUrl: true, mediaUrls: true, thumbnailUrl: true, caption: true } },
				_count: { select: { votes: true } },
			},
			orderBy: { votesCount: 'desc' },
			skip,
			take: parseInt(limit),
		});

		const total = await prisma.competitionSubmission.count({ where: { competitionId: id } });

		res.json({
			success: true,
			data: { submissions, total, page: parseInt(page), hasMore: skip + submissions.length < total },
		});
	} catch (error) {
		console.error('getSubmissions error:', error);
		res.status(500).json({ success: false, message: 'Failed to get submissions' });
	}
};

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /api/community/templates
 */
exports.getTemplates = async (req, res) => {
	try {
		const { category, sort = 'trending', page = 1, limit = 20, search } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const where = { isActive: true };
		if (category) where.category = category;
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
			];
		}

		let orderBy;
		switch (sort) {
			case 'rated':
				orderBy = { rating: 'desc' };
				break;
			case 'newest':
				orderBy = { createdAt: 'desc' };
				break;
			case 'most-used':
				orderBy = { usageCount: 'desc' };
				break;
			case 'trending':
			default:
				orderBy = [{ isFeatured: 'desc' }, { usageCount: 'desc' }];
				break;
		}

		const templates = await prisma.template.findMany({
			where,
			include: {
				creator: { select: { id: true, username: true, avatar: true } },
			},
			orderBy,
			skip,
			take: parseInt(limit),
		});

		const total = await prisma.template.count({ where });

		res.json({
			success: true,
			data: { templates, total, page: parseInt(page), hasMore: skip + templates.length < total },
		});
	} catch (error) {
		console.error('getTemplates error:', error);
		res.status(500).json({ success: false, message: 'Failed to get templates' });
	}
};

/**
 * GET /api/community/templates/:id
 */
exports.getTemplateDetails = async (req, res) => {
	try {
		const { id } = req.params;

		const template = await prisma.template.findUnique({
			where: { id },
			include: {
				creator: { select: { id: true, username: true, avatar: true } },
				ratings: { select: { rating: true, userId: true } },
			},
		});

		if (!template) {
			return res.status(404).json({ success: false, message: 'Template not found' });
		}

		res.json({ success: true, data: template });
	} catch (error) {
		console.error('getTemplateDetails error:', error);
		res.status(500).json({ success: false, message: 'Failed to get template' });
	}
};

/**
 * POST /api/community/templates
 */
exports.createTemplate = async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			name, description, category, prompt, previewUrl, thumbnailUrl,
			aiModel, aspectRatio, style, negativePrompt, coinCost, tags,
		} = req.body;

		if (!name || !category || !prompt) {
			return res.status(400).json({ success: false, message: 'Name, category, and prompt are required' });
		}

		const template = await prisma.template.create({
			data: {
				creatorId: userId,
				name,
				description: description || null,
				category,
				prompt,
				previewUrl: previewUrl || null,
				thumbnailUrl: thumbnailUrl || null,
				aiModel: aiModel || null,
				aspectRatio: aspectRatio || null,
				style: style || null,
				negativePrompt: negativePrompt || null,
				coinCost: coinCost || 0,
				tags: tags || [],
			},
			include: {
				creator: { select: { id: true, username: true, avatar: true } },
			},
		});

		res.status(201).json({ success: true, message: 'Template created', data: template });
	} catch (error) {
		console.error('createTemplate error:', error);
		res.status(500).json({ success: false, message: 'Failed to create template' });
	}
};

/**
 * POST /api/community/templates/:id/use
 */
exports.useTemplate = async (req, res) => {
	try {
		const { id } = req.params;

		const template = await prisma.template.update({
			where: { id },
			data: { usageCount: { increment: 1 } },
			select: { prompt: true, aiModel: true, aspectRatio: true, style: true, usageCount: true },
		});

		res.json({ success: true, data: template });
	} catch (error) {
		console.error('useTemplate error:', error);
		res.status(500).json({ success: false, message: 'Failed to use template' });
	}
};

/**
 * POST /api/community/templates/:id/rate
 */
exports.rateTemplate = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		const { rating } = req.body;

		if (!rating || rating < 1 || rating > 5) {
			return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
		}

		await prisma.templateRating.upsert({
			where: { templateId_userId: { templateId: id, userId } },
			create: { templateId: id, userId, rating },
			update: { rating },
		});

		// Recalculate average
		const agg = await prisma.templateRating.aggregate({
			where: { templateId: id },
			_avg: { rating: true },
			_count: { rating: true },
		});

		await prisma.template.update({
			where: { id },
			data: {
				rating: agg._avg.rating || 0,
				ratingCount: agg._count.rating || 0,
			},
		});

		res.json({ success: true, message: 'Rating submitted', data: { averageRating: agg._avg.rating, totalRatings: agg._count.rating } });
	} catch (error) {
		console.error('rateTemplate error:', error);
		res.status(500).json({ success: false, message: 'Failed to rate template' });
	}
};

// ============================================
// BADGES
// ============================================

/**
 * GET /api/community/badges
 */
exports.getAllBadges = async (req, res) => {
	try {
		const badges = await prisma.badge.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
		});

		res.json({ success: true, data: badges });
	} catch (error) {
		console.error('getAllBadges error:', error);
		res.status(500).json({ success: false, message: 'Failed to get badges' });
	}
};

/**
 * GET /api/community/badges/my
 */
exports.getMyBadges = async (req, res) => {
	try {
		const userId = req.user.id;

		const userBadges = await prisma.userBadge.findMany({
			where: { userId },
			include: {
				badge: true,
			},
			orderBy: { createdAt: 'asc' },
		});

		res.json({ success: true, data: userBadges });
	} catch (error) {
		console.error('getMyBadges error:', error);
		res.status(500).json({ success: false, message: 'Failed to get badges' });
	}
};

/**
 * POST /api/community/badges/sync
 * Recalculates a user's real stats from the DB (post count, competitions, etc.)
 * then retroactively awards all badges they qualify for, and returns the full list.
 * This is needed because cached counters (totalCreations, competitionsEntered, etc.)
 * start at 0 and are only incremented going forward — older activity isn't counted
 * until this sync is run.
 */
exports.syncMyBadges = async (req, res) => {
	try {
		const userId = req.user.id;

		// ── Step 1: Recalculate real stats from actual DB rows ──────────────────
		const [actualPostCount, actualCompEntered, actualCompWon] = await Promise.all([
			prisma.post.count({ where: { authorId: userId } }),
			prisma.competitionParticipant.count({ where: { userId } }),
			prisma.competitionSubmission.count({ where: { userId, rank: 1 } }),
		]);

		await prisma.user.update({
			where: { id: userId },
			data: {
				totalCreations: actualPostCount,
				competitionsEntered: actualCompEntered,
				competitionsWon: actualCompWon,
			},
		});

		// ── Step 2: Run badge eligibility check with fresh stats ────────────────
		await rewardEngine.checkBadges(userId);

		// ── Step 3: Return updated earned badges list ───────────────────────────
		const userBadges = await prisma.userBadge.findMany({
			where: { userId },
			select: {
				id: true,
				createdAt: true,
				badge: {
					select: {
						id: true,
						name: true,
						displayName: true,
						description: true,
						iconUrl: true,
						category: true,
						rarity: true,
						coinReward: true,
						xpReward: true,
					},
				},
			},
			orderBy: { createdAt: 'asc' },
		});

		res.json({ success: true, data: userBadges });
	} catch (error) {
		console.error('syncMyBadges error:', error);
		res.status(500).json({ success: false, message: 'Failed to sync badges' });
	}
};

// ============================================
// ADMIN: Competition Management
// ============================================

/**
 * GET /api/admin/community/stats
 */
exports.adminGetStats = async (req, res) => {
	try {
		const [
			totalCompetitions, activeCompetitions, totalParticipants,
			totalBadgesAwarded, totalTemplates, totalSubmissions,
		] = await Promise.all([
			prisma.competition.count(),
			prisma.competition.count({ where: { status: 'live' } }),
			prisma.competitionParticipant.count(),
			prisma.userBadge.count(),
			prisma.template.count(),
			prisma.competitionSubmission.count(),
		]);

		res.json({
			success: true,
			data: {
				totalCompetitions, activeCompetitions, totalParticipants,
				totalBadgesAwarded, totalTemplates, totalSubmissions,
			},
		});
	} catch (error) {
		console.error('adminGetStats error:', error);
		res.status(500).json({ success: false, message: 'Failed to get stats' });
	}
};

/**
 * PATCH /api/admin/community/competitions/:id
 */
exports.adminUpdateCompetition = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = {};
		const allowed = ['title', 'description', 'rules', 'coverImage', 'category',
			'submissionType', 'status', 'prizePool', 'prizeBreakdown',
			'isFeatured', 'isTrending', 'isApproved', 'startsAt', 'endsAt'];

		for (const key of allowed) {
			if (req.body[key] !== undefined) {
				if (key === 'startsAt' || key === 'endsAt') {
					updateData[key] = new Date(req.body[key]);
				} else {
					updateData[key] = req.body[key];
				}
			}
		}

		const competition = await prisma.competition.update({
			where: { id },
			data: updateData,
		});

		res.json({ success: true, message: 'Competition updated', data: competition });
	} catch (error) {
		console.error('adminUpdateCompetition error:', error);
		res.status(500).json({ success: false, message: 'Failed to update competition' });
	}
};

/**
 * POST /api/admin/community/competitions/:id/finalize
 */
exports.adminFinalizeCompetition = async (req, res) => {
	try {
		const { id } = req.params;
		await rewardEngine.onCompetitionCompleted(id);
		res.json({ success: true, message: 'Competition finalized and prizes distributed' });
	} catch (error) {
		console.error('adminFinalizeCompetition error:', error);
		res.status(500).json({ success: false, message: 'Failed to finalize competition' });
	}
};

/**
 * DELETE /api/admin/community/competitions/:id
 */
exports.adminDeleteCompetition = async (req, res) => {
	try {
		const { id } = req.params;
		await prisma.competition.delete({ where: { id } });
		res.json({ success: true, message: 'Competition deleted' });
	} catch (error) {
		console.error('adminDeleteCompetition error:', error);
		res.status(500).json({ success: false, message: 'Failed to delete competition' });
	}
};

// ============================================
// ADMIN: Badge Management
// ============================================

/**
 * GET /api/admin/community/badges
 */
exports.adminGetBadges = async (req, res) => {
	try {
		const badges = await prisma.badge.findMany({
			orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
			include: { _count: { select: { earnedBy: true } } },
		});
		res.json({ success: true, data: badges });
	} catch (error) {
		console.error('adminGetBadges error:', error);
		res.status(500).json({ success: false, message: 'Failed to get badges' });
	}
};

/**
 * POST /api/admin/community/badges
 */
exports.adminCreateBadge = async (req, res) => {
	try {
		const { name, displayName, description, iconUrl, category, requirement, coinReward, xpReward, rarity, sortOrder } = req.body;

		if (!name || !displayName || !description || !category || !requirement) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

		const badge = await prisma.badge.create({
			data: {
				name, displayName, description,
				iconUrl: iconUrl || null,
				category,
				requirement,
				coinReward: coinReward || 0,
				xpReward: xpReward || 0,
				rarity: rarity || 'common',
				sortOrder: sortOrder || 0,
			},
		});

		res.status(201).json({ success: true, message: 'Badge created', data: badge });
	} catch (error) {
		if (error.code === 'P2002') {
			return res.status(400).json({ success: false, message: 'Badge with this name already exists' });
		}
		console.error('adminCreateBadge error:', error);
		res.status(500).json({ success: false, message: 'Failed to create badge' });
	}
};

/**
 * PUT /api/admin/community/badges/:id
 */
exports.adminUpdateBadge = async (req, res) => {
	try {
		const { id } = req.params;
		const badge = await prisma.badge.update({ where: { id }, data: req.body });
		res.json({ success: true, message: 'Badge updated', data: badge });
	} catch (error) {
		console.error('adminUpdateBadge error:', error);
		res.status(500).json({ success: false, message: 'Failed to update badge' });
	}
};

/**
 * POST /api/admin/community/badges/award
 * Manually award one or all earned badges to a user.
 *
 * Body:
 *   { userId, badgeName }           → award one specific badge
 *   { userId, syncAll: true }       → run full badge eligibility check for user
 *   { syncAll: true }               → run eligibility check for the calling admin
 */
exports.adminAwardBadge = async (req, res) => {
	try {
		const { userId, badgeName, syncAll } = req.body;
		const targetUserId = userId || req.user.id;

		if (syncAll) {
			await rewardEngine.checkBadges(targetUserId);
			const earned = await prisma.userBadge.findMany({
				where: { userId: targetUserId },
				include: { badge: true },
				orderBy: { createdAt: 'asc' },
			});
			return res.json({ success: true, message: 'Badge sync complete', data: earned });
		}

		if (!badgeName) {
			return res.status(400).json({ success: false, message: 'Provide badgeName or syncAll: true' });
		}

		const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
		if (!badge) {
			const allBadges = await prisma.badge.findMany({ select: { name: true, displayName: true } });
			return res.status(404).json({
				success: false,
				message: `Badge "${badgeName}" not found`,
				availableBadges: allBadges,
			});
		}

		// Upsert — safe to call even if already earned
		await prisma.userBadge.upsert({
			where: { userId_badgeId: { userId: targetUserId, badgeId: badge.id } },
			create: { userId: targetUserId, badgeId: badge.id },
			update: {},
		});

		res.json({ success: true, message: `"${badge.displayName}" awarded`, badge });
	} catch (error) {
		console.error('adminAwardBadge error:', error);
		res.status(500).json({ success: false, message: 'Failed to award badge' });
	}
};

// ============================================
// ADMIN: Reward Config
// ============================================

/**
 * GET /api/admin/community/rewards
 */
exports.adminGetRewards = async (req, res) => {
	try {
		const rewards = await prisma.rewardConfig.findMany({ orderBy: { key: 'asc' } });
		res.json({ success: true, data: rewards });
	} catch (error) {
		console.error('adminGetRewards error:', error);
		res.status(500).json({ success: false, message: 'Failed to get rewards' });
	}
};

/**
 * PUT /api/admin/community/rewards/:key
 */
exports.adminUpdateReward = async (req, res) => {
	try {
		const { key } = req.params;
		const { coinReward, xpReward, isActive } = req.body;

		const reward = await prisma.rewardConfig.update({
			where: { key },
			data: {
				...(coinReward !== undefined && { coinReward }),
				...(xpReward !== undefined && { xpReward }),
				...(isActive !== undefined && { isActive }),
			},
		});

		res.json({ success: true, message: 'Reward config updated', data: reward });
	} catch (error) {
		console.error('adminUpdateReward error:', error);
		res.status(500).json({ success: false, message: 'Failed to update reward config' });
	}
};
