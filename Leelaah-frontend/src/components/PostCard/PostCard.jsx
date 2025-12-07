import React, { useState, memo, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaComment, FaRegComment, FaPlay } from 'react-icons/fa';
import apiService from '../../services/api';
import './PostCard.css';

const PostCard = memo(({ post, aspectRatio = 'square', size = 'medium', onShowAuthModal, onPostClick, onUserClick }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imageHeight, setImageHeight] = useState(null);
  const videoRef = useRef(null);
  const [isVideoInView, setIsVideoInView] = useState(false);

  // Calculate natural height based on aspect ratio for masonry layout
  const getMinHeight = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'min-h-[400px]'; // 9:16 ratio - taller
      case 'landscape':
        return 'min-h-[200px]'; // 16:9 ratio - shorter
      case 'square':
      default:
        return 'min-h-[300px]'; // 1:1 ratio - medium
    }
  };

  // Determine if post is a video
  const isVideo = post.mediaType?.startsWith('video/') ||
                  post.type === 'video' ||
                  post.category === 'video-post' ||
                  post.mediaUrl?.includes('.mp4') ||
                  post.mediaUrl?.includes('.webm') ||
                  post.mediaUrl?.includes('.mov');

  // Determine media URL - handle multiple field names from API
  const mediaUrl =
    post.imageUrl ||
    post.mediaUrl ||
    post.thumbnailUrl ||
    (post.mediaUrls && post.mediaUrls[0]) ||
    post.image ||
    '/assets/placeholder.png';

  // Get author name
  const authorName = post.author
    ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() ||
    post.author.username ||
    'Anonymous'
    : 'Anonymous';

  // Get author ID for navigation
  const authorId = post.author?.id || post.authorId;

  // Handle author click - navigate to user profile
  const handleAuthorClick = useCallback((e) => {
    e.stopPropagation();
    if (authorId && onUserClick) {
      onUserClick(authorId);
    }
  }, [authorId, onUserClick]);

  // Handle like/unlike with API call
  const toggleLike = useCallback(async (shouldLike) => {
    if (!isLoggedIn) {
      onShowAuthModal?.();
      return;
    }

    if (isLiking) return; // Prevent double clicks
    setIsLiking(true);

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(shouldLike);
    setLikeCount(prev => shouldLike ? prev + 1 : prev - 1);

    try {
      if (shouldLike) {
        const response = await apiService.posts.likePost(post.id);
        if (response.data.success) {
          setLikeCount(response.data.likesCount);
          setIsLiked(response.data.isLiked);
        }
      } else {
        const response = await apiService.posts.unlikePost(post.id);
        if (response.data.success) {
          setLikeCount(response.data.likesCount);
          setIsLiked(response.data.isLiked);
        }
      }
    } catch (error) {
      // Revert on error
      console.error('Like/unlike error:', error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  }, [isLoggedIn, isLiked, likeCount, isLiking, post.id, onShowAuthModal]);

  const handleLike = useCallback((e) => {
    e?.stopPropagation();
    toggleLike(!isLiked);
  }, [isLiked, toggleLike]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onShowAuthModal?.();
      return;
    }

    // Double tap only likes (doesn't toggle)
    if (!isLiked) {
      toggleLike(true);
    }

    // Always show heart animation on double tap
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  }, [isLoggedIn, isLiked, toggleLike, onShowAuthModal]);

  const handleCommentClick = useCallback((e) => {
    e?.stopPropagation();
    // Navigate to single post page
    onPostClick?.(post.id);
  }, [post.id, onPostClick]);

  const handleCardClick = useCallback(() => {
    onPostClick?.(post.id);
  }, [post.id, onPostClick]);

  // Intersection Observer for video autoplay
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVideoInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            // Play video when in view
            videoRef.current?.play()?.catch(err => {
              console.log('Autoplay prevented:', err);
            });
          } else {
            // Pause video when out of view
            videoRef.current?.pause();
          }
        });
      },
      {
        threshold: 0.5, // Video must be 50% visible
        rootMargin: '0px'
      }
    );

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [isVideo]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] group mb-2 md:mb-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      onClick={handleCardClick}
    >
      {/* Media Container with Natural Height */}
      <div className={`relative w-full ${getMinHeight()} bg-gray-900`}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
          </div>
        )}

        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              className={`w-full h-auto object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedData={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Video load error:', e);
                setImageLoaded(true);
              }}
            />
            {/* Video Play Indicator */}
            {!isVideoInView && imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                  <FaPlay className="text-white text-2xl" />
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={post.title || post.prompt || 'Post image'}
            className={`w-full h-auto object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={(e) => {
              setImageLoaded(true);
              // Let the image determine its natural height
              if (e.target.naturalHeight) {
                setImageHeight(e.target.naturalHeight);
              }
            }}
            onError={(e) => {
              e.target.src = '/assets/placeholder.png';
              setImageLoaded(true);
            }}
          />
        )}

        {/* Double Tap Heart Animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <FaHeart className="text-white text-6xl animate-[heartPop_0.6s_ease-in-out] drop-shadow-2xl" />
          </div>
        )}

        {/* Hover Overlay with Details */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>

          {/* Top Right: Category/Date */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            {isVideo && (
              <span className="px-3 py-1 text-xs font-medium bg-red-500/90 backdrop-blur-md rounded-full text-white border border-red-400/30 flex items-center gap-1">
                <FaPlay className="text-[10px]" />
                Video
              </span>
            )}
            {post.category && !isVideo && (
              <span className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30">
                {post.category}
              </span>
            )}
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3 z-10">
            {/* Author Info - Clickable */}
            <div
              className="flex items-center gap-2 group/author"
              onClick={handleAuthorClick}
              style={{ cursor: authorId ? 'pointer' : 'default' }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={authorName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-white font-medium text-sm truncate group-hover/author:underline">
                {authorName}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isLiked
                    ? 'bg-red-500/90 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                {isLiked ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
                <span className="text-xs font-medium">{likeCount}</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-200"
                onClick={handleCommentClick}
              >
                <FaRegComment className="text-sm" />
                <span className="text-xs font-medium">{post.commentsCount || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
