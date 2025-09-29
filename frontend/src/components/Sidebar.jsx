import React from 'react';
import Icon from './Icon';

const SuggestedUser = ({ user }) => {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
                <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <h4 className="cabin-semibold text-sm text-gray-900 dark:text-white">{user.username}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.mutualFollowers} mutual followers</p>
                </div>
            </div>
            <button className="text-blue-500 hover:text-blue-600 text-sm cabin-semibold">
                Follow
            </button>
        </div>
    );
};

const Sidebar = ({ currentUser, suggestedUsers }) => {
    return (
        <div className="hidden xl:block fixed right-4 top-20 w-80 h-full overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                {/* Current User */}
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <h3 className="cabin-semibold text-gray-900 dark:text-white">{currentUser.username}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.name}</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600 text-sm cabin-semibold">
                        Switch
                    </button>
                </div>

                {/* Suggestions for you */}
                <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="cabin-semibold text-gray-500 dark:text-gray-400 text-sm">Suggested for you</h4>
                        <button className="text-gray-900 dark:text-white text-sm cabin-regular">See All</button>
                    </div>

                    <div className="space-y-2">
                        {suggestedUsers.map((user) => (
                            <SuggestedUser key={user.id} user={user} />
                        ))}
                    </div>
                </div>

                {/* Footer Links */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                        <p>About • Help • Press • API • Jobs • Privacy</p>
                        <p>Terms • Locations • Language • Meta Verified</p>
                        <p className="pt-2">© 2025 LEELAVERSE FROM META</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;