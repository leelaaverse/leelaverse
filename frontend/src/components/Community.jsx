import Icon from './Icon';

export default function Community() {
    const communityStats = [
        {
            title: "Active Creators",
            value: "12,500+",
            description: "Artists generating daily",
            icon: "palette",
            color: "from-pink-500 to-rose-600"
        },
        {
            title: "AI Models",
            value: "50+",
            description: "Latest AI technologies",
            icon: "robot",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: "Artworks Created",
            value: "1M+",
            description: "Unique AI generations",
            icon: "sparkles",
            color: "from-purple-500 to-indigo-600"
        },
        {
            title: "Revenue Shared",
            value: "₹10M+",
            description: "Earned by creators",
            icon: "currency",
            color: "from-emerald-500 to-teal-600"
        }
    ]

    const featuredCreators = [
        { name: "Sarah AI", avatar: "user", specialty: "Portrait Art", earnings: "₹45K" },
        { name: "Digital Mike", avatar: "code", specialty: "Landscapes", earnings: "₹38K" },
        { name: "Pixel Queen", avatar: "crown", specialty: "Abstract Art", earnings: "₹52K" },
        { name: "Neo Artist", avatar: "mask", specialty: "Conceptual", earnings: "₹41K" }
    ]

    return (
        <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-6 border border-indigo-200 dark:border-indigo-700">
                        <Icon name="star" className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        <span className="cabin-semibold text-indigo-800 dark:text-indigo-300 font-semibold">Community Powered</span>
                    </div>

                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Join the <span className="gradient-text-primary">Creator Economy</span>
                    </h2>

                    <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Be part of a thriving ecosystem where creativity meets opportunity
                    </p>
                </div>

                {/* Community Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {communityStats.map((stat, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Card */}
                            <div className="glass-strong dark:bg-gray-800/50 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30 dark:border-gray-700/50 relative overflow-hidden">
                                {/* Icon */}
                                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                    <Icon name={stat.icon} className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <div className="zalando-sans-expanded-bold text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {stat.value}
                                </div>
                                <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {stat.title}
                                </h3>
                                <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm">
                                    {stat.description}
                                </p>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Featured Creators */}
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-3xl p-12 border border-gray-100 dark:border-gray-700">
                    {/* Community Showcase Images */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="relative group">
                            <img
                                src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Creative Community"
                                className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white cabin-semibold">Creative Minds</span>
                            </div>
                        </div>
                        <div className="relative group">
                            <img
                                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Digital Artists"
                                className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white cabin-semibold">Digital Artists</span>
                            </div>
                        </div>
                        <div className="relative group">
                            <img
                                src="https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=400"
                                alt="Innovation Hub"
                                className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white cabin-semibold">Innovation Hub</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h3 className="zalando-sans-expanded-bold text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Top Creators This Month
                        </h3>
                        <p className="cabin-regular text-gray-600 dark:text-gray-300">
                            Meet some of our most successful AI artists
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredCreators.map((creator, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100 dark:border-gray-700"
                            >
                                <div className="text-center">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border-2 border-indigo-200 dark:border-indigo-700">
                                        <Icon name={creator.avatar} className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>

                                    {/* Info */}
                                    <h4 className="zalando-sans-expanded-primary font-semibold text-gray-900 dark:text-white mb-1">
                                        {creator.name}
                                    </h4>
                                    <p className="cabin-regular text-gray-600 dark:text-gray-300 text-sm mb-3">
                                        {creator.specialty}
                                    </p>

                                    {/* Earnings */}
                                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg px-3 py-2">
                                        <span className="cabin-semibold text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                                            {creator.earnings} earned
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <button className="cabin-semibold px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center">
                            <Icon name="rocket" className="w-5 h-5 text-white mr-2" />
                            Start Your Creator Journey
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
