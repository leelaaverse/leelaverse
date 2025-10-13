// Central export file for all models
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Save = require('./Save');
const Follow = require('./Follow');
const Group = require('./Group');
const Notification = require('./Notification');
const Story = require('./Story');
const Tag = require('./Tag');
const AIGeneration = require('./AIGeneration');
const CoinTransaction = require('./CoinTransaction');

module.exports = {
	User,
	Post,
	Comment,
	Like,
	Save,
	Follow,
	Group,
	Notification,
	Story,
	Tag,
	AIGeneration,
	CoinTransaction
};
