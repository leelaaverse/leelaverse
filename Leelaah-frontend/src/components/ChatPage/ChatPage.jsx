import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaCheck, FaImage, FaSmile, FaTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { BiMessageDetail } from 'react-icons/bi';
import { MdPersonAddAlt1, MdGif } from 'react-icons/md';
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
	const messagesEndRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const searchTimeoutRef = useRef(null);
	const fileInputRef = useRef(null);

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

				// NOTE: Socket message is now emitted by the backend upon successful API call
				// We do NOT need to emit it manually here.

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

	const filteredConversations = conversations.filter(conv =>
		conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredRequests = messageRequests.filter(req =>
		req.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredFollowing = searchQuery ? following.filter(user =>
		user.username.toLowerCase().includes(searchQuery.toLowerCase())
	) : [];

	return (
		<div className="chat-page">
			{/* Left Sidebar */}
			<div className="chat-sidebar">
				{/* Header */}
				<div className="chat-sidebar-header">
					<button className="chat-back-btn" onClick={onBack}>
						<FaArrowLeft />
					</button>
					<h2>{user?.username}</h2>
				</div>

				{/* Search */}
				<div className="chat-search">
					<FaSearch className="search-icon" />
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={handleSearch}
					/>
				</div>

				{/* Tabs */}
				<div className="chat-tabs">
					<button
						className={`chat-tab ${activeTab === 'primary' ? 'active' : ''}`}
						onClick={() => setActiveTab('primary')}
					>
						Primary
					</button>
					<button
						className={`chat-tab ${activeTab === 'requests' ? 'active' : ''}`}
						onClick={() => setActiveTab('requests')}
					>
						Requests
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
									<BiMessageDetail size={40} />
									<p>No messages yet</p>
								</div>
							)}

							{filteredConversations.map((conv) => (
								<div
									key={conv.id}
									className={`chat-conversation ${selectedConversation?.id === conv.id ? 'active' : ''}`}
									onClick={() => loadConversation(conv)}
								>
									<img
										src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser.username}&background=random`}
										alt={conv.otherUser.username}
										className="conversation-avatar"
									/>
									<div className="conversation-info">
										<div className="conversation-name">{conv.otherUser.username}</div>
										<div className="conversation-preview">{conv.lastMessage?.content || ''}</div>
									</div>
									<div className="conversation-meta">
										<span className="conversation-time">{formatTime(conv.lastMessageAt)}</span>
										{conv.unreadCount > 0 && (
											<span className="unread-badge">{conv.unreadCount}</span>
										)}
									</div>
								</div>
							))}

							{searchQuery && filteredFollowing.length > 0 && (
								<>
									<div className="section-divider">Following</div>
									{filteredFollowing.map((user) => (
										<div
											key={user.id}
											className="chat-conversation"
											onClick={() => {
												setSelectedConversation({ otherUser: user, messages: [] });
												setMessages([]);
												setSearchQuery('');
											}}
										>
											<img
												src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
												alt={user.username}
												className="conversation-avatar"
											/>
											<div className="conversation-info">
												<div className="conversation-name">{user.username}</div>
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
									<MdPersonAddAlt1 size={40} />
									<p>No requests</p>
								</div>
							)}

							{filteredRequests.map((req) => (
								<div key={req.id} className="chat-request">
									<img
										src={req.otherUser.avatar || `https://ui-avatars.com/api/?name=${req.otherUser.username}&background=random`}
										alt={req.otherUser.username}
										className="conversation-avatar"
									/>
									<div className="conversation-info">
										<div className="conversation-name">{req.otherUser.username}</div>
										<div className="conversation-preview">{req.lastMessage?.content}</div>
									</div>
									<div className="request-actions">
										<button className="btn-accept" onClick={() => handleAcceptRequest(req)}>
											<FaCheck />
										</button>
										<button className="btn-reject" onClick={() => handleRejectRequest(req)}>
											<IoClose />
										</button>
									</div>
								</div>
							))}
						</>
					)}
				</div>
			</div>

			{/* Right Panel - Messages */}
			<div className="chat-message-panel">
				{selectedConversation ? (
					<>
						{/* Chat Header */}
						<div className="chat-message-header">
							<img
								src={selectedConversation.otherUser.avatar || `https://ui-avatars.com/api/?name=${selectedConversation.otherUser.username}&background=random`}
								alt={selectedConversation.otherUser.username}
								className="header-avatar"
							/>
							<div className="header-info">
								<div className="header-name">{selectedConversation.otherUser.username}</div>
							</div>
						</div>

						{/* Messages */}
						<div className="chat-messages">
							{loading ? (
								<div className="message-loading">Loading...</div>
							) : (
								<>
									{messages.map((msg, idx) => {
										// Detect shared post: has mediaUrl + content contains ?post=
										const isSharedPost = msg.mediaUrl && msg.content?.includes('?post=');
										const sharedPostId = isSharedPost
											? (() => { try { const u = msg.content.split('\n').find(l => l.includes('?post=')); return new URL(u).searchParams.get('post'); } catch { return null; } })()
											: null;
										const postCaption = isSharedPost
											? msg.content.split('\n').filter(l => !l.includes('?post='))[0]
											: null;

										return (
											<div
												key={idx}
												className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
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
															{msg.content && <p>{msg.content}</p>}
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
														</>
													)}
													<span className="message-time">{formatTime(msg.createdAt)}</span>
												</div>
											</div>
										);
									})}
									{isTyping && (
										<div className="typing-indicator">
											<span></span>
											<span></span>
											<span></span>
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
								<div className="image-preview">
									<img src={imagePreview} alt="Preview" />
									<button type="button" className="remove-image" onClick={handleRemoveImage}>
										<FaTimes />
									</button>
								</div>
							)}

							{/* Emoji Picker */}
							{showEmojiPicker && (
								<div className="emoji-picker-wrapper">
									<EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
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
										onClick={() => fileInputRef.current?.click()}
										title="Upload image"
									>
										<FaImage />
									</button>
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
										title="Send GIF (Coming soon)"
										disabled
									>
										<MdGif />
									</button>
								</div>

								<input
									type="text"
									value={messageInput}
									onChange={handleTyping}
									placeholder="Message..."
								/>

								{imagePreview ? (
									<button
										type="button"
										onClick={handleImageUpload}
										disabled={uploadingImage}
									>
										{uploadingImage ? '...' : <FaPaperPlane />}
									</button>
								) : (
									<button type="submit" disabled={!messageInput.trim()}>
										<FaPaperPlane />
									</button>
								)}
							</div>
						</form>
					</>
				) : (
					<div className="chat-empty-panel">
						<BiMessageDetail size={80} />
						<h3>Your messages</h3>
						<p>Send a message to start a chat</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatPage;
