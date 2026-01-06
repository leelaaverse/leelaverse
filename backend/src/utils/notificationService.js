const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a notification and emit it via Socket.IO
 *
 * @param {Object} req - Express request object (to access io)
 * @param {Object} data - Notification data
 * @param {string} data.recipientId - ID of user receiving notification
 * @param {string} data.senderId - ID of user triggering notification
 * @param {string} data.type - Type: 'like', 'comment', 'follow', etc.
 * @param {string} data.content - Notification message text
 * @param {string} [data.postId] - Optional related post ID
 * @param {string} [data.commentId] - Optional related comment ID
 * @param {string} [data.link] - Optional link to navigate to
 */
const createNotification = async (req, { recipientId, senderId, type, content, postId, commentId, link }) => {
	try {
		// Don't notify if user interacts with their own content
		if (recipientId === senderId) return null;

		// Create notification in DB
		const notification = await prisma.notification.create({
			data: {
				recipientId,
				senderId,
				type,
				message: content,
				postId,
				commentId,
				link,
				isRead: false
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true
					}
				}
			}
		});

		// Emit socket event if io instance is available
		const io = req.app.get('io');
		if (io) {
			io.to(`user:${recipientId}`).emit('new:notification', notification);
		}

		return notification;
	} catch (error) {
		console.error('Error creating notification:', error);
		// Don't throw error to prevent blocking the main action (like/comment)
		return null;
	}
};

module.exports = { createNotification };
