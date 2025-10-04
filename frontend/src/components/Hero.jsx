import Icon from './Icon'

export default function Hero({ setIsWaitlistModalOpen }) {
    return (
        <section className="pt-32 pb-20 relative overflow-hidden min-h-screen flex items-center">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900"></div>
            <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 border border-emerald-200 dark:border-emerald-700 mb-8 shadow-lg">
                            <Icon name="rocket" className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="cabin-semibold text-emerald-800 dark:text-emerald-300 font-semibold">Beta Launching Soon</span>
                            <div className="ml-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="zalando-sans-expanded-bold text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Generate Your{' '}
                            <span className="gradient-text-primary animate-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-size-200">
                                Alternate Reality
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Step into the future of social media where AI meets creativity. Join a vibrant community of creators, artists, and innovators building the next generation of digital expression.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <button
                                onClick={() => setIsWaitlistModalOpen(true)}
                                className="group cabin-semibold px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 relative overflow-hidden animate-gradient bg-size-200"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    <Icon name="sparkles" className="w-6 h-6 mr-3" />
                                    Join Early Access
                                    <Icon name="arrow" className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                            </button>

                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="cabin-semibold px-10 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-200 rounded-3xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center group"
                            >
                                <Icon name="play" className="w-6 h-6 mr-3" />
                                Watch Demo
                                <Icon name="play" className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 justify-center lg:justify-start mb-8">
                            <div className="text-center lg:text-left">
                                <div className="zalando-sans-expanded-bold text-4xl font-bold text-gray-900 dark:text-white mb-2">15K+</div>
                                <div className="cabin-regular text-gray-600 dark:text-gray-400">Beta Waitlist</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="zalando-sans-expanded-bold text-4xl font-bold text-gray-900 dark:text-white mb-2">100K+</div>
                                <div className="cabin-regular text-gray-600 dark:text-gray-400">AI Creations</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="zalando-sans-expanded-bold text-4xl font-bold text-gray-900 dark:text-white mb-2">₹5M+</div>
                                <div className="cabin-regular text-gray-600 dark:text-gray-400">Creator Revenue</div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <div className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                <Icon name="check" className="w-4 h-4 mr-2 text-green-500" />
                                <span className="cabin-regular text-sm text-gray-700 dark:text-gray-300">100% Free to Join</span>
                            </div>
                            <div className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                <Icon name="lock" className="w-4 h-4 mr-2 text-blue-500" />
                                <span className="cabin-regular text-sm text-gray-700 dark:text-gray-300">Privacy Protected</span>
                            </div>
                            <div className="flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                <Icon name="lightning" className="w-4 h-4 mr-2 text-purple-500" />
                                <span className="cabin-regular text-sm text-gray-700 dark:text-gray-300">Instant Access</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="relative max-w-lg mx-auto">
                            {/* AI Generated Images Gallery */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-4">
                                    <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                        <img
                                            src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
                                            alt="AI Digital Art"
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-white text-xs cabin-semibold">Digital Art</span>
                                        </div>
                                    </div>
                                    <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                        <img
                                            src="https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg?auto=compress&cs=tinysrgb&w=400"
                                            alt="Abstract AI Art"
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-white text-xs cabin-semibold">Abstract</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                        <img
                                            src="https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400"
                                            alt="Futuristic AI"
                                            className="w-full h-36 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-white text-xs cabin-semibold">Futuristic</span>
                                        </div>
                                    </div>
                                    <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                        <img
                                            src="https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=400"
                                            alt="Creative AI"
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-white text-xs cabin-semibold">Creative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="relative z-10">
                                {/* Main Card */}
                                <div className="glass-strong rounded-3xl p-8 shadow-2xl mb-6 animate-float">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                                            <Icon name="artist" className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white">AI Art Creation</h3>
                                            <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">Generate stunning visuals</p>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl h-32 flex items-center justify-center">
                                        <Icon name="sparkles" className="w-12 h-12 text-pink-600 dark:text-pink-400" />
                                    </div>
                                </div>

                                {/* Secondary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-strong rounded-2xl p-6 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-3">
                                            <Icon name="lightning" className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-2">Instant AI</h4>
                                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl h-20 flex items-center justify-center">
                                            <Icon name="rocket" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>

                                    <div className="glass-strong rounded-2xl p-6 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
                                            <Icon name="dollar" className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-2">Earn Money</h4>
                                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl h-20 flex items-center justify-center">
                                            <Icon name="diamond" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute -inset-10 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
