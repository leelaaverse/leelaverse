const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
	// Recipient
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Sender/Actor
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		index: true
	},

	// Notification Type
	type: {
		type: String,
		required: true,
		enum: [
			'like',
			'comment',
			'reply',
			'follow',
			'mention',
			'share',
			'post',
			'group_invite',
			'achievement',
			'coin_earned',
			'ai_generation_complete'
		],
		index: true
	},

	// Reference to related entity
	relatedModel: {
		type: String,
		enum: ['Post', 'Comment', 'User', 'Group', null]
	},
	relatedId: {
		type: mongoose.Schema.Types.ObjectId,
		refPath: 'relatedModel'
	},

	// Content
	message: {
		type: String,
		required: true
	},

	// Status
	read: {
		type: Boolean,
		default: false,
		index: true
	},
	readAt: Date,

	// Action URL
	actionUrl: String
}, {
	timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// TTL index - delete read notifications after 30 days
notificationSchema.index({ readAt: 1 }, {
	expireAfterSeconds: 2592000,
	partialFilterExpression: { read: true }
});

module.exports = mongoose.model('Notification', notificationSchema);
