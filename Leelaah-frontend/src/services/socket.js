import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
	constructor() {
		this.socket = null;
		this.connected = false;
	}

	connect(token) {
		if (this.socket?.connected) {
			console.log('Socket already connected');
			return this.socket;
		}

		this.socket = io(SOCKET_URL, {
			auth: {
				token
			},
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5
		});

		this.socket.on('connect', () => {
			console.log('✅ Socket connected');
			this.connected = true;
		});

		this.socket.on('disconnect', () => {
			console.log('❌ Socket disconnected');
			this.connected = false;
		});

		this.socket.on('error', (error) => {
			console.error('Socket error:', error);
		});

		return this.socket;
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.connected = false;
		}
	}

	// Join a conversation room
	joinConversation(conversationId) {
		if (this.socket) {
			this.socket.emit('join:conversation', conversationId);
		}
	}

	// Leave a conversation room
	leaveConversation(conversationId) {
		if (this.socket) {
			this.socket.emit('leave:conversation', conversationId);
		}
	}

	// Send a message
	sendMessage(data) {
		if (this.socket) {
			this.socket.emit('send:message', data);
		}
	}

	// Typing indicators
	startTyping(conversationId) {
		if (this.socket) {
			this.socket.emit('typing:start', { conversationId });
		}
	}

	stopTyping(conversationId) {
		if (this.socket) {
			this.socket.emit('typing:stop', { conversationId });
		}
	}

	// Mark as read
	markAsRead(conversationId, messageIds) {
		if (this.socket) {
			this.socket.emit('message:read', { conversationId, messageIds });
		}
	}

	// Event listeners
	onReceiveMessage(callback) {
		if (this.socket) {
			this.socket.on('receive:message', callback);
		}
	}

	onNewMessageNotification(callback) {
		if (this.socket) {
			this.socket.on('new:message:notification', callback);
		}
	}

	onNotification(callback) {
		if (this.socket) {
			this.socket.on('new:notification', callback);
		}
	}

	onUserTyping(callback) {
		if (this.socket) {
			this.socket.on('user:typing', callback);
		}
	}

	onUserStoppedTyping(callback) {
		if (this.socket) {
			this.socket.on('user:stopped:typing', callback);
		}
	}

	onMessagesRead(callback) {
		if (this.socket) {
			this.socket.on('messages:read', callback);
		}
	}

	// Remove event listeners
	off(event, callback) {
		if (this.socket) {
			this.socket.off(event, callback);
		}
	}
}

export default new SocketService();
