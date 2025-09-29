import React from 'react';
import Icon from './Icon';

const TopBar = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
    return (
        <div className="md:ml-64 fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-3 md:hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm zalando-sans-expanded-bold">L</span>
                    </div>
                    <h1 className="text-lg zalando-sans-expanded-primary text-gray-900 dark:text-white">Leelaverse</h1>
                </div>

                {/* Desktop Title */}
                <div className="hidden md:block">
                    <h1 className="text-xl zalando-sans-expanded-primary text-gray-900 dark:text-white">Feed</h1>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Icon name="heart" className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Icon name="send" className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Profile/Logout Menu */}
                    <div className="relative">
                        <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/32'}
                                alt={user?.username}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;