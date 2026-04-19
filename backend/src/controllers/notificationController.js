const prisma = require('../config/prisma');

// GET /api/notifications - Get notifications for current user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { recipientId: userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    sender: {
                        select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
                    },
                    post: {
                        select: { id: true, title: true, category: true }
                    }
                }
            }),
            prisma.notification.count({ where: { recipientId: userId } }),
            prisma.notification.count({ where: { recipientId: userId, isRead: false } })
        ]);

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + limit < total
                }
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await prisma.notification.count({
            where: { recipientId: userId, isRead: false }
        });
        res.json({ success: true, data: { unreadCount: count } });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
    }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await prisma.notification.findFirst({
            where: { id, recipientId: userId }
        });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() }
        });

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { recipientId: userId, isRead: false },
            data: { isRead: true, readAt: new Date() }
        });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
};

// Helper to create a notification
const createNotification = async ({ recipientId, senderId, type, message, postId, commentId, aiGenerationId, link }) => {
    try {
        // Don't send self-notifications for social actions
        if (senderId && senderId === recipientId && ['like', 'comment', 'follow'].includes(type)) {
            return null;
        }

        const notification = await prisma.notification.create({
            data: {
                recipientId,
                senderId: senderId || null,
                type,
                message,
                postId: postId || null,
                commentId: commentId || null,
                aiGenerationId: aiGenerationId || null,
                link: link || null
            },
            include: {
                sender: {
                    select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });

        // Emit via Socket.io if available
        const io = global.io;
        if (io) {
            io.to(`user:${recipientId}`).emit('new:notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification
};
