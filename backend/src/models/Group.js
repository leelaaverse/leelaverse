const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
	// Basic Info
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
		index: true
	},
	slug: {
		type: String,
		unique: true,
		lowercase: true,
		index: true
	},
	description: {
		type: String,
		maxlength: 1000
	},

	// Media
	avatar: String,
	coverImage: String,

	// Creator
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Members
	members: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		role: {
			type: String,
			enum: ['admin', 'moderator', 'member'],
			default: 'member'
		},
		joinedAt: {
			type: Date,
			default: Date.now
		}
	}],

	// Stats
	stats: {
		membersCount: { type: Number, default: 0 },
		postsCount: { type: Number, default: 0 },
		activeMembers: { type: Number, default: 0 }
	},

	// Settings
	visibility: {
		type: String,
		enum: ['public', 'private', 'secret'],
		default: 'public',
		index: true
	},
	joinApprovalRequired: {
		type: Boolean,
		default: false
	},

	// Category
	category: {
		type: String,
		enum: ['AI Art', 'Video Generation', 'Photography', 'Discussion', 'Tech', 'General'],
		index: true
	},

	// Tags
	tags: [{
		type: String,
		lowercase: true
	}],

	// Status
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

// Indexes
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ 'stats.membersCount': -1 });
groupSchema.index({ category: 1, visibility: 1 });

// Generate slug before saving
groupSchema.pre('save', function (next) {
	if (this.isModified('name')) {
		this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
	}
	next();
});

module.exports = mongoose.model('Group', groupSchema);
