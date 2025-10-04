import Icon from './Icon';

export default function Testimonials() {
    const testimonials = [
        {
            content: "Leelaaverse has completely transformed how I create and share AI art. The community is incredible and the monetization features actually work!",
            author: "Sarah Chen",
            role: "AI Artist",
            avatar: "user",
            gradient: "from-pink-500 to-rose-600"
        },
        {
            content: "Finally, a platform built specifically for AI creators. The quality of content here is miles ahead of traditional social media.",
            author: "Marcus Rodriguez",
            role: "Digital Creator",
            avatar: "code",
            gradient: "from-blue-500 to-cyan-600"
        },
        {
            content: "I've earned more in my first month on Leelaaverse than I did in a year on other platforms. This is the future of creative expression.",
            author: "Emily Watson",
            role: "AI Influencer",
            avatar: "rocket",
            gradient: "from-emerald-500 to-teal-600"
        }
    ]

    const stats = [
        { value: "4.9/5", label: "User Rating", icon: "star" },
        { value: "50K+", label: "AI Artworks Created", icon: "palette" },
        { value: "₹2M+", label: "Creator Earnings", icon: "currency" }
    ]

    return (
        <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        What Early Users <span className="gradient-text-primary">Say</span>
                    </h2>
                    <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Join thousands who are already creating their alternate selves
                    </p>

                    {/* User Success Showcase */}
                    <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
                        <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Creative Success Story"
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <span className="text-white cabin-semibold text-sm">Success Stories</span>
                            </div>
                        </div>
                        <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Happy Creators"
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <span className="text-white cabin-semibold text-sm">Happy Creators</span>
                            </div>
                        </div>
                        <div className="relative group overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Community Growth"
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <span className="text-white cabin-semibold text-sm">Growing Community</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="glass-strong dark:bg-gray-800/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-white/30 dark:border-gray-700/50"
                        >
                            {/* Quote Content */}
                            <div className="mb-6">
                                <div className="text-4xl text-indigo-400 dark:text-indigo-300 mb-4 opacity-50">"</div>
                                <p className="cabin-regular text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    {testimonial.content}
                                </p>
                            </div>

                            {/* Author */}
                            <div className="flex items-center">
                                <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon name={testimonial.avatar} className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white">
                                        {testimonial.author}
                                    </h4>
                                    <p className="cabin-regular text-gray-600 dark:text-gray-400 text-sm">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Icon name={stat.icon} className="w-8 h-8 text-white" />
                            </div>
                            <div className="zalando-sans-expanded-bold text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="cabin-regular text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Social Proof */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <Icon name="user" className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <Icon name="user" className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <Icon name="user" className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-semibold text-white">
                                +99
                            </div>
                        </div>
                        <span className="cabin-semibold text-gray-700 dark:text-gray-300 font-semibold">
                            Join 10,000+ early users
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
