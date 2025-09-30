import Icon from './Icon'

export default function Features() {
    const features = [
        {
            icon: 'robot',
            title: 'AI-Only Content',
            description: 'Post AI-generated images, videos, and text. No regular photos, only pure AI creativity.',
            gradient: 'from-blue-500 to-purple-600'
        },
        {
            icon: 'upvote',
            title: 'Vote & Trend',
            description: 'Upvote the best content. Weekly awards and trending algorithms boost top creators.',
            gradient: 'from-emerald-500 to-teal-600'
        },
        {
            icon: 'shopping',
            title: 'AI Marketplace',
            description: 'Buy and sell AI art directly. Set your price, we take only 0.05% commission.',
            gradient: 'from-pink-500 to-rose-600'
        },
        {
            icon: 'lightning',
            title: 'Instant Generation',
            description: 'Input prompts, select AI models, generate content instantly using our advanced tools.',
            gradient: 'from-yellow-500 to-orange-600'
        },
        {
            icon: 'trophy',
            title: 'Leaderboards',
            description: 'Weekly top creators and earners. Build your reputation in the AI creator community.',
            gradient: 'from-indigo-500 to-blue-600'
        },
        {
            icon: 'globe',
            title: 'Multi-AI Models',
            description: 'Choose from multiple AI providers. Find the perfect model for your creative vision.',
            gradient: 'from-purple-500 to-indigo-600'
        }
    ]

    return (
        <section id="features" className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Why <span className="gradient-text-primary">Leelaaverse?</span>
                    </h2>
                    <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        The future of AI-powered social creativity
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon name={feature.icon} className="w-8 h-8 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="zalando-sans-expanded-primary text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {feature.title}
                            </h3>
                            <p className="cabin-regular text-gray-600 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Border Glow */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 -z-10 blur-xl transition-opacity duration-300`}></div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200 dark:border-indigo-700">
                        <Icon name="sparkles" className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        <span className="cabin-semibold text-indigo-800 dark:text-indigo-300 font-semibold">
                            More features coming soon in beta release
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}