import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import SocialNavigation from './SocialNavigation';
import TopBar from './TopBar';
import Stories from './Stories';
import PostCard from './PostCard';
import Sidebar from './Sidebar';
import Icon from './Icon';
import { mockPosts, mockStories, mockSuggestedUsers, mockCurrentUser } from '../data/mockData';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    // Enhanced user object with mock data
    const currentUser = {
        ...mockCurrentUser,
        username: user?.username || mockCurrentUser.username,
        firstName: user?.firstName || mockCurrentUser.name,
        avatar: user?.avatar || mockCurrentUser.avatar
    };

    // AI Theme colors and effects
    const [aiParticles, setAiParticles] = useState([]);

    useEffect(() => {
        // Generate floating AI particles
        const particles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.3 + 0.1
        }));
        setAiParticles(particles);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        {/* AI Universe Welcome Banner */}
                        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden">
                            <div className="absolute inset-0 opacity-30">
                                <div className="w-full h-full bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-full blur-3xl"></div>
                            </div>
                            <div className="relative z-10 text-center">
                                <h2 className="text-2xl sm:text-3xl zalando-sans-expanded-bold text-white mb-2">Welcome to the AI Universe</h2>
                                <p className="cabin-regular text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">Where creativity meets artificial intelligence</p>
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-white cabin-semibold text-xs sm:text-sm">
                                        ✨ AI-Generated
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-white cabin-semibold text-xs sm:text-sm">
                                        🎨 Creative
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-white cabin-semibold text-xs sm:text-sm">
                                        🌟 Unique
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Panel */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl zalando-sans-expanded-primary text-gray-900 dark:text-white mb-4">Create Something Amazing</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <button className="group bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white transition-all transform hover:scale-105 active:scale-95">
                                    <Icon name="image" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="cabin-semibold text-xs sm:text-sm">AI Art</span>
                                </button>
                                <button className="group bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white transition-all transform hover:scale-105 active:scale-95">
                                    <Icon name="video" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="cabin-semibold text-xs sm:text-sm">AI Video</span>
                                </button>
                                <button className="group bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white transition-all transform hover:scale-105 active:scale-95">
                                    <Icon name="mic" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="cabin-semibold text-xs sm:text-sm">AI Audio</span>
                                </button>
                                <button className="group bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white transition-all transform hover:scale-105 active:scale-95">
                                    <Icon name="edit-3" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="cabin-semibold text-xs sm:text-sm">AI Text</span>
                                </button>
                            </div>
                        </div>

                        {/* AI Stories Showcase */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl zalando-sans-expanded-primary text-gray-900 dark:text-white">AI Creators Today</h3>
                                <button className="text-indigo-600 dark:text-indigo-400 cabin-semibold text-xs sm:text-sm hover:text-indigo-700 dark:hover:text-indigo-300">
                                    View All
                                </button>
                            </div>
                            <Stories stories={mockStories} currentUser={currentUser} />
                        </div>

                        {/* Neural Feed */}
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-xl sm:text-2xl zalando-sans-expanded-primary text-gray-900 dark:text-white text-center">
                                Neural Feed
                                <span className="block text-xs sm:text-sm cabin-regular text-gray-600 dark:text-gray-300 mt-1">AI-curated content just for you</span>
                            </h3>
                            {mockPosts.map((post, index) => (
                                <div key={post.id} className="relative">
                                    {/* Glowing effect for every 3rd post */}
                                    {index % 3 === 0 && (
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-lg"></div>
                                    )}
                                    <PostCard post={post} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'explore':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        {/* AI Discovery Hub */}
                        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
                            <h2 className="text-2xl sm:text-3xl zalando-sans-expanded-bold mb-3 sm:mb-4">AI Discovery Hub</h2>
                            <p className="cabin-regular text-purple-100 mb-4 sm:mb-6 text-sm sm:text-base">Explore the infinite possibilities of AI creativity</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-colors cursor-pointer group">
                                    <Icon name="trending-up" className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-white" />
                                    <h3 className="text-base sm:text-lg zalando-sans-expanded-primary mb-2 text-white">Trending AI</h3>
                                    <p className="cabin-regular text-xs sm:text-sm text-purple-100">Latest viral AI creations</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-colors cursor-pointer group">
                                    <Icon name="zap" className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-white" />
                                    <h3 className="text-base sm:text-lg zalando-sans-expanded-primary mb-2 text-white">AI Challenges</h3>
                                    <p className="cabin-regular text-xs sm:text-sm text-purple-100">Join creative competitions</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-colors cursor-pointer group">
                                    <Icon name="award" className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 group-hover:scale-110 transition-transform text-white" />
                                    <h3 className="text-base sm:text-lg zalando-sans-expanded-primary mb-2 text-white">Top Creators</h3>
                                    <p className="cabin-regular text-xs sm:text-sm text-purple-100">Follow the best AI artists</p>
                                </div>
                            </div>
                        </div>

                        {/* Trending Tags */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl zalando-sans-expanded-primary text-gray-900 dark:text-white mb-3 sm:mb-4">Trending in AI Universe</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {['#AIArt', '#NeuralStyle', '#DigitalCreativity', '#AIPhotography', '#MachineLearning', '#GenerativeAI', '#AIMusic', '#DeepDream'].map((tag) => (
                                    <span key={tag} className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full cabin-semibold text-xs sm:text-sm hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800 dark:hover:to-purple-800 cursor-pointer transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'create':
                return (
                    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        {/* AI Studio Header */}
                        <div className="text-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
                            <h2 className="text-3xl sm:text-4xl zalando-sans-expanded-bold mb-3 sm:mb-4">AI Creation Studio</h2>
                            <p className="text-lg sm:text-xl cabin-regular text-emerald-100">Turn your imagination into reality</p>
                        </div>

                        {/* Creation Tools Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {[
                                { icon: 'image', title: 'AI Image Generator', desc: 'Create stunning visuals from text', color: 'from-pink-500 to-rose-500', feature: 'Most Popular' },
                                { icon: 'video', title: 'AI Video Creator', desc: 'Generate amazing video content', color: 'from-blue-500 to-indigo-500', feature: 'New' },
                                { icon: 'music', title: 'AI Music Composer', desc: 'Compose original soundtracks', color: 'from-purple-500 to-violet-500', feature: 'Beta' },
                                { icon: 'edit-3', title: 'AI Text Writer', desc: 'Generate creative content', color: 'from-green-500 to-emerald-500', feature: '' },
                                { icon: 'layers', title: 'AI Style Transfer', desc: 'Transform artistic styles', color: 'from-orange-500 to-red-500', feature: 'Premium' },
                                { icon: 'cpu', title: 'Custom AI Model', desc: 'Train your own AI', color: 'from-gray-600 to-gray-800', feature: 'Pro' }
                            ].map((tool, index) => (
                                <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer">
                                    <div className="relative">
                                        {tool.feature && (
                                            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs zalando-sans-expanded-bold px-2 py-1 rounded-full">
                                                {tool.feature}
                                            </span>
                                        )}
                                        <div className={`bg-gradient-to-r ${tool.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                            <Icon name={tool.icon} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <h3 className="text-base sm:text-lg zalando-sans-expanded-primary text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                                        <p className="cabin-regular text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{tool.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white text-center">
                            <h2 className="text-2xl sm:text-3xl zalando-sans-expanded-bold mb-3 sm:mb-4">Neural Activity Center</h2>
                            <p className="cabin-regular text-orange-100 text-sm sm:text-base">Track your AI universe interactions</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 text-center">
                                <Icon name="heart" className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-xl sm:text-2xl zalando-sans-expanded-bold text-gray-900 dark:text-white mb-1 sm:mb-2">1.2k</h3>
                                <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">Likes Received</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 text-center">
                                <Icon name="message-circle" className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-xl sm:text-2xl zalando-sans-expanded-bold text-gray-900 dark:text-white mb-1 sm:mb-2">346</h3>
                                <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">Comments</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 text-center">
                                <Icon name="users" className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-xl sm:text-2xl zalando-sans-expanded-bold text-gray-900 dark:text-white mb-1 sm:mb-2">89</h3>
                                <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">New Followers</p>
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        {/* Profile Header with AI Theme */}
                        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl sm:rounded-3xl overflow-hidden">
                            <div className="relative p-6 sm:p-8">
                                {/* Floating particles background */}
                                <div className="absolute inset-0 overflow-hidden">
                                    {aiParticles.map((particle) => (
                                        <div
                                            key={particle.id}
                                            className="absolute bg-white rounded-full animate-pulse"
                                            style={{
                                                left: `${particle.x}%`,
                                                top: `${particle.y}%`,
                                                width: `${particle.size}px`,
                                                height: `${particle.size}px`,
                                                opacity: particle.opacity
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 sm:space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={currentUser.avatar}
                                            alt={currentUser.username}
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/30"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-1.5 sm:p-2">
                                            <Icon name="zap" className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left flex-1 text-white">
                                        <h1 className="text-2xl sm:text-3xl zalando-sans-expanded-bold mb-1 sm:mb-2">{currentUser.username}</h1>
                                        <p className="cabin-regular text-indigo-200 mb-3 sm:mb-4 text-sm sm:text-base">{currentUser.name} • AI Creator</p>
                                        <div className="flex justify-center md:justify-start space-x-4 sm:space-x-6 lg:space-x-8 mb-4 sm:mb-6">
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl zalando-sans-expanded-bold">{currentUser.posts}</div>
                                                <div className="text-xs sm:text-sm cabin-regular text-indigo-200">Creations</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl zalando-sans-expanded-bold">{currentUser.followers}</div>
                                                <div className="text-xs sm:text-sm cabin-regular text-indigo-200">Followers</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl zalando-sans-expanded-bold">{currentUser.following}</div>
                                                <div className="text-xs sm:text-sm cabin-regular text-indigo-200">Following</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 sm:px-6 py-2 rounded-xl cabin-semibold transition-colors border border-white/30 text-sm sm:text-base">
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={onLogout}
                                                className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-white px-4 sm:px-6 py-2 rounded-xl cabin-semibold transition-colors border border-red-400/30 text-sm sm:text-base"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Stats Panel */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: 'AI Models Used', value: '12', icon: 'cpu', color: 'bg-blue-500' },
                                { label: 'Images Generated', value: '2.3k', icon: 'image', color: 'bg-purple-500' },
                                { label: 'Total Likes', value: '15.7k', icon: 'heart', color: 'bg-red-500' },
                                { label: 'AI Rank', value: '#47', icon: 'award', color: 'bg-yellow-500' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 text-center">
                                    <div className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                                        <Icon name={stat.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="text-lg sm:text-2xl zalando-sans-expanded-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                                    <div className="text-xs sm:text-sm cabin-regular text-gray-600 dark:text-gray-300">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <SocialNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDarkMode={isDarkMode}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Top Bar */}
            <TopBar
                user={currentUser}
                onLogout={onLogout}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                activeTab={activeTab}
            />

            {/* Main Content */}
            <main className={`transition-all duration-300 pt-16 pb-20 md:pb-8 px-2 sm:px-4 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
                <div className="flex justify-center">
                    <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-4 xl:gap-6">
                        {/* Main Feed */}
                        <div className="flex-1 order-1">
                            <div className="py-2 sm:py-6">
                                {renderContent()}
                            </div>
                        </div>

                        {/* Right Sidebar - Hidden on mobile and tablet, visible on xl screens */}
                        <div className="hidden xl:block xl:w-80 order-2">
                            <Sidebar
                                currentUser={currentUser}
                                suggestedUsers={mockSuggestedUsers}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;