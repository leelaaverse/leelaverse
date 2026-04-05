import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaRegComment, FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { PiShareFatDuotone } from 'react-icons/pi';
import { RiMagicLine, RiFileCopyLine, RiCameraLensLine } from 'react-icons/ri';
import apiService from '../../services/api';
import ShareModal from '../ShareModal/ShareModal';
import toast from 'react-hot-toast';
import './SinglePost.css';

const SinglePost = ({ postId, onBack, onShowAuthModal, onNavigate }) => {
	const { isLoggedIn, user } = useSelector((state) => state.auth);
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editCaption, setEditCaption] = useState('');
	const [editTitle, setEditTitle] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const { theme } = useSelector((s) => s.theme || { theme: 'Dark' });

	// Like state
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [isLiking, setIsLiking] = useState(false);

	// Comments state
	const [comments, setComments] = useState([]);
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [commentsCount, setCommentsCount] = useState(0);
	const [newComment, setNewComment] = useState('');
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [commentsPagination, setCommentsPagination] = useState({ page: 1, pages: 1 });
	const [showShareModal, setShowShareModal] = useState(false);
	const isLightTheme = theme === 'Light' || (
		theme === 'Auto' &&
		typeof window !== 'undefined' &&
		window.matchMedia &&
		!window.matchMedia('(prefers-color-scheme: dark)').matches
	);

	// Fetch post details
	useEffect(() => {
		const fetchPost = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiService.posts.getPost(postId);
				if (response.data.success) {
					setPost(response.data.post);
					setLikeCount(response.data.post.likesCount || 0);
					setCommentsCount(response.data.post.commentsCount || 0);
				}
			} catch (err) {
				console.error('Error fetching post:', err);
				setError('Failed to load post');
			} finally {
				setLoading(false);
			}
		};

		if (postId) {
			fetchPost();
		}
	}, [postId]);

	// Check like status for logged-in user
	useEffect(() => {
		const checkLikeStatus = async () => {
			if (!postId) return;

			try {
				const response = await apiService.posts.checkLikeStatus(postId);
				if (response.data.success) {
					setIsLiked(response.data.isLiked);
					setLikeCount(response.data.likesCount);
				}
			} catch (err) {
				console.error('Error checking like status:', err);
			}
		};

		checkLikeStatus();
	}, [postId, isLoggedIn]);

	// Fetch comments
	const fetchComments = useCallback(async (page = 1) => {
		try {
			setCommentsLoading(true);
			const response = await apiService.posts.getComments(postId, { page, limit: 20 });

			if (response.data.success) {
				if (page === 1) {
					setComments(response.data.comments);
				} else {
					setComments(prev => [...prev, ...response.data.comments]);
				}
				setCommentsCount(response.data.commentsCount);
				setCommentsPagination(response.data.pagination);
			}
		} catch (err) {
			console.error('Error fetching comments:', err);
		} finally {
			setCommentsLoading(false);
		}
	}, [postId]);

	useEffect(() => {
		if (postId) {
			fetchComments(1);
		}
	}, [postId, fetchComments]);

	// Handle like/unlike
	const handleLike = async () => {
		if (!isLoggedIn) {
			onShowAuthModal?.();
			return;
		}

		if (isLiking) return;
		setIsLiking(true);

		const previousLiked = isLiked;
		const previousCount = likeCount;

		setIsLiked(!isLiked);
		setLikeCount(prev => !isLiked ? prev + 1 : prev - 1);

		try {
			if (!isLiked) {
				const response = await apiService.posts.likePost(postId);
				if (response.data.success) {
					setLikeCount(response.data.likesCount);
					setIsLiked(response.data.isLiked);
				}
			} else {
				const response = await apiService.posts.unlikePost(postId);
				if (response.data.success) {
					setLikeCount(response.data.likesCount);
					setIsLiked(response.data.isLiked);
				}
			}
		} catch (error) {
			console.error('Like/unlike error:', error);
			setIsLiked(previousLiked);
			setLikeCount(previousCount);
		} finally {
			setIsLiking(false);
		}
	};

	// Handle add comment
	const handleAddComment = async (e) => {
		e.preventDefault();

		if (!isLoggedIn) {
			onShowAuthModal?.();
			return;
		}

		if (!newComment.trim() || isSubmittingComment) return;

		setIsSubmittingComment(true);

		try {
			const response = await apiService.posts.addComment(postId, newComment.trim());

			if (response.data.success) {
				setComments(prev => [response.data.comment, ...prev]);
				setCommentsCount(response.data.commentsCount);
				setNewComment('');
			}
		} catch (error) {
			console.error('Add comment error:', error);
		} finally {
			setIsSubmittingComment(false);
		}
	};

	// Handle delete comment
	const handleDeleteComment = async (commentId) => {
		if (!window.confirm('Are you sure you want to delete this comment?')) return;

		try {
			const response = await apiService.posts.deleteComment(postId, commentId);

			if (response.data.success) {
				setComments(prev => prev.filter(c => c.id !== commentId));
				setCommentsCount(response.data.commentsCount);
			}
		} catch (error) {
			console.error('Delete comment error:', error);
		}
	};

	// Handle edit post
	const handleStartEdit = () => {
		setEditCaption(post.caption || '');
		setEditTitle(post.title || '');
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditCaption('');
		setEditTitle('');
	};

	const handleSaveEdit = async () => {
		if (isSaving) return;

		try {
			setIsSaving(true);
			const response = await apiService.posts.updatePost(postId, {
				caption: editCaption,
				title: editTitle
			});

			if (response.data.success) {
				setPost(response.data.post);
				setIsEditing(false);
				toast.success('Post updated successfully');
			}
		} catch (error) {
			console.error('Update post error:', error);
			toast.error(error.response?.data?.message || 'Failed to update post');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeletePost = async () => {
		if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

		try {
			const response = await apiService.posts.deletePost(postId);
			if (response.data.success) {
				toast.success('Post deleted successfully');
				setTimeout(() => onBack(), 1000);
			}
		} catch (error) {
			console.error('Delete post error:', error);
			toast.error(error.response?.data?.message || 'Failed to delete post');
		}
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	// Get author name
	const getAuthorName = (author) => {
		if (!author) return 'Anonymous';
		return `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
			author.username || 'Anonymous';
	};

	// Determine if post is a video
	const isVideo = post?.mediaType?.startsWith('video/') ||
	                post?.type === 'video' ||
	                post?.category === 'video-post' ||
	                post?.mediaUrl?.includes('.mp4') ||
	                post?.mediaUrl?.includes('.webm') ||
	                post?.mediaUrl?.includes('.mov');

	// Get media URL
	const getMediaUrl = (post) => {
		return post.mediaUrl ||
			post.thumbnailUrl ||
			(post.mediaUrls && post.mediaUrls[0]) ||
			'/assets/placeholder.png';
	};

	const currentUserId = user?.id ? String(user.id) : null;
	const postAuthorId = post?.author?.id || post?.authorId
		? String(post.author?.id || post.authorId)
		: null;

	// Handle share
	const handleShare = () => {
		setShowShareModal(true);
	};

	// Handle recreate
	const handleRecreate = () => {
		if (!isLoggedIn) {
			onShowAuthModal?.();
			return;
		}
		toast.success('Remix started! Create your version.');
	};

	// Prevent right-click download on media
	const preventContextMenu = (e) => e.preventDefault();

	if (loading) {
		return (
			<div className="single-post-container">
				<div className="single-post-loading">
					<div className="loading-spinner"></div>
					<p>Loading post...</p>
				</div>
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="single-post-container">
				<div className="single-post-error">
					<p>{error || 'Post not found'}</p>
					<button onClick={onBack} className="back-btn">
						<FaArrowLeft /> Go Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="single-post-container">
			{/* Header */}
			<div className="single-post-header">
				<button onClick={onBack} className="back-btn">
					<FaArrowLeft />
				</button>

				<div className="header-actions">
					{currentUserId && postAuthorId && currentUserId === postAuthorId && (
						<>
							{!isEditing ? (
								<>
									<button onClick={handleStartEdit} className="icon-btn edit-btn" title="Edit">
										<HiOutlinePencilSquare />
									</button>
									<button onClick={handleDeletePost} className="icon-btn delete-btn" title="Delete">
										<FaTrash />
									</button>
								</>
							) : (
								<>
									<button onClick={handleCancelEdit} className="pill-btn cancel-btn">
										Cancel
									</button>
									<button onClick={handleSaveEdit} className="pill-btn save-btn" disabled={isSaving}>
										{isSaving ? 'Saving...' : 'Save'}
									</button>
								</>
							)}
						</>
					)}
				</div>
			</div>

			<div className="single-post-content">
				{/* Media Section */}
				<div className="post-media-section">
					<div className="media-wrapper">
						{isVideo ? (
							<video
								src={getMediaUrl(post)}
								autoPlay
								loop
								muted
								playsInline
								className="post-media"
								controlsList="nodownload nofullscreen noremoteplayback"
								disablePictureInPicture
								onContextMenu={preventContextMenu}
								onClick={() => onNavigate && onNavigate('bloops')}
								style={{ cursor: 'pointer' }}
							/>
						) : (
							<img
								src={getMediaUrl(post)}
								alt={post.title || post.caption || 'Post'}
								className="post-media"
								draggable="false"
								onContextMenu={preventContextMenu}
							/>
						)}
					</div>

					{/* Floating action bar on media */}
					<div className="media-floating-actions">
						<button
							className={`floating-action-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
							onClick={handleLike}
							disabled={isLiking}
						>
							{isLiked ? <FaHeart /> : <FaRegHeart />}
							<span>{likeCount}</span>
						</button>
						<button className="floating-action-btn" onClick={() => document.querySelector('.comment-input')?.focus()}>
							<FaRegComment />
							<span>{commentsCount}</span>
						</button>
						<button className="floating-action-btn" onClick={handleShare}>
							<PiShareFatDuotone />
						</button>
					</div>
				</div>

				{/* Details Section */}
				<div className="post-details-section">
					<div className="details-content-wrapper">
						{/* Author Info */}
						<div className="post-author-info">
							<div className="author-avatar">
								{post.author?.avatar ? (
									<img src={post.author.avatar} alt={getAuthorName(post.author)} />
								) : (
									<div className="avatar-placeholder" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#5a5aff', color: '#fff', fontWeight: 'bold'}}>
										{getAuthorName(post.author).charAt(0).toUpperCase()}
									</div>
								)}
							</div>
							<div className="author-details">
								<span className="author-name">{getAuthorName(post.author)}</span>
								<span className="post-date">{formatDate(post.createdAt)}</span>
							</div>
							{(!currentUserId || !postAuthorId || currentUserId !== postAuthorId) && (
								<button className="author-follow-btn">Follow</button>
							)}
						</div>

						<div className="divider" />

					{/* Title & Caption */}
					{isEditing ? (
						<div className="post-edit-form">
							<div className="edit-field">
								<label>Title</label>
								<input
									type="text"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									placeholder="Post title"
									className="edit-input"
								/>
							</div>
							<div className="edit-field">
								<label>Caption (Prompt)</label>
								<textarea
									value={editCaption}
									onChange={(e) => setEditCaption(e.target.value)}
									placeholder="Post caption or Prompt"
									rows={4}
									className="edit-textarea"
								/>
							</div>
						</div>
					) : (
						<>
							{post.title && (
								<div className="post-title">
									<h3>{post.title}</h3>
								</div>
							)}
							{/* Prompt Box */}
							{(post.prompt || post.caption) && (
								<div style={{ marginBottom: 20 }}>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#888898', letterSpacing: '0.05em' }}>
											<RiMagicLine size={14} color="#888898" /> PROMPT
										</div>
										<button
											onClick={() => {
												navigator.clipboard.writeText(post.prompt || post.caption).catch(() => {});
												toast.success('Prompt copied to clipboard');
											}}
											style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#e0e0f8', background: '#1e1e32', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
										>
											<RiFileCopyLine size={12} /> Copy
										</button>
									</div>
									<div style={{ padding: '12px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7, color: '#c0c0d8' }}>
										{(post.prompt || post.caption || '').split(/(\[[^\]]+\])/g).map((part, i) =>
											part.startsWith('[') ? <span key={i} style={{ color: '#5a5aff', fontWeight: 700 }}>{part}</span> : part
										)}
									</div>
								</div>
							)}

							{/* Information Table */}
							<div style={{ marginBottom: 20 }}>
								<div style={{ fontSize: 12, fontWeight: 700, color: '#888898', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
									 <RiCameraLensLine size={14} /> INFORMATION
								</div>
								<div style={{ background: '#0e0e1a', borderRadius: 12, padding: '12px 16px', border: '1px solid #1a1a2e' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
										<span style={{ color: '#888898', fontSize: 13 }}>Model</span>
										<span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{post.aiModel || 'Leelaah AI V1'}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
										<span style={{ color: '#888898', fontSize: 13 }}>Style</span>
										<span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{post.style || 'Cinematic'}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
										<span style={{ color: '#888898', fontSize: 13 }}>Type</span>
										<span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{isVideo ? 'Video' : 'Image'}</span>
									</div>
								</div>
							</div>
						</>
					)}

					{/* Comments Section */}
					<div className="comments-section">
						<h3>Comments</h3>

						{/* Add Comment Form */}
						{isLoggedIn ? (
							<form className="add-comment-form" onSubmit={handleAddComment}>
								<div className="comment-input-wrapper">
									<input
										type="text"
										className="comment-input"
										placeholder="Write a comment..."
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										disabled={isSubmittingComment}
									/>
									<button
										type="submit"
										disabled={!newComment.trim() || isSubmittingComment}
										className="submit-comment-btn"
									>
										<FaPaperPlane />
									</button>
								</div>
							</form>
						) : (
							<div className="login-prompt">
								<button onClick={() => onShowAuthModal?.()}>
									Login to comment
								</button>
							</div>
						)}

						{/* Comments List */}
						<div className="comments-list">
							{commentsLoading && comments.length === 0 ? (
								<div className="comments-loading">Loading comments...</div>
							) : comments.length === 0 ? (
								<div className="no-comments">
									<p>No comments yet. Be the first to comment!</p>
								</div>
							) : (
								<>
									{comments.map((comment) => (
										<div key={comment.id} className="comment-item">
											<div className="comment-avatar">
												{comment.author?.avatar ? (
													<img src={comment.author.avatar} alt={getAuthorName(comment.author)} />
												) : (
													<div className="avatar-placeholder">
														{getAuthorName(comment.author).charAt(0).toUpperCase()}
													</div>
												)}
											</div>
											<div className="comment-content">
												<div className="comment-header">
													<span className="comment-author">{getAuthorName(comment.author)}</span>
													<span className="comment-date">{formatDate(comment.createdAt)}</span>
													{currentUserId && String(comment.authorId) === currentUserId && (
														<button
															className="delete-comment-btn"
															onClick={() => handleDeleteComment(comment.id)}
														>
															<FaTrash />
														</button>
													)}
												</div>
												<p className="comment-text">{comment.text}</p>
											</div>
										</div>
									))}

									{/* Load More */}
									{commentsPagination.page < commentsPagination.pages && (
										<button
											className="load-more-comments"
											onClick={() => fetchComments(commentsPagination.page + 1)}
											disabled={commentsLoading}
										>
											{commentsLoading ? 'Loading...' : 'Load more comments'}
										</button>
									)}
								</>
							)}
						</div>
					</div>
					</div>
					
					{/* Fixed Recreate Button at Bottom Container mimicking Sidebar */}
					<div className="recreate-pattern-footer">
						<button
							onClick={handleRecreate}
							className={`recreate-pattern-btn ${isLightTheme ? 'light' : 'dark'}`}
						>
							<RiMagicLine size={18} />
							Recreate Pattern
						</button>
					</div>
				</div>
			</div>

			<ShareModal
				isOpen={showShareModal}
				onClose={() => setShowShareModal(false)}
				postId={postId}
				postTitle={post?.title}
				postMediaUrl={post ? getMediaUrl(post) : undefined}
			/>
		</div>
	);
};

export default SinglePost;
