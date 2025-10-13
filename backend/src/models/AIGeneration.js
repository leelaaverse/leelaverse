const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema({
	// User
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Generation Type
	type: {
		type: String,
		enum: ['image', 'video', 'text-enhancement'],
		required: true,
		index: true
	},

	// AI Model
	model: {
		type: String,
		required: true,
		enum: ['DALL-E 3', 'Midjourney v6', 'Stable Diffusion XL', 'Runway Gen-2', 'Pika Labs', 'Firefly', 'Leonardo AI']
	},

	// Input
	prompt: {
		type: String,
		required: true
	},
	enhancedPrompt: String,

	// Parameters
	parameters: {
		style: String,
		aspectRatio: String,
		steps: Number,
		seed: String,
		quality: String
	},

	// Output
	resultUrl: String,
	thumbnailUrl: String,

	// Related Post
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	},

	// Performance Metrics
	generationTime: Number,
	cost: Number,

	// Status
	status: {
		type: String,
		enum: ['pending', 'processing', 'completed', 'failed'],
		default: 'pending',
		index: true
	},
	errorMessage: String,

	// Quality Rating (user feedback)
	userRating: {
		type: Number,
		min: 1,
		max: 5
	}
}, {
	timestamps: true
});

// Indexes
aiGenerationSchema.index({ user: 1, createdAt: -1 });
aiGenerationSchema.index({ type: 1, model: 1 });
aiGenerationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
