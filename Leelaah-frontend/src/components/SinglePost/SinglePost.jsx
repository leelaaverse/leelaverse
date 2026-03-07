import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaRegComment, FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { PiShareFatDuotone } from 'react-icons/pi';
import { IoSparklesSharp } from 'react-icons/io5';
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

	// Handle share
	const handleShare = () => {
		setShowShareModal(true);
	};

	// Handle remix
	const handleRemix = () => {
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
					{user?.id === post.authorId && (
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
					<button onClick={handleRemix} className="pill-btn remix-btn" title="Remix">
						<IoSparklesSharp />
						<span>Remix</span>
					</button>
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
					{/* Author Info */}
					<div className="post-author-info">
						<div className="author-avatar">
							{post.author?.avatar ? (
								<img src={post.author.avatar} alt={getAuthorName(post.author)} />
							) : (
								<div className="avatar-placeholder">
									{getAuthorName(post.author).charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<div className="author-details">
							<span className="author-name">{getAuthorName(post.author)}</span>
							<span className="post-date">{formatDate(post.createdAt)}</span>
						</div>
					</div>

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
								<label>Caption</label>
								<textarea
									value={editCaption}
									onChange={(e) => setEditCaption(e.target.value)}
									placeholder="Post caption"
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
							{post.caption && (
								<div className="post-caption">
									<p>{post.caption}</p>
								</div>
							)}
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
													{user?.id === comment.authorId && (
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
