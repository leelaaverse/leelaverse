import React, { useState } from 'react';
import Icon from '../Icon';
import ProfileSettings from './ProfileSettings';

const Profile = ({ currentUser, isOwnProfile = true, viewingUsername = null }) => {
    const [activeContentTab, setActiveContentTab] = useState('posts');
    const [showSettings, setShowSettings] = useState(false);
    const [profileData, setProfileData] = useState(currentUser);

    // Mock data for content tabs
    const mockPosts = [
        {
            id: 1,
            type: 'image',
            mediaUrl: 'https://picsum.photos/seed/1/400/400',
            likes: 234,
            comments: 12,
            aiGenerated: true,
            aiModel: 'FLUX Schnell'
        },
        {
            id: 2,
            type: 'image',
            mediaUrl: 'https://picsum.photos/seed/2/400/600',
            likes: 456,
            comments: 28,
            aiGenerated: true,
            aiModel: 'Stable Diffusion'
        },
        {
            id: 3,
            type: 'image',
            mediaUrl: 'https://picsum.photos/seed/3/400/400',
            likes: 189,
            comments: 15,
            aiGenerated: false
        },
    ];

    const mockThoughts = [
        {
            id: 1,
            text: "Just discovered an amazing AI model that creates photorealistic portraits! 🎨✨",
            timestamp: "2h ago",
            likes: 45,
            comments: 8
        },
        {
            id: 2,
            text: "Working on a new series of AI-generated landscapes. The results are mind-blowing! 🌄",
            timestamp: "5h ago",
            likes: 92,
            comments: 15
        },
        {
            id: 3,
            text: "Does anyone have tips for improving prompt engineering? Looking to level up my AI art game! 🚀",
            timestamp: "1d ago",
            likes: 67,
            comments: 23
        },
    ];

    const mockShorts = [
        {
            id: 1,
            thumbnail: 'https://picsum.photos/seed/v1/400/700',
            views: '12.5K',
            duration: '0:15'
        },
        {
            id: 2,
            thumbnail: 'https://picsum.photos/seed/v2/400/700',
            views: '8.2K',
            duration: '0:30'
        },
        {
            id: 3,
            thumbnail: 'https://picsum.photos/seed/v3/400/700',
            views: '15.8K',
            duration: '0:20'
        },
    ];

    const handleSaveSettings = (updatedData) => {
        setProfileData({ ...profileData, ...updatedData });
        setShowSettings(false);
        // TODO: Add API call to save profile data
    };

    const displayUser = isOwnProfile ? profileData : {
        ...currentUser,
        username: viewingUsername || currentUser.username
    };

    // Get the gradient class for profile wall theme
    const getProfileWallGradient = (theme) => {
        const themes = {
            'gradient-purple': 'from-purple-500 via-indigo-500 to-blue-500',
            'gradient-sunset': 'from-orange-400 via-pink-500 to-purple-600',
            'gradient-ocean': 'from-cyan-400 via-blue-500 to-indigo-600',
            'gradient-forest': 'from-green-400 via-emerald-500 to-teal-600',
            'gradient-fire': 'from-red-500 via-orange-500 to-yellow-500',
            'gradient-midnight': 'from-gray-900 via-purple-900 to-indigo-900',
            'gradient-rose': 'from-pink-400 via-rose-400 to-red-400',
            'gradient-mint': 'from-teal-300 via-green-300 to-emerald-400',
            'gradient-cosmic': 'from-violet-600 via-fuchsia-500 to-pink-500',
        };
        return themes[theme] || themes['gradient-purple'];
    };

    return (
        <>
            <div className="space-y-6">
                {/* Profile Overview Card */}
                <div className={`relative overflow-hidden rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 bg-gradient-to-r ${getProfileWallGradient(displayUser.profileWallTheme || 'gradient-purple')}`}>
                    {/* Decorative Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    {/* Content Container */}
                    <div className="relative p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar */}
                            <img
                                src={displayUser.avatar}
                                alt={displayUser.username}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/50 shadow-2xl backdrop-blur-sm"
                            />

                            {/* User Info & Actions */}
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl cabin-bold text-white flex items-center gap-2">
                                            {displayUser.username}
                                            {displayUser.verificationStatus === 'verified' && (
                                                <Icon name="badge-check" className="w-6 h-6 text-blue-400" />
                                            )}
                                        </h2>
                                        <p className="text-white/80 text-sm">@{displayUser.username.toLowerCase()}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    {isOwnProfile ? (
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full cabin-semibold hover:bg-white transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Icon name="settings" className="w-4 h-4" />
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button className="px-6 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full cabin-semibold hover:bg-white transition-all shadow-lg flex items-center gap-2">
                                                <Icon name="user-plus" className="w-4 h-4" />
                                                Follow
                                            </button>
                                            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full cabin-semibold hover:bg-white/30 transition-all border border-white/30">
                                                <Icon name="message-square" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {displayUser.bio && (
                                    <p className="text-white/90 mb-4 max-w-2xl">
                                        {displayUser.bio}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-white/80">
                                    {displayUser.location && (
                                        <div className="flex items-center gap-1">
                                            <Icon name="map-pin" className="w-4 h-4" />
                                            <span>{displayUser.location}</span>
                                        </div>
                                    )}
                                    {displayUser.website && (
                                        <a
                                            href={displayUser.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-white transition-colors"
                                        >
                                            <Icon name="link" className="w-4 h-4" />
                                            <span>{displayUser.website.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Icon name="calendar" className="w-4 h-4" />
                                        <span>Joined March 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Social Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Icon name="users" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="cabin-semibold text-gray-900 dark:text-white">Social Impact</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Posts</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">{displayUser.posts}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Followers</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">{displayUser.followers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Following</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">{displayUser.following}</span>
                            </div>
                        </div>
                    </div>

                    {/* Creative Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Icon name="sparkles" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="cabin-semibold text-gray-900 dark:text-white">AI Creativity</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Images Generated</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">342</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Videos Created</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">28</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Total Likes</span>
                                <span className="text-xl cabin-bold text-gray-900 dark:text-white">12.8K</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Icon name="award" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="cabin-semibold text-gray-900 dark:text-white">Achievements</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: 'star', label: 'Top Creator', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
                                { icon: 'zap', label: 'Fast Learner', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                                { icon: 'heart', label: 'Community Favorite', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
                                { icon: 'trending-up', label: 'Rising Star', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
                            ].map((achievement, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg ${achievement.color} text-xs cabin-medium`}
                                >
                                    <Icon name={achievement.icon} className="w-3 h-3" />
                                    <span>{achievement.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {[
                            { id: 'posts', label: 'Posts', icon: 'image', count: mockPosts.length },
                            { id: 'thoughts', label: 'Thoughts', icon: 'message-circle', count: mockThoughts.length },
                            { id: 'shorts', label: 'Shorts', icon: 'video', count: mockShorts.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveContentTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-all ${activeContentTab === tab.id
                                        ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 cabin-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Icon name={tab.icon} className="w-5 h-5" />
                                <span>{tab.label}</span>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs cabin-medium">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Posts Grid */}
                        {activeContentTab === 'posts' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mockPosts.map(post => (
                                    <div
                                        key={post.id}
                                        className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                                    >
                                        <img
                                            src={post.mediaUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover"
                                        />
                                        {post.aiGenerated && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs cabin-medium flex items-center gap-1">
                                                <Icon name="sparkles" className="w-3 h-3" />
                                                AI
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                            <div className="flex items-center gap-1">
                                                <Icon name="heart" className="w-5 h-5" />
                                                <span className="cabin-semibold">{post.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Icon name="message-square" className="w-5 h-5" />
                                                <span className="cabin-semibold">{post.comments}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Thoughts List */}
                        {activeContentTab === 'thoughts' && (
                            <div className="space-y-4">
                                {mockThoughts.map(thought => (
                                    <div
                                        key={thought.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-md transition-shadow"
                                    >
                                        <p className="text-gray-900 dark:text-white mb-3">{thought.text}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">{thought.timestamp}</span>
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                    <Icon name="heart" className="w-4 h-4" />
                                                    <span className="cabin-medium">{thought.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                    <Icon name="message-square" className="w-4 h-4" />
                                                    <span className="cabin-medium">{thought.comments}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Shorts Grid */}
                        {activeContentTab === 'shorts' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {mockShorts.map(short => (
                                    <div
                                        key={short.id}
                                        className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer"
                                    >
                                        <img
                                            src={short.thumbnail}
                                            alt="Short"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-2 left-2 right-2 text-white">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Icon name="play" className="w-3 h-3" />
                                                    <span className="cabin-medium">{short.views}</span>
                                                </div>
                                                <span className="cabin-medium">{short.duration}</span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                <Icon name="play" className="w-6 h-6 text-purple-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Settings Modal */}
            {showSettings && (
                <ProfileSettings
                    currentUser={profileData}
                    onSave={handleSaveSettings}
                    onCancel={() => setShowSettings(false)}
                />
            )}
        </>
    );
};

export default Profile;
