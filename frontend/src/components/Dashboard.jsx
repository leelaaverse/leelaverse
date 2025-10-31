import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import CreatePostModal from './CreatePostModal';
import FeedPost from './FeedPost';
import FeedShort from './FeedShort';
import MyGenerations from './MyGenerations';
import ImageGrid from './ImageGrid';
import Profile from './NavOptions/Profile';
import Shorts from './NavOptions/Shorts';
import Explore from './NavOptions/Explore';
import Groups from './NavOptions/Groups';
import { mockPosts, mockSuggestedUsers, mockCurrentUser } from '../data/mockData';
import logoImage from '../assets/logo.png';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postsError, setPostsError] = useState(null);
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { accessToken } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const currentUser = {
        ...mockCurrentUser,
        username: user?.username || mockCurrentUser.username,
        firstName: user?.firstName || mockCurrentUser.name,
        avatar: user?.avatar || mockCurrentUser.avatar,
        coins: user?.coinBalance || 250,
        posts: user?.posts || 42,
        followers: user?.followers || '2.5K',
        following: user?.following || 180,
    };

    // Fetch posts from backend
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                setPostsError(null);

                const response = await fetch(`${API_URL}/api/posts/feed?limit=20`, {
                    headers: accessToken ? {
                        'Authorization': `Bearer ${accessToken}`
                    } : {}
                });

                const data = await response.json();

                if (data.success) {
                    setPosts(data.posts);
                } else {
                    setPostsError(data.message || 'Failed to load posts');
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPostsError('Failed to load posts');
            } finally {
                setLoadingPosts(false);
            }
        };

        if (activeTab === 'home') {
            fetchPosts();
        }
    }, [activeTab, API_URL, accessToken]);

    // Refresh posts function
    const refreshPosts = () => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                const response = await fetch(`${API_URL}/api/posts/feed?limit=20`, {
                    headers: accessToken ? {
                        'Authorization': `Bearer ${accessToken}`
                    } : {}
                });

                const data = await response.json();
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error('Failed to refresh posts:', error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchPosts();
    };
    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-8">
                        {/* New Creation Zone */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-purple-100 dark:border-purple-900/20">
                            <h2 className="text-xl cabin-semibold mb-4 text-gray-900 dark:text-white">Create Something Amazing</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { icon: 'image', label: 'Upload Image', color: 'from-blue-400 to-indigo-500' },
                                    { icon: 'wand', label: 'Generate Image', color: 'from-purple-400 to-fuchsia-500' },
                                    { icon: 'film', label: 'Upload Video', color: 'from-orange-400 to-red-500' },
                                    { icon: 'sparkles', label: 'Generate Video', color: 'from-green-400 to-teal-500' },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white hover:shadow-lg hover:scale-105 transition-all`}
                                    >
                                        <Icon name={item.icon} className="w-6 h-6" />
                                        <span className="text-sm cabin-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* New Masonry-style Feed */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl cabin-semibold text-gray-900 dark:text-white">Your Feed</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={refreshPosts}
                                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm cabin-medium hover:bg-purple-700 transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loadingPosts && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
                                                }`}
                                        >
                                            {/* Image Skeleton */}
                                            <div className={`${i === 0 ? 'aspect-[16/9]' : 'aspect-square'} bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>
                                            {/* Content Skeleton */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                </div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                                <div className="flex justify-between pt-2">
                                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Error State */}
                            {postsError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                                    <Icon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-600 dark:text-red-400">{postsError}</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loadingPosts && !postsError && posts.length === 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 text-center">
                                    <Icon name="image" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl cabin-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to create something amazing!</p>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full cabin-semibold hover:shadow-lg transition-all"
                                    >
                                        Create Your First Post
                                    </button>
                                </div>
                            )}

                            {/* Grid Layout for Feed */}
                            {!loadingPosts && !postsError && posts.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Render Real Posts */}
                                    {posts.map((post, index) => {
                                        const timeAgo = (date) => {
                                            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                                            if (seconds < 60) return `${seconds}s ago`;
                                            const minutes = Math.floor(seconds / 60);
                                            if (minutes < 60) return `${minutes}m ago`;
                                            const hours = Math.floor(minutes / 60);
                                            if (hours < 24) return `${hours}h ago`;
                                            const days = Math.floor(hours / 24);
                                            return `${days}d ago`;
                                        };

                                        // Determine if post has multiple images
                                        const imageUrls = post.mediaUrls && post.mediaUrls.length > 0
                                            ? post.mediaUrls
                                            : post.mediaUrl ? [post.mediaUrl] : [];

                                        const hasImages = imageUrls.length > 0;
                                        const isTextPost = post.category === 'text-post' || !hasImages;
                                        const hasMultipleImages = imageUrls.length > 1;

                                        return (
                                            <div
                                                key={post.id}
                                                className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 ${index === 0 && hasImages ? 'sm:col-span-2 lg:col-span-2' : ''
                                                    }`}
                                            >
                                                {/* Image Post */}
                                                {hasImages && (
                                                    <div className="relative">
                                                        {/* Single Image - Full Display */}
                                                        {!hasMultipleImages && (
                                                            <div className={`relative ${index === 0 ? 'aspect-[16/9]' : 'aspect-square'}`}>
                                                                <img
                                                                    src={imageUrls[0]}
                                                                    alt={post.title || post.caption || 'Post image'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Multiple Images - Grid Layout */}
                                                        {hasMultipleImages && (
                                                            <div className="p-3">
                                                                <ImageGrid
                                                                    images={imageUrls}
                                                                    onImageClick={(idx) => window.open(imageUrls[idx], '_blank')}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* AI Model Badge */}
                                                        {post.aiGenerated && post.aiModel && (
                                                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs cabin-medium flex items-center gap-1 z-10">
                                                                <Icon name="sparkles" className="w-3 h-3" />
                                                                {post.aiModel}
                                                            </div>
                                                        )}
                                                        {/* Multiple Images Indicator */}
                                                        {hasMultipleImages && (
                                                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs cabin-medium flex items-center gap-1 z-10">
                                                                <Icon name="image" className="w-3 h-3" />
                                                                {imageUrls.length} images
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Post Content */}
                                                <div className={isTextPost ? 'p-5' : 'p-4'}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={post.author?.avatar || `https://i.pravatar.cc/150?u=${post.authorId}`}
                                                                alt={post.author?.username || 'User'}
                                                                className="w-6 h-6 rounded-full object-cover"
                                                            />
                                                            <span className="text-sm cabin-medium text-gray-900 dark:text-white">
                                                                @{post.author?.username || 'unknown'}
                                                            </span>
                                                            {post.author?.verificationStatus === 'verified' && (
                                                                <Icon name="badge-check" className="w-4 h-4 text-blue-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <Icon name="clock" className="w-3 h-3" />
                                                            <span>{timeAgo(post.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Title (if exists) */}
                                                    {post.title && (
                                                        <h3 className="text-sm cabin-semibold text-gray-900 dark:text-white mb-2">
                                                            {post.title}
                                                        </h3>
                                                    )}

                                                    {/* Caption */}
                                                    {post.caption && (
                                                        <p className={`text-gray-600 dark:text-gray-300 ${isTextPost ? 'text-base mb-4' : 'text-sm mb-3'} line-clamp-3`}>
                                                            {post.caption}
                                                        </p>
                                                    )}

                                                    {/* Engagement Buttons */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                                                                <Icon name="heart" className="w-4 h-4" />
                                                                <span className="text-xs cabin-medium">{post.likesCount || 0}</span>
                                                            </button>
                                                            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                                                                <Icon name="message-square" className="w-4 h-4" />
                                                                <span className="text-xs cabin-medium">{post.commentsCount || 0}</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                                                                <Icon name="bookmark" className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                                                                <Icon name="share" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'shorts':
                return <Shorts />;

            case 'explore':
                return <Explore />;

            case 'groups':
                return <Groups />;

            case 'profile':
                return <Profile currentUser={currentUser} />;

            case 'my-creations':
                return <MyGenerations user={currentUser} />;

            case 'settings':
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl cabin-semibold text-gray-900 dark:text-white mb-6">Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <div>
                                        <h3 className="cabin-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark mode on/off</p>
                                    </div>
                                    <button
                                        onClick={toggleDarkMode}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <div className="text-center py-8">
                                    <p className="text-gray-600 dark:text-gray-400">More settings coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 cabin-regular">
            {/* Top Navigation Bar - Redesigned */}
            <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
                            <img
                                src={logoImage}
                                alt="leelaah Logo"
                                className="h-10 w-10 object-contain rounded-2xl"
                            />
                            <h1 className="text-2xl zalando-sans-expanded-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                leelaah
                            </h1>
                        </div>

                        {/* Center: Navigation - New Style */}
                        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                            {[
                                { id: 'home', icon: 'layout', label: 'Home' },
                                { id: 'shorts', icon: 'video', label: 'Shorts' },
                                { id: 'explore', icon: 'search', label: 'Explore' },
                                { id: 'groups', icon: 'users', label: 'Groups' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm cabin-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600 cabin-medium'
                                        }`}
                                >
                                    <Icon name={tab.icon} className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Right: Coins, Create, Profile */}
                        <div className="flex items-center gap-3">
                            {/* Coins Display - New Style */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white cabin-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                                <Icon name="hexagon" className="w-4 h-4" />
                                <span>{currentUser.coins}</span>
                            </div>

                            {/* Create Button - New Style */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full cabin-semibold hover:shadow-lg hover:scale-105 transition-all"
                            >
                                <Icon name="plus-circle" className="w-4 h-4" />
                                <span className="hidden sm:inline">Create</span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.username}
                                        className="w-9 h-9 rounded-full object-cover border-2 border-purple-500"
                                    />
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowProfileMenu(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slideDown">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <div className="cabin-semibold text-gray-900 dark:text-white">{currentUser.username}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">@{currentUser.username.toLowerCase()}</div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('profile');
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cabin-regular"
                                                >
                                                    <Icon name="user" className="w-4 h-4" />
                                                    <span>View Profile</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('settings');
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cabin-regular"
                                                >
                                                    <Icon name="settings" className="w-4 h-4" />
                                                    <span>Settings</span>
                                                </button>
                                                <button
                                                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cabin-regular"
                                                >
                                                    <Icon name="help-circle" className="w-4 h-4" />
                                                    <span>Help & Support</span>
                                                </button>
                                            </div>

                                            {/* Sign Out */}
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                                <button
                                                    onClick={() => {
                                                        onLogout();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors cabin-medium"
                                                >
                                                    <Icon name="log-out" className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation - New Style */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg">
                <div className="flex items-center justify-around h-16 px-2">
                    {[
                        { id: 'home', icon: 'layout', label: 'Home' },
                        { id: 'shorts', icon: 'video', label: 'Shorts' },
                        { id: 'explore', icon: 'search', label: 'Explore' },
                        { id: 'groups', icon: 'users', label: 'Groups' },
                        { id: 'profile', icon: 'user', label: 'Profile' },
                    ].map((tab, i) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <Icon name={tab.icon} className="w-6 h-6" />
                            <span className="text-xs cabin-medium mt-1">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content - With New Sidebar */}
            <div className="pt-20 pb-20 md:pb-8 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Desktop Only */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {/* User Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.username}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900/30 mb-3"
                                    />
                                    <h3 className="cabin-semibold text-gray-900 dark:text-white text-lg">{currentUser.username}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">@{currentUser.username.toLowerCase()}</p>
                                    <div className="flex justify-between w-full text-center border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                                        <div>
                                            <div className="cabin-semibold text-gray-900 dark:text-white">{currentUser.posts}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">Posts</div>
                                        </div>
                                        <div className="border-r border-l border-gray-100 dark:border-gray-700 px-4">
                                            <div className="cabin-semibold text-gray-900 dark:text-white">{currentUser.followers}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">Followers</div>
                                        </div>
                                        <div>
                                            <div className="cabin-semibold text-gray-900 dark:text-white">{currentUser.following}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">Following</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="cabin-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Icon name="bookmark" className="w-5 h-5 text-purple-500" />
                                    Shortcuts
                                </h3>
                                <div className="space-y-1">
                                    {[
                                        { icon: 'wand', label: 'My AI Creations', badge: null, action: 'my-creations' },
                                        { icon: 'heart', label: 'Liked Posts', badge: '12' },
                                        { icon: 'bookmark', label: 'Saved Items', badge: '36' },
                                        { icon: 'star', label: 'Featured', badge: '2' },
                                        { icon: 'clock', label: 'Recent' },
                                        { icon: 'trending-up', label: 'Trending' },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => item.action && setActiveTab(item.action)}
                                            className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                                    <Icon name={item.icon} className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 cabin-medium">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full cabin-medium">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Responsive Width */}
                    <div className="lg:col-span-3">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                currentUser={currentUser}
                onPostCreated={refreshPosts}
            />

            {/* Floating Create Button (Mobile) - New Style */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-30 flex items-center justify-center"
            >
                <Icon name="plus-circle" className="w-7 h-7" />
            </button>
        </div>
    );
};

export default Dashboard;

