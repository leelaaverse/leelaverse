import { useState, useEffect } from 'react'
import { useDarkMode } from '../contexts/DarkModeContext'
import Icon from './Icon'
import Logo from '../assets/logo.png'

export default function Header({ currentPage, setCurrentPage, setIsWaitlistModalOpen, setIsLoginModalOpen, setIsSignupModalOpen }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { isDarkMode, toggleDarkMode } = useDarkMode()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (sectionId) => {
        if (currentPage !== 'home') {
            setCurrentPage('home')
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }
        setIsMobileMenuOpen(false)
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'py-2'
            : 'py-4'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className={`glass-strong rounded-3xl px-6 py-3 shadow-lg transition-all duration-300 ${isScrolled ? 'shadow-xl py-2' : ''
                    } dark:bg-gray-900/95 dark:backdrop-blur-xl dark:border-gray-600/30`}>
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center space-x-3 cursor-pointer group"
                            onClick={() => setCurrentPage('home')}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <img src={Logo} alt="Leelaaverse Logo" className="w-12 h-12 object-contain rounded-2xl" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                            </div>
                            <h1 className="zalando-sans-expanded-primary text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">
                                Leelaaverse
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="cabin-medium text-sm xl:text-base text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium whitespace-nowrap"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="cabin-medium text-sm xl:text-base text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium whitespace-nowrap"
                            >
                                How It Works
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="cabin-medium text-sm xl:text-base text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium whitespace-nowrap"
                            >
                                FAQ
                            </button>
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                                aria-label="Toggle dark mode"
                            >
                                <Icon
                                    name={isDarkMode ? "sun" : "moon"}
                                    className="w-4 h-4 text-gray-600 dark:text-yellow-300"
                                />
                            </button>

                            <button
                                onClick={() => setIsLoginModalOpen?.(true)}
                                className="cabin-medium px-3 lg:px-4 py-2 text-sm lg:text-base text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium whitespace-nowrap"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsSignupModalOpen?.(true)}
                                className="cabin-semibold px-4 lg:px-6 py-2 text-sm lg:text-base bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => setIsWaitlistModalOpen(true)}
                                className="cabin-semibold px-3 lg:px-6 py-2 text-sm lg:text-base bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center whitespace-nowrap"
                            >
                                <Icon name="rocket" className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                <span className="hidden lg:inline">Join Waitlist</span>
                                <span className="lg:hidden">Join</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ${isMobileMenuOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="flex flex-col space-y-4 py-4 border-t border-gray-200 dark:border-gray-600">
                            {/* Dark Mode Toggle Mobile */}
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                                aria-label="Toggle dark mode"
                            >
                                <Icon
                                    name={isDarkMode ? "sun" : "moon"}
                                    className="w-4 h-4 text-gray-600 dark:text-yellow-300"
                                />
                                <span className="cabin-medium text-gray-700 dark:text-gray-300 font-medium text-sm">
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            </button>

                            <button
                                onClick={() => scrollToSection('features')}
                                className="cabin-medium text-left text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="cabin-medium text-left text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
                            >
                                How It Works
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="cabin-medium text-left text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
                            >
                                FAQ
                            </button>
                            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={() => {
                                        setIsLoginModalOpen?.(true)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="cabin-medium text-left text-gray-700 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-300 font-medium"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSignupModalOpen?.(true)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="cabin-semibold px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg text-center"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => setIsWaitlistModalOpen(true)}
                                    className="cabin-semibold px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg text-center"
                                >
                                    Join Waitlist
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}