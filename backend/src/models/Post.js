const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	// Author
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Content Type
	type: {
		type: String,
		enum: ['image', 'video', 'text', 'short'],
		required: true,
		index: true
	},

	// Post Category (More specific categorization)
	category: {
		type: String,
		enum: ['short', 'normal-video', 'image-post', 'text-post', 'image-text-post'],
		required: true,
		index: true
	},

	// Text Content
	caption: {
		type: String,
		maxlength: 2500
	},
	title: {
		type: String,
		maxlength: 200
	},

	// Media
	mediaUrl: {
		type: String
	},
	thumbnailUrl: {
		type: String
	},
	mediaType: {
		type: String,
		enum: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', null]
	},

	// AI Generation Details
	aiGenerated: {
		type: Boolean,
		default: false,
		index: true
	},
	aiDetails: {
		model: {
			type: String,
			enum: ['DALL-E 3', 'Midjourney v6', 'Stable Diffusion XL', 'Runway Gen-2', 'Pika Labs', 'Firefly', 'Leonardo AI', null]
		},
		prompt: String,
		enhancedPrompt: String,
		style: String,
		aspectRatio: String,
		steps: Number,
		generationTime: Number,
		cost: Number,
		seed: String
	},

	// Engagement Stats (Denormalized)
	stats: {
		likes: { type: Number, default: 0, index: true },
		comments: { type: Number, default: 0 },
		shares: { type: Number, default: 0 },
		saves: { type: Number, default: 0 },
		views: { type: Number, default: 0 }
	},

	// Tags
	tags: [{
		type: String,
		lowercase: true,
		trim: true
	}],

	// Location
	location: {
		name: String,
		coordinates: {
			type: { type: String, default: 'Point' },
			coordinates: [Number]
		}
	},

	// Visibility
	visibility: {
		type: String,
		enum: ['public', 'followers', 'private'],
		default: 'public',
		index: true
	},

	// Status
	status: {
		type: String,
		enum: ['draft', 'published', 'archived'],
		default: 'published',
		index: true
	},

	// Featured
	isFeatured: {
		type: Boolean,
		default: false,
		index: true
	},

	// Neural Score (AI quality rating)
	neuralScore: {
		type: Number,
		min: 0,
		max: 10,
		index: true
	},

	// Moderation
	flagged: {
		type: Boolean,
		default: false
	},
	flagReason: String,

	// Soft Delete
	deletedAt: {
		type: Date,
		default: null
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'stats.likes': -1 });
postSchema.index({ 'stats.views': -1 });
postSchema.index({ tags: 1 });
postSchema.index({ aiGenerated: 1, createdAt: -1 });
postSchema.index({ type: 1, status: 1, visibility: 1 });
postSchema.index({ isFeatured: 1, createdAt: -1 });
postSchema.index({ neuralScore: -1 });

// Compound index for feed queries
postSchema.index({
	status: 1,
	visibility: 1,
	deletedAt: 1,
	createdAt: -1
});

// Geospatial index for location-based queries
postSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function () {
	if (this.stats.views === 0) return 0;
	const totalEngagement = this.stats.likes + this.stats.comments + this.stats.shares;
	return ((totalEngagement / this.stats.views) * 100).toFixed(2);
});

// Virtual populate for author details
postSchema.virtual('authorDetails', {
	ref: 'User',
	localField: 'author',
	foreignField: '_id',
	justOne: true
});

module.exports = mongoose.model('Post', postSchema);
