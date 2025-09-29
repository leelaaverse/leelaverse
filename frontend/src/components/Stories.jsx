import React from 'react';
import Icon from './Icon';

const StoryCircle = ({ story, isOwn = false }) => {
    return (
        <div className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer">
            <div className={`relative p-1 rounded-full transition-all duration-300 group-hover:scale-105 ${story.viewed
                ? 'bg-gradient-to-tr from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'
                : isOwn
                    ? 'bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500'
                    : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse'
                }`}>
                <div className="bg-white dark:bg-gray-800 rounded-full p-1">
                    <img
                        src={story.avatar}
                        alt={story.username}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                </div>
                {isOwn ? (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1.5 shadow-lg">
                        <Icon name="zap" className="w-3 h-3 text-white" />
                    </div>
                ) : (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-1">
                        <Icon name="cpu" className="w-2 h-2 text-white" />
                    </div>
                )}
            </div>
            <div className="text-center">
                <span className="text-xs cabin-semibold text-gray-700 dark:text-gray-300 block max-w-[80px] truncate">
                    {isOwn ? 'Your AI' : story.username}
                </span>
                {!isOwn && (
                    <span className="text-[10px] cabin-regular text-gray-500 dark:text-gray-400 block">
                        {story.aiActivity || 'Creating...'}
                    </span>
                )}
            </div>
        </div>
    );
};

const Stories = ({ stories, currentUser }) => {
    return (
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg zalando-sans-expanded-primary text-gray-900 dark:text-white">AI Creators Live</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs cabin-regular text-gray-600 dark:text-gray-400">Live Now</span>
                </div>
            </div>

            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2">
                {/* Add Your AI Story */}
                <StoryCircle
                    story={{
                        avatar: currentUser.avatar,
                        username: currentUser.username
                    }}
                    isOwn={true}
                />

                {/* AI Creator Stories */}
                {stories.map((story) => (
                    <StoryCircle key={story.id} story={story} />
                ))}

                {/* Discover More */}
                <div className="flex flex-col items-center space-y-2 flex-shrink-0 group cursor-pointer">
                    <div className="p-1 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 group-hover:scale-105 transition-all duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-full p-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                                <Icon name="search" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>
                    <span className="text-xs cabin-semibold text-gray-600 dark:text-gray-400 text-center max-w-[80px]">
                        Discover
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Stories;