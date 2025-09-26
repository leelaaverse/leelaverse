const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({
                        success: false,
                        message: 'User with this email already exists'
                    });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is already taken'
                    });
                }
            }

            // Create new user
            const user = new User({
                username,
                email,
                password,
                firstName: firstName || '',
                lastName: lastName || ''
            });

            await user.save();

            // Generate tokens
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Add refresh token to user's tokens array
            user.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date()
            });
            await user.save();

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshTokens;

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

            // Handle Mongoose validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors
                });
            }

            // Handle duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                const message = field === 'email' ? 'Email is already registered' : 'Username is already taken';

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

            // Find user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is locked
            if (user.lockUntil && user.lockUntil > Date.now()) {
                const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
                return res.status(423).json({
                    success: false,
                    message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`
                });
            }

            // Check if account is banned
            if (user.isBanned) {
                if (user.banExpiresAt && user.banExpiresAt > Date.now()) {
                    return res.status(403).json({
                        success: false,
                        message: `Account is banned until ${user.banExpiresAt.toDateString()}`
                    });
                } else if (!user.banExpiresAt) {
                    return res.status(403).json({
                        success: false,
                        message: 'Account is permanently banned'
                    });
                }
            }

            // Check password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                // Record failed login attempt
                user.loginAttempts.push({
                    ip: clientIP,
                    success: false,
                    timestamp: new Date()
                });

                // Increment failed attempts
                user.failedLoginAttempts += 1;

                // Lock account if too many failed attempts
                if (user.failedLoginAttempts >= 5) {
                    user.lockUntil = Date.now() + (30 * 60 * 1000); // Lock for 30 minutes
                }

                await user.save();

                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Successful login - reset failed attempts and update last login
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            user.lastLogin = new Date();
            user.lastActiveAt = new Date();

            // Record successful login attempt
            user.loginAttempts.unshift({
                ip: clientIP,
                success: true,
                timestamp: new Date()
            });

            // Keep only last 10 login attempts
            if (user.loginAttempts.length > 10) {
                user.loginAttempts = user.loginAttempts.slice(0, 10);
            }

            // Generate tokens
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Add refresh token to user's tokens array
            user.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date()
            });

            // Limit number of refresh tokens (keep only 5 most recent)
            if (user.refreshTokens.length > 5) {
                user.refreshTokens = user.refreshTokens.slice(-5);
            }

            await user.save();

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshTokens;
            delete userResponse.loginAttempts;

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

    // Refresh access token
    async refreshToken(req, res) {
        try {
            const user = req.user;
            const oldRefreshToken = req.refreshToken;

            // Remove old refresh token
            user.refreshTokens = user.refreshTokens.filter(
                tokenObj => tokenObj.token !== oldRefreshToken
            );

            // Generate new tokens
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Add new refresh token
            user.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date()
            });

            await user.save();

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during token refresh'
            });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            const user = req.user;
            const refreshToken = req.body.refreshToken;

            if (refreshToken) {
                // Remove specific refresh token
                user.refreshTokens = user.refreshTokens.filter(
                    tokenObj => tokenObj.token !== refreshToken
                );
            } else {
                // Remove all refresh tokens (logout from all devices)
                user.refreshTokens = [];
            }

            await user.save();

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
            const user = req.user;

            // Remove all refresh tokens
            user.refreshTokens = [];
            await user.save();

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

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = req.user;

            // Update last active timestamp
            user.lastActiveAt = new Date();
            await user.save();

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshTokens;
            delete userResponse.loginAttempts;

            res.json({
                success: true,
                data: {
                    user: userResponse
                }
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
            const user = req.user;
            const updates = req.body;

            // Update profile fields
            if (updates.firstName !== undefined) user.profile.firstName = updates.firstName;
            if (updates.lastName !== undefined) user.profile.lastName = updates.lastName;
            if (updates.bio !== undefined) user.profile.bio = updates.bio;
            if (updates.location !== undefined) user.profile.location = updates.location;
            if (updates.website !== undefined) user.profile.website = updates.website;
            if (updates.socialLinks) {
                user.profile.socialLinks = { ...user.profile.socialLinks, ...updates.socialLinks };
            }

            await user.save();

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.refreshTokens;
            delete userResponse.loginAttempts;

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: userResponse
                }
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
            const user = req.user;
            const { currentPassword, newPassword } = req.body;

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            user.password = newPassword;
            user.passwordChangedAt = new Date();

            // Remove all refresh tokens (force re-login on all devices)
            user.refreshTokens = [];

            await user.save();

            res.json({
                success: true,
                message: 'Password changed successfully. Please log in again.'
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

            const user = await User.findOne({ email });
            if (!user) {
                // Don't reveal if email exists for security
                return res.json({
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            await user.save();

            // TODO: Send email with reset token
            // For now, we'll just return the token (remove this in production)
            console.log('Password reset token:', resetToken);

            res.json({
                success: true,
                message: 'Password reset link has been sent to your email.',
                // Remove this in production:
                resetToken: resetToken
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while processing password reset request'
            });
        }
    }

    // Reset password with token
    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            // Hash the token to compare with stored hash
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is invalid or has expired'
                });
            }

            // Update password and clear reset token
            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.passwordChangedAt = new Date();

            // Remove all refresh tokens (force re-login on all devices)
            user.refreshTokens = [];

            await user.save();

            res.json({
                success: true,
                message: 'Password has been reset successfully. Please log in with your new password.'
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while resetting password'
            });
        }
    }
}

module.exports = new AuthController();