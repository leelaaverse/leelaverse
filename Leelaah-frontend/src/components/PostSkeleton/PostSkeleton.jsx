import React from 'react';
import './PostSkeleton.css';

const PostSkeleton = ({ count = 4, variant = 'mixed' }) => {
  // Generate varying heights for masonry effect
  const getRandomHeight = (index) => {
    const heights = [
      'h-[250px]', // landscape-ish
      'h-[350px]', // square-ish
      'h-[450px]', // portrait-ish
      'h-[300px]', // medium
      'h-[400px]', // tall
      'h-[280px]', // short
    ];
    return heights[index % heights.length];
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`relative w-full overflow-hidden rounded-lg mb-2 md:mb-3 bg-gray-900/50 ${getRandomHeight(index)}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostSkeleton;
