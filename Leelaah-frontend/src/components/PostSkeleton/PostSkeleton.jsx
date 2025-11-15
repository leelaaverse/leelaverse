import React from 'react';
import './PostSkeleton.css';

const PostSkeleton = ({ count = 4, size = 'medium' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`post-skeleton-card ${size}`}>
          <div className="skeleton-image">
            <div className="skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostSkeleton;
