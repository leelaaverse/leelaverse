import { useState, useEffect } from 'react'

export default function WaitlistModal({ isOpen, setIsOpen }) {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSuccess(true)
        setEmail('')

        setTimeout(() => {
            setIsSuccess(false)
            setIsOpen(false)
        }, 2000)
    }

    const closeModal = () => {
        if (!isSubmitting) {
            setIsOpen(false)
            setEmail('')
            setIsSuccess(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="relative glass-strong rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/30 animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-6 right-6 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 group"
                    disabled={isSubmitting}
                >
                    <span className="text-gray-600 group-hover:text-gray-800 text-lg">×</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl zalando-sans-expanded-bold">L</span>
                        </div>
                    </div>

                    <h3 className="zalando-sans-expanded-bold text-3xl font-bold text-gray-900 mb-3">
                        Join the Waitlist
                    </h3>

                    <p className="cabin-regular text-gray-600 leading-relaxed">
                        Be the first to experience the future of AI social media. Get early access and exclusive benefits.
                    </p>
                </div>

                {/* Success State */}
                {isSuccess && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                            <span className="text-white text-3xl">✓</span>
                        </div>
                        <h4 className="zalando-sans-expanded-primary text-2xl font-semibold text-gray-900 mb-3">
                            Welcome to the Waitlist!
                        </h4>
                        <p className="cabin-regular text-gray-600">
                            Check your email for confirmation and exclusive updates.
                        </p>
                    </div>
                )}

                {/* Form */}
                {!isSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="cabin-semibold block text-sm font-semibold text-gray-700 mb-3">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 cabin-regular bg-white/50 backdrop-blur-sm"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 cabin-semibold ${isSubmitting || !email
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                    Joining Waitlist...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <span className="mr-2">🚀</span>
                                    Join Waitlist
                                </span>
                            )}
                        </button>
                    </form>
                )}

                {/* Benefits */}
                {!isSuccess && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="zalando-sans-expanded-primary text-sm font-semibold text-gray-900 mb-4 text-center">
                            Waitlist Benefits
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <span className="text-lg">⚡</span>
                                </div>
                                <p className="cabin-regular text-xs text-gray-600">Early Access</p>
                            </div>
                            <div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <span className="text-lg">🎁</span>
                                </div>
                                <p className="cabin-regular text-xs text-gray-600">Free Credits</p>
                            </div>
                            <div>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <span className="text-lg">👑</span>
                                </div>
                                <p className="cabin-regular text-xs text-gray-600">VIP Status</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="cabin-regular text-xs text-gray-500">
                        No spam, unsubscribe anytime. We respect your privacy.
                    </p>
                </div>
            </div>
        </div>
    )
}