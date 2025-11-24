const UserService = require('../services/UserService');
const prisma = require('../config/prisma');

class ProfileController {
    constructor() {
        this.updateProfile = this.updateProfile.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
        this.updateCoverImage = this.updateCoverImage.bind(this);
        this.updateUsername = this.updateUsername.bind(this);
        this.updateBio = this.updateBio.bind(this);
        this.updateSocialLinks = this.updateSocialLinks.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.checkUsernameAvailability = this.checkUsernameAvailability.bind(this);
        this.getProfileStats = this.getProfileStats.bind(this);
    }

    /**
     * Update complete profile
     * @route PUT /api/profile
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const {
                firstName,
                lastName,
                bio,
                location,
                website,
                phoneNumber,
                dateOfBirth,
            } = req.body;

            console.log('📝 Profile update request:', { userId, fields: Object.keys(req.body) });

            // Build update object with only provided fields
            const updateData = {};
            if (firstName !== undefined) updateData.firstName = firstName.trim();
            if (lastName !== undefined) updateData.lastName = lastName.trim();
            if (bio !== undefined) updateData.bio = bio.trim();
            if (location !== undefined) updateData.location = location.trim();
            if (website !== undefined) updateData.website = website.trim();
            if (phoneNumber !== undefined) {
                // Check if phone number is already taken
                if (phoneNumber) {
                    const existingPhone = await prisma.user.findFirst({
                        where: {
                            phoneNumber,
                            id: { not: userId }
                        }
                    });
                    if (existingPhone) {
                        return res.status(400).json({
                            success: false,
                            message: 'Phone number is already in use'
                        });
                    }
                }
                updateData.phoneNumber = phoneNumber;
            }
            if (dateOfBirth !== undefined) {
                updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
            }

            updateData.updatedAt = new Date();

            const updatedUser = await UserService.updateUser(userId, updateData);

            // Remove sensitive data
            const { password, ...userResponse } = updatedUser;

            console.log('✅ Profile updated successfully');

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Profile update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message
            });
        }
    }

    /**
     * Update avatar
     * @route PUT /api/profile/avatar
     */
    async updateAvatar(req, res) {
        try {
            const userId = req.user.id;
            const { avatar } = req.body;

            if (!avatar) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar URL is required'
                });
            }

            console.log('🖼️ Updating avatar for user:', userId);

            const updatedUser = await UserService.updateUser(userId, {
                avatar,
                updatedAt: new Date()
            });

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Avatar updated successfully');

            res.json({
                success: true,
                message: 'Avatar updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Avatar update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update avatar',
                error: error.message
            });
        }
    }

    /**
     * Update cover image
     * @route PUT /api/profile/cover
     */
    async updateCoverImage(req, res) {
        try {
            const userId = req.user.id;
            const { coverImage } = req.body;

            if (!coverImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Cover image URL is required'
                });
            }

            console.log('🖼️ Updating cover image for user:', userId);

            const updatedUser = await UserService.updateUser(userId, {
                coverImage,
                updatedAt: new Date()
            });

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Cover image updated successfully');

            res.json({
                success: true,
                message: 'Cover image updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Cover image update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update cover image',
                error: error.message
            });
        }
    }

    /**
     * Update username
     * @route PUT /api/profile/username
     */
    async updateUsername(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            // Validate username format
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
                });
            }

            console.log('👤 Checking username availability:', username);

            // Check if username is already taken
            const existingUser = await UserService.findByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            console.log('✅ Username available, updating...');

            const updatedUser = await UserService.updateUser(userId, {
                username,
                updatedAt: new Date()
            });

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Username updated successfully');

            res.json({
                success: true,
                message: 'Username updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Username update error:', error);

            // Handle unique constraint violation
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update username',
                error: error.message
            });
        }
    }

    /**
     * Update bio
     * @route PUT /api/profile/bio
     */
    async updateBio(req, res) {
        try {
            const userId = req.user.id;
            const { bio } = req.body;

            // Validate bio length
            if (bio && bio.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: 'Bio must be 500 characters or less'
                });
            }

            console.log('📝 Updating bio for user:', userId);

            const updatedUser = await UserService.updateUser(userId, {
                bio: bio ? bio.trim() : null,
                updatedAt: new Date()
            });

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Bio updated successfully');

            res.json({
                success: true,
                message: 'Bio updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Bio update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update bio',
                error: error.message
            });
        }
    }

    /**
     * Update social links
     * @route PUT /api/profile/social
     */
    async updateSocialLinks(req, res) {
        try {
            const userId = req.user.id;
            const {
                twitterLink,
                instagramLink,
                linkedinLink,
                githubLink,
                discordLink
            } = req.body;

            console.log('🔗 Updating social links for user:', userId);

            const updateData = {
                updatedAt: new Date()
            };

            if (twitterLink !== undefined) updateData.twitterLink = twitterLink || null;
            if (instagramLink !== undefined) updateData.instagramLink = instagramLink || null;
            if (linkedinLink !== undefined) updateData.linkedinLink = linkedinLink || null;
            if (githubLink !== undefined) updateData.githubLink = githubLink || null;
            if (discordLink !== undefined) updateData.discordLink = discordLink || null;

            const updatedUser = await UserService.updateUser(userId, updateData);

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Social links updated successfully');

            res.json({
                success: true,
                message: 'Social links updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Social links update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update social links',
                error: error.message
            });
        }
    }

    /**
     * Update user settings (notification, privacy, display)
     * @route PUT /api/profile/settings
     */
    async updateSettings(req, res) {
        try {
            const userId = req.user.id;
            const {
                notificationSettings,
                privacySettings,
                displaySettings
            } = req.body;

            console.log('⚙️ Updating settings for user:', userId);

            const updateData = {
                updatedAt: new Date()
            };

            if (notificationSettings !== undefined) {
                updateData.notificationSettings = notificationSettings;
            }
            if (privacySettings !== undefined) {
                updateData.privacySettings = privacySettings;
            }
            if (displaySettings !== undefined) {
                updateData.displaySettings = displaySettings;
            }

            const updatedUser = await UserService.updateUser(userId, updateData);

            const { password, ...userResponse } = updatedUser;

            console.log('✅ Settings updated successfully');

            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('❌ Settings update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update settings',
                error: error.message
            });
        }
    }

    /**
     * Check username availability
     * @route GET /api/profile/check-username/:username
     */
    async checkUsernameAvailability(req, res) {
        try {
            const { username } = req.params;
            const userId = req.user?.id; // Optional - to exclude current user

            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            // Validate username format
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                return res.json({
                    success: true,
                    available: false,
                    message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
                });
            }

            const existingUser = await UserService.findByUsername(username);

            // If user exists and it's not the current user
            const available = !existingUser || (userId && existingUser.id === userId);

            res.json({
                success: true,
                available,
                message: available ? 'Username is available' : 'Username is already taken'
            });

        } catch (error) {
            console.error('❌ Username check error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check username availability',
                error: error.message
            });
        }
    }

    /**
     * Get detailed profile statistics
     * @route GET /api/profile/stats
     */
    async getProfileStats(req, res) {
        try {
            const userId = req.user.id;

            console.log('📊 Fetching profile stats for user:', userId);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    _count: {
                        select: {
                            posts: true,
                            followers: true,
                            following: true,
                            likes: true,
                            comments: true,
                            saves: true,
                            aiGenerations: true
                        }
                    },
                    posts: {
                        select: {
                            _count: {
                                select: {
                                    likes: true,
                                    comments: true,
                                    saves: true
                                }
                            }
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

            // Calculate total engagement
            const totalLikesReceived = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
            const totalCommentsReceived = user.posts.reduce((sum, post) => sum + post._count.comments, 0);
            const totalSavesReceived = user.posts.reduce((sum, post) => sum + post._count.saves, 0);

            const stats = {
                userId: user.id,
                username: user.username,
                memberSince: user.createdAt,
                counts: {
                    posts: user._count.posts,
                    followers: user._count.followers,
                    following: user._count.following,
                    likesGiven: user._count.likes,
                    commentsGiven: user._count.comments,
                    savedPosts: user._count.saves,
                    aiGenerations: user._count.aiGenerations
                },
                engagement: {
                    totalLikesReceived,
                    totalCommentsReceived,
                    totalSavesReceived,
                    totalEngagement: totalLikesReceived + totalCommentsReceived + totalSavesReceived
                },
                creator: {
                    totalCreations: user.totalCreations,
                    totalEarnings: parseFloat(user.totalEarnings),
                    coinBalance: user.coinBalance,
                    subscriptionTier: user.subscriptionTier || 'free'
                },
                aiUsage: {
                    dailyUsed: user.dailyGenerationsUsed,
                    dailyLimit: user.dailyGenerationsLimit,
                    monthlyUsed: user.monthlyGenerationsUsed,
                    monthlyLimit: user.monthlyGenerationsLimit
                }
            };

            console.log('✅ Profile stats fetched successfully');

            res.json({
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('❌ Stats fetch error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile stats',
                error: error.message
            });
        }
    }
}

module.exports = new ProfileController();
