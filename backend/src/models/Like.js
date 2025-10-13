const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
	// User who liked
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Polymorphic reference (can be Post or Comment)
	targetModel: {
		type: String,
		required: true,
		enum: ['Post', 'Comment'],
		index: true
	},
	targetId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		refPath: 'targetModel'
	}
}, {
	timestamps: true
});

// Compound index to prevent duplicate likes
likeSchema.index({ user: 1, targetModel: 1, targetId: 1 }, { unique: true });

// Index for counting likes on a specific target
likeSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('Like', likeSchema);
