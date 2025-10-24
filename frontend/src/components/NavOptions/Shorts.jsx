import React from 'react';
import Icon from '../Icon';

const Shorts = () => {
    return (
        <div className="space-y-6">
            <div className="text-center py-16">
                <Icon name="video" className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl cabin-semibold text-gray-900 dark:text-white mb-2">Shorts</h2>
                <p className="text-gray-600 dark:text-gray-400">Short-form AI-generated videos coming soon</p>
            </div>
        </div>
    );
};

export default Shorts;
