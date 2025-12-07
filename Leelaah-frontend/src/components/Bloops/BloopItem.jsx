import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const BloopItem = ({ post, isActive, onToggleMute, isMuted, onViewPost }) => {
    const videoRef = useRef(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isActive) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(error => {
                console.log("Autoplay prevented:", error);
            });
        } else {
            videoRef.current.pause();
        }
    }, [isActive]);

    useEffect(() => {
        if (post.likes) {
            setIsLiked(post.likes.some(like => like.userId === user?.id));
        }
    }, [post.likes, user]);

    useEffect(() => {
        // Check if user is following the post author
        const checkFollowStatus = async () => {
            if (user && post.author?.id && user.id !== post.author.id) {
                try {
                    const response = await apiService.users.getFollowStatus(post.author.id);
                    setIsFollowing(response.data.isFollowing);
                } catch (error) {
                    console.error('Failed to check follow status:', error);
                }
            }
        };
        checkFollowStatus();
    }, [user, post.author?.id]);

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to follow users');
            return;
        }

        // Optimistic UI update - update immediately
        const wasFollowing = isFollowing;
        setIsFollowing(!isFollowing);

        // Call API in background
        try {
            if (wasFollowing) {
                await apiService.users.unfollowUser(post.author.id);
                toast.success(`Unfollowed @${post.author.username}`);
            } else {
                await apiService.users.followUser(post.author.id);
                toast.success(`Following @${post.author.username}`);
            }
        } catch (error) {
            // Revert on error
            setIsFollowing(wasFollowing);
            console.error('Follow error:', error);
            toast.error('Failed to update follow status');
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to like posts');
            return;
        }

        // Optimistic UI update - update immediately
        const wasLiked = isLiked;
        const previousCount = likesCount;

        if (isLiked) {
            setLikesCount(prev => Math.max(0, prev - 1));
            setIsLiked(false);
        } else {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
        }

        // Call API in background
        try {
            if (wasLiked) {
                await apiService.posts.unlikePost(post.id);
            } else {
                await apiService.posts.likePost(post.id);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(wasLiked);
            setLikesCount(previousCount);
            console.error('Like error:', error);
            toast.error('Failed to update like');
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        toast.success('Link copied to clipboard!');
    };

    const handleCommentClick = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to view comments');
            return;
        }
        setShowComments(!showComments);
        if (!showComments && comments.length === 0) {
            await fetchComments();
        }
    };

    const fetchComments = async () => {
        try {
            const response = await apiService.posts.getComments(post.id, { limit: 5 });
            setComments(response.data.data.comments || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);

        // Optimistic UI update
        const tempComment = {
            id: 'temp-' + Date.now(),
            text: commentText,
            author: {
                username: user.username,
                avatar: user.avatar
            },
            createdAt: new Date().toISOString()
        };

        setComments(prev => [tempComment, ...prev]);
        setCommentsCount(prev => prev + 1);
        const textToSubmit = commentText;
        setCommentText('');

        try {
            const response = await apiService.posts.addComment(post.id, textToSubmit);
            // Replace temp comment with real one
            setComments(prev => prev.map(c => c.id === tempComment.id ? response.data.comment : c));
            toast.success('Comment added!');
        } catch (error) {
            // Revert on error
            setComments(prev => prev.filter(c => c.id !== tempComment.id));
            setCommentsCount(prev => Math.max(0, prev - 1));
            setCommentText(textToSubmit);
            console.error('Failed to add comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative w-full h-full bg-black snap-start flex items-center justify-center overflow-hidden">
            {/* Video Player - Contained with aspect ratio */}
            <video
                ref={videoRef}
                src={post.mediaUrl}
                className="max-w-full max-h-full object-contain"
                loop
                playsInline
                muted={isMuted}
                onClick={onToggleMute}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to profile
                        }}
                        className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-2"
                    >
                        <img
                            src={post.author?.avatar || '/assets/profile.png'}
                            alt={post.author?.username}
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleLike}
                        className={`p-2 rounded-full transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-white'}`}
                    >
                        <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart text-3xl drop-shadow-lg`}></i>
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleCommentClick}
                        className="p-2 rounded-full text-white transition-transform active:scale-90"
                    >
                        <i className="fa-regular fa-comment-dots text-3xl drop-shadow-lg"></i>
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">{commentsCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-full text-white transition-transform active:scale-90"
                    >
                        <i className="fa-solid fa-share text-3xl drop-shadow-lg"></i>
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewPost && onViewPost(post.id);
                        }}
                        className="p-2 rounded-full text-white transition-transform active:scale-90"
                    >
                        <i className="fa-solid fa-expand text-2xl drop-shadow-lg"></i>
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">View</span>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-4 bottom-8 right-16 z-10 text-white text-left">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg drop-shadow-md">@{post.author?.username}</h3>
                    {user?.id !== post.author?.id && (
                        <button
                            onClick={handleFollow}
                            className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold border transition-colors ${
                                isFollowing
                                    ? 'bg-white/10 border-white/50 hover:bg-white/20'
                                    : 'bg-purple-600 border-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <p className="text-sm mb-2 line-clamp-2 drop-shadow-md">{post.caption || post.title}</p>

                {/* Music/Audio Info (Mock) */}
                <div className="flex items-center gap-2 opacity-90">
                    <i className="fa-solid fa-music text-xs animate-spin-slow"></i>
                    <div className="text-xs overflow-hidden w-32">
                        <div className="whitespace-nowrap animate-marquee">
                            Original Audio - {post.author?.username}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mute Indicator */}
            {isMuted && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 p-4 rounded-full backdrop-blur-sm pointer-events-none animate-fade-in-out">
                    <i className="fa-solid fa-volume-xmark text-white text-4xl"></i>
                </div>
            )}

            {/* Comments Panel */}
            {showComments && (
                <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-md z-20 max-h-[60%] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <h3 className="text-white font-semibold text-lg">Comments</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowComments(false);
                            }}
                            className="text-white/70 hover:text-white"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {comments.length === 0 ? (
                            <p className="text-white/50 text-center py-8">No comments yet. Be the first!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-2">
                                    <img
                                        src={comment.author?.avatar || '/assets/profile.png'}
                                        alt={comment.author?.username}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-semibold text-sm">{comment.author?.username}</span>
                                            <span className="text-white/40 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-white text-sm mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleSubmitComment} className="p-4 border-t border-white/10 bg-black/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/10 text-white placeholder-white/40 px-4 py-2 rounded-full outline-none focus:bg-white/20 transition-colors"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmitting}
                                className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BloopItem;
