import React, { useState } from 'react';
import Icon from './Icon';

const PostCard = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            {/* User Header with AI Badge */}
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gradient-to-r from-purple-400 to-pink-400"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1">
                            <Icon name="zap" className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="cabin-semibold text-gray-900 dark:text-white">{post.user.username}</h3>
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full zalando-sans-expanded-bold">
                                AI
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{post.location} • {post.aiModel && `${post.aiModel} model`}</p>
                    </div>
                </div>
                <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Icon name="more-horizontal" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Post Image with AI Overlay */}
            <div className="relative group">
                <img
                    src={post.image}
                    alt="AI Generated content"
                    className="w-full h-96 object-cover"
                />

                {/* AI Generation Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                        <Icon name="cpu" className="w-4 h-4" />
                        <span className="text-sm cabin-semibold">{post.aiModel || 'AI Generated'}</span>
                    </div>
                    {post.prompt && (
                        <p className="text-xs text-gray-300 mt-1 cabin-regular">"{post.prompt}"</p>
                    )}
                </div>

                {/* Quality Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl px-3 py-1">
                    <span className="text-white text-sm zalando-sans-expanded-bold">4K</span>
                </div>
            </div>

            {/* Enhanced Post Actions */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="flex items-center space-x-2 hover:scale-110 transition-all group"
                        >
                            <Icon
                                name="heart"
                                className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-700 dark:text-gray-300 group-hover:text-red-500'}`}
                            />
                            <span className="cabin-semibold text-sm text-gray-700 dark:text-gray-300">
                                {isLiked ? post.likes + 1 : post.likes}
                            </span>
                        </button>
                        <button className="flex items-center space-x-2 hover:scale-110 transition-all group">
                            <Icon name="message-circle" className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                            <span className="cabin-semibold text-sm text-gray-700 dark:text-gray-300">{post.comments}</span>
                        </button>
                        <button className="hover:scale-110 transition-transform group">
                            <Icon name="share" className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-green-500 transition-colors" />
                        </button>
                        <button className="flex items-center space-x-2 hover:scale-110 transition-all group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
                            <Icon name="download" className="w-4 h-4" />
                            <span className="text-sm cabin-semibold">Download</span>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsSaved(!isSaved)}
                        className="hover:scale-110 transition-transform"
                    >
                        <Icon
                            name="bookmark"
                            className={`w-7 h-7 transition-colors ${isSaved ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500'}`}
                        />
                    </button>
                </div>

                {/* Neural Network Stats */}
                <div className="flex items-center space-x-4 mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs cabin-regular text-gray-600 dark:text-gray-300">Neural Score: {post.neuralScore || '9.8'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Icon name="clock" className="w-3 h-3 text-gray-500" />
                        <span className="text-xs cabin-regular text-gray-600 dark:text-gray-300">{post.generationTime || '3.2s'} gen time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Icon name="layers" className="w-3 h-3 text-gray-500" />
                        <span className="text-xs cabin-regular text-gray-600 dark:text-gray-300">{post.steps || '50'} steps</span>
                    </div>
                </div>

                {/* Caption with AI Context */}
                <div className="mb-3">
                    <span className="cabin-semibold text-gray-900 dark:text-white mr-2">{post.user.username}</span>
                    <span className="cabin-regular text-gray-700 dark:text-gray-300">{post.caption}</span>

                    {post.tags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs cabin-semibold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enhanced Comments Preview */}
                {post.comments > 0 && (
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 cabin-semibold mb-3 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View all {post.comments} neural responses
                    </button>
                )}

                {/* Time with Generation Details */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500 cabin-regular uppercase">
                        {post.timeAgo}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                        <Icon name="eye" className="w-3 h-3" />
                        <span>{post.views || '1.2k'} views</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;