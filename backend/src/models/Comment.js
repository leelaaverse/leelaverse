const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	// Post Reference
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
		required: true,
		index: true
	},

	// Author
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Comment Content
	text: {
		type: String,
		required: true,
		maxlength: 1000
	},

	// Reply Structure
	parentComment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment',
		default: null,
		index: true
	},
	replyLevel: {
		type: Number,
		default: 0,
		max: 3
	},

	// Engagement
	likes: {
		type: Number,
		default: 0
	},
	repliesCount: {
		type: Number,
		default: 0
	},

	// Moderation
	edited: {
		type: Boolean,
		default: false
	},
	editedAt: Date,
	flagged: {
		type: Boolean,
		default: false
	},

	// Soft Delete
	deletedAt: {
		type: Date,
		default: null
	}
}, {
	timestamps: true
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ post: 1, parentComment: 1 });

module.exports = mongoose.model('Comment', commentSchema);
