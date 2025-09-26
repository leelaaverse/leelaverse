import { useState } from 'react'

export default function Newsletter() {
    const [email, setEmail] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (email) {
            setIsSubscribed(true)
            setEmail('')
            setTimeout(() => setIsSubscribed(false), 3000)
        }
    }

    return (
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Content */}
                <div className="mb-12">
                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-white mb-6">
                        Stay in the <span className="text-yellow-300">Loop</span>
                    </h2>
                    <p className="cabin-regular text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                        Get exclusive updates, early access invites, and AI creation tips delivered to your inbox.
                        Be the first to know when new features launch.
                    </p>
                </div>

                {/* Newsletter Form */}
                <div className="max-w-lg mx-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent cabin-regular"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubscribed}
                            className={`cabin-semibold px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl whitespace-nowrap ${isSubscribed
                                    ? 'bg-emerald-500 text-white cursor-not-allowed'
                                    : 'bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105'
                                }`}
                        >
                            {isSubscribed ? (
                                <span className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    Subscribed!
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <span className="mr-2">📧</span>
                                    Subscribe
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="cabin-regular text-white/70 text-sm mt-4">
                        No spam, unsubscribe at any time. We respect your privacy.
                    </p>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-3 gap-8 mt-16">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <span className="text-2xl">🎨</span>
                        </div>
                        <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-white mb-2">
                            AI Art Tips
                        </h3>
                        <p className="cabin-regular text-white/80 text-sm">
                            Weekly prompts and techniques from top creators
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-white mb-2">
                            Feature Updates
                        </h3>
                        <p className="cabin-regular text-white/80 text-sm">
                            Be first to try new AI models and platform features
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-white mb-2">
                            Exclusive Access
                        </h3>
                        <p className="cabin-regular text-white/80 text-sm">
                            VIP invites and early beta participation
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}