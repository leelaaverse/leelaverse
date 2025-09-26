import Icon from './Icon';

export default function Technology() {
    const aiModels = [
        {
            name: "DALL-E 3",
            type: "Image Generation",
            description: "Latest OpenAI model for photorealistic images",
            icon: "palette",
            color: "from-blue-500 to-cyan-600",
            features: ["Photorealistic", "Text Integration", "High Resolution"]
        },
        {
            name: "Midjourney v6",
            type: "Artistic Creation",
            description: "Advanced artistic AI for creative visuals",
            icon: "sparkles",
            color: "from-purple-500 to-pink-600",
            features: ["Artistic Style", "Creative Control", "Style Mixing"]
        },
        {
            name: "Stable Diffusion XL",
            type: "Open Source",
            description: "Powerful open-source generation model",
            icon: "wrench",
            color: "from-emerald-500 to-teal-600",
            features: ["Customizable", "Fast Generation", "Local Processing"]
        },
        {
            name: "Claude Vision",
            type: "AI Analysis",
            description: "Advanced image understanding and description",
            icon: "eye",
            color: "from-orange-500 to-red-600",
            features: ["Image Analysis", "Content Understanding", "Smart Tagging"]
        }
    ]

    const techFeatures = [
        {
            title: "Lightning Fast",
            description: "Generate AI content in under 3 seconds",
            icon: "lightning",
            metric: "< 3s"
        },
        {
            title: "99.9% Uptime",
            description: "Enterprise-grade reliability and performance",
            icon: "shield",
            metric: "99.9%"
        },
        {
            title: "Global CDN",
            description: "Optimized delivery across 50+ countries",
            icon: "globe",
            metric: "50+"
        },
        {
            title: "Smart Caching",
            description: "Intelligent content delivery system",
            icon: "brain",
            metric: "AI"
        }
    ]

    return (
        <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-purple-950 dark:to-gray-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/20 dark:bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 dark:bg-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-full mb-6 border border-white/20 dark:border-white/10">
                        <Icon name="rocket" className="w-5 h-5 text-white/90 mr-2" />
                        <span className="cabin-semibold text-white/90 font-semibold">Powered by AI</span>
                    </div>

                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-white mb-4">
                        Cutting-Edge <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Technology</span>
                    </h2>

                    <p className="cabin-regular text-xl text-white/80 max-w-3xl mx-auto">
                        Built on the latest AI models and cloud infrastructure for unmatched performance
                    </p>
                </div>

                {/* AI Models Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {aiModels.map((model, index) => (
                        <div
                            key={index}
                            className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 group"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 bg-gradient-to-br ${model.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                <Icon name={model.icon} className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-white mb-2">
                                {model.name}
                            </h3>
                            <p className="cabin-regular text-sm text-blue-300 dark:text-blue-400 mb-3">
                                {model.type}
                            </p>
                            <p className="cabin-regular text-white/70 dark:text-white/60 text-sm mb-4 leading-relaxed">
                                {model.description}
                            </p>

                            {/* Features */}
                            <div className="space-y-2">
                                {model.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center text-xs">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 dark:bg-emerald-300 rounded-full mr-2"></div>
                                        <span className="cabin-regular text-white/60 dark:text-white/50">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Metrics */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
                    <div className="text-center mb-12">
                        <h3 className="zalando-sans-expanded-bold text-3xl font-bold text-white mb-4">
                            Performance That Matters
                        </h3>
                        <p className="cabin-regular text-white/70 dark:text-white/60">
                            Built for scale, optimized for speed, designed for creators
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {techFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center group"
                            >
                                {/* Metric Circle */}
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 rounded-full flex items-center justify-center mx-auto border border-white/20 dark:border-white/10 group-hover:scale-110 transition-all duration-300">
                                        <Icon name={feature.icon} className="w-8 h-8 text-white" />
                                    </div>
                                    {/* Metric Badge */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-3 py-1">
                                        <span className="cabin-semibold text-white text-xs font-semibold">
                                            {feature.metric}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <h4 className="zalando-sans-expanded-primary text-lg font-semibold text-white mb-2">
                                    {feature.title}
                                </h4>
                                <p className="cabin-regular text-white/60 dark:text-white/50 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="mt-16 text-center">
                        <p className="cabin-regular text-white/40 dark:text-white/30 text-sm mb-4">Powered by</p>
                        <div className="flex flex-wrap justify-center gap-8 items-center">
                            {['OpenAI', 'AWS', 'CloudFlare', 'MongoDB', 'Redis', 'Docker'].map((tech, index) => (
                                <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20 dark:border-white/10">
                                    <span className="cabin-semibold text-white/80 dark:text-white/70 font-semibold text-sm">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}