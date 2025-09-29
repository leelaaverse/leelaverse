import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

const TopBar = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
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
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        >
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/32'}
                                alt={user?.username}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <Icon name="chevron-down" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.username}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email}</p>
                                </div>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Icon name="user" className="w-4 h-4" />
                                    <span>Profile</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Icon name="settings" className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        onLogout();
                                    }}
                                >
                                    <Icon name="log-out" className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;