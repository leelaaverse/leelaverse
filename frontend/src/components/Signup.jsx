import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import GoogleOAuthButton from './GoogleOAuthButton'

export default function Signup({ setCurrentPage }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [error, setError] = useState('')
    const [errors, setErrors] = useState({})
    const { register } = useAuth()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Clear errors when user starts typing
        if (error) setError('')
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setErrors({})

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (!agreeToTerms) {
            setError('Please agree to the terms and conditions')
            return
        }

        setIsLoading(true)

        // Prepare registration data
        const registrationData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
        }

        const result = await register(registrationData)

        if (result.success) {
            // Registration successful - user will be automatically logged in
            // Redirect to dashboard (this will happen automatically via AuthContext)
        } else {
            if (result.errors && Array.isArray(result.errors)) {
                // Handle validation errors
                const errorMap = {}
                result.errors.forEach(err => {
                    errorMap[err.field] = err.message
                })
                setErrors(errorMap)
            }
            setError(result.message || 'Registration failed. Please try again.')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl zalando-sans-expanded-bold">L</span>
                        </div>
                    </div>

                    <h2 className="zalando-sans-expanded-bold text-4xl font-bold text-gray-900 mb-3">
                        Create Account
                    </h2>

                    <p className="cabin-regular text-gray-600">
                        Join the future of AI social media
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.firstName ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.lastName ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.username ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                placeholder="Choose a username"
                            />
                            {errors.username && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.email ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.password ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                placeholder="Create a strong password"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cabin-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Confirm your password"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Terms Agreement */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                            />
                            <label className="cabin-regular ml-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                I agree to the{' '}
                                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-300">
                                    Terms of Service
                                </a>
                                {' '}and{' '}
                                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-300">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 cabin-semibold ${isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <span className="mr-2">🚀</span>
                                    Create Account
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 cabin-regular">Or sign up with</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Signup */}
                    <div className="grid grid-cols-2 gap-4">
                        <GoogleOAuthButton
                            mode="signup"
                            onError={(errorMessage) => setError(errorMessage)}
                        />
                        <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-300 cabin-semibold font-semibold">
                            <span className="mr-2">💬</span>
                            Discord
                        </button>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="cabin-regular text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => setCurrentPage('login')}
                            className="cabin-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-300 font-semibold"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="cabin-regular text-gray-500 hover:text-gray-700 transition-colors duration-300 text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Benefits */}
                <div className="glass rounded-2xl p-6 mt-8">
                    <h4 className="zalando-sans-expanded-primary text-center font-semibold text-gray-900 mb-4">
                        Why Join leelaah?
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg">🎨</span>
                            </div>
                            <p className="cabin-regular text-xs text-gray-600">Create AI Art</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg">💰</span>
                            </div>
                            <p className="cabin-regular text-xs text-gray-600">Earn Money</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg">🌟</span>
                            </div>
                            <p className="cabin-regular text-xs text-gray-600">Build Community</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
