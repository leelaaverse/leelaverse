const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
	// Author
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Content
	type: {
		type: String,
		enum: ['image', 'video', 'text'],
		required: true
	},
	mediaUrl: String,
	thumbnailUrl: String,
	text: String,
	backgroundColor: String,

	// AI Details
	aiGenerated: {
		type: Boolean,
		default: false
	},
	aiActivity: {
		type: String,
		enum: ['Training Model', 'Live Streaming', 'Generating Art', 'Experimenting', null]
	},

	// Engagement
	views: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		viewedAt: {
			type: Date,
			default: Date.now
		}
	}],
	viewsCount: {
		type: Number,
		default: 0
	},

	// Duration (in seconds)
	duration: {
		type: Number,
		default: 5
	},

	// Visibility
	visibility: {
		type: String,
		enum: ['all', 'followers', 'close-friends'],
		default: 'all'
	}
}, {
	timestamps: true
});

// Indexes
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24 hours

module.exports = mongoose.model('Story', storySchema);
