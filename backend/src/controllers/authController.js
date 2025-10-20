const UserService = require('../services/UserService');
const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthController {
    constructor() {
        // Bind all methods to preserve 'this' context
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.logoutAll = this.logoutAll.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.requestPasswordReset = this.requestPasswordReset.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.mockRegister = this.mockRegister.bind(this);
        this.mockLogin = this.mockLogin.bind(this);
    }

    // Register new user
    async register(req, res) {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            console.log('🔐 REGISTER attempt:', {
                email,
                username,
                origin: req.headers.origin,
                ip: req.ip
            });

            // Check if user already exists
            const existingUserByEmail = await UserService.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            const existingUserByUsername = await UserService.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            // Create new user
            const user = await UserService.createUser({
                username,
                email: email.toLowerCase(),
                password,
                firstName: firstName || 'User',
                lastName: lastName || ''
            });

            // Generate tokens
            const accessToken = UserService.generateAccessToken(user.id);
            const refreshToken = UserService.generateRefreshToken(user.id);

            // Store refresh token
            await UserService.storeRefreshToken(user.id, refreshToken);

            // Remove password from response
            const { password: _, ...userResponse } = user;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Registration error:', error);

            // Handle Prisma unique constraint errors
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0] || 'field';
                const message = field === 'email' 
                    ? 'Email is already registered' 
                    : `${field} is already taken`;

                return res.status(400).json({
                    success: false,
                    message: message,
                    errors: [{
                        field: field,
                        message: message
                    }]
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            console.log('🔐 LOGIN attempt:', {
                email,
                origin: req.headers.origin,
                ip: clientIP
            });

            // Find user by email
            const user = await UserService.findByEmail(email);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is locked
            if (UserService.isAccountLocked(user)) {
                const lockTimeRemaining = Math.ceil(
                    (new Date(user.lockUntil) - Date.now()) / (1000 * 60)
                );
                return res.status(423).json({
                    success: false,
                    message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`
                });
            }

            // Check if account is banned
            if (user.isBanned) {
                if (user.banExpiresAt && new Date(user.banExpiresAt) > new Date()) {
                    return res.status(403).json({
                        success: false,
                        message: `Account is banned until ${new Date(user.banExpiresAt).toDateString()}`
                    });
                } else if (!user.banExpiresAt) {
                    return res.status(403).json({
                        success: false,
                        message: 'Account is permanently banned'
                    });
                }
            }

            // Check password
            const isMatch = await UserService.comparePassword(password, user.password);

            if (!isMatch) {
                // Increment failed attempts
                await UserService.incrementLoginAttempts(user.id);

                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Successful login - reset failed attempts and update last login
            await UserService.resetLoginAttempts(user.id);
            await UserService.updateLastLogin(user.id);

            // Generate tokens
            const accessToken = UserService.generateAccessToken(user.id);
            const refreshToken = UserService.generateRefreshToken(user.id);

            // Store refresh token
            await UserService.storeRefreshToken(user.id, refreshToken);

            // Remove sensitive data from response
            const { password: _, ...userResponse } = user;

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            const refreshToken = req.body.refreshToken;

            if (refreshToken) {
                await UserService.deleteRefreshToken(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during logout'
            });
        }
    }

    // Logout from all devices
    async logoutAll(req, res) {
        try {
            const userId = req.user.id;

            await UserService.deleteAllRefreshTokens(userId);

            res.json({
                success: true,
                message: 'Logged out from all devices successfully'
            });

        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during logout'
            });
        }
    }

    // Refresh access token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = UserService.verifyRefreshToken(refreshToken);

            // Check if refresh token exists in database
            const tokenRecord = await UserService.findRefreshToken(refreshToken);

            if (!tokenRecord) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const accessToken = UserService.generateAccessToken(decoded.id);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken
                }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const user = await UserService.getUserProfile(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching profile'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const {
                firstName,
                lastName,
                bio,
                location,
                website,
                avatar,
                coverImage,
                phoneNumber,
                dateOfBirth,
                twitterLink,
                instagramLink,
                linkedinLink,
                githubLink,
                discordLink
            } = req.body;

            const updateData = {};
            if (firstName !== undefined) updateData.firstName = firstName;
            if (lastName !== undefined) updateData.lastName = lastName;
            if (bio !== undefined) updateData.bio = bio;
            if (location !== undefined) updateData.location = location;
            if (website !== undefined) updateData.website = website;
            if (avatar !== undefined) updateData.avatar = avatar;
            if (coverImage !== undefined) updateData.coverImage = coverImage;
            if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
            if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
            if (twitterLink !== undefined) updateData.twitterLink = twitterLink;
            if (instagramLink !== undefined) updateData.instagramLink = instagramLink;
            if (linkedinLink !== undefined) updateData.linkedinLink = linkedinLink;
            if (githubLink !== undefined) updateData.githubLink = githubLink;
            if (discordLink !== undefined) updateData.discordLink = discordLink;

            const user = await UserService.updateUser(userId, updateData);

            const { password: _, ...userResponse } = user;

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while updating profile'
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            const user = await UserService.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isMatch = await UserService.comparePassword(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await UserService.updateUser(userId, { password: hashedPassword });

            // Logout from all devices
            await UserService.deleteAllRefreshTokens(userId);

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while changing password'
            });
        }
    }

    // Request password reset
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await UserService.findByEmail(email);

            if (!user) {
                // Don't reveal if user exists
                return res.json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent'
                });
            }

            // Generate reset token
            const resetToken = UserService.generatePasswordResetToken();
            const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

            await UserService.updateUser(user.id, {
                passwordResetToken: resetToken,
                passwordResetExpires: resetTokenExpires
            });

            // TODO: Send email with reset link
            console.log('Password reset token:', resetToken);

            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });

        } catch (error) {
            console.error('Request password reset error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while requesting password reset'
            });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            const user = await prisma.user.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Hash new password
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and clear reset token
            await UserService.updateUser(user.id, {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            });

            // Logout from all devices
            await UserService.deleteAllRefreshTokens(user.id);

            res.json({
                success: true,
                message: 'Password reset successful. Please login with your new password.'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while resetting password'
            });
        }
    }

    // Mock register (for testing without database)
    async mockRegister(req, res) {
        const { username, email, password } = req.body;

        const mockUser = {
            id: 'mock-user-id-' + Date.now(),
            username,
            email,
            firstName: 'Mock',
            lastName: 'User',
            role: 'user',
            isEmailVerified: false,
            createdAt: new Date().toISOString()
        };

        const accessToken = jwt.sign(
            { id: mockUser.id },
            process.env.JWT_SECRET || 'mock-secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: mockUser.id },
            process.env.JWT_REFRESH_SECRET || 'mock-refresh-secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Mock registration successful (database not available)',
            data: {
                user: mockUser,
                accessToken,
                refreshToken
            }
        });
    }

    // Mock login (for testing without database)
    async mockLogin(req, res) {
        const { email } = req.body;

        const mockUser = {
            id: 'mock-user-id-123',
            username: 'mockuser',
            email,
            firstName: 'Mock',
            lastName: 'User',
            role: 'user',
            isEmailVerified: true,
            createdAt: new Date().toISOString()
        };

        const accessToken = jwt.sign(
            { id: mockUser.id },
            process.env.JWT_SECRET || 'mock-secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: mockUser.id },
            process.env.JWT_REFRESH_SECRET || 'mock-refresh-secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Mock login successful (database not available)',
            data: {
                user: mockUser,
                accessToken,
                refreshToken
            }
        });
    }
}

module.exports = new AuthController();
