// Central export file for Prisma models
// All models are now defined in prisma/schema.prisma
// This file exports the Prisma client for easy access throughout the app

const prisma = require('../config/prisma');

// Export the Prisma client instance
module.exports = prisma;

// Also export as named exports for backward compatibility
module.exports.prisma = prisma;
module.exports.User = prisma.user;
module.exports.Post = prisma.post;
module.exports.Comment = prisma.comment;
module.exports.Like = prisma.like;
module.exports.Save = prisma.save;
module.exports.Follow = prisma.follow;
module.exports.Group = prisma.group;
module.exports.Notification = prisma.notification;
module.exports.Story = prisma.story;
module.exports.StoryView = prisma.storyView;
module.exports.Tag = prisma.tag;
module.exports.AIGeneration = prisma.aIGeneration;
module.exports.CoinTransaction = prisma.coinTransaction;
module.exports.RefreshToken = prisma.refreshToken;

