import React from 'react';
import Icon from './Icon';

const SocialNavigation = ({ activeTab, setActiveTab, isDarkMode }) => {
    const navItems = [
        { id: 'home', icon: 'home', label: 'Neural Feed', aiFeature: true },
        { id: 'explore', icon: 'compass', label: 'Explore AI', aiFeature: true },
        { id: 'create', icon: 'cpu', label: 'AI Studio', aiFeature: true },
        { id: 'activity', icon: 'zap', label: 'Activity', aiFeature: false },
        { id: 'profile', icon: 'user', label: 'Profile', aiFeature: false }
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 z-40 shadow-2xl">
                <div className="p-8">
                    {/* Enhanced Logo */}
                    <div className="flex items-center space-x-4 mb-12">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl zalando-sans-expanded-bold">L</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl zalando-sans-expanded-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                LeelaVerse
                            </h1>
                            <p className="text-xs cabin-regular text-gray-500 dark:text-gray-400">AI Social Universe</p>
                        </div>
                    </div>

                    {/* Enhanced Navigation */}
                    <ul className="space-y-3">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 cabin-semibold group ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl transform scale-105'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-750 hover:scale-102'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-xl ${activeTab === item.id
                                            ? 'bg-white/20 backdrop-blur-sm'
                                            : 'bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                                            }`}>
                                            <Icon
                                                name={item.icon}
                                                className={`w-5 h-5 ${activeTab === item.id
                                                    ? 'text-white'
                                                    : 'text-gray-600 dark:text-gray-400 group-hover:text-indigo-600'
                                                    }`}
                                            />
                                        </div>
                                        <span className="text-base">{item.label}</span>
                                    </div>
                                    {item.aiFeature && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${activeTab === item.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-400'
                                            }`}>
                                            AI
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* AI Status Panel */}
                    <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                <Icon name="cpu" className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="cabin-semibold text-gray-900 dark:text-white text-sm">Neural Network</h4>
                                <p className="text-xs cabin-regular text-gray-600 dark:text-gray-400">Online & Learning</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs cabin-regular">
                                <span className="text-gray-600 dark:text-gray-400">AI Models Active:</span>
                                <span className="text-indigo-600 dark:text-indigo-400 cabin-semibold">12</span>
                            </div>
                            <div className="flex justify-between text-xs cabin-regular">
                                <span className="text-gray-600 dark:text-gray-400">Creations Today:</span>
                                <span className="text-indigo-600 dark:text-indigo-400 cabin-semibold">847</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <Icon
                                name={item.icon}
                                className={`w-6 h-6 mb-1 ${activeTab === item.id
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            />
                            <span className="text-xs cabin-regular">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default SocialNavigation;