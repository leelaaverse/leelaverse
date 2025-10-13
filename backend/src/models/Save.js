const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
	// User who saved
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Saved Post
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
		required: true,
		index: true
	},

	// Collections/Folders
	collection: {
		type: String,
		default: 'Saved Items',
		index: true
	},

	// Notes (optional)
	notes: {
		type: String,
		maxlength: 500
	}
}, {
	timestamps: true
});

// Prevent duplicate saves
saveSchema.index({ user: 1, post: 1 }, { unique: true });

// Index for user's saved collections
saveSchema.index({ user: 1, collection: 1, createdAt: -1 });

module.exports = mongoose.model('Save', saveSchema);
