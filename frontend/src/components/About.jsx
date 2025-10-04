import Icon from './Icon';

export default function About() {
    const highlights = [
        {
            icon: 'rocket',
            title: 'AI-First Platform',
            description: 'Built from the ground up for AI content creators and enthusiasts.'
        },
        {
            icon: 'gem',
            title: 'Premium Experience',
            description: 'Curated, high-quality AI art with advanced discovery algorithms.'
        },
        {
            icon: 'star',
            title: 'Creator Economy',
            description: 'Monetize your AI creations with our transparent marketplace.'
        }
    ]

    return (
        <section id="about" className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div>
                        <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            The Future of <span className="gradient-text-primary">Creative Expression</span>
                        </h2>

                        <p className="cabin-regular text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            Leelaaverse isn't just another social platform. We're building the Facebook for AI creators,
                            evolving into the YouTube for AI content. A vibrant, community-driven space where technology
                            meets imagination, and everyone can explore their alternate digital identity.
                        </p>

                        <div className="space-y-6 mb-8">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Icon name={highlight.icon} className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {highlight.title}
                                        </h3>
                                        <p className="cabin-regular text-gray-600 dark:text-gray-300">
                                            {highlight.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="cabin-semibold px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                                Learn More
                            </button>
                            <button className="cabin-semibold px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold shadow-lg border border-gray-200 dark:border-gray-600">
                                View Roadmap
                            </button>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        {/* Background Images */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-4">
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg?auto=compress&cs=tinysrgb&w=400"
                                        alt="AI Neural Network"
                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/70 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-white text-sm cabin-semibold">Neural Networks</span>
                                    </div>
                                </div>
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
                                        alt="Digital Creativity"
                                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/70 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className="text-white text-xs cabin-semibold">Digital Art</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/8438971/pexels-photo-8438971.jpeg?auto=compress&cs=tinysrgb&w=400"
                                        alt="AI Technology"
                                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-pink-600/70 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className="text-white text-xs cabin-semibold">AI Tech</span>
                                    </div>
                                </div>
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=400"
                                        alt="Creative AI"
                                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/70 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className="text-white text-xs cabin-semibold">Creativity</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {/* Main Visual Card */}
                            <div className="glass-strong dark:bg-gray-800/50 rounded-3xl p-8 shadow-2xl mb-6 border border-white/30 dark:border-gray-700/50">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl h-32 flex items-center justify-center">
                                        <Icon name="palette" className="w-12 h-12 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl h-32 flex items-center justify-center">
                                        <Icon name="robot" className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        AI Creator Studio
                                    </h3>
                                    <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">
                                        Professional tools for AI art creation
                                    </p>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="glass dark:bg-gray-800/50 rounded-2xl p-4 text-center border border-white/30 dark:border-gray-700/50">
                                    <div className="zalando-sans-expanded-bold text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                        99%
                                    </div>
                                    <div className="cabin-regular text-xs text-gray-600 dark:text-gray-300">
                                        AI Content
                                    </div>
                                </div>
                                <div className="glass dark:bg-gray-800/50 rounded-2xl p-4 text-center border border-white/30 dark:border-gray-700/50">
                                    <div className="zalando-sans-expanded-bold text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                        24/7
                                    </div>
                                    <div className="cabin-regular text-xs text-gray-600 dark:text-gray-300">
                                        Generation
                                    </div>
                                </div>
                                <div className="glass dark:bg-gray-800/50 rounded-2xl p-4 text-center border border-white/30 dark:border-gray-700/50">
                                    <div className="zalando-sans-expanded-bold text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                        0.05%
                                    </div>
                                    <div className="cabin-regular text-xs text-gray-600 dark:text-gray-300">
                                        Platform Fee
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Elements */}
                        <div className="absolute -inset-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-30 animate-float"></div>
                        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
