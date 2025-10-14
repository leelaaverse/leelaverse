import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const MyGenerations = ({ user }) => {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
                `${ 'http://localhost:3000'}/api/posts/my-generations?page=${currentPage}&limit=12`,
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
        // This will be implemented later to create a post from the generation
        console.log('Create post from generation:', generation);
        // TODO: Open create post modal with pre-filled image
    };

    const handleDownload = async (imageUrl, prompt) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prompt.slice(0, 30)}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 cabin-regular">Loading your AI creations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <Icon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400 cabin-medium">{error}</p>
                <button
                    onClick={fetchGenerations}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cabin-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (generations.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Icon name="image" className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl cabin-semibold text-gray-900 dark:text-white mb-2">
                    No AI Creations Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 cabin-regular mb-6">
                    Start creating stunning AI-generated images with our powerful tools
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full cabin-semibold hover:shadow-lg hover:scale-105 transition-all">
                    Create Your First Image
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl cabin-bold text-gray-900 dark:text-white">
                        My AI Generations
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 cabin-regular mt-1">
                        {generations.length} unpublished creation{generations.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={fetchGenerations}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <Icon name="refresh-cw" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Grid of AI Generations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.map((generation) => (
                    <div
                        key={generation._id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <img
                                src={generation.resultUrl || generation.thumbnailUrl}
                                alt={generation.prompt}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => setSelectedImage(generation)}
                            />

                            {/* Model Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-full cabin-semibold">
                                    {generation.model}
                                </span>
                            </div>

                            {/* Quick Actions Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
                                <button
                                    onClick={() => handleCreatePost(generation)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg cabin-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <Icon name="plus-circle" className="w-4 h-4" />
                                    Post
                                </button>
                                <button
                                    onClick={() => handleDownload(generation.resultUrl, generation.prompt)}
                                    className="px-4 py-2 bg-white/90 text-gray-900 rounded-lg cabin-semibold hover:bg-white transition-colors flex items-center gap-2"
                                >
                                    <Icon name="download" className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 cabin-regular line-clamp-2 mb-2">
                                {generation.prompt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span className="cabin-medium">
                                    {new Date(generation.createdAt).toLocaleDateString()}
                                </span>
                                {generation.parameters?.aspectRatio && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded cabin-medium">
                                        {generation.parameters.aspectRatio}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Icon name="chevron-left" className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg cabin-semibold transition-colors ${
                                    currentPage === page
                                        ? 'bg-purple-600 text-white'
                                        : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Icon name="chevron-right" className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Icon name="x" className="w-6 h-6" />
                        </button>

                        {/* Image */}
                        <img
                            src={selectedImage.resultUrl}
                            alt={selectedImage.prompt}
                            className="w-full h-auto rounded-2xl shadow-2xl"
                        />

                        {/* Info Bar */}
                        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4">
                            <p className="text-white cabin-regular mb-3">{selectedImage.prompt}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-white/70">
                                    <span className="cabin-medium">{selectedImage.model}</span>
                                    <span>{selectedImage.parameters?.aspectRatio}</span>
                                    <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCreatePost(selectedImage)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg cabin-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        <Icon name="plus-circle" className="w-4 h-4" />
                                        Create Post
                                    </button>
                                    <button
                                        onClick={() => handleDownload(selectedImage.resultUrl, selectedImage.prompt)}
                                        className="px-4 py-2 bg-white text-gray-900 rounded-lg cabin-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        <Icon name="download" className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyGenerations;
