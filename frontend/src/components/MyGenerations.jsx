import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import ImageGrid from './ImageGrid';
import CreatePostModal from './CreatePostModal';

const MyGenerations = ({ user }) => {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState(null);

    useEffect(() => {
        fetchGenerations();
    }, [currentPage]);

    const fetchGenerations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'

            if (!token) {
                setError('You need to log in to view your AI generations');
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/posts/my-generations?page=${currentPage}&limit=12`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setGenerations(data.data.generations);
                setTotalPages(data.data.pagination.totalPages);
                setError(null);
            } else {
                // Handle authentication errors specifically
                if (response.status === 401) {
                    setError('Your session has expired. Please log in again.');
                    // Optionally clear the invalid token
                    localStorage.removeItem('accessToken');
                } else {
                    setError(data.message || 'Failed to fetch generations');
                }
            }
        } catch (err) {
            console.error('Error fetching generations:', err);
            setError('Failed to load your AI generations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = (generation) => {
        setSelectedGeneration(generation);
        setShowPostModal(true);
    };

    const handlePostCreated = () => {
        // Refresh generations after post is created
        fetchGenerations();
        setShowPostModal(false);
        setSelectedGeneration(null);
    };

    const handleDownload = async (generation) => {
        try {
            const imageUrls = generation.resultUrls && generation.resultUrls.length > 0
                ? generation.resultUrls
                : [generation.resultUrl];

            // Download all images
            for (let i = 0; i < imageUrls.length; i++) {
                const response = await fetch(imageUrls[i]);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const filename = imageUrls.length > 1
                    ? `${generation.prompt.slice(0, 30)}_${i + 1}.jpg`
                    : `${generation.prompt.slice(0, 30)}.jpg`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Small delay between downloads to prevent browser blocking
                if (i < imageUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-2"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                            {/* Image Skeleton */}
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            {/* Info Skeleton */}
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                <div className="flex justify-between">
                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800/30 rounded-3xl p-8 text-center backdrop-blur-sm">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="alert-circle" className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl cabin-semibold text-gray-900 dark:text-white mb-2">Oops!</h3>
                    <p className="text-red-600 dark:text-red-400 cabin-regular mb-6">{error}</p>
                    <button
                        onClick={fetchGenerations}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl cabin-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (generations.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-pink-900/20 rounded-3xl flex items-center justify-center shadow-lg">
                        <Icon name="image" className="w-16 h-16 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Icon name="sparkles" className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-3xl cabin-bold text-gray-900 dark:text-white mb-3">
                    No Creations Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 cabin-regular mb-8 max-w-md mx-auto">
                    Start your creative journey with AI-powered image generation. Transform your ideas into stunning visuals.
                </p>
                <button className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_100%] text-white rounded-full cabin-semibold hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 animate-gradient">
                    <Icon name="plus-circle" className="w-5 h-5 inline mr-2" />
                    Create Your First Image
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Modern Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl cabin-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        My AI Gallery
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 cabin-regular mt-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {generations.length} unpublished creation{generations.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={fetchGenerations}
                    className="group p-3 bg-gray-100 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all hover:scale-105"
                    title="Refresh"
                >
                    <Icon name="refresh-cw" className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:rotate-180 transition-all duration-500" />
                </button>
            </div>

            {/* Minimalist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {generations.map((generation) => (
                    <div
                        key={generation.id}
                        className="group relative bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
                    >
                        {/* Image Container with Perfect Square */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                            {/* Check if generation has multiple images (from resultUrls array or single resultUrl) */}
                            {generation.resultUrls && generation.resultUrls.length > 1 ? (
                                <div className="w-full h-full p-2">
                                    <ImageGrid
                                        images={generation.resultUrls}
                                        onImageClick={(idx) => setSelectedImage({ ...generation, selectedImageIndex: idx })}
                                        className="cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <img
                                    src={generation.resultUrl || generation.resultUrls?.[0] || generation.thumbnailUrl}
                                    alt={generation.prompt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                    onClick={() => setSelectedImage(generation)}
                                />
                            )}

                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {/* Quick Actions - Bottom Floating */}
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreatePost(generation);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cabin-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Icon name="send" className="w-4 h-4" />
                                        Post
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(generation);
                                        }}
                                        className="px-4 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl cabin-semibold hover:bg-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                                        title={generation.resultUrls && generation.resultUrls.length > 1 ? `Download ${generation.resultUrls.length} images` : 'Download image'}
                                    >
                                        <Icon name="download" className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Model Badge - Top Left */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs rounded-full cabin-semibold flex items-center gap-1.5">
                                        <Icon name="cpu" className="w-3 h-3" />
                                        {generation.model}
                                    </span>
                                    {/* Multiple Images Badge */}
                                    {generation.resultUrls && generation.resultUrls.length > 1 && (
                                        <span className="px-3 py-1.5 bg-purple-600/80 backdrop-blur-md text-white text-xs rounded-full cabin-semibold flex items-center gap-1.5">
                                            <Icon name="image" className="w-3 h-3" />
                                            {generation.resultUrls.length}
                                        </span>
                                    )}
                                </div>

                                {/* Aspect Ratio Badge - Top Right */}
                                {generation.aspectRatio && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs rounded-full cabin-medium">
                                            {generation.aspectRatio}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Minimal Info Section */}
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 cabin-regular line-clamp-2 leading-relaxed">
                                {generation.prompt}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 cabin-medium flex items-center gap-1.5">
                                    <Icon name="calendar" className="w-3.5 h-3.5" />
                                    {new Date(generation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                {generation.seed && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-lg cabin-mono text-[10px]">
                                        #{generation.seed.slice(0, 6)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:scale-105 disabled:hover:scale-100"
                    >
                        <Icon name="chevron-left" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            // Show first 2, current, and last 2 pages
                            let page;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[44px] h-11 rounded-xl cabin-semibold text-sm transition-all ${currentPage === page
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:scale-105 disabled:hover:scale-100"
                    >
                        <Icon name="chevron-right" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            )}

            {/* Modern Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-14 right-0 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110 z-10"
                        >
                            <Icon name="x" className="w-6 h-6" />
                        </button>

                        {/* Main Content */}
                        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            {/* Image */}
                            <div className="relative bg-black">
                                {selectedImage.resultUrls && selectedImage.resultUrls.length > 1 ? (
                                    // Multiple Images - Show Grid or Selected Image
                                    <div className="p-4">
                                        {selectedImage.selectedImageIndex !== undefined ? (
                                            <img
                                                src={selectedImage.resultUrls[selectedImage.selectedImageIndex]}
                                                alt={selectedImage.prompt}
                                                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                                            />
                                        ) : (
                                            <div className="max-w-4xl mx-auto">
                                                <ImageGrid
                                                    images={selectedImage.resultUrls}
                                                    onImageClick={(idx) => setSelectedImage({ ...selectedImage, selectedImageIndex: idx })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Single Image
                                    <img
                                        src={selectedImage.resultUrl || selectedImage.resultUrls?.[0]}
                                        alt={selectedImage.prompt}
                                        className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                                    />
                                )}

                                {/* Floating Badges */}
                                <div className="absolute top-6 left-6 flex gap-3">
                                    <span className="px-4 py-2 bg-black/70 backdrop-blur-md text-white text-sm rounded-full cabin-semibold flex items-center gap-2">
                                        <Icon name="cpu" className="w-4 h-4" />
                                        {selectedImage.model}
                                    </span>
                                    {selectedImage.resultUrls && selectedImage.resultUrls.length > 1 && (
                                        <span className="px-4 py-2 bg-purple-600/80 backdrop-blur-md text-white text-sm rounded-full cabin-semibold flex items-center gap-2">
                                            <Icon name="image" className="w-4 h-4" />
                                            {selectedImage.resultUrls.length} images
                                        </span>
                                    )}
                                    {selectedImage.aspectRatio && (
                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm rounded-full cabin-medium">
                                            {selectedImage.aspectRatio}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info Panel */}
                            <div className="p-6 space-y-4">
                                {/* Prompt */}
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <p className="text-white cabin-regular leading-relaxed">{selectedImage.prompt}</p>
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                        <p className="text-xs text-gray-400 cabin-medium mb-1">Date</p>
                                        <p className="text-sm text-white cabin-semibold">
                                            {new Date(selectedImage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                        <p className="text-xs text-gray-400 cabin-medium mb-1">Steps</p>
                                        <p className="text-sm text-white cabin-semibold">{selectedImage.steps || 'Auto'}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                        <p className="text-xs text-gray-400 cabin-medium mb-1">Quality</p>
                                        <p className="text-sm text-white cabin-semibold">{selectedImage.quality || 'High'}</p>
                                    </div>
                                    {selectedImage.seed && (
                                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                            <p className="text-xs text-gray-400 cabin-medium mb-1">Seed</p>
                                            <p className="text-sm text-white cabin-mono">#{selectedImage.seed.slice(0, 8)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setSelectedImage(null);
                                            handleCreatePost(selectedImage);
                                        }}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cabin-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Icon name="send" className="w-5 h-5" />
                                        Create Post
                                    </button>
                                    <button
                                        onClick={() => handleDownload(selectedImage)}
                                        className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl cabin-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Icon name="download" className="w-5 h-5" />
                                        {selectedImage.resultUrls && selectedImage.resultUrls.length > 1
                                            ? `Download All (${selectedImage.resultUrls.length})`
                                            : 'Download'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const imageUrl = selectedImage.selectedImageIndex !== undefined && selectedImage.resultUrls
                                                ? selectedImage.resultUrls[selectedImage.selectedImageIndex]
                                                : selectedImage.resultUrl || selectedImage.resultUrls?.[0];
                                            window.open(imageUrl, '_blank');
                                        }}
                                        className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl cabin-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Icon name="external-link" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Post Modal - Pre-filled with selected generation */}
            {showPostModal && selectedGeneration && (
                <CreatePostModal
                    isOpen={showPostModal}
                    onClose={() => {
                        setShowPostModal(false);
                        setSelectedGeneration(null);
                    }}
                    currentUser={user}
                    onPostCreated={handlePostCreated}
                    prefilledData={{
                        imageUrls: selectedGeneration.resultUrls && selectedGeneration.resultUrls.length > 0
                            ? selectedGeneration.resultUrls
                            : [selectedGeneration.resultUrl],
                        aiGenerationIds: [selectedGeneration.id],
                        prompt: selectedGeneration.prompt,
                        aiGenerated: true,
                        selectedModel: selectedGeneration.model,
                        aspectRatio: selectedGeneration.aspectRatio,
                        style: selectedGeneration.style
                    }}
                />
            )}
        </div>
    );
};

export default MyGenerations;
