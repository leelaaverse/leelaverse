import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import Navbar from '../Navbar/Navbar';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import SinglePost from '../SinglePost/SinglePost';
import PostCard from '../PostCard/PostCard';
import ProfileBadge from '../shared/ProfileBadge';
import CreateModal from '../CreateModal/CreateModal';
import './ViewProfile.css';

// ── Custom Draft Preview Modal with Aesthetic Video Player ──
const DraftPreviewModal = ({ draft, isVideo, onClose, onPost }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(true);
    const [muted, setMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlsTimer = useRef(null);

    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play(); setPlaying(true); }
        else { v.pause(); setPlaying(false); }
    };

    const handleTimeUpdate = () => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        setProgress((v.currentTime / v.duration) * 100);
        setCurrentTime(v.currentTime);
    };

    const handleSeek = (e) => {
        const v = videoRef.current;
        if (!v) return;
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        v.currentTime = pct * v.duration;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => setShowControls(false), 2500);
    };

    useEffect(() => {
        return () => clearTimeout(controlsTimer.current);
    }, []);

    return (
        <div className="draft-preview-overlay" onClick={onClose}>
            <div className="draft-preview-content" onClick={e => e.stopPropagation()}>
                <button className="draft-preview-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {isVideo ? (
                    <div
                        className="custom-player"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setShowControls(false)}
                    >
                        <video
                            ref={videoRef}
                            src={draft.resultUrl}
                            autoPlay loop muted={muted} playsInline
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                            onClick={togglePlay}
                            className="custom-player-video"
                        />
                        {/* Play/pause center icon */}
                        {!playing && (
                            <div className="custom-player-play-overlay" onClick={togglePlay}>
                                <i className="fa-solid fa-play"></i>
                            </div>
                        )}
                        {/* Bottom controls bar */}
                        <div className={`custom-player-controls ${showControls || !playing ? 'visible' : ''}`}>
                            <button className="cp-btn" onClick={togglePlay}>
                                <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`}></i>
                            </button>
                            <span className="cp-time">{formatTime(currentTime)}</span>
                            <div className="cp-progress-bar" onClick={handleSeek}>
                                <div className="cp-progress-track">
                                    <div className="cp-progress-fill" style={{ width: `${progress}%` }} />
                                    <div className="cp-progress-thumb" style={{ left: `${progress}%` }} />
                                </div>
                            </div>
                            <span className="cp-time">{formatTime(duration)}</span>
                            <button className="cp-btn" onClick={() => setMuted(!muted)}>
                                <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                            </button>
                        </div>
                    </div>
                ) : (
                    <img src={draft.resultUrl} alt={draft.prompt} />
                )}

                <div className="draft-preview-info">
                    <div className="draft-preview-meta">
                        <strong>{draft.model?.split('/').pop()}</strong> · {draft.aspectRatio || '1:1'}
                    </div>
                    <button className="draft-btn-post" onClick={onPost}>
                        <i className="fa-solid fa-paper-plane"></i> Post This
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewProfile = ({ onNavigate, onOpenCreateModal }) => {
    const { user } = useSelector((state) => state.auth);
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [viewingPost, setViewingPost] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [draftsLoading, setDraftsLoading] = useState(false);
    const [draftsLoaded, setDraftsLoaded] = useState(false);
    const [draftForPost, setDraftForPost] = useState(null);
    const [previewDraft, setPreviewDraft] = useState(null);

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'drafts' && !draftsLoaded) {
            fetchDrafts();
        }
    }, [activeTab]);

    const fetchUserProfile = async () => {
        try {
            const response = await apiService.auth.getProfile();
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

    const fetchDrafts = async () => {
        try {
            setDraftsLoading(true);
            const response = await apiService.posts.getMyGenerations();
            if (response.data.success) {
                setDrafts(response.data.data.generations || []);
            }
        } catch (error) {
            console.error('Failed to fetch drafts:', error);
            setDrafts([]);
        } finally {
            setDraftsLoading(false);
            setDraftsLoaded(true);
        }
    };

    const handlePostDraft = (draft) => {
        setDraftForPost(draft);
    };

    const handleDraftModalClose = () => {
        setDraftForPost(null);
        // Refresh drafts to remove drafted item
        fetchDrafts();
        fetchUserPosts();
    };

    const handleDeleteDraft = async (draftId) => {
        try {
            // For now just remove from local state - backend delete can be added later
            setDrafts(prev => prev.filter(d => d.id !== draftId));
        } catch (error) {
            console.error('Failed to delete draft:', error);
        }
    };

    const isVideoUrl = (url) => {
        if (!url) return false;
        return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);
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

    const getPostMediaKind = useCallback((post) => {
        const mediaType = post.mediaType?.toLowerCase() || '';
        const type = post.type?.toLowerCase() || '';
        const category = post.category?.toLowerCase() || '';
        const mediaUrl = (
            post.mediaUrl ||
            post.thumbnailUrl ||
            post.imageUrl ||
            post.image ||
            (post.mediaUrls && post.mediaUrls[0]) ||
            ''
        ).toLowerCase();

        if (
            mediaType.startsWith('image/') ||
            type === 'image' ||
            category === 'image-post' ||
            /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/.test(mediaUrl)
        ) {
            return 'image';
        }

        if (
            mediaType.startsWith('video/') ||
            type === 'video' ||
            category === 'video-post' ||
            /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/.test(mediaUrl)
        ) {
            return 'video';
        }

        if (
            mediaType.startsWith('audio/') ||
            type === 'audio' ||
            /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/.test(mediaUrl)
        ) {
            return 'audio';
        }

        return mediaUrl ? 'image' : 'text';
    }, []);

    const getFilteredPosts = useCallback(() => {
        if (filterType === 'all') return userPosts;

        return userPosts.filter((post) => getPostMediaKind(post) === filterType);
    }, [filterType, getPostMediaKind, userPosts]);

    const parseAspectRatio = useCallback((ratioStr) => {
        if (!ratioStr) return null;

        if (ratioStr.includes(':')) {
            const parts = ratioStr.split(':');
            if (parts.length === 2) {
                const w = parseFloat(parts[0]);
                const h = parseFloat(parts[1]);
                if (w > 0 && h > 0) return w / h;
            }
        }

        if (ratioStr.includes('x')) {
            const parts = ratioStr.split('x');
            if (parts.length === 2) {
                const w = parseFloat(parts[0]);
                const h = parseFloat(parts[1]);
                if (w > 0 && h > 0) return w / h;
            }
        }

        if (ratioStr.startsWith('landscape')) return 16 / 9;
        if (ratioStr.startsWith('portrait')) return 9 / 16;
        if (ratioStr.startsWith('square')) return 1;
        if (ratioStr.startsWith('auto')) return null;

        return null;
    }, []);

    const getAspectRatio = useCallback((post) => {
        let numericRatio = null;

        if (post.aiAspectRatio) {
            numericRatio = parseAspectRatio(post.aiAspectRatio);
        }

        if (numericRatio === null) {
            const isVideo = post.mediaType?.startsWith('video/') ||
                post.type === 'video' ||
                post.category === 'video-post' ||
                post.mediaUrl?.includes('.mp4') ||
                post.mediaUrl?.includes('.webm') ||
                post.mediaUrl?.includes('.mov');

            const width = post.width || post.metadata?.width || (isVideo ? 9 : 1);
            const height = post.height || post.metadata?.height || (isVideo ? 16 : 1);
            numericRatio = width / height;
        }

        if (numericRatio > 1.2) return 'landscape';
        if (numericRatio < 0.8) return 'portrait';
        return 'square';
    }, [parseAspectRatio]);

    const filteredPosts = useMemo(() => {
        const basePosts = getFilteredPosts();

        if (activeTab === 'ai') {
            return basePosts.filter((post) => post.aiGenerated);
        }

        if (activeTab === 'saved') {
            return [];
        }

        return basePosts;
    }, [activeTab, getFilteredPosts]);

    const columns = useMemo(() => {
        const cols = [[], [], [], []];
        const colHeights = [0, 0, 0, 0];

        filteredPosts.forEach((post) => {
            let numericRatio = parseAspectRatio(post.aiAspectRatio);
            if (!numericRatio) {
                const aspectRatio = getAspectRatio(post);
                if (aspectRatio === 'portrait') numericRatio = 3 / 4;
                else if (aspectRatio === 'landscape') numericRatio = 16 / 9;
                else numericRatio = 1;
            }

            const weight = 1 / numericRatio;
            const minIndex = colHeights.indexOf(Math.min(...colHeights));
            cols[minIndex].push(post);
            colHeights[minIndex] += weight;
        });

        return cols;
    }, [filteredPosts, getAspectRatio, parseAspectRatio]);

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
                setActiveTab={() => onNavigate && onNavigate('home')}
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

                            {/* Earned Badges */}
                            {userProfile?.earnedBadges?.length > 0 && (
                                <div className="profile-badges">
                                    <span className="profile-badges-label">Badges</span>
                                    <div className="profile-badges-list">
                                        {userProfile.earnedBadges.map(({ badge }) => (
                                            <ProfileBadge key={badge.id} badge={badge} />
                                        ))}
                                    </div>
                                </div>
                            )}

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
                            className={`profile-tab ${activeTab === 'drafts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('drafts')}
                        >
                            <i className="fa-solid fa-pen-ruler"></i> Drafts
                            {drafts.length > 0 && <span className="draft-count-badge">{drafts.length}</span>}
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <i className="fa-solid fa-bookmark"></i> Saved
                        </button>
                    </div>

                    <div className="profile-posts-section">
                        {/* ── DRAFTS TAB ── */}
                        {activeTab === 'drafts' ? (
                            <div className="drafts-section">
                                {draftsLoading ? (
                                    <div className="drafts-grid">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="draft-card-skeleton">
                                                <div className="draft-skeleton-media animate-shimmer" />
                                                <div className="draft-skeleton-info">
                                                    <div className="draft-skeleton-line w-60" />
                                                    <div className="draft-skeleton-line w-80" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : drafts.length > 0 ? (
                                    <div className="drafts-grid">
                                        {drafts.map(draft => (
                                            <div key={draft.id} className="draft-card">
                                                <div className="draft-media" onClick={() => setPreviewDraft(draft)}>
                                                    {isVideoUrl(draft.resultUrl) ? (
                                                        <video
                                                            src={draft.resultUrl}
                                                            muted
                                                            loop
                                                            playsInline
                                                            onMouseOver={e => e.target.play()}
                                                            onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                                            className="draft-media-content"
                                                        />
                                                    ) : (
                                                        <img src={draft.resultUrl} alt={draft.prompt} className="draft-media-content" />
                                                    )}
                                                    <div className="draft-overlay">
                                                        <button className="draft-btn-post" onClick={() => handlePostDraft(draft)}>
                                                            <i className="fa-solid fa-paper-plane"></i> Post
                                                        </button>
                                                        <button className="draft-btn-delete" onClick={() => handleDeleteDraft(draft.id)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                    {isVideoUrl(draft.resultUrl) && (
                                                        <span className="draft-type-badge"><i className="fa-solid fa-play"></i></span>
                                                    )}
                                                    <span className="draft-ratio-badge">{draft.aspectRatio || '1:1'}</span>
                                                </div>
                                                <div className="draft-info">
                                                    <p className="draft-model">
                                                        <i className="fa-solid fa-microchip"></i>
                                                        {draft.model?.split('/').pop() || 'AI Model'}
                                                    </p>
                                                    <p className="draft-prompt">{draft.prompt?.slice(0, 80)}{draft.prompt?.length > 80 ? '…' : ''}</p>
                                                    <p className="draft-date">{new Date(draft.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-8 text-white/60">
                                        <i className="fa-solid fa-pen-ruler text-6xl mb-4" style={{ opacity: 0.4 }}></i>
                                        <h3 className="text-xl font-semibold mb-2">No drafts</h3>
                                        <p className="text-sm">AI generations that you haven't posted yet will appear here.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                        <>
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
                                {columns.map((column, colIndex) => (
                                    <div key={colIndex} className="flex flex-col">
                                        {column.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                aspectRatio={getAspectRatio(post)}
                                                onShowAuthModal={() => {}}
                                                onPostClick={handlePostClick}
                                                onUserClick={(authorId) => {
                                                    if (authorId === user?.id) {
                                                        return;
                                                    }
                                                    onNavigate?.('user', authorId);
                                                }}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-8 text-white/60">
                                <i className="fa-solid fa-image text-6xl mb-4"></i>
                                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                                <p className="text-sm">Start creating amazing content!</p>
                            </div>
                        )}
                        </>
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
                        onOpenCreateModal={onOpenCreateModal}
                    />
                </div>
            )}

            {/* Draft Preview Modal */}
            {previewDraft && (
                <DraftPreviewModal
                    draft={previewDraft}
                    isVideo={isVideoUrl(previewDraft.resultUrl)}
                    onClose={() => setPreviewDraft(null)}
                    onPost={() => { setPreviewDraft(null); handlePostDraft(previewDraft); }}
                />
            )}

            {/* Draft Post Modal */}
            {draftForPost && (
                <CreateModal
                    isOpen={true}
                    onClose={handleDraftModalClose}
                    initialStep="postForm"
                    initialImagePreview={draftForPost.resultUrl}
                    initialAiGenerationIds={[draftForPost.id]}
                    initialModel={draftForPost.model}
                    initialPrompt={draftForPost.prompt}
                    initialAspectRatio={draftForPost.aspectRatio}
                    initialIsVideo={isVideoUrl(draftForPost.resultUrl)}
                />
            )}
        </div>
    );
};

export default ViewProfile;
