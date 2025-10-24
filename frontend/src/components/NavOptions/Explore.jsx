import React from 'react';
import Icon from '../Icon';

const Explore = () => {
    return (
        <div className="space-y-6">
            <div className="text-center py-16">
                <Icon name="search" className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl cabin-semibold text-gray-900 dark:text-white mb-2">Explore</h2>
                <p className="text-gray-600 dark:text-gray-400">Discover trending AI content and creators</p>
            </div>
        </div>
    );
};

export default Explore;
