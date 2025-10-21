// Example: Using ImageGrid in FeedPost Component
// File: frontend/src/components/FeedPost.jsx

import React from 'react';
import ImageGrid from './ImageGrid';
import Icon from './Icon';

const FeedPost = ({ post }) => {
    const handleImageClick = (index) => {
        // Open lightbox or full-screen view
        console.log('Clicked image', index, post.mediaUrls[index]);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.author.username}
                            {post.author.verified && (
                                <Icon name="check-circle" className="w-4 h-4 text-blue-500 inline ml-1" />
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {post.aiGenerated && (
                    <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center gap-1">
                        <Icon name="sparkles" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            AI Generated
                        </span>
                    </div>
                )}
            </div>

            {/* Post Caption */}
            {post.caption && (
                <div className="px-4 pb-3">
                    <p className="text-gray-800 dark:text-gray-200">
                        {post.caption}
                    </p>
                </div>
            )}

            {/* Image Grid - Multiple Images Support */}
            {post.mediaUrls && post.mediaUrls.length > 0 ? (
                <ImageGrid
                    images={post.mediaUrls}
                    onImageClick={handleImageClick}
                />
            ) : post.mediaUrl ? (
                // Fallback for single image (backward compatibility)
                <img
                    src={post.mediaUrl}
                    alt={post.caption || 'Post image'}
                    className="w-full object-cover cursor-pointer"
                    onClick={() => window.open(post.mediaUrl, '_blank')}
                />
            ) : null}

            {/* Post Actions */}
            <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                    <Icon name="heart" className="w-5 h-5" />
                    <span className="text-sm">{post.likesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <Icon name="message-circle" className="w-5 h-5" />
                    <span className="text-sm">{post.commentsCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                    <Icon name="share-2" className="w-5 h-5" />
                    <span className="text-sm">{post.sharesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors">
                    <Icon name="bookmark" className="w-5 h-5" />
                    <span className="text-sm">{post.savesCount || 0}</span>
                </button>
            </div>

            {/* AI Details (Optional) */}
            {post.aiGenerated && post.aiPrompt && (
                <div className="px-4 pb-4">
                    <details className="text-sm">
                        <summary className="cursor-pointer text-purple-600 dark:text-purple-400 hover:underline">
                            View AI Details
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Model:</span> {post.aiModel}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Prompt:</span> {post.aiPrompt}
                            </p>
                            {post.aiStyle && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Style:</span> {post.aiStyle}
                                </p>
                            )}
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Aspect Ratio:</span> {post.aiAspectRatio}
                            </p>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default FeedPost;

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Single Image Post
const singleImagePost = {
    id: '1',
    author: { username: 'john_doe', avatar: '...', verified: true },
    caption: 'Beautiful sunset!',
    mediaUrls: ['https://cloudinary.com/image1.jpg'],
    aiGenerated: true,
    aiModel: 'FLUX Schnell',
    aiPrompt: 'sunset over ocean',
    likesCount: 42,
    createdAt: '2025-01-15'
};
// Renders: Full-width single image

// Example 2: Two Images Post
const twoImagesPost = {
    id: '2',
    mediaUrls: [
        'https://cloudinary.com/image1.jpg',
        'https://cloudinary.com/image2.jpg'
    ]
};
// Renders: 50-50 side-by-side grid

// Example 3: Three Images Post
const threeImagesPost = {
    id: '3',
    mediaUrls: [
        'https://cloudinary.com/image1.jpg',
        'https://cloudinary.com/image2.jpg',
        'https://cloudinary.com/image3.jpg'
    ]
};
// Renders: Large left image + 2 stacked on right (Twitter style)

// Example 4: Four Images Post
const fourImagesPost = {
    id: '4',
    caption: 'My AI art collection',
    mediaUrls: [
        'https://cloudinary.com/image1.jpg',
        'https://cloudinary.com/image2.jpg',
        'https://cloudinary.com/image3.jpg',
        'https://cloudinary.com/image4.jpg'
    ]
};
// Renders: 2x2 perfect grid

// Example 5: Backward Compatible (Single mediaUrl)
const legacyPost = {
    id: '5',
    mediaUrl: 'https://cloudinary.com/single-image.jpg'
};
// Renders: Falls back to simple <img> tag

// ============================================
// LIGHTBOX INTEGRATION (Future Enhancement)
// ============================================

import { useState } from 'react';

const FeedPostWithLightbox = ({ post }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const handleImageClick = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <>
            <div className="bg-white rounded-2xl">
                {/* ... post content ... */}

                <ImageGrid
                    images={post.mediaUrls}
                    onImageClick={handleImageClick}
                />
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white"
                    >
                        <Icon name="x" className="w-8 h-8" />
                    </button>

                    <img
                        src={post.mediaUrls[lightboxIndex]}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* Navigation */}
                    {lightboxIndex > 0 && (
                        <button
                            onClick={() => setLightboxIndex(lightboxIndex - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                        >
                            <Icon name="chevron-left" className="w-12 h-12" />
                        </button>
                    )}

                    {lightboxIndex < post.mediaUrls.length - 1 && (
                        <button
                            onClick={() => setLightboxIndex(lightboxIndex + 1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                        >
                            <Icon name="chevron-right" className="w-12 h-12" />
                        </button>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                        {lightboxIndex + 1} / {post.mediaUrls.length}
                    </div>
                </div>
            )}
        </>
    );
};
