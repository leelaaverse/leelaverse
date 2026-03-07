import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaRegComment, FaMusic } from 'react-icons/fa';
import { PiShareFatDuotone } from 'react-icons/pi';
import { HiOutlineArrowsExpand } from 'react-icons/hi';
import { IoVolumeOff, IoClose } from 'react-icons/io5';

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
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/50 pointer-events-none"></div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to profile
                    }}
                    className="w-11 h-11 rounded-full border-2 border-white/80 overflow-hidden shadow-lg mb-1"
                >
                    <img
                        src={post.author?.avatar || '/assets/profile.png'}
                        alt={post.author?.username}
                        className="w-full h-full object-cover"
                    />
                </button>

                <div className="flex flex-col items-center gap-0.5">
                    <button
                        onClick={handleLike}
                        className={`p-2 transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-white'}`}
                    >
                        {isLiked
                            ? <FaHeart size={26} className="drop-shadow-lg" />
                            : <FaRegHeart size={26} className="drop-shadow-lg" />
                        }
                    </button>
                    <span className="text-white/90 text-[11px] font-medium drop-shadow-md">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <button
                        onClick={handleCommentClick}
                        className="p-2 text-white transition-transform active:scale-90"
                    >
                        <FaRegComment size={24} className="drop-shadow-lg" />
                    </button>
                    <span className="text-white/90 text-[11px] font-medium drop-shadow-md">{commentsCount}</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <button
                        onClick={handleShare}
                        className="p-2 text-white transition-transform active:scale-90"
                    >
                        <PiShareFatDuotone size={26} className="drop-shadow-lg" />
                    </button>
                    <span className="text-white/90 text-[11px] font-medium drop-shadow-md">Share</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewPost && onViewPost(post.id);
                        }}
                        className="p-2 text-white transition-transform active:scale-90"
                    >
                        <HiOutlineArrowsExpand size={24} className="drop-shadow-lg" />
                    </button>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-4 bottom-6 right-20 z-10 text-white text-left">
                <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-[15px] drop-shadow-md">@{post.author?.username}</h3>
                    {user?.id !== post.author?.id && (
                        <button
                            onClick={handleFollow}
                            className={`px-3 py-0.5 backdrop-blur-md rounded-full text-[11px] font-semibold border transition-all ${
                                isFollowing
                                    ? 'bg-white/10 border-white/30 hover:bg-white/20'
                                    : 'bg-white/20 border-white/40 hover:bg-white/30'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <p className="text-[13px] mb-1.5 line-clamp-2 drop-shadow-md text-white/90">{post.caption || post.title}</p>

                {/* Music/Audio Info */}
                <div className="flex items-center gap-2 opacity-70">
                    <FaMusic size={10} className="animate-spin-slow" />
                    <div className="text-[11px] overflow-hidden w-32">
                        <div className="whitespace-nowrap animate-marquee">
                            Original Audio - {post.author?.username}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mute Indicator */}
            {isMuted && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/30 p-4 rounded-full backdrop-blur-sm pointer-events-none animate-fade-in-out">
                    <IoVolumeOff size={36} className="text-white" />
                </div>
            )}

            {/* Comments Panel */}
            {showComments && (
                <div
                    className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/95 via-black/90 to-black/50 backdrop-blur-xl z-20 max-h-[60%] overflow-hidden flex flex-col rounded-t-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center px-5 py-3 border-b border-white/8">
                        <h3 className="text-white font-semibold text-base">Comments</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowComments(false);
                            }}
                            className="text-white/60 hover:text-white p-1 transition-colors"
                        >
                            <IoClose size={22} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                        {comments.length === 0 ? (
                            <p className="text-white/40 text-center py-8 text-sm">No comments yet. Be the first!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-2.5">
                                    <img
                                        src={comment.author?.avatar || '/assets/profile.png'}
                                        alt={comment.author?.username}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/90 font-semibold text-[13px]">{comment.author?.username}</span>
                                            <span className="text-white/30 text-[11px]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-white/80 text-[13px] mt-0.5">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleSubmitComment} className="px-4 py-3 border-t border-white/8">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/8 text-white placeholder-white/30 px-4 py-2 rounded-full text-sm outline-none focus:bg-white/12 transition-colors"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmitting}
                                className="px-5 py-2 bg-white/15 text-white rounded-full text-sm font-medium hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? '...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BloopItem;
