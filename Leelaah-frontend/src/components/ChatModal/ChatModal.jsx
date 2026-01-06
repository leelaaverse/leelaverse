import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes, FaPaperPlane, FaSearch, FaArrowLeft, FaCheck, FaUserFriends } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { BiMessageDetail } from 'react-icons/bi';
import { MdPersonAddAlt1 } from 'react-icons/md';
import apiService from '../../services/api';
import socketService from '../../services/socket';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose }) => {
	const { user, token } = useSelector((state) => state.auth);
	const [activeView, setActiveView] = useState('list'); // 'list', 'chat', 'requests'
	const [conversations, setConversations] = useState([]);
	const [messageRequests, setMessageRequests] = useState([]);
	const [following, setFollowing] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [messageInput, setMessageInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const searchTimeoutRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && token) {
			socketService.connect(token);
			fetchConversations();
			fetchMessageRequests();
			fetchFollowing();
		}

		return () => {
			if (selectedConversation) {
				socketService.leaveConversation(selectedConversation.id);
			}
		};
	}, [isOpen, token]);

	useEffect(() => {
		if (!isOpen) return;

		const handleReceiveMessage = (data) => {
			if (selectedConversation && data.conversationId === selectedConversation.id) {
				setMessages((prev) => [...prev, data]);
			}
			fetchConversations();
		};

		const handleUserTyping = ({ userId, conversationId }) => {
			if (selectedConversation && conversationId === selectedConversation.id) {
				setIsTyping(true);
			}
		};

		const handleUserStoppedTyping = ({ userId, conversationId }) => {
			if (selectedConversation && conversationId === selectedConversation.id) {
				setIsTyping(false);
			}
		};

		const handleNewMessage = () => {
			fetchConversations();
			fetchMessageRequests();
		};

		socketService.onReceiveMessage(handleReceiveMessage);
		socketService.onUserTyping(handleUserTyping);
		socketService.onUserStoppedTyping(handleUserStoppedTyping);
		socketService.onNewMessageNotification(handleNewMessage);

		return () => {
			socketService.off('receive:message', handleReceiveMessage);
			socketService.off('user:typing', handleUserTyping);
			socketService.off('user:stopped:typing', handleUserStoppedTyping);
			socketService.off('new:message:notification', handleNewMessage);
		};
	}, [isOpen, selectedConversation]);

	const fetchConversations = async () => {
		try {
			const response = await apiService.messages.getConversations();
			if (response.data.success) {
				setConversations(response.data.conversations);
			}
		} catch (error) {
			console.error('Failed to fetch conversations:', error);
		}
	};

	const fetchMessageRequests = async () => {
		try {
			const response = await apiService.messages.getRequests();
			if (response.data.success) {
				setMessageRequests(response.data.requests);
			}
		} catch (error) {
			console.error('Failed to fetch message requests:', error);
		}
	};

	const fetchFollowing = async () => {
		try {
			const response = await apiService.users.getFollowing();
			if (response.data.success) {
				setFollowing(response.data.following || []);
			}
		} catch (error) {
			console.error('Failed to fetch following:', error);
		}
	};

	const loadConversation = async (conversation) => {
		setLoading(true);
		try {
			const response = await apiService.messages.getConversation(conversation.id);
			if (response.data.success) {
				setSelectedConversation(response.data.conversation);
				setMessages(response.data.conversation.messages || []);
				socketService.joinConversation(conversation.id);
				setActiveView('chat');
			}
		} catch (error) {
			console.error('Failed to load conversation:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!messageInput.trim() || !selectedConversation) return;

		const recipientId = selectedConversation.otherUser.id;

		try {
			const response = await apiService.messages.sendMessage({
				recipientId,
				content: messageInput
			});

			if (response.data.success) {
				// If this was a new conversation, update with the conversation ID
				if (!selectedConversation.id && response.data.conversation) {
					setSelectedConversation(prev => ({
						...prev,
						id: response.data.conversation.id
					}));
					// Join the conversation room
					socketService.joinConversation(response.data.conversation.id);
				}

				// Send via socket for real-time delivery (if conversation exists)
				if (selectedConversation.id || response.data.conversation?.id) {
					socketService.sendMessage({
						conversationId: selectedConversation.id || response.data.conversation.id,
						content: messageInput,
						recipientId
					});
				}

				setMessageInput('');
				socketService.stopTyping(selectedConversation.id || response.data.conversation.id);

				// Refresh conversations list
				fetchConversations();
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	const handleTyping = (e) => {
		setMessageInput(e.target.value);

		if (!selectedConversation) return;

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		socketService.startTyping(selectedConversation.id);

		typingTimeoutRef.current = setTimeout(() => {
			socketService.stopTyping(selectedConversation.id);
		}, 3000);
	};

	const handleSearch = (e) => {
		const query = e.target.value;
		setSearchQuery(query);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			// Search is applied through filtering in render
		}, 300);
	};

	const handleAcceptRequest = async (conversation) => {
		try {
			const response = await apiService.messages.acceptRequest(conversation.id);
			if (response.data.success) {
				fetchConversations();
				fetchMessageRequests();
				setActiveView('list');
			}
		} catch (error) {
			console.error('Failed to accept request:', error);
		}
	};

	const handleRejectRequest = async (conversation) => {
		try {
			const response = await apiService.messages.rejectRequest(conversation.id);
			if (response.data.success) {
				fetchMessageRequests();
			}
		} catch (error) {
			console.error('Failed to reject request:', error);
		}
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'now';
		if (diffMins < 60) return `${diffMins}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		return date.toLocaleDateString();
	};

	const filteredItems = () => {
		if (activeView === 'requests') {
			return messageRequests.filter(req =>
				req.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (activeView === 'list') {
			if (searchQuery) {
				// Search in both conversations and following
				const matchedConvs = conversations.filter(conv =>
					conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
				);
				const matchedFollowing = following.filter(user =>
					user.username.toLowerCase().includes(searchQuery.toLowerCase())
				);
				return { conversations: matchedConvs, following: matchedFollowing };
			}
			return { conversations, following: [] };
		}

		return { conversations: [], following: [] };
	};

	if (!isOpen) return null;

	const filtered = filteredItems();

	return (
		<div className={`chat-panel ${isOpen ? 'open' : ''}`}>
			{/* Header */}
			<div className="chat-panel-header">
				<div className="chat-header-content">
					{activeView === 'chat' && (
						<button className="chat-back-button" onClick={() => {
							setActiveView('list');
							setSelectedConversation(null);
						}}>
							<FaArrowLeft />
						</button>
					)}
					<h3>
						{activeView === 'chat' ? selectedConversation?.otherUser.username :
							activeView === 'requests' ? 'Message Requests' : 'Messages'}
					</h3>
				</div>
				<button className="chat-close-button" onClick={onClose}>
					<IoClose />
				</button>
			</div>

			{/* Body */}
			<div className="chat-panel-body">
				{activeView !== 'chat' && (
					<>
						{/* Search Bar */}
						<div className="chat-search-container">
							<FaSearch className="chat-search-icon" />
							<input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={handleSearch}
								className="chat-search-input"
							/>
						</div>

						{/* Tabs */}
						<div className="chat-tabs-container">
							<button
								className={`chat-tab-btn ${activeView === 'list' ? 'active' : ''}`}
								onClick={() => setActiveView('list')}
							>
								<BiMessageDetail />
								<span>Chats</span>
							</button>
							<button
								className={`chat-tab-btn ${activeView === 'requests' ? 'active' : ''}`}
								onClick={() => setActiveView('requests')}
							>
								<MdPersonAddAlt1 />
								<span>Requests</span>
								{messageRequests.length > 0 && (
									<span className="chat-tab-badge">{messageRequests.length}</span>
								)}
							</button>
						</div>
					</>
				)}

				{/* Conversation List */}
				{activeView === 'list' && (
					<div className="chat-list">
						{filtered.conversations.length === 0 && !searchQuery && (
							<div className="chat-empty">
								<BiMessageDetail size={48} />
								<p>No conversations yet</p>
								<span>Start messaging your followers</span>
							</div>
						)}

						{filtered.conversations.map((conv) => (
							<div
								key={conv.id}
								className="chat-list-item"
								onClick={() => loadConversation(conv)}
							>
								<img
									src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser.username}&background=random`}
									alt={conv.otherUser.username}
									className="chat-list-avatar"
								/>
								<div className="chat-list-content">
									<div className="chat-list-top">
										<span className="chat-list-name">{conv.otherUser.username}</span>
										<span className="chat-list-time">{formatTime(conv.lastMessageAt)}</span>
									</div>
									<div className="chat-list-bottom">
										<span className="chat-list-preview">{conv.lastMessage?.content || ''}</span>
										{conv.unreadCount > 0 && (
											<span className="chat-list-unread">{conv.unreadCount}</span>
										)}
									</div>
								</div>
							</div>
						))}

						{searchQuery && filtered.following.length > 0 && (
							<>
								<div className="chat-section-label">Following</div>
								{filtered.following.map((user) => (
									<div
										key={user.id}
										className="chat-list-item"
										onClick={async () => {
											// Start new conversation by opening chat with user directly
											try {
												// Create a temporary conversation object and load it
												// The conversation will be created when first message is sent
												const tempConversation = {
													id: null, // Will be created on first message
													otherUser: user
												};
												setSelectedConversation({ otherUser: user, messages: [] });
												setMessages([]);
												setActiveView('chat');
												setSearchQuery('');
											} catch (error) {
												console.error('Failed to start conversation:', error);
											}
										}}
									>
										<img
											src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
											alt={user.username}
											className="chat-list-avatar"
										/>
										<div className="chat-list-content">
											<span className="chat-list-name">{user.username}</span>
										</div>
									</div>
								))}
							</>
						)}
					</div>
				)}

				{/* Message Requests */}
				{activeView === 'requests' && (
					<div className="chat-list">
						{filtered.length === 0 && (
							<div className="chat-empty">
								<MdPersonAddAlt1 size={48} />
								<p>No message requests</p>
							</div>
						)}

						{filtered.map((req) => (
							<div key={req.id} className="chat-request-card">
								<img
									src={req.otherUser.avatar || `https://ui-avatars.com/api/?name=${req.otherUser.username}&background=random`}
									alt={req.otherUser.username}
									className="chat-request-avatar"
								/>
								<div className="chat-request-info">
									<span className="chat-request-name">{req.otherUser.username}</span>
									<span className="chat-request-preview">{req.lastMessage?.content}</span>
								</div>
								<div className="chat-request-actions">
									<button
										className="chat-request-accept"
										onClick={() => handleAcceptRequest(req)}
									>
										<FaCheck />
									</button>
									<button
										className="chat-request-reject"
										onClick={() => handleRejectRequest(req)}
									>
										<IoClose />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Chat View */}
				{activeView === 'chat' && (
					<>
						<div className="chat-messages-container">
							{loading ? (
								<div className="chat-loading">Loading...</div>
							) : (
								<>
									{messages.map((msg, idx) => (
										<div
											key={idx}
											className={`chat-msg ${msg.senderId === user.id ? 'sent' : 'received'}`}
										>
											<div className="chat-msg-bubble">
												<p>{msg.content}</p>
												<span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
											</div>
										</div>
									))}
									{isTyping && (
										<div className="chat-typing">
											<span></span>
											<span></span>
											<span></span>
										</div>
									)}
									<div ref={messagesEndRef} />
								</>
							)}
						</div>

						<form className="chat-input-container" onSubmit={handleSendMessage}>
							<input
								type="text"
								value={messageInput}
								onChange={handleTyping}
								placeholder="Message..."
								className="chat-message-input"
							/>
							<button type="submit" className="chat-send-button" disabled={!messageInput.trim()}>
								<FaPaperPlane />
							</button>
						</form>
					</>
				)}
			</div>
		</div >
	);
};

export default ChatModal;
