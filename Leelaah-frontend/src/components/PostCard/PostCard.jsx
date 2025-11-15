import React, { useState, memo } from 'react';
import './PostCard.css';

const PostCard = memo(({ post, size = 'medium' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine image URL - handle multiple field names from API
  const imageUrl =
    post.imageUrl ||
    post.mediaUrl ||
    post.thumbnailUrl ||
    (post.mediaUrls && post.mediaUrls[0]) ||
    post.image ||
    '/assets/placeholder.png';

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Get author name
  const authorName = post.author
    ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() ||
      post.author.username ||
      'Anonymous'
    : 'Anonymous';

  return (
    <div
      className={`post-card ${size}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Lazy Loading */}
      <div className="post-image-container">
        {!imageLoaded && (
          <div className="post-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={post.title || post.prompt || 'Post image'}
          className={`post-image ${imageLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/assets/placeholder.png';
            setImageLoaded(true);
          }}
        />

        {/* Hover Overlay with Details */}
        {isHovered && (
          <div className="post-overlay">
            <div className="post-details">
              {/* Author Info */}
              <div className="post-author">
                <div className="author-avatar">
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt={authorName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="author-info">
                  <div className="author-name">
                    {authorName}
                    {post.author?.verificationStatus === 'verified' && (
                      <span className="verified-badge" title="Verified">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="post-date">{formatDate(post.createdAt)}</div>
                </div>
              </div>

              {/* Post Title/Prompt */}
              {(post.title || post.prompt) && (
                <div className="post-title">
                  {post.title || post.prompt?.substring(0, 80) + '...'}
                </div>
              )}

              {/* Post Stats */}
              <div className="post-stats">
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-value">
                    {post.viewsCount || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-value">
                    {post.likesCount || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span className="stat-value">
                    {post.commentsCount || 0}
                  </span>
                </div>
              </div>

              {/* Category Badge */}
              {post.category && (
                <div className="post-category-badge">{post.category}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
