const express = require('express');
const passport = require('../config/passport');
const prisma = require('../models');
const UserService = require('../services/UserService');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize Passport middleware
router.use(passport.initialize());

// Google OAuth login route
router.get('/google', passport.authenticate('google', {
	scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/google/callback',
	passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
	async (req, res) => {
		try {
			const user = req.user;

			console.log('🎉 OAuth callback successful for user:', user.email);

			// Generate JWT tokens
			const accessToken = UserService.generateAccessToken(user.id);
			const refreshToken = UserService.generateRefreshToken(user.id);

			// Store refresh token
			await UserService.storeRefreshToken(user.id, refreshToken);

			// Determine redirect URL based on environment
			const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

			// Create success redirect with tokens as query parameters
			const redirectURL = `${frontendURL}/auth/callback?success=true&access_token=${accessToken}&refresh_token=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
				id: user.id,
				email: user.email,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar
			}))}`;

			console.log('🔄 Redirecting to:', frontendURL);
			res.redirect(redirectURL);

		} catch (error) {
			console.error('❌ OAuth callback error:', error);
			const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
			res.redirect(`${frontendURL}/login?error=oauth_callback_failed`);
		}
	}
);

// OAuth token verification route (for frontend to validate tokens)
router.post('/verify-oauth-token', async (req, res) => {
	try {
		const { access_token } = req.body;

		if (!access_token) {
			return res.status(400).json({
				success: false,
				message: 'Access token is required'
			});
		}

		// Verify the JWT token
		const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
		const user = await prisma.user.findUnique({
			where: { id: decoded.id }
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Remove sensitive information
		const { password, ...userResponse } = user;

		res.json({
			success: true,
			message: 'Token verified successfully',
			data: {
				user: userResponse,
				accessToken: access_token
			}
		});

	} catch (error) {
		console.error('OAuth token verification error:', error);
		res.status(401).json({
			success: false,
			message: 'Invalid or expired token'
		});
	}
});

// OAuth logout route
router.post('/logout-oauth', async (req, res) => {
	try {
		const { refresh_token } = req.body;
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				success: false,
				message: 'Access token is required'
			});
		}

		const accessToken = authHeader.substring(7);
		const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

		if (refresh_token) {
			// Delete the specific refresh token
			await prisma.refreshToken.deleteMany({
				where: {
					userId: decoded.id,
					token: refresh_token
				}
			});
		}

		res.json({
			success: true,
			message: 'Logged out successfully'
		});

	} catch (error) {
		console.error('OAuth logout error:', error);
		res.status(500).json({
			success: false,
			message: 'Logout failed'
		});
	}
});

module.exports = router;
