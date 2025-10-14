import React, { useState } from 'react';
import Icon from './Icon';

const FeedPost = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/20"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 cursor-pointer">
                                {post.user.name}
                            </h3>
                            {post.user.verified && (
                                <Icon name="badge-check" className="w-4 h-4 text-blue-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{post.timestamp}</span>
                            {post.aiGenerated && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                        <Icon name="sparkles" className="w-3 h-3" />
                                        AI Generated
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                    <Icon name="more-horizontal" className="w-5 h-5" />
                </button>
            </div>

            {/* Post Content */}
            {post.content && (
                <div className="px-4 pb-3">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                        {post.content}
                    </p>
                    {post.tags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Post Image/Video */}
            {post.image && (
                <div className="relative group cursor-pointer">
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full object-cover"
                    />
                    {post.aiModel && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                            <Icon name="cpu" className="w-3 h-3" />
                            {post.aiModel}
                        </div>
                    )}
                </div>
            )}

            {/* Post Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`flex items-center gap-2 transition-all ${
                                isLiked
                                    ? 'text-red-500'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                            }`}
                        >
                            <Icon name={isLiked ? 'heart' : 'heart'} className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="font-semibold">{post.likes + (isLiked ? 1 : 0)}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <Icon name="message-circle" className="w-5 h-5" />
                            <span className="font-semibold">{post.comments}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                            <Icon name="share-2" className="w-5 h-5" />
                            <span className="font-semibold">{post.shares}</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSaved(!isSaved)}
                        className={`transition-all ${
                            isSaved
                                ? 'text-yellow-500'
                                : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500'
                        }`}
                    >
                        <Icon name={isSaved ? 'bookmark' : 'bookmark'} className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Comment Section */}
                {showComments && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex gap-2">
                            <img
                                src={post.user.avatar}
                                alt="Your avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-full text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <button className="text-purple-600 dark:text-purple-400 font-semibold text-sm hover:text-purple-700 px-3">
                                Post
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedPost;
