import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import './ViewProfile.css';

const ViewProfile = ({ onNavigate }) => {
    const { user } = useSelector((state) => state.auth);
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const response = await apiService.auth.getProfile();
            setUserProfile(response.data.data.user);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
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
            <Navbar isLoggedIn={true} onBack={() => onNavigate && onNavigate('home')} showBackButton={true} />

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
                                <h2 className="profile-username">@{username}</h2>
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
                            All Posts
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'singularity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('singularity')}
                        >
                            Singularity
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'draft' ? 'active' : ''}`}
                            onClick={() => setActiveTab('draft')}
                        >
                            Drafts
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

                        {/* Posts Grid */}
                        <div className="posts-grid">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <div key={post.id} className="post-grid-item">
                                        {post.mediaUrl || post.thumbnailUrl ? (
                                            <img
                                                src={post.thumbnailUrl || post.mediaUrl}
                                                alt={post.title || 'Post'}
                                                className="post-image"
                                            />
                                        ) : (
                                            <div className="post-placeholder">
                                                <i className="fa-solid fa-image"></i>
                                                <p>{post.title || 'Untitled'}</p>
                                            </div>
                                        )}
                                        <div className="post-overlay">
                                            <div className="post-stats">
                                                <span>
                                                    <i className="fa-solid fa-heart"></i>
                                                    {post._count?.likes || 0}
                                                </span>
                                                <span>
                                                    <i className="fa-solid fa-comment"></i>
                                                    {post._count?.comments || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-posts">
                                    <i className="fa-solid fa-image"></i>
                                    <h3>No posts yet</h3>
                                    <p>Start creating amazing content!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Sidebar onNavigate={onNavigate} />

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userProfile={userProfile}
            />
        </div>
    );
};

export default ViewProfile;
