import Icon from './Icon';

export default function CTA({ setIsWaitlistModalOpen }) {
    return (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20 relative overflow-hidden">
            {/* Background Images */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
                <div className="absolute top-10 left-10">
                    <img
                        src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200"
                        alt="Innovation"
                        className="w-32 h-32 object-cover rounded-full"
                    />
                </div>
                <div className="absolute top-20 right-20">
                    <img
                        src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200"
                        alt="Startup"
                        className="w-40 h-40 object-cover rounded-full"
                    />
                </div>
                <div className="absolute bottom-20 left-20">
                    <img
                        src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200"
                        alt="Creativity"
                        className="w-36 h-36 object-cover rounded-full"
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Main Content */}
                <div className="relative">
                    {/* Background Glow */}
                    <div className="absolute -inset-10 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 dark:from-indigo-600/30 dark:via-purple-600/30 dark:to-pink-600/30 rounded-full blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>

                    <div className="relative glass-strong dark:bg-gray-800/50 rounded-3xl p-12 shadow-2xl border border-white/30 dark:border-gray-700/50">
                        <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Ready to Generate Your{' '}
                            <span className="gradient-text-primary animate-gradient">
                                Alternate You?
                            </span>
                        </h2>

                        <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Join thousands of AI creators waiting for launch. Be among the first to experience
                            the future of creative social media.
                        </p>

                        {/* Main CTA Button */}
                        <button
                            onClick={() => setIsWaitlistModalOpen(true)}
                            className="group relative cabin-semibold px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 animate-gradient bg-size-200"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <Icon name="sparkles" className="w-6 h-6 text-white mr-3" />
                                Join the Waitlist
                                <Icon name="arrow-right" className="w-5 h-5 text-white ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>

                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
                        </button>

                        {/* Secondary Info */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                                Free to join
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                                Early access benefits
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                                No spam, ever
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 grid sm:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Icon name="target" className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-2">
                            Launch Ready
                        </h3>
                        <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm text-center">
                            Platform in final beta testing phase
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Icon name="users" className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-2">
                            Growing Community
                        </h3>
                        <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm text-center">
                            10,000+ creators already waiting
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Icon name="lightning" className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-2">
                            Instant Access
                        </h3>
                        <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm text-center">
                            Get notified the moment we launch
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
