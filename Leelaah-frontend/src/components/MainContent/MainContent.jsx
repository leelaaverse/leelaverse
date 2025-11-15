import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, setCategory } from '../../store/slices/postsSlice';
import PostCard from '../PostCard/PostCard';
import PostSkeleton from '../PostSkeleton/PostSkeleton';
import './MainContent.css';

const MainContent = ({ activeTab }) => {
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

    // Group posts into rows
    const groupPosts = () => {
        const rows = [];
        let index = 0;

        // First row: 2 large posts (if available)
        if (posts.length >= 2) {
            rows.push({
                type: 'large',
                posts: posts.slice(0, 2),
            });
            index = 2;
        } else if (posts.length === 1) {
            rows.push({
                type: 'large',
                posts: [posts[0]],
            });
            index = 1;
        }

        // Remaining rows: 4 medium posts each
        while (index < posts.length) {
            const rowPosts = posts.slice(index, index + 4);
            rows.push({
                type: 'medium',
                posts: rowPosts,
            });
            index += 4;
        }

        return rows;
    };

    const rows = groupPosts();

    return (
        <main className="mainContent tab-content my-4" id="pills-tabContent">
            <div className="container-fluid">
                {/* Loading State - First Load */}
                {loading && posts.length === 0 && (
                    <>
                        {/* Large Posts Skeleton */}
                        <div className="row mainContentRow">
                            <div className="col-md-6">
                                <PostSkeleton count={1} size="large" />
                            </div>
                            <div className="col-md-6">
                                <PostSkeleton count={1} size="large" />
                            </div>
                        </div>

                        {/* Medium Posts Skeleton */}
                        <div className="row mt-3 mainContentRow">
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                        </div>

                        <div className="row mt-3 mainContentRow">
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                            <div className="col-md-3">
                                <PostSkeleton count={1} size="medium" />
                            </div>
                        </div>
                    </>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="error-message" style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        color: '#ff6b6b'
                    }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠️ Error loading posts</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 107, 107, 0.7)' }}>{error}</p>
                        <button
                            onClick={() => dispatch(fetchFeedPosts({ category: getCategoryFromTab(activeTab), page: 1, limit: 12 }))}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1.5rem',
                                background: '#5d5fef',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Posts Content */}
                {!loading && !error && posts.length === 0 && (
                    <div className="no-posts-message">
                        <p>No posts available at the moment.</p>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                            Be the first to create a post!
                        </p>
                    </div>
                )}

                {rows.map((row, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className={`row ${rowIndex > 0 ? 'mt-3' : ''} mainContentRow`}
                    >
                        {row.type === 'large' ? (
                            <>
                                {row.posts.map((post, postIndex) => (
                                    <div className="col-md-6" key={post.id}>
                                        <PostCard post={post} size="large" />
                                    </div>
                                ))}
                                {/* Fill empty space if only 1 large post */}
                                {row.posts.length === 1 && <div className="col-md-6"></div>}
                            </>
                        ) : (
                            <>
                                {row.posts.map((post, postIndex) => (
                                    <div className="col-md-3" key={post.id}>
                                        <PostCard post={post} size="medium" />
                                    </div>
                                ))}
                                {/* Fill empty spaces */}
                                {Array.from({ length: 4 - row.posts.length }).map((_, i) => (
                                    <div className="col-md-3" key={`empty-${i}`}></div>
                                ))}
                            </>
                        )}
                    </div>
                ))}

                {/* Loading More State */}
                {loadingMore && (
                    <div className="row mt-3 mainContentRow">
                        <div className="col-md-3">
                            <PostSkeleton count={1} size="medium" />
                        </div>
                        <div className="col-md-3">
                            <PostSkeleton count={1} size="medium" />
                        </div>
                        <div className="col-md-3">
                            <PostSkeleton count={1} size="medium" />
                        </div>
                        <div className="col-md-3">
                            <PostSkeleton count={1} size="medium" />
                        </div>
                    </div>
                )}

                {/* Infinite Scroll Observer Target */}
                {!loading && posts.length > 0 && hasMore && (
                    <div ref={observerTarget} className="observer-target"></div>
                )}

                {/* No More Posts */}
                {!loading && posts.length > 0 && !hasMore && (
                    <div className="no-more-posts">
                        <p>You've reached the end!</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;
