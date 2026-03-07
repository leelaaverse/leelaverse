import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../../services/api';
import BloopItem from './BloopItem';
import toast from 'react-hot-toast';
import { IoArrowBack } from 'react-icons/io5';
import { PiFilmReelLight } from 'react-icons/pi';

const Bloops = ({ onBack, onViewPost }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const containerRef = useRef();

    // Fetch videos
    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            console.log('🎬 Fetching bloops - Page:', page);

            // Fetch posts with category 'video-post'
            const response = await apiService.posts.getBloops({
                page: page,
                limit: 5
            });

            console.log('🎬 Bloops API Response:', response.data);

            const newVideos = response.data.data.posts;

            console.log('🎬 New videos received:', newVideos.length);

            if (newVideos.length === 0) {
                setHasMore(false);
                console.log('🎬 No more videos to load');
            } else {
                setVideos(prev => {
                    // Filter out duplicates
                    const existingIds = new Set(prev.map(v => v.id));
                    const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v.id));
                    return [...prev, ...uniqueNewVideos];
                });

                // Set first video as active if none active
                if (!activeVideoId && newVideos.length > 0) {
                    setActiveVideoId(newVideos[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch bloops:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, [page, activeVideoId]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Intersection Observer for infinite scroll and active video detection
    const lastVideoElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Handle scroll to update active video
    const handleScroll = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const videoElements = container.querySelectorAll('.bloop-item-container');

        let maxVisibility = 0;
        let newActiveId = activeVideoId;

        videoElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate visibility percentage
            const intersectionHeight = Math.max(0, Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top));
            const visibility = intersectionHeight / rect.height;

            if (visibility > 0.6) { // If more than 60% visible
                newActiveId = el.getAttribute('data-id');
            }
        });

        if (newActiveId !== activeVideoId) {
            setActiveVideoId(newActiveId);
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Header / Back Button */}
            <div className="absolute top-0 left-0 w-full z-20 px-4 py-3 bg-linear-to-b from-black/60 to-transparent flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <IoArrowBack size={22} className="drop-shadow-md" />
                </button>
                <h1 className="text-white font-semibold text-lg drop-shadow-md tracking-wide">Bloops</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Video Container - Centered with max width */}
            <div
                ref={containerRef}
                className="h-full w-full max-w-[500px] overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
                onScroll={handleScroll}
            >
                {videos.map((video, index) => {
                    if (videos.length === index + 1) {
                        return (
                            <div
                                ref={lastVideoElementRef}
                                key={video.id}
                                data-id={video.id}
                                className="bloop-item-container w-full h-full snap-start"
                            >
                                <BloopItem
                                    post={video}
                                    isActive={activeVideoId === video.id}
                                    isMuted={isMuted}
                                    onToggleMute={toggleMute}
                                    onViewPost={onViewPost}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div
                                key={video.id}
                                data-id={video.id}
                                className="bloop-item-container w-full h-full snap-start"
                            >
                                <BloopItem
                                    post={video}
                                    isActive={activeVideoId === video.id}
                                    isMuted={isMuted}
                                    onToggleMute={toggleMute}
                                    onViewPost={onViewPost}
                                />
                            </div>
                        );
                    }
                })}

                {loading && (
                    <div className="w-full h-full flex items-center justify-center snap-start bg-black">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white/40"></div>
                    </div>
                )}

                {!loading && videos.length === 0 && (
                    <div className="w-full h-full flex flex-col items-center justify-center snap-start bg-black text-white">
                        <PiFilmReelLight size={56} className="mb-4 text-white/20" />
                        <p className="text-lg font-semibold text-white/70">No Bloops yet</p>
                        <p className="text-white/30 mt-1 text-sm">Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bloops;
