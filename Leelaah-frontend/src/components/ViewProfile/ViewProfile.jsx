import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import Navbar from '../Navbar/Navbar';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import SinglePost from '../SinglePost/SinglePost';
import './ViewProfile.css';

const ViewProfile = ({ onNavigate }) => {
    const { user } = useSelector((state) => state.auth);
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [viewingPost, setViewingPost] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            console.log('🔄 Fetching user profile...');
            const response = await apiService.auth.getProfile();
            console.log('✅ Profile fetched:', response.data.data.user);
            setUserProfile(response.data.data.user);
        } catch (error) {
            console.error('❌ Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = (wasUpdated) => {
        setIsEditModalOpen(false);
        // If profile was updated, refresh the profile data
        if (wasUpdated) {
            console.log('🔄 Profile was updated, refreshing...');
            fetchUserProfile();
        }
    };

    const fetchUserPosts = async () => {
        if (!user?.id) return;

        try {
            const response = await apiService.posts.getUserPosts(user.id);
            setUserPosts(response.data.posts || []);
        } catch (error) {
            console.error('Failed to fetch user posts:', error);
            setUserPosts([]);
        }
    };

    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
        setViewingPost(true);
    };

    const handleClosePost = () => {
        setViewingPost(false);
        setSelectedPostId(null);
        // Refresh posts in case of edits
        fetchUserPosts();
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const getFilteredPosts = () => {
        if (filterType === 'all') return userPosts;
        return userPosts.filter(post => {
            if (filterType === 'image') return post.mediaType === 'image';
            if (filterType === 'video') return post.mediaType === 'video';
            if (filterType === 'audio') return post.mediaType === 'audio';
            if (filterType === 'text') return !post.mediaUrl;
            return true;
        });
    };

    const filteredPosts = getFilteredPosts();
    const displayName = userProfile
        ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
        : user?.firstName || 'User';
    const username = userProfile?.username || user?.username || 'username';
    const avatarUrl = userProfile?.avatar || user?.avatar || '/assets/profile.png';
    const bio = userProfile?.bio || 'Digital creator | Turning ideas into visuals';

    if (loading) {
        return (
            <div className="view-profile">
                <Navbar isLoggedIn={true} />
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="view-profile">
            <Navbar
                isLoggedIn={true}
                onBack={() => onNavigate && onNavigate('home')}
                showBackButton={true}
                onNavigate={onNavigate}
                setActiveTab={(tab) => onNavigate && onNavigate('home')}
                onChatClick={() => onNavigate && onNavigate('chat')}
            />

            <main className="profile-main">
                {/* Profile Hero Section */}
                <div className="profile-hero">
                    <div className="profile-hero-content">
                        <div className="profile-avatar-large">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                onError={(e) => e.target.src = '/assets/profile.png'}
                            />
                        </div>
                        <div className="profile-info">
                            <div className="profile-header-actions">
                                <h2 className="profile-username">
                                    @{username}
                                    {userProfile?.verificationStatus === 'verified' && (
                                        <span className="verification-badge" title="Verified">
                                            <i className="fa-solid fa-circle-check"></i>
                                        </span>
                                    )}
                                </h2>
                                <div className="profile-actions">
                                    <button
                                        className="btn-edit-profile"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                        Edit Profile
                                    </button>
                                    <button className="btn-settings">
                                        <i className="fa-solid fa-gear"></i>
                                    </button>
                                </div>
                            </div>
                            <h3 className="profile-display-name">{displayName}</h3>
                            <p className="profile-bio">{bio}</p>

                            {/* Location and Website */}
                            <div className="profile-meta">
                                {userProfile?.location && (
                                    <div className="profile-meta-item">
                                        <i className="fa-solid fa-location-dot"></i>
                                        <span>{userProfile.location}</span>
                                    </div>
                                )}
                                {userProfile?.website && (
                                    <div className="profile-meta-item">
                                        <i className="fa-solid fa-link"></i>
                                        <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                                            {userProfile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            {(userProfile?.twitterLink || userProfile?.instagramLink || userProfile?.linkedinLink || userProfile?.githubLink || userProfile?.discordLink) && (
                                <div className="profile-social-links">
                                    {userProfile?.twitterLink && (
                                        <a href={userProfile.twitterLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
                                            <i className="fa-brands fa-x-twitter"></i>
                                        </a>
                                    )}
                                    {userProfile?.instagramLink && (
                                        <a href={userProfile.instagramLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                            <i className="fa-brands fa-instagram"></i>
                                        </a>
                                    )}
                                    {userProfile?.linkedinLink && (
                                        <a href={userProfile.linkedinLink} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                                            <i className="fa-brands fa-linkedin"></i>
                                        </a>
                                    )}
                                    {userProfile?.githubLink && (
                                        <a href={userProfile.githubLink} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                                            <i className="fa-brands fa-github"></i>
                                        </a>
                                    )}
                                    {userProfile?.discordLink && (
                                        <a href={userProfile.discordLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
                                            <i className="fa-brands fa-discord"></i>
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="profile-stats">
                                <div className="stat-box">
                                    <span className="stat-value">{formatNumber(userProfile?.totalCreations || 0)}</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-box">
                                    <span className="stat-value">{formatNumber(userProfile?._count?.followers || 0)}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-box">
                                    <span className="stat-value">{formatNumber(userProfile?._count?.following || 0)}</span>
                                    <span className="stat-label">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="profile-content">
                    <div className="profile-tabs">
                        <button
                            className={`profile-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            <i className="fa-solid fa-grid-2"></i> All Posts
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Generated
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <i className="fa-solid fa-bookmark"></i> Saved
                        </button>
                    </div>

                    <div className="profile-posts-section">
                        {/* Filter Dropdown */}
                        <div className="posts-filter">
                            <button
                                className="filter-btn"
                                onClick={() => document.getElementById('filterDropdown').classList.toggle('show')}
                            >
                                <i className="fa-solid fa-filter"></i>
                                Filter
                            </button>
                            <div className="filter-dropdown" id="filterDropdown">
                                <button onClick={() => { setFilterType('all'); document.getElementById('filterDropdown').classList.remove('show'); }}>
                                    All
                                </button>
                                <button onClick={() => { setFilterType('image'); document.getElementById('filterDropdown').classList.remove('show'); }}>
                                    Images
                                </button>
                                <button onClick={() => { setFilterType('video'); document.getElementById('filterDropdown').classList.remove('show'); }}>
                                    Videos
                                </button>
                                <button onClick={() => { setFilterType('audio'); document.getElementById('filterDropdown').classList.remove('show'); }}>
                                    Audio
                                </button>
                                <button onClick={() => { setFilterType('text'); document.getElementById('filterDropdown').classList.remove('show'); }}>
                                    Text
                                </button>
                            </div>
                        </div>

                        {/* Posts Grid - Masonry Layout */}
                        {filteredPosts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 px-4">
                                {Array.from({ length: 4 }).map((_, colIndex) => {
                                    const columnPosts = filteredPosts.filter((_, idx) => idx % 4 === colIndex);
                                    return (
                                        <div key={colIndex} className="flex flex-col">
                                            {columnPosts.map((post) => {
                                                // Determine aspect ratio from post data
                                                const getAspectRatio = () => {
                                                    if (post.aiAspectRatio === '9:16') return 'portrait';
                                                    if (post.aiAspectRatio === '16:9') return 'landscape';
                                                    return 'square';
                                                };
                                                const aspectRatio = getAspectRatio();
                                                const minHeight = aspectRatio === 'portrait' ? 'min-h-[400px]' : aspectRatio === 'landscape' ? 'min-h-[200px]' : 'min-h-[300px]';

                                                // Detect if post is a video
                                                const isVideo = post.mediaType?.startsWith('video/') ||
                                                                post.type === 'video' ||
                                                                post.category === 'video-post' ||
                                                                post.mediaUrl?.includes('.mp4') ||
                                                                post.mediaUrl?.includes('.webm') ||
                                                                post.mediaUrl?.includes('.mov');

                                                return (
                                                    <div
                                                        key={post.id}
                                                        className={`relative w-full overflow-hidden rounded-lg cursor-pointer mb-2 md:mb-3 group ${minHeight} bg-gray-900`}
                                                        onClick={() => handlePostClick(post.id)}
                                                    >
                                                        {post.mediaUrl || post.thumbnailUrl ? (
                                                            isVideo ? (
                                                                <video
                                                                    src={post.mediaUrl}
                                                                    className="w-full h-auto object-contain"
                                                                    muted
                                                                    playsInline
                                                                    onMouseEnter={(e) => e.target.play()}
                                                                    onMouseLeave={(e) => e.target.pause()}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={post.thumbnailUrl || post.mediaUrl}
                                                                    alt={post.title || 'Post'}
                                                                    className="w-full h-auto object-contain"
                                                                />
                                                            )
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                                                                <i className="fa-solid fa-image text-4xl mb-2"></i>
                                                                <p className="text-sm">{post.title || 'Untitled'}</p>
                                                            </div>
                                                        )}
                                                        {isVideo && (
                                                            <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                                                                <i className="fa-solid fa-play text-[10px]"></i>
                                                                Video
                                                            </div>
                                                        )}
                                                        {post.aiGenerated && (
                                                            <div className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                                                                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white">
                                                                <span className="flex items-center gap-1">
                                                                    <i className="fa-solid fa-heart"></i>
                                                                    {post._count?.likes || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <i className="fa-solid fa-comment"></i>
                                                                    {post._count?.comments || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-8 text-white/60">
                                <i className="fa-solid fa-image text-6xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                                <p className="text-sm">Start creating amazing content!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>


            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={handleModalClose}
                userProfile={userProfile}
            />

            {/* Single Post View */}
            {viewingPost && selectedPostId && (
                <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
                    <SinglePost
                        postId={selectedPostId}
                        onBack={handleClosePost}
                        onShowAuthModal={() => {}}
                    />
                </div>
            )}
        </div>
    );
};

export default ViewProfile;
