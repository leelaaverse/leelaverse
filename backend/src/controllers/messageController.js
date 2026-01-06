const prisma = require('../config/prisma');
const { checkMutualFollow } = require('../utils/checkMutualFollow');

/**
 * Send a message to another user
 * Creates a new conversation if it doesn't exist
 * Checks mutual following to determine if it's a direct message or message request
 */
exports.sendMessage = async (req, res) => {
	try {
		const senderId = req.user.id;
		const { recipientId, content, mediaUrl, mediaType } = req.body;

		// Validation
		// Validation
		if (!recipientId) {
			return res.status(400).json({
				success: false,
				error: 'Recipient ID is required'
			});
		}

		if ((!content || !content.trim()) && !mediaUrl) {
			return res.status(400).json({
				success: false,
				error: 'Message content or media is required'
			});
		}

		// Can't message yourself
		if (senderId === recipientId) {
			return res.status(400).json({
				success: false,
				error: 'Cannot send message to yourself'
			});
		}

		// Check if recipient exists
		const recipient = await prisma.user.findUnique({
			where: { id: recipientId }
		});

		if (!recipient) {
			return res.status(404).json({
				success: false,
				error: 'Recipient not found'
			});
		}

		// Check mutual following
		const isMutualFollowers = await checkMutualFollow(senderId, recipientId);

		// Ensure consistent participant order for unique constraint
		const [participant1Id, participant2Id] = [senderId, recipientId].sort();

		// Find or create conversation
		let conversation = await prisma.conversation.findUnique({
			where: {
				participant1Id_participant2Id: {
					participant1Id,
					participant2Id
				}
			}
		});

		if (!conversation) {
			// Create new conversation
			conversation = await prisma.conversation.create({
				data: {
					participant1Id,
					participant2Id,
					participants: [senderId, recipientId],
					isMutualFollowers,
					isAccepted: isMutualFollowers, // Auto-accept if mutual followers
					acceptedAt: isMutualFollowers ? new Date() : null,
					lastMessageAt: new Date(),
					lastMessagePreview: content.substring(0, 100),
					lastMessageSender: senderId
				}
			});
		} else {
			// Update existing conversation
			conversation = await prisma.conversation.update({
				where: { id: conversation.id },
				data: {
					isMutualFollowers,
					lastMessageAt: new Date(),
					lastMessagePreview: content.substring(0, 100),
					lastMessageSender: senderId
				}
			});
		}

		// Create message
		const message = await prisma.message.create({
			data: {
				conversationId: conversation.id,
				senderId,
				content,
				mediaUrl,
				mediaType
			},
			include: {
				sender: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				}
			}
		});

		// Get Socket.IO instance
		const io = req.app.get('io');
		if (io) {
			// Emit to conversation room (real-time chat)
			io.to(`conversation:${conversation.id}`).emit('receive:message', {
				...message,
				createdAt: message.createdAt.toISOString()
			});

			// Emit to recipient's user room (notification)
			io.to(`user:${recipientId}`).emit('new:message:notification', {
				conversationId: conversation.id,
				senderId,
				content,
				type: 'message'
			});
		}

		res.status(201).json({
			success: true,
			message,
			conversation: {
				id: conversation.id,
				isAccepted: conversation.isAccepted,
				isMutualFollowers: conversation.isMutualFollowers
			}
		});
	} catch (error) {
		console.error('Send message error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to send message'
		});
	}
};

/**
 * Get all conversations for the logged-in user
 * Excludes unaccepted message requests
 */
exports.getConversations = async (req, res) => {
	try {
		const userId = req.user.id;

		const conversations = await prisma.conversation.findMany({
			where: {
				participants: {
					has: userId
				},
				OR: [
					{ isAccepted: true },
					{ lastMessageSender: userId } // Also show if I sent the last message (my sent requests)
				]
			},
			include: {
				participant1: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				participant2: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				messages: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					include: {
						sender: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								username: true
							}
						}
					}
				}
			},
			orderBy: {
				lastMessageAt: 'desc'
			}
		});

		// Format conversations to include other user info and unread count
		const formattedConversations = await Promise.all(
			conversations.map(async (conv) => {
				const otherUser = conv.participant1.id === userId ? conv.participant2 : conv.participant1;

				// Count unread messages
				const unreadCount = await prisma.message.count({
					where: {
						conversationId: conv.id,
						senderId: { not: userId },
						isRead: false
					}
				});

				return {
					id: conv.id,
					otherUser,
					lastMessage: conv.messages[0] || null,
					lastMessageAt: conv.lastMessageAt,
					unreadCount,
					isMutualFollowers: conv.isMutualFollowers
				};
			})
		);

		res.json({
			success: true,
			conversations: formattedConversations
		});
	} catch (error) {
		console.error('Get conversations error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch conversations'
		});
	}
};

