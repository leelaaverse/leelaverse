import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, setCategory } from '../../store/slices/postsSlice';
import PostCard from '../PostCard/PostCard';
import PostSkeleton from '../PostSkeleton/PostSkeleton';
import './MainContent.css';

const MainContent = ({ activeTab, onShowAuthModal, onPostClick, onUserClick }) => {
    const dispatch = useDispatch();
    const { posts, loading, loadingMore, hasMore, pagination, currentCategory, error } = useSelector(
        (state) => state.posts
    );
    const observerTarget = useRef(null);

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

    // Fetch posts when tab changes
    useEffect(() => {
        const category = getCategoryFromTab(activeTab);
        if (category !== currentCategory) {
            dispatch(setCategory(category));
            dispatch(fetchFeedPosts({ category, page: 1, limit: 12 }));
        }
    }, [activeTab, currentCategory, dispatch]);

    // Initial load
    useEffect(() => {
        if (posts.length === 0 && !loading) {
            const category = getCategoryFromTab(activeTab);
            dispatch(fetchFeedPosts({ category, page: 1, limit: 12 }));
        }
    }, []);

    // Infinite scroll handler
    const handleObserver = useCallback(
        (entries) => {
            const [target] = entries;
            if (target.isIntersecting && hasMore && !loading && !loadingMore) {
                const nextPage = pagination.page + 1;
                const category = getCategoryFromTab(activeTab);
                dispatch(fetchFeedPosts({ category, page: nextPage, limit: 12 }));
            }
        },
        [hasMore, loading, loadingMore, pagination.page, activeTab, dispatch]
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

    // Distribute posts into 4 columns for masonry layout
    const columns = useMemo(() => {
        const cols = [[], [], [], []];
        const colHeights = [0, 0, 0, 0];

        posts.forEach(post => {
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
    }, [posts, getAspectRatio]);

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

                {/* Infinite Scroll Observer Target */}
                {!loading && posts.length > 0 && hasMore && (
                    <div ref={observerTarget} className="h-12 w-full my-8"></div>
                )}

                {/* No More Posts */}
                {!loading && posts.length > 0 && !hasMore && (
                    <div className="text-center py-8 text-gray-400 dark:text-white/50 font-['Poppins'] mt-8">
                        <p className="text-sm">You've reached the end!</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;
