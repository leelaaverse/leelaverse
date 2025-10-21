const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../models');

// Validate OAuth environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
	console.error('❌ GOOGLE_CLIENT_ID environment variable is required');
	process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
	console.error('❌ GOOGLE_CLIENT_SECRET environment variable is required');
	process.exit(1);
}

console.log('✅ OAuth environment variables loaded successfully');

// Passport configuration for Google OAuth
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/oauth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
	try {
		console.log('🔍 Google OAuth Profile:', {
			id: profile.id,
			email: profile.emails[0]?.value,
			displayName: profile.displayName,
			givenName: profile.name?.givenName,
			familyName: profile.name?.familyName,
			name: profile.name
		});

		// Check if user already exists with this Google ID
		let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

		if (user) {
			console.log('🔄 Existing OAuth user found:', user.email);
			return done(null, user);
		}

		// Check if user exists with the same email
		const email = profile.emails[0]?.value;
		user = await prisma.user.findUnique({ where: { email } });

		if (user) {
			// Link Google account to existing user
			console.log('🔗 Linking Google account to existing user:', user.email);
			user = await prisma.user.update({
				where: { id: user.id },
				data: {
					googleId: profile.id,
					oauthProviders: user.oauthProviders ? [...user.oauthProviders, 'google'] : ['google'],
				}
			});
			return done(null, user);
		}

		// Create new user
		console.log('👤 Creating new OAuth user');

		// Use Google's structured name data when available, fallback to displayName parsing
		let firstName, lastName;

		if (profile.name?.givenName && profile.name?.familyName) {
			firstName = profile.name.givenName;
			lastName = profile.name.familyName;
		} else if (profile.displayName) {
			const nameParts = profile.displayName.split(' ');
			firstName = nameParts[0] || 'OAuth';
			lastName = nameParts.slice(1).join(' ') || 'User';
		} else {
			firstName = 'OAuth';
			lastName = 'User';
		}

		// Ensure we have non-empty names
		if (!firstName.trim()) firstName = 'OAuth';
		if (!lastName.trim()) lastName = 'User';

		// Generate a unique username based on email or Google ID
		// Sanitize username to only contain letters, numbers, and underscores
		let baseUsername = email ? email.split('@')[0] : `user${profile.id}`;
		// Replace dots, hyphens, and other special characters with underscores
		baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '_');
		// Remove consecutive underscores and trim underscores from start/end
		baseUsername = baseUsername.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
		// Ensure minimum length
		if (baseUsername.length < 3) {
			baseUsername = `user_${profile.id}`;
		}

		let username = baseUsername;

		// Ensure username is unique
		let usernameExists = await prisma.user.findUnique({ where: { username } });
		let counter = 1;
		while (usernameExists) {
			username = `${baseUsername}${counter}`;
			usernameExists = await prisma.user.findUnique({ where: { username } });
			counter++;
		}

		user = await prisma.user.create({
			data: {
				username,
				email: email || `${profile.id}@google.oauth`,
				firstName,
				lastName,
				googleId: profile.id,
				oauthProviders: ['google'],
				avatar: profile.photos[0]?.value || '',
				bio: 'Joined via Google OAuth',
				isEmailVerified: true,
				password: null
			}
		});

		console.log('✅ New OAuth user created:', user.email);

		return done(null, user);
	} catch (error) {
		console.error('❌ Google OAuth error:', error);
		return done(error, null);
	}
}));

// Serialize user for session
passport.serializeUser((user, done) => {
	done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

module.exports = passport;
