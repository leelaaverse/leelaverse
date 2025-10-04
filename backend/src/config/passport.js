const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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
		});		// Check if user already exists with this Google ID
		let user = await User.findOne({ 'oauth.googleId': profile.id });

		if (user) {
			console.log('🔄 Existing OAuth user found:', user.email);
			return done(null, user);
		}

		// Check if user exists with the same email
		const email = profile.emails[0]?.value;
		user = await User.findOne({ email });

		if (user) {
			// Link Google account to existing user
			console.log('🔗 Linking Google account to existing user:', user.email);
			user.oauth.googleId = profile.id;
			user.oauth.providers.push('google');
			await user.save();
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
		if (!lastName.trim()) lastName = 'User';		// Generate a unique username based on email or Google ID
		let username = email ? email.split('@')[0] : `user${profile.id}`;

		// Ensure username is unique
		let usernameExists = await User.findOne({ username });
		let counter = 1;
		while (usernameExists) {
			username = `${email ? email.split('@')[0] : `user${profile.id}`}${counter}`;
			usernameExists = await User.findOne({ username });
			counter++;
		}

		user = new User({
			username,
			email: email || `${profile.id}@google.oauth`,
			firstName,
			lastName,
			oauth: {
				googleId: profile.id,
				providers: ['google']
			},
			profile: {
				avatar: profile.photos[0]?.value || '',
				bio: 'Joined via Google OAuth'
			},
			isEmailVerified: true, // Google emails are pre-verified
			password: undefined // No password for OAuth users
		});

		await user.save();
		console.log('✅ New OAuth user created:', user.email);

		return done(null, user);
	} catch (error) {
		console.error('❌ Google OAuth error:', error);
		return done(error, null);
	}
}));

// Serialize user for session
passport.serializeUser((user, done) => {
	done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

module.exports = passport;
