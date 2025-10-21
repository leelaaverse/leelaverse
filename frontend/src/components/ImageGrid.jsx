import React from 'react';

/**
 * Twitter-like Image Grid Component
 * Displays 1-4 images in responsive layouts:
 * - 1 image: Full width
 * - 2 images: Side by side
 * - 3 images: Large left + 2 stacked right
 * - 4 images: 2x2 grid
 */
const ImageGrid = ({ images, className = '', onImageClick = null }) => {
    if (!images || images.length === 0) return null;

    const imageCount = Math.min(images.length, 4);

    // Single image layout
    if (imageCount === 1) {
        return (
            <div className={`w-full ${className}`}>
                <div
                    className="relative w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                    style={{ maxHeight: '600px' }}
                    onClick={() => onImageClick && onImageClick(0)}
                >
                    <img
                        src={images[0]}
                        alt="Post image"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>
        );
    }

    // Two images layout (side by side)
    if (imageCount === 2) {
        return (
            <div className={`w-full grid grid-cols-2 gap-1 ${className}`}>
                {images.slice(0, 2).map((img, idx) => (
                    <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                        style={{ height: '300px' }}
                        onClick={() => onImageClick && onImageClick(idx)}
                    >
                        <img
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Three images layout (large left + 2 stacked right)
    if (imageCount === 3) {
        return (
            <div className={`w-full grid grid-cols-2 gap-1 ${className}`}>
                {/* Large image on the left */}
                <div
                    className="relative row-span-2 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                    style={{ height: '400px' }}
                    onClick={() => onImageClick && onImageClick(0)}
                >
                    <img
                        src={images[0]}
                        alt="Post image 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Two stacked images on the right */}
                <div className="flex flex-col gap-1">
                    {images.slice(1, 3).map((img, idx) => (
                        <div
                            key={idx + 1}
                            className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                            style={{ height: '199.5px' }}
                            onClick={() => onImageClick && onImageClick(idx + 1)}
                        >
                            <img
                                src={img}
                                alt={`Post image ${idx + 2}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Four images layout (2x2 grid)
    if (imageCount === 4) {
        return (
            <div className={`w-full grid grid-cols-2 gap-1 ${className}`}>
                {images.slice(0, 4).map((img, idx) => (
                    <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                        style={{ height: '250px' }}
                        onClick={() => onImageClick && onImageClick(idx)}
                    >
                        <img
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default ImageGrid;
