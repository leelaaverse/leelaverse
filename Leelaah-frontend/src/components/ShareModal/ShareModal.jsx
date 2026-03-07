import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { IoClose, IoSearchOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { HiOutlineLink } from 'react-icons/hi2';
import { FiSend } from 'react-icons/fi';
import apiService from '../../services/api';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, postId, postTitle, postMediaUrl }) => {
	const { isLoggedIn } = useSelector((state) => state.auth);
	const [search, setSearch] = useState('');
	const [following, setFollowing] = useState([]);
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [copied, setCopied] = useState(false);
	const inputRef = useRef(null);
	const modalRef = useRef(null);

	// Fetch following list + recent conversations
	useEffect(() => {
		if (!isOpen || !isLoggedIn) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const [followingRes, convoRes] = await Promise.all([
					apiService.users.getFollowing().catch(() => ({ data: { following: [] } })),
					apiService.messages.getConversations().catch(() => ({ data: { conversations: [] } }))
				]);
				setFollowing(followingRes.data?.following || []);
				setConversations(convoRes.data?.conversations || []);
			} catch (err) {
				console.error('Error fetching share data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isOpen, isLoggedIn]);

	// Focus search input when opened
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 300);
			setSelectedUsers([]);
			setSent(false);
			setSearch('');
			setCopied(false);
		}
	}, [isOpen]);

	// Close on backdrop click
	const handleBackdropClick = useCallback((e) => {
		if (e.target === modalRef.current) {
			onClose();
		}
	}, [onClose]);

	// Close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [isOpen, onClose]);

	// Build combined user list from following + recent convos
	const allUsers = (() => {
		const seenIds = new Set();
		const list = [];

		// Recent conversation users first
		conversations.forEach((c) => {
			const u = c.otherUser;
			if (u && !seenIds.has(u.id)) {
				seenIds.add(u.id);
				list.push({ ...u, isRecent: true });
			}
		});

		// Then following
		following.forEach((u) => {
			if (u && !seenIds.has(u.id)) {
				seenIds.add(u.id);
				list.push(u);
			}
		});

		return list;
	})();

	// Filter by search
	const filteredUsers = allUsers.filter((u) => {
		if (!search.trim()) return true;
		const q = search.toLowerCase();
		const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
		const username = (u.username || '').toLowerCase();
		return name.includes(q) || username.includes(q);
	});

	// Toggle select user
	const toggleUser = (userId) => {
		setSent(false);
		setSelectedUsers((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	// Send to selected users
	const handleSend = async () => {
		if (selectedUsers.length === 0 || sending) return;

		setSending(true);
		const url = `${window.location.origin}${window.location.pathname}?post=${postId}`;
		const content = postTitle
			? `${postTitle}\n${url}`
			: url;

		try {
			await Promise.all(
				selectedUsers.map((recipientId) =>
					apiService.messages.sendMessage({
						recipientId,
						content,
						mediaUrl: postMediaUrl || undefined,
						mediaType: postMediaUrl ? 'image' : undefined
					})
				)
			);
			setSent(true);
			setTimeout(() => {
				onClose();
			}, 1200);
		} catch (err) {
			console.error('Error sending share messages:', err);
		} finally {
			setSending(false);
		}
	};

	// Copy link
	const handleCopyLink = () => {
		const url = `${window.location.origin}${window.location.pathname}?post=${postId}`;
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		}).catch(() => {});
	};

	// Get display name
	const getName = (u) =>
		`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User';

	if (!isOpen) return null;

	return (
		<div className="share-modal-backdrop" ref={modalRef} onClick={(e) => { e.stopPropagation(); handleBackdropClick(e); }}>
			<div className={`share-modal ${isOpen ? 'open' : ''}`}>
				{/* Header */}
				<div className="share-modal-header">
					<h3>Share</h3>
					<button className="share-close-btn" onClick={onClose}>
						<IoClose />
					</button>
				</div>

				{/* Search */}
				<div className="share-search-wrapper">
					<IoSearchOutline className="share-search-icon" />
					<input
						ref={inputRef}
						type="text"
						placeholder="Search people..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="share-search-input"
					/>
				</div>

				{/* User List */}
				<div className="share-user-list">
					{loading ? (
						<div className="share-loading">
							<div className="share-loading-dot" />
							<div className="share-loading-dot" />
							<div className="share-loading-dot" />
						</div>
					) : !isLoggedIn ? (
						<div className="share-empty">Log in to share with friends</div>
					) : filteredUsers.length === 0 ? (
						<div className="share-empty">
							{search ? 'No people found' : 'Follow someone to share with them'}
						</div>
					) : (
						filteredUsers.map((user) => {
							const isSelected = selectedUsers.includes(user.id);
							return (
								<div
									key={user.id}
									className={`share-user-row ${isSelected ? 'selected' : ''}`}
									onClick={() => toggleUser(user.id)}
								>
									<div className="share-user-avatar">
										{user.avatar ? (
											<img src={user.avatar} alt={getName(user)} />
										) : (
											<div className="share-avatar-fallback">
												{getName(user).charAt(0).toUpperCase()}
											</div>
										)}
									</div>
									<div className="share-user-info">
										<span className="share-user-name">{getName(user)}</span>
										{user.username && (
											<span className="share-user-handle">@{user.username}</span>
										)}
									</div>
									<div className={`share-select-circle ${isSelected ? 'checked' : ''}`}>
										{isSelected && <IoCheckmarkCircle />}
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Bottom Actions */}
				<div className="share-bottom-bar">
					<button
						className={`share-copy-btn ${copied ? 'copied' : ''}`}
						onClick={handleCopyLink}
					>
						<HiOutlineLink />
						<span>{copied ? 'Copied!' : 'Copy link'}</span>
					</button>

					{selectedUsers.length > 0 && (
						<button
							className={`share-send-btn ${sent ? 'sent' : ''}`}
							onClick={handleSend}
							disabled={sending || sent}
						>
							{sent ? (
								<>
									<IoCheckmarkCircle />
									<span>Sent</span>
								</>
							) : (
								<>
									<FiSend />
									<span>{sending ? 'Sending...' : `Send`}</span>
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ShareModal;
