const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');

/**
 * User Service - Handles all user-related operations with Prisma
 */
class UserService {
	/**
	 * Create a new user
	 */
	static async createUser(userData) {
		const { password, ...otherData } = userData;

		// Hash password if provided
		let hashedPassword = null;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}

		const user = await prisma.user.create({
			data: {
				...otherData,
				password: hashedPassword,
			},
		});

		return user;
	}

	/**
	 * Find user by email
	 */
	static async findByEmail(email) {
		return await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});
	}

	/**
	 * Find user by username
	 */
	static async findByUsername(username) {
		return await prisma.user.findUnique({
			where: { username },
		});
	}

	/**
	 * Find user by ID
	 */
	static async findById(id) {
		return await prisma.user.findUnique({
			where: { id },
		});
	}

	/**
	 * Find user by Google ID
	 */
	static async findByGoogleId(googleId) {
		return await prisma.user.findUnique({
			where: { googleId },
		});
	}

	/**
	 * Update user
	 */
	static async updateUser(id, data) {
		return await prisma.user.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete user
	 */
	static async deleteUser(id) {
		return await prisma.user.delete({
			where: { id },
		});
	}

	/**
	 * Compare password
	 */
	static async comparePassword(plainPassword, hashedPassword) {
		if (!hashedPassword) return false;
		return await bcrypt.compare(plainPassword, hashedPassword);
	}

	/**
	 * Generate access token
	 */
	static generateAccessToken(userId) {
		return jwt.sign(
			{ id: userId },
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: process.env.JWT_EXPIRE || '15m' }
		);
	}

	/**
	 * Generate refresh token
	 */
	static generateRefreshToken(userId) {
		return jwt.sign(
			{ id: userId },
			process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
			{ expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
		);
	}

	/**
	 * Verify access token
	 */
	static verifyAccessToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
		} catch (error) {
			throw new Error('Invalid or expired token');
		}
	}

	/**
	 * Verify refresh token
	 */
	static verifyRefreshToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}

	/**
	 * Store refresh token
	 */
	static async storeRefreshToken(userId, token) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

		return await prisma.refreshToken.create({
			data: {
				userId,
				token,
				expiresAt,
			},
		});
	}

	/**
	 * Find refresh token
	 */
	static async findRefreshToken(token) {
		return await prisma.refreshToken.findUnique({
			where: { token },
			include: { user: true },
		});
	}

	/**
	 * Delete refresh token
	 */
	static async deleteRefreshToken(token) {
		return await prisma.refreshToken.delete({
			where: { token },
		});
	}

	/**
	 * Delete all refresh tokens for a user
	 */
	static async deleteAllRefreshTokens(userId) {
		return await prisma.refreshToken.deleteMany({
			where: { userId },
		});
	}

	/**
	 * Generate password reset token
	 */
	static generatePasswordResetToken() {
		return crypto.randomBytes(32).toString('hex');
	}

	/**
	 * Generate email verification token
	 */
	static generateEmailVerificationToken() {
		return crypto.randomBytes(32).toString('hex');
	}

	/**
	 * Update last login
	 */
	static async updateLastLogin(userId) {
		return await prisma.user.update({
			where: { id: userId },
			data: { lastLogin: new Date() },
		});
	}

	/**
	 * Increment login attempts
	 */
	static async incrementLoginAttempts(userId) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		const loginAttempts = (user.loginAttempts || 0) + 1;
		const lockUntil = loginAttempts >= 5
			? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
			: null;

		return await prisma.user.update({
			where: { id: userId },
			data: {
				loginAttempts,
				lockUntil,
			},
		});
	}

	/**
	 * Reset login attempts
	 */
	static async resetLoginAttempts(userId) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				loginAttempts: 0,
				lockUntil: null,
			},
		});
	}

	/**
	 * Check if user is locked
	 */
	static isAccountLocked(user) {
		if (!user.lockUntil) return false;
		return new Date() < new Date(user.lockUntil);
	}

	/**
	 * Get user profile with stats
	 */
	static async getUserProfile(userId) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				email: true,
				avatar: true,
				bio: true,
				location: true,
				website: true,
				coverImage: true,
				role: true,
				isEmailVerified: true,
				coinBalance: true,
				totalCreations: true,
				totalEarnings: true,
				subscriptionTier: true,
				createdAt: true,
				_count: {
					select: {
						posts: true,
						followers: true,
						following: true,
					},
				},
			},
		});

		return user;
	}

	/**
	 * Update coin balance
	 */
	static async updateCoinBalance(userId, amount) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		const newBalance = user.coinBalance + amount;

		return await prisma.user.update({
			where: { id: userId },
			data: {
				coinBalance: newBalance,
				totalCoinsEarned: amount > 0 ? user.totalCoinsEarned + amount : user.totalCoinsEarned,
				totalCoinsSpent: amount < 0 ? user.totalCoinsSpent + Math.abs(amount) : user.totalCoinsSpent,
			},
		});
	}
}

module.exports = UserService;
