const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
	// Who is following
	follower: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Who is being followed
	following: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Notification preference for this follow
	notificationsEnabled: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

// Prevent self-follow and duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for queries
followSchema.index({ follower: 1, createdAt: -1 }); // User's following list
followSchema.index({ following: 1, createdAt: -1 }); // User's followers list

// Prevent users from following themselves
followSchema.pre('save', function (next) {
	if (this.follower.equals(this.following)) {
		next(new Error('Users cannot follow themselves'));
	} else {
		next();
	}
});

module.exports = mongoose.model('Follow', followSchema);
