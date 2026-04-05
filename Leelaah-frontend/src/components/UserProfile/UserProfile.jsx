import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import SinglePost from '../SinglePost/SinglePost';
import PostCard from '../PostCard/PostCard';
import './UserProfile.css';

const UserProfile = ({ userId, onNavigate, onBack, onChatClick }) => {
	const { user: currentUser } = useSelector((state) => state.auth);
	const [profile, setProfile] = useState(null);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('posts');
	const [selectedPostId, setSelectedPostId] = useState(null);
	const [viewingPost, setViewingPost] = useState(false);

	useEffect(() => {
		if (userId) {
			fetchUserProfile();
		}
	}, [userId]);

	const fetchUserProfile = async () => {
		try {
			setLoading(true);
			console.log('📋 Fetching public profile for:', userId);
			const response = await apiService.users.getPublicProfile(userId);

			if (response.data.success) {
				setProfile(response.data.user);
				setPosts(response.data.posts || []);
				setIsFollowing(response.data.user.isFollowing || false);
				console.log('✅ Profile loaded:', response.data.user.username);
			}
		} catch (error) {
			console.error('❌ Failed to fetch profile:', error);
			toast.error('Failed to load profile');
		} finally {
			setLoading(false);
		}
	};

	const handleFollowToggle = async () => {
		if (!currentUser) {
			toast.error('Please login to follow users');
			return;
		}

		try {
			setFollowLoading(true);

			if (isFollowing) {
				await apiService.users.unfollowUser(userId);
				setIsFollowing(false);
				toast.success(`Unfollowed @${profile?.username}`);
				// Update follower count
				setProfile(prev => ({
					...prev,
					_count: {
						...prev._count,
						followers: Math.max(0, (prev._count?.followers || 1) - 1)
					}
				}));
			} else {
				await apiService.users.followUser(userId);
				setIsFollowing(true);
				toast.success(`Following @${profile?.username}`);
				// Update follower count
				setProfile(prev => ({
					...prev,
					_count: {
						...prev._count,
						followers: (prev._count?.followers || 0) + 1
					}
				}));
			}
		} catch (error) {
			console.error('❌ Follow toggle error:', error);
			const message = error.response?.data?.message || 'Failed to update follow status';
			toast.error(message);
		} finally {
			setFollowLoading(false);
		}
	};

	const formatNumber = (num) => {
		if (!num) return '0';
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
		return num.toString();
	};

	const handlePostClick = (postId) => {
		setSelectedPostId(postId);
		setViewingPost(true);
	};

	const handleClosePost = () => {
		setViewingPost(false);
		setSelectedPostId(null);
		// Refresh posts in case of edits
		fetchUserProfile();
	};

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

	const columns = useMemo(() => {
		const cols = [[], [], [], []];
		const colHeights = [0, 0, 0, 0];

		posts.forEach((post) => {
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
	}, [posts, getAspectRatio, parseAspectRatio]);

	const displayName = profile
		? `${profile.firstName} ${profile.lastName}`.trim()
		: 'User';
	const username = profile?.username || 'username';
	const avatarUrl = profile?.avatar || '/assets/profile.png';
	const coverUrl = profile?.coverImage || null;
	const bio = profile?.bio || 'No bio yet';
	const isOwnProfile = currentUser?.id === userId;

	if (loading) {
		return (
			<div className="user-profile">
				<Navbar isLoggedIn={!!currentUser} />
				<div className="profile-loading">
					<div className="spinner"></div>
					<p>Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="user-profile">
				<Navbar
					isLoggedIn={!!currentUser}
					onBack={onBack}
					showBackButton={true}
					onChatClick={onChatClick}
				/>
				<div className="profile-error">
					<i className="fa-solid fa-user-slash"></i>
					<h3>User not found</h3>
					<p>This profile doesn't exist or has been removed.</p>
					<button onClick={onBack} className="btn-back">
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="user-profile">
			<Navbar
				isLoggedIn={!!currentUser}
				onBack={onBack}
				showBackButton={true}
				onNavigate={onNavigate}
				setActiveTab={(tab) => onNavigate && onNavigate('home')}
				onChatClick={onChatClick}
			/>

			<main className="profile-main">
				{/* Cover Image */}
				{coverUrl && (
					<div className="profile-cover">
						<img src={coverUrl} alt="Cover" />
					</div>
				)}

				{/* Profile Hero Section */}
				<div className={`profile-hero ${coverUrl ? 'has-cover' : ''}`}>
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
									{profile?.verificationStatus === 'verified' && (
										<span className="verification-badge" title="Verified">
											<i className="fa-solid fa-circle-check"></i>
										</span>
									)}
								</h2>
								<div className="profile-actions">
									{!isOwnProfile && (
										<button
											className={`btn-follow ${isFollowing ? 'following' : ''}`}
											onClick={handleFollowToggle}
											disabled={followLoading}
										>
											{followLoading ? (
												<i className="fa-solid fa-spinner fa-spin"></i>
											) : isFollowing ? (
												<>
													<i className="fa-solid fa-user-check"></i>
													Following
												</>
											) : (
												<>
													<i className="fa-solid fa-user-plus"></i>
													Follow
												</>
											)}
										</button>
									)}
									{isOwnProfile && (
										<button
											className="btn-edit-profile"
											onClick={() => onNavigate && onNavigate('profile')}
										>
											<i className="fa-solid fa-pen"></i>
											Edit Profile
										</button>
									)}
								</div>
							</div>
							<h3 className="profile-display-name">{displayName}</h3>
							<p className="profile-bio">{bio}</p>

							{/* Location and Website */}
							<div className="profile-meta">
								{profile?.location && (
									<div className="profile-meta-item">
										<i className="fa-solid fa-location-dot"></i>
										<span>{profile.location}</span>
									</div>
								)}
								{profile?.website && (
									<div className="profile-meta-item">
										<i className="fa-solid fa-link"></i>
										<a href={profile.website} target="_blank" rel="noopener noreferrer">
											{profile.website.replace(/^https?:\/\//, '')}
										</a>
									</div>
								)}
							</div>

							{/* Social Links */}
							{(profile?.twitterLink || profile?.instagramLink || profile?.linkedinLink || profile?.githubLink || profile?.discordLink) && (
								<div className="profile-social-links">
									{profile?.twitterLink && (
										<a href={profile.twitterLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
											<i className="fa-brands fa-x-twitter"></i>
										</a>
									)}
									{profile?.instagramLink && (
										<a href={profile.instagramLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
											<i className="fa-brands fa-instagram"></i>
										</a>
									)}
									{profile?.linkedinLink && (
										<a href={profile.linkedinLink} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
											<i className="fa-brands fa-linkedin"></i>
										</a>
									)}
									{profile?.githubLink && (
										<a href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
											<i className="fa-brands fa-github"></i>
										</a>
									)}
									{profile?.discordLink && (
										<a href={profile.discordLink} target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
											<i className="fa-brands fa-discord"></i>
										</a>
									)}
								</div>
							)}

							<div className="profile-stats">
								<div className="stat-box">
									<span className="stat-value">{formatNumber(profile?._count?.posts || profile?.totalCreations || 0)}</span>
									<span className="stat-label">Posts</span>
								</div>
								<div className="stat-divider"></div>
								<div className="stat-box">
									<span className="stat-value">{formatNumber(profile?._count?.followers || 0)}</span>
									<span className="stat-label">Followers</span>
								</div>
								<div className="stat-divider"></div>
								<div className="stat-box">
									<span className="stat-value">{formatNumber(profile?._count?.following || 0)}</span>
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
							className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
							onClick={() => setActiveTab('posts')}
						>
							<i className="fa-solid fa-grid-2"></i> Posts
						</button>
					</div>

					<div className="profile-posts-section">
						{posts.length > 0 ? (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 px-4">
								{columns.map((column, colIndex) => (
									<div key={colIndex} className="flex flex-col">
										{column.map((post) => (
											<PostCard
												key={post.id}
												post={post}
												aspectRatio={getAspectRatio(post)}
												onShowAuthModal={() => toast.error('Please login to interact with posts')}
												onPostClick={handlePostClick}
												onUserClick={(authorId) => {
													if (authorId === currentUser?.id) {
														onNavigate?.('profile');
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
								<p className="text-sm">When @{username} posts, they'll appear here.</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<Sidebar onNavigate={onNavigate} />

			{/* Single Post View */}
			{viewingPost && selectedPostId && (
				<div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
					<SinglePost
						postId={selectedPostId}
						onBack={handleClosePost}
						onShowAuthModal={() => toast.error('Please login to interact with posts')}
					/>
				</div>
			)}
		</div>
	);
};

export default UserProfile;