/**
 * Get a specific conversation with all messages
 */
exports.getConversation = async (req, res) => {
	try {
		const userId = req.user.id;
		const { conversationId } = req.params;

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId },
			include: {
				participant1: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				participant2: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				messages: {
					orderBy: { createdAt: 'asc' },
					include: {
						sender: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								username: true,
								avatar: true
							}
						}
					}
				}
			}
		});

		if (!conversation) {
			return res.status(404).json({
				success: false,
				error: 'Conversation not found'
			});
		}

		// Check if user is a participant
		if (!conversation.participants.includes(userId)) {
			return res.status(403).json({
				success: false,
				error: 'You are not a participant in this conversation'
			});
		}

		// Mark messages as read
		await prisma.message.updateMany({
			where: {
				conversationId,
				senderId: { not: userId },
				isRead: false
			},
			data: {
				isRead: true,
				readAt: new Date()
			}
		});

		const otherUser = conversation.participant1.id === userId ? conversation.participant2 : conversation.participant1;

		res.json({
			success: true,
			conversation: {
				id: conversation.id,
				otherUser,
				messages: conversation.messages,
				isAccepted: conversation.isAccepted,
				isMutualFollowers: conversation.isMutualFollowers
			}
		});
	} catch (error) {
		console.error('Get conversation error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch conversation'
		});
	}
};

/**
 * Get message requests (unaccepted conversations)
 */
exports.getMessageRequests = async (req, res) => {
	try {
		const userId = req.user.id;

		const requests = await prisma.conversation.findMany({
			where: {
				participants: {
					has: userId
				},
				isAccepted: false,
				lastMessageSender: { not: userId } // Only show requests where other person sent last message
			},
			include: {
				participant1: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				participant2: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						avatar: true
					}
				},
				messages: {
					take: 1,
					orderBy: { createdAt: 'desc' }
				}
			},
			orderBy: {
				lastMessageAt: 'desc'
			}
		});

		const formattedRequests = requests.map((req) => {
			const otherUser = req.participant1.id === userId ? req.participant2 : req.participant1;
			return {
				id: req.id,
				otherUser,
				lastMessage: req.messages[0] || null,
				lastMessageAt: req.lastMessageAt
			};
		});

		res.json({
			success: true,
			requests: formattedRequests
		});
	} catch (error) {
		console.error('Get message requests error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch message requests'
		});
	}
};

/**
 * Accept a message request
 */
exports.acceptMessageRequest = async (req, res) => {
	try {
		const userId = req.user.id;
		const { conversationId } = req.params;

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId }
		});

		if (!conversation) {
			return res.status(404).json({
				success: false,
				error: 'Conversation not found'
			});
		}

		// Check if user is a participant
		if (!conversation.participants.includes(userId)) {
			return res.status(403).json({
				success: false,
				error: 'You are not authorized to accept this request'
			});
		}

		// Accept the conversation
		const updated = await prisma.conversation.update({
			where: { id: conversationId },
			data: {
				isAccepted: true,
				acceptedAt: new Date()
			}
		});

		res.json({
			success: true,
			conversation: updated
		});
	} catch (error) {
		console.error('Accept message request error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to accept message request'
		});
	}
};

/**
 * Reject/delete a message request
 */
exports.rejectMessageRequest = async (req, res) => {
	try {
		const userId = req.user.id;
		const { conversationId } = req.params;

		const conversation = await prisma.conversation.findUnique({
			where: { id: conversationId }
		});

		if (!conversation) {
			return res.status(404).json({
				success: false,
				error: 'Conversation not found'
			});
		}

		// Check if user is a participant
		if (!conversation.participants.includes(userId)) {
			return res.status(403).json({
				success: false,
				error: 'You are not authorized to reject this request'
			});
		}

		// Delete the conversation and all messages (cascade)
		await prisma.conversation.delete({
			where: { id: conversationId }
		});

		res.json({
			success: true,
			message: 'Message request rejected'
		});
	} catch (error) {
		console.error('Reject message request error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to reject message request'
		});
	}
};

/**
 * Mark messages as read
 */
exports.markAsRead = async (req, res) => {
	try {
		const userId = req.user.id;
		const { conversationId } = req.body;

		// Mark all messages in conversation as read
		await prisma.message.updateMany({
			where: {
				conversationId,
				senderId: { not: userId },
				isRead: false
			},
			data: {
				isRead: true,
				readAt: new Date()
			}
		});

		res.json({
			success: true,
			message: 'Messages marked as read'
		});
	} catch (error) {
		console.error('Mark as read error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to mark messages as read'
		});
	}
};
