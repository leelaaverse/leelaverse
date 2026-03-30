import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import SinglePost from '../SinglePost/SinglePost';
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
								{Array.from({ length: 4 }).map((_, colIndex) => {
									const columnPosts = posts.filter((_, idx) => idx % 4 === colIndex);
									return (
										<div key={colIndex} className="flex flex-col gap-1 md:gap-2">
											{columnPosts.map((post) => {
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
														className="relative w-full overflow-hidden rounded-lg cursor-pointer group"
														onClick={() => handlePostClick(post.id)}
													>
														{post.mediaUrl || post.thumbnailUrl ? (
															isVideo ? (
																<video
																	src={post.mediaUrl}
																	className="w-full h-auto block"
																	muted
																	playsInline
																	onMouseEnter={(e) => e.target.play()}
																	onMouseLeave={(e) => e.target.pause()}
																/>
															) : (
																<img
																	src={post.thumbnailUrl || post.mediaUrl}
																	alt={post.title || 'Post'}
																	className="w-full h-auto block"
																	loading="lazy"
																/>
															)
														) : (
															<div className="w-full flex flex-col items-center justify-center text-white/60 bg-gray-800/80 rounded-lg py-16">
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
														<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
															<div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white">
																<span className="flex items-center gap-1">
																	<i className="fa-solid fa-heart"></i>
																	{post.likesCount || post._count?.likes || 0}
																</span>
																<span className="flex items-center gap-1">
																	<i className="fa-solid fa-comment"></i>
																	{post.commentsCount || post._count?.comments || 0}
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
