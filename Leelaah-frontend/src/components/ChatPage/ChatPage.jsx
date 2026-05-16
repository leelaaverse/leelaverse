import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaCheck, FaImage, FaSmile, FaTimes } from 'react-icons/fa';
import { IoClose, IoCheckmarkDone, IoCheckmark } from 'react-icons/io5';
import { BiMessageDetail } from 'react-icons/bi';
import { MdPersonAddAlt1, MdGif } from 'react-icons/md';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';
import apiService from '../../services/api';
import socketService from '../../services/socket';
import { compressImage, uploadImageToCloudinary } from '../../utils/imageCompression';
import './ChatPage.css';

const ChatPage = ({ onBack, onNavigate }) => {
	const { user, token } = useSelector((state) => state.auth);
	const [activeTab, setActiveTab] = useState('primary'); // 'primary' or 'requests'
	const [conversations, setConversations] = useState([]);
	const [messageRequests, setMessageRequests] = useState([]);
	const [following, setFollowing] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [messageInput, setMessageInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [isMobileConvOpen, setIsMobileConvOpen] = useState(false);
	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const searchTimeoutRef = useRef(null);
	const fileInputRef = useRef(null);
	const inputRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (token) {
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
	}, [token]);

	useEffect(() => {
		const handleReceiveMessage = (data) => {
			if (selectedConversation && data.conversationId === selectedConversation.id) {
				setMessages(prev => {
					// Check if we already have this message by ID
					if (prev.some(msg => msg.id === data.id)) return prev;

					// Check if we have an optimistic version of this message
					const optimisticIndex = prev.findIndex(msg =>
						msg.isOptimistic &&
						msg.content === data.content &&
						String(msg.senderId) === String(data.senderId)
					);

					if (optimisticIndex !== -1) {
						// Replace optimistic message with real one from socket
						const newMessages = [...prev];
						newMessages[optimisticIndex] = data;
						return newMessages;
					}

					return [...prev, data];
				});
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
	}, [selectedConversation]);

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
		setIsMobileConvOpen(true);
		try {
			const response = await apiService.messages.getConversation(conversation.id);
			if (response.data.success) {
				setSelectedConversation(response.data.conversation);
				setMessages(response.data.conversation.messages || []);
				socketService.joinConversation(conversation.id);
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
		const tempId = `temp-${Date.now()}`;
		const currentInput = messageInput;

		// Optimistically add message to UI immediately
		const tempMessage = {
			id: tempId,
			content: currentInput,
			senderId: user.id,
			createdAt: new Date().toISOString(),
			isOptimistic: true
		};
		setMessages((prev) => [...prev, tempMessage]);
		setMessageInput('');

		try {
			const response = await apiService.messages.sendMessage({
				recipientId,
				content: messageInput
			});

			if (response.data.success) {
				// Replace optimistic message with real one
				if (response.data.message) {
					setMessages((prev) =>
						prev.map(msg => msg.id === tempId ? response.data.message : msg)
					);
				}

				if (!selectedConversation.id && response.data.conversation) {
					setSelectedConversation(prev => ({
						...prev,
						id: response.data.conversation.id
					}));
					socketService.joinConversation(response.data.conversation.id);
				}

				socketService.stopTyping(selectedConversation.id || response.data.conversation.id);
				fetchConversations();
			}
		} catch (error) {
			console.error('Failed to send message:', error);
			// Remove optimistic message on error
			setMessages((prev) => prev.filter(msg => msg.id !== tempId));
			setMessageInput(currentInput);
		}
	};

	const handleTyping = (e) => {
		setMessageInput(e.target.value);

		if (!selectedConversation?.id) return;

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
				setActiveTab('primary');
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

	const handleImageSelect = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}

		setSelectedImage(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const handleImageUpload = async () => {
		if (!selectedImage || !selectedConversation) return;

		setUploadingImage(true);
		try {
			// Compress image
			const compressed = await compressImage(selectedImage);

			// Upload to Cloudinary
			const imageUrl = await uploadImageToCloudinary(compressed, token);

			// Send as message
			const recipientId = selectedConversation.otherUser.id;
			const response = await apiService.messages.sendMessage({
				recipientId,
				content: messageInput || '',
				mediaUrl: imageUrl,
				mediaType: 'image'
			});

			if (response.data.success) {
				// Handle new conversation creation
				if (!selectedConversation.id && response.data.conversation) {
					setSelectedConversation(prev => ({
						...prev,
						id: response.data.conversation.id,
						isAccepted: response.data.conversation.isAccepted
					}));
					socketService.joinConversation(response.data.conversation.id);
				}

				setMessages((prev) => [...prev, response.data.message]);
				setSelectedImage(null);
				setImagePreview(null);
				setMessageInput('');
				fetchConversations();
			}
		} catch (error) {
			console.error('Failed to upload image:', error);
			alert('Failed to upload image');
		} finally {
			setUploadingImage(false);
		}
	};

	const handleEmojiClick = (emojiData) => {
		setMessageInput(prev => prev + emojiData.emoji);
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleMobileBack = () => {
		setIsMobileConvOpen(false);
		setSelectedConversation(null);
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

	const formatMessageTime = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Group messages by date
	const groupMessagesByDate = (msgs) => {
		const groups = [];
		let currentDate = '';
		msgs.forEach((msg) => {
			const d = new Date(msg.createdAt);
			const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
			const today = new Date();
			const isToday = d.toDateString() === today.toDateString();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			const isYesterday = d.toDateString() === yesterday.toDateString();
			const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : dateStr;

			if (label !== currentDate) {
				currentDate = label;
				groups.push({ type: 'date', label });
			}
			groups.push({ type: 'message', data: msg });
		});
		return groups;
	};

	const filteredConversations = conversations.filter(conv =>
		conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredRequests = messageRequests.filter(req =>
		req.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredFollowing = searchQuery ? following.filter(u =>
		u.username.toLowerCase().includes(searchQuery.toLowerCase())
	) : [];

	const groupedMessages = groupMessagesByDate(messages);

	return (
		<div className={`chat-page ${isMobileConvOpen ? 'conversation-selected' : ''}`}>
			{/* ─── Left Sidebar ─── */}
			<div className="chat-sidebar">
				{/* Header */}
				<div className="chat-sidebar-header">
					<button className="chat-back-btn" onClick={onBack} title="Back to Home">
						<FaArrowLeft />
					</button>
					<div className="chat-header-info">
						<h2>Messages</h2>
						<span className="chat-msg-count">
							{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
						</span>
					</div>
				</div>

				{/* Search */}
				<div className="chat-search">
					<FaSearch className="search-icon" />
					<input
						type="text"
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={handleSearch}
					/>
					{searchQuery && (
						<button className="search-clear" onClick={() => setSearchQuery('')}>
							<FaTimes />
						</button>
					)}
				</div>

				{/* Tabs */}
				<div className="chat-tabs">
					<button
						className={`chat-tab ${activeTab === 'primary' ? 'active' : ''}`}
						onClick={() => setActiveTab('primary')}
					>
						<span className="tab-text">Primary</span>
						{conversations.length > 0 && (
							<span className="tab-count">{conversations.length}</span>
						)}
					</button>
					<button
						className={`chat-tab ${activeTab === 'requests' ? 'active' : ''}`}
						onClick={() => setActiveTab('requests')}
					>
						<span className="tab-text">Requests</span>
						{messageRequests.length > 0 && (
							<span className="tab-badge">{messageRequests.length}</span>
						)}
					</button>
				</div>

				{/* Conversation List */}
				<div className="chat-conversations">
					{activeTab === 'primary' && (
						<>
							{filteredConversations.length === 0 && !searchQuery && (
								<div className="chat-empty-state">
									<div className="empty-icon-wrap">
										<BiMessageDetail size={32} />
									</div>
									<h4>No messages yet</h4>
									<p>Start a conversation with someone you follow</p>
								</div>
							)}

							{filteredConversations.map((conv) => (
								<div
									key={conv.id}
									className={`chat-conversation ${selectedConversation?.id === conv.id ? 'active' : ''}`}
									onClick={() => loadConversation(conv)}
								>
									<div className="conv-avatar-wrap">
										<img
											src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser.username}&background=5d5fef&color=fff&bold=true`}
											alt={conv.otherUser.username}
											className="conversation-avatar"
										/>
										<span className="conv-online-dot"></span>
									</div>
									<div className="conversation-info">
										<div className="conv-top-row">
											<span className="conversation-name">{conv.otherUser.username}</span>
											<span className="conversation-time">{formatTime(conv.lastMessageAt)}</span>
										</div>
										<div className="conv-bottom-row">
											<span className="conversation-preview">
												{conv.lastMessage?.senderId === user?.id && (
													<IoCheckmarkDone className="msg-sent-icon" />
												)}
												{conv.lastMessage?.content || 'Sent an attachment'}
											</span>
											{conv.unreadCount > 0 && (
												<span className="unread-badge">{conv.unreadCount}</span>
											)}
										</div>
									</div>
								</div>
							))}

							{searchQuery && filteredFollowing.length > 0 && (
								<>
									<div className="section-divider">
										<span>People you follow</span>
									</div>
									{filteredFollowing.map((u) => (
										<div
											key={u.id}
											className="chat-conversation"
											onClick={() => {
												setSelectedConversation({ otherUser: u, messages: [] });
												setMessages([]);
												setSearchQuery('');
												setIsMobileConvOpen(true);
											}}
										>
											<div className="conv-avatar-wrap">
												<img
													src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=5d5fef&color=fff&bold=true`}
													alt={u.username}
													className="conversation-avatar"
												/>
											</div>
											<div className="conversation-info">
												<div className="conv-top-row">
													<span className="conversation-name">{u.username}</span>
												</div>
												<div className="conv-bottom-row">
													<span className="conversation-preview">Start a conversation</span>
												</div>
											</div>
										</div>
									))}
								</>
							)}
						</>
					)}

					{activeTab === 'requests' && (
						<>
							{filteredRequests.length === 0 && (
								<div className="chat-empty-state">
									<div className="empty-icon-wrap">
										<MdPersonAddAlt1 size={32} />
									</div>
									<h4>No requests</h4>
									<p>Message requests will appear here</p>
								</div>
							)}

							{filteredRequests.map((req) => (
								<div key={req.id} className="chat-request">
									<div className="conv-avatar-wrap">
										<img
											src={req.otherUser.avatar || `https://ui-avatars.com/api/?name=${req.otherUser.username}&background=5d5fef&color=fff&bold=true`}
											alt={req.otherUser.username}
											className="conversation-avatar"
										/>
									</div>
									<div className="conversation-info">
										<div className="conversation-name">{req.otherUser.username}</div>
										<div className="conversation-preview">{req.lastMessage?.content}</div>
									</div>
									<div className="request-actions">
										<button className="btn-accept" onClick={() => handleAcceptRequest(req)} title="Accept">
											<FaCheck />
										</button>
										<button className="btn-reject" onClick={() => handleRejectRequest(req)} title="Decline">
											<IoClose />
										</button>
									</div>
								</div>
							))}
						</>
					)}
				</div>
			</div>

			{/* ─── Right Panel - Messages ─── */}
			<div className="chat-message-panel">
				{selectedConversation ? (
					<>
						{/* Chat Header */}
						<div className="chat-message-header">
							<button className="mobile-back-btn" onClick={handleMobileBack}>
								<FaArrowLeft />
							</button>
							<div
								className="header-user-info"
								onClick={() => onNavigate && onNavigate('user', selectedConversation.otherUser.id)}
								style={{ cursor: 'pointer' }}
							>
								<img
									src={selectedConversation.otherUser.avatar || `https://ui-avatars.com/api/?name=${selectedConversation.otherUser.username}&background=5d5fef&color=fff&bold=true`}
									alt={selectedConversation.otherUser.username}
									className="header-avatar"
								/>
								<div className="header-info">
									<div className="header-name">{selectedConversation.otherUser.username}</div>
									<div className="header-status">
										{isTyping ? (
											<span className="status-typing">typing...</span>
										) : (
											<span className="status-online">Active</span>
										)}
									</div>
								</div>
							</div>
							<div className="header-actions">
								<button className="header-action-btn" title="More options">
									<HiOutlineDotsVertical />
								</button>
							</div>
						</div>

						{/* Messages Area */}
						<div className="chat-messages">
							{loading ? (
								<div className="chat-skeleton-container">
									{[1, 2, 3, 4, 5].map((i) => (
										<div key={i} className={`skeleton-message ${i % 2 === 0 ? 'sent' : 'received'}`}>
											<div className="skeleton-bubble" style={{ width: `${Math.floor(Math.random() * 40) + 20}%` }}></div>
										</div>
									))}
								</div>
							) : (
								<>
									{messages.length === 0 && (
										<div className="chat-start-notice">
											<div className="chat-start-avatar">
												<img
													src={selectedConversation.otherUser.avatar || `https://ui-avatars.com/api/?name=${selectedConversation.otherUser.username}&background=5d5fef&color=fff&bold=true`}
													alt=""
												/>
											</div>
											<h4>{selectedConversation.otherUser.username}</h4>
											<p>Send a message to start the conversation</p>
										</div>
									)}

									{groupedMessages.map((item, idx) => {
										if (item.type === 'date') {
											return (
												<div key={`date-${idx}`} className="message-date-divider">
													<span>{item.label}</span>
												</div>
											);
										}

										const msg = item.data;
										const isSent = msg.senderId === user.id;
										// Detect shared post
										const isSharedPost = msg.mediaUrl && msg.content?.includes('?post=');
										const sharedPostId = isSharedPost
											? (() => { try { const u = msg.content.split('\n').find(l => l.includes('?post=')); return new URL(u).searchParams.get('post'); } catch { return null; } })()
											: null;
										const postCaption = isSharedPost
											? msg.content.split('\n').filter(l => !l.includes('?post='))[0]
											: null;

										return (
											<div
												key={msg.id || idx}
												className={`message ${isSent ? 'sent' : 'received'} ${msg.isOptimistic ? 'optimistic' : ''}`}
											>
												<div className="message-bubble">
													{isSharedPost ? (
														<div
															className="shared-post-card"
															onClick={() => sharedPostId && onNavigate && onNavigate('post', sharedPostId)}
														>
															<div className="shared-post-thumb">
																<img
																	src={msg.mediaUrl}
																	alt="Shared post"
																	onError={(e) => { e.target.style.display = 'none'; }}
																/>
															</div>
															<div className="shared-post-info">
																<span className="shared-post-label">Shared Post</span>
																<span className="shared-post-title">{postCaption || 'View post'}</span>
															</div>
														</div>
													) : (
														<>
															{msg.mediaUrl && (
																<img
																	src={msg.mediaUrl}
																	alt="Shared media"
																	className="message-image"
																	onError={(e) => {
																		console.error('Image failed to load:', msg.mediaUrl);
																		e.target.style.display = 'none';
																	}}
																/>
															)}
															{msg.content && <p>{msg.content}</p>}
														</>
													)}
													<div className="message-meta">
														<span className="message-time">{formatMessageTime(msg.createdAt)}</span>
														{isSent && (
															<span className="message-status">
																{msg.isOptimistic ? <IoCheckmark /> : <IoCheckmarkDone />}
															</span>
														)}
													</div>
												</div>
											</div>
										);
									})}

									{isTyping && (
										<div className="message received">
											<div className="message-bubble typing-bubble">
												<div className="typing-indicator">
													<span></span>
													<span></span>
													<span></span>
												</div>
											</div>
										</div>
									)}
									<div ref={messagesEndRef} />
								</>
							)}
						</div>

						{/* Message Input */}
						<form className="chat-message-input" onSubmit={handleSendMessage}>
							{/* Image Preview */}
							{imagePreview && (
								<div className="image-preview-bar">
									<div className="image-preview-item">
										<img src={imagePreview} alt="Preview" />
										<button type="button" className="remove-image" onClick={handleRemoveImage}>
											<FaTimes />
										</button>
									</div>
								</div>
							)}

							{/* Emoji Picker */}
							{showEmojiPicker && (
								<div className="emoji-picker-wrapper">
									<EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width="100%" height={350} />
								</div>
							)}

							<div className="input-container">
								{/* Media Buttons */}
								<div className="media-buttons">
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleImageSelect}
										style={{ display: 'none' }}
									/>
									<button
										type="button"
										className="media-btn"
										onClick={() => setShowEmojiPicker(!showEmojiPicker)}
										title="Add emoji"
									>
										<FaSmile />
									</button>
									<button
										type="button"
										className="media-btn"
										onClick={() => fileInputRef.current?.click()}
										title="Upload image"
									>
										<FaImage />
									</button>
								</div>

								<input
									ref={inputRef}
									type="text"
									value={messageInput}
									onChange={handleTyping}
									placeholder="Type a message..."
									onFocus={() => setShowEmojiPicker(false)}
								/>

								{imagePreview ? (
									<button
										type="button"
										className="send-btn"
										onClick={handleImageUpload}
										disabled={uploadingImage}
									>
										{uploadingImage ? (
											<div className="send-spinner"></div>
										) : (
											<FaPaperPlane />
										)}
									</button>
								) : (
									<button type="submit" className="send-btn" disabled={!messageInput.trim()}>
										<FaPaperPlane />
									</button>
								)}
							</div>
						</form>
					</>
				) : (
					<div className="chat-empty-panel">
						<div className="empty-panel-content">
							<div className="empty-panel-icon">
								<BiMessageDetail size={48} />
							</div>
							<h3>Your Messages</h3>
							<p>Send private messages to your friends and creators</p>
							<span className="empty-panel-hint">Select a conversation or search for someone to chat with</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatPage;
