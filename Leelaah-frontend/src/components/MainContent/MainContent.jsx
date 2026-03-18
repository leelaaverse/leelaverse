import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, setCategory } from '../../store/slices/postsSlice';
import PostCard from '../PostCard/PostCard';
import PostSkeleton from '../PostSkeleton/PostSkeleton';
import { IoLockClosedOutline } from 'react-icons/io5';
import './MainContent.css';

const GUEST_POST_LIMIT = 12;

const MainContent = ({ activeTab, onShowAuthModal, onPostClick, onUserClick }) => {
    const dispatch = useDispatch();
    const { posts, loading, loadingMore, hasMore, pagination, currentCategory, error } = useSelector(
        (state) => state.posts
    );
    const { isLoggedIn } = useSelector((state) => state.auth);
    const observerTarget = useRef(null);
    const [showLoginWall, setShowLoginWall] = useState(false);

    // Map activeTab to category
    const getCategoryFromTab = (tab) => {
        switch (tab) {
            case 'featured':
                return 'featured';
            case 'trending':
                return 'trending';
            case 'following':
                return 'following';
            default:
                return 'featured';
        }
    };

    // Fetch posts when tab changes — setCategory restores from cache if available
    useEffect(() => {
        const category = getCategoryFromTab(activeTab);
        if (category !== currentCategory) {
            dispatch(setCategory(category));
        }
    }, [activeTab, currentCategory, dispatch]);

    // Load posts if current category has no data
    // The thunk has a built-in `condition` guard that prevents re-fetch if data already exists
    useEffect(() => {
        const category = getCategoryFromTab(activeTab);
        dispatch(fetchFeedPosts({ category, page: 1, limit: 12 }));
    }, [activeTab, dispatch]);

    // Infinite scroll handler — blocked for non-logged-in users
    const handleObserver = useCallback(
        (entries) => {
            const [target] = entries;
            if (target.isIntersecting && hasMore && !loading && !loadingMore) {
                // If not logged in, show login wall instead of loading more
                if (!isLoggedIn) {
                    setShowLoginWall(true);
                    return;
                }
                const nextPage = pagination.page + 1;
                const category = getCategoryFromTab(activeTab);
                dispatch(fetchFeedPosts({ category, page: nextPage, limit: 12 }));
            }
        },
        [hasMore, loading, loadingMore, pagination.page, activeTab, dispatch, isLoggedIn]
    );

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        const element = observerTarget.current;
        const option = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver(handleObserver, option);
        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [handleObserver]);

    // Reset login wall when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            setShowLoginWall(false);
        }
    }, [isLoggedIn]);

    // Calculate aspect ratio for each post
    const getAspectRatio = useCallback((post) => {
        // First, check if aiAspectRatio is available from AI generation
        if (post.aiAspectRatio) {
            const ratio = post.aiAspectRatio;
            if (ratio === '16:9') return 'landscape';
            if (ratio === '9:16') return 'portrait';
            if (ratio === '1:1' || ratio === 'square') return 'square';
        }

        // Check if it's a video to provide better defaults
        const isVideo = post.mediaType?.startsWith('video/') ||
            post.type === 'video' ||
            post.category === 'video-post' ||
            post.mediaUrl?.includes('.mp4') ||
            post.mediaUrl?.includes('.webm') ||
            post.mediaUrl?.includes('.mov');

        // Fallback: calculate from width/height if available
        const width = post.width || post.metadata?.width || (isVideo ? 9 : 1);
        const height = post.height || post.metadata?.height || (isVideo ? 16 : 1);
        const ratio = width / height;

        // Categorize aspect ratios
        if (ratio > 1.5) return 'landscape'; // 16:9
        if (ratio < 0.7) return 'portrait'; // 9:16
        return 'square'; // 1:1
    }, []);

    // For non-logged-in users, only show first 12 posts
    const visiblePosts = useMemo(() => {
        if (!isLoggedIn && posts.length > GUEST_POST_LIMIT) {
            return posts.slice(0, GUEST_POST_LIMIT);
        }
        return posts;
    }, [posts, isLoggedIn]);

    // Distribute posts into 4 columns for masonry layout
    const columns = useMemo(() => {
        const cols = [[], [], [], []];
        const colHeights = [0, 0, 0, 0];

        visiblePosts.forEach(post => {
            const aspectRatio = getAspectRatio(post);

            // Assign weight based on aspect ratio for better distribution
            let weight = 1;
            if (aspectRatio === 'portrait') weight = 1.5;
            if (aspectRatio === 'landscape') weight = 0.7;

            // Find column with minimum height
            const minIndex = colHeights.indexOf(Math.min(...colHeights));
            cols[minIndex].push(post);
            colHeights[minIndex] += weight;
        });

        return cols;
    }, [visiblePosts, getAspectRatio]);

    // Determine if we should show the scroll target (for infinite scroll)
    const shouldShowScrollTarget = isLoggedIn && !loading && posts.length > 0 && hasMore;

    return (
        <main className="mainContent tab-content my-4" id="pills-tabContent">
            <div className="container-fluid px-2 sm:px-4">
                {/* Loading State - First Load */}
                {loading && posts.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
                        {Array.from({ length: 4 }).map((_, colIndex) => (
                            <div key={colIndex} className="flex flex-col">
                                <PostSkeleton count={3} variant="mixed" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="text-center py-12 px-8 text-red-500 dark:text-red-400">
                        <p className="text-xl mb-4">⚠️ Error loading posts</p>
                        <p className="text-sm text-red-400/70 mb-4">{error}</p>
                        <button
                            onClick={() => dispatch(fetchFeedPosts({ category: getCategoryFromTab(activeTab), page: 1, limit: 12 }))}
                            className="mt-4 px-6 py-2 bg-[#5d5fef] text-white rounded-lg cursor-pointer font-['Poppins'] hover:bg-[#4a4bcc] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Posts Content */}
                {!loading && !error && posts.length === 0 && (
                    <div className="text-center py-16 px-8 text-gray-500 dark:text-white/60 font-['Poppins']">
                        <p className="text-xl">No posts available at the moment.</p>
                        <p className="text-sm text-gray-400 dark:text-white/50 mt-2">
                            Be the first to create a post!
                        </p>
                    </div>
                )}

                {/* Masonry Grid Layout */}
                {!loading && !error && posts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
                        {columns.map((column, colIndex) => (
                            <div key={colIndex} className="flex flex-col">
                                {column.map((post) => {
                                    const aspectRatio = getAspectRatio(post);
                                    return (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            aspectRatio={aspectRatio}
                                            onShowAuthModal={onShowAuthModal}
                                            onPostClick={onPostClick}
                                            onUserClick={onUserClick}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading More State */}
                {loadingMore && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 mt-4">
                        {Array.from({ length: 4 }).map((_, colIndex) => (
                            <div key={colIndex} className="flex flex-col">
                                <PostSkeleton count={2} variant="mixed" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Observer Target — only for logged-in users */}
                {shouldShowScrollTarget && (
                    <div ref={observerTarget} className="h-12 w-full my-8"></div>
                )}

                {/* Login Wall — shown when non-logged-in user tries to scroll past 12 posts */}
                {!isLoggedIn && posts.length > 0 && (
                    <div className="relative mt-4">
                        {/* Gradient fade overlay on last row */}
                        <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-[#f5f5f5] dark:from-black to-transparent pointer-events-none z-10" />
                        
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center relative z-20">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                <IoLockClosedOutline className="text-indigo-500 dark:text-indigo-400" size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-['Poppins']">
                                Sign in to see more
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs font-['Poppins']">
                                Create an account to explore unlimited posts, videos, and AI creations
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onShowAuthModal?.('login')}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl
                                             hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 hover:scale-[1.02] active:scale-95
                                             shadow-lg shadow-indigo-500/25"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => onShowAuthModal?.('signup')}
                                    className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                                             text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5
                                             hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95"
                                >
                                    Sign up
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* No More Posts — only for logged-in users */}
                {isLoggedIn && !loading && posts.length > 0 && !hasMore && (
                    <div className="text-center py-8 text-gray-400 dark:text-white/50 font-['Poppins'] mt-8">
                        <p className="text-sm">You've reached the end!</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;
