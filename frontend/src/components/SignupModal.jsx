import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Icon from './Icon'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'
import GoogleOAuthButton from './GoogleOAuthButton'

export default function SignupModal({ isOpen, setIsOpen, setIsLoginModalOpen }) {
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
    const [validationErrors, setValidationErrors] = useState({})
    const { register } = useAuth()

    // Real-time validation functions
    const validateUsername = (username) => {
        if (!username) return ''
        if (username.length < 3) return 'Username must be at least 3 characters'
        if (username.length > 30) return 'Username cannot be more than 30 characters'
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
        return ''
    }

    const validateEmail = (email) => {
        if (!email) return ''
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
        if (!emailRegex.test(email)) return 'Please enter a valid email address'
        return ''
    }

    const validatePassword = (password) => {
        if (!password) return ''
        if (password.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            return 'Password must contain uppercase, lowercase, number, and special character'
        }
        return ''
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })

        // Clear errors when user starts typing
        if (error) setError('')
        if (errors[name]) {
            setErrors({ ...errors, [name]: null })
        }

        // Real-time validation
        let validationError = ''
        switch (name) {
            case 'username':
                validationError = validateUsername(value)
                break
            case 'email':
                validationError = validateEmail(value)
                break
            case 'password':
                validationError = validatePassword(value)
                break
            default:
                break
        }

        setValidationErrors({
            ...validationErrors,
            [name]: validationError
        })
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

        // Check for validation errors
        const hasValidationErrors = Object.values(validationErrors).some(error => error !== '')
        if (hasValidationErrors) {
            setError('Please fix the validation errors above')
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
            setIsOpen(false)
            setFormData({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            })
            setValidationErrors({})
            setAgreeToTerms(false)
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

    const switchToLogin = () => {
        setIsOpen(false)
        setIsLoginModalOpen(true)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                ></div>

                {/* Modal positioning */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                {/* Modal content */}
                <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-3xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all sm:my-4 sm:align-middle sm:max-w-lg sm:w-full max-h-[95vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>

                    <div className="space-y-4">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <span className="text-white font-bold text-xl zalando-sans-expanded-bold">L</span>
                                </div>
                            </div>

                            <h2 className="zalando-sans-expanded-bold text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Join leelaah
                            </h2>

                            <p className="cabin-regular text-gray-600 dark:text-gray-300">
                                Create your account and start creating
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="cabin-regular w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="cabin-regular w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="username" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`cabin-regular w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${(errors.username || validationErrors.username) ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Choose a username"
                                />
                                {(errors.username || validationErrors.username) && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.username || validationErrors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`cabin-regular w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${(errors.email || validationErrors.email) ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="john@example.com"
                                />
                                {(errors.email || validationErrors.email) && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.email || validationErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`cabin-regular w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${(errors.password || validationErrors.password) ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Create a password"
                                />
                                {(errors.password || validationErrors.password) && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.password || validationErrors.password}
                                    </p>
                                )}
                                <PasswordStrengthIndicator password={formData.password} />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="cabin-semibold block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="cabin-regular w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Terms and conditions */}
                            <div className="flex items-start">
                                <input
                                    id="agree-terms"
                                    name="agree-terms"
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                                />
                                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cabin-regular">
                                    I agree to the{' '}
                                    <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors duration-300 font-semibold">
                                        Terms of Service
                                    </button>
                                    {' '}and{' '}
                                    <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors duration-300 font-semibold">
                                        Privacy Policy
                                    </button>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="cabin-semibold w-full py-3 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 cabin-regular">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="w-full">
                            <GoogleOAuthButton
                                mode="signup"
                                onError={(errorMessage) => setError(errorMessage)}
                                className="w-full py-3 font-semibold rounded-xl border-2 hover:shadow-lg"
                            />
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="cabin-regular text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <button
                                    onClick={switchToLogin}
                                    className="cabin-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors duration-300 font-semibold"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
