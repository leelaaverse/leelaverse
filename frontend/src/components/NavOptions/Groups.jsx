import React from 'react';
import Icon from '../Icon';

const Groups = () => {
    return (
        <div className="space-y-6">
            <div className="text-center py-16">
                <Icon name="users" className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl cabin-semibold text-gray-900 dark:text-white mb-2">Groups</h2>
                <p className="text-gray-600 dark:text-gray-400">Join communities of AI creators and enthusiasts</p>
            </div>
        </div>
    );
};

export default Groups;
