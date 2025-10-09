import React from 'react';
import Icon from './Icon';

const FeedShort = ({ short }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4 p-4">
                {/* Short Thumbnail */}
                <div className="relative w-36 aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
                    <img
                        src={short.thumbnail}
                        alt={short.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="play" className="w-6 h-6 text-white ml-1" />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
                        0:15
                    </div>

                    {/* Views Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                        <Icon name="eye" className="w-3 h-3" />
                        {short.views}
                    </div>
                </div>

                {/* Short Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors cursor-pointer">
                        {short.title}
                    </h3>

                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <img
                            src={short.user.avatar}
                            alt={short.user.name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/20"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">
                            {short.user.name}
                        </span>
                        {short.user.verified && (
                            <Icon name="badge-check" className="w-4 h-4 text-blue-500" />
                        )}
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Icon name="heart" className="w-4 h-4 text-red-500" />
                            <span className="font-semibold">{(short.likes / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Icon name="message-circle" className="w-4 h-4" />
                            <span className="font-semibold">{short.comments || Math.floor(short.likes / 100)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Icon name="share-2" className="w-4 h-4" />
                            <span className="font-semibold">{short.shares || Math.floor(short.likes / 200)}</span>
                        </div>
                    </div>

                    {/* AI Badge */}
                    {short.aiGenerated && (
                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-xs font-medium">
                            <Icon name="sparkles" className="w-3 h-3" />
                            AI Generated
                        </div>
                    )}
                </div>

                {/* Action Menu */}
                <button className="self-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                    <Icon name="more-vertical" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default FeedShort;
