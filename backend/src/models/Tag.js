const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
	// Tag Name
	name: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true
	},

	// Usage Stats
	usageCount: {
		type: Number,
		default: 0,
		index: true
	},

	// Trending Score (calculated based on recent usage)
	trendingScore: {
		type: Number,
		default: 0,
		index: true
	},

	// Category
	category: {
		type: String,
		enum: ['ai-art', 'photography', 'video', 'discussion', 'tech', 'general'],
		index: true
	},

	// Featured
	isFeatured: {
		type: Boolean,
		default: false
	},

	// Last Used
	lastUsed: {
		type: Date,
		default: Date.now,
		index: true
	}
}, {
	timestamps: true
});

// Indexes
tagSchema.index({ trendingScore: -1, usageCount: -1 });
tagSchema.index({ name: 'text' });

module.exports = mongoose.model('Tag', tagSchema);
