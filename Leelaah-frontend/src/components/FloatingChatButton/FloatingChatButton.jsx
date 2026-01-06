import React, { useState, useEffect } from 'react';
import { BiMessageDetail } from 'react-icons/bi';
import apiService from '../../services/api';
import './FloatingChatButton.css';

const FloatingChatButton = ({ onClick }) => {
	const [conversations, setConversations] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		fetchConversations();
		// Refresh every 30 seconds
		const interval = setInterval(fetchConversations, 30000);
		return () => clearInterval(interval);
	}, []);

	const fetchConversations = async () => {
		try {
			const response = await apiService.messages.getConversations();
			if (response.data.success) {
				const convs = response.data.conversations || [];
				setConversations(convs.slice(0, 3)); // Only show first 3

				// Calculate total unread
				const total = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
				setUnreadCount(total);
			}
		} catch (error) {
			console.error('Failed to fetch conversations:', error);
		}
	};

	return (
		<div className="floating-chat-button" onClick={onClick}>
			<BiMessageDetail className="chat-button-icon" />
			<span className="chat-button-text">Messages</span>

			{/* Avatar Stack */}
			{conversations.length > 0 && (
				<div className="chat-button-avatars">
					{conversations.map((conv, idx) => (
						<img
							key={conv.id}
							src={conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser.username}&background=random`}
							alt={conv.otherUser.username}
							className="chat-button-avatar"
							style={{ zIndex: 3 - idx }}
						/>
					))}
				</div>
			)}

			{/* Unread Badge */}
			{unreadCount > 0 && (
				<span className="chat-button-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
			)}
		</div>
	);
};

export default FloatingChatButton;
