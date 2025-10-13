const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
	// User
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// Transaction Type
	type: {
		type: String,
		required: true,
		enum: [
			'earn',
			'spend',
			'purchase',
			'gift',
			'reward',
			'refund',
			'daily_bonus',
			'achievement'
		],
		index: true
	},

	// Amount (positive or negative)
	amount: {
		type: Number,
		required: true
	},

	// Balance After Transaction
	balanceAfter: {
		type: Number,
		required: true
	},

	// Description
	description: {
		type: String,
		required: true
	},

	// Related Entity
	relatedModel: {
		type: String,
		enum: ['Post', 'AIGeneration', 'User', null]
	},
	relatedId: {
		type: mongoose.Schema.Types.ObjectId,
		refPath: 'relatedModel'
	},

	// Metadata
	metadata: {
		aiModel: String,
		generationType: String,
		achievementName: String
	}
}, {
	timestamps: true
});

// Indexes
coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
