export default function Footer() {
    const currentYear = new Date().getFullYear()

    const links = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'How it Works', href: '#how-it-works' },
            { name: 'Pricing', href: '#' },
            { name: 'Roadmap', href: '#' }
        ],
        company: [
            { name: 'About Us', href: '#about' },
            { name: 'Careers', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Press', href: '#' }
        ],
        support: [
            { name: 'Help Center', href: '#' },
            { name: 'Contact', href: '#' },
            { name: 'Status', href: '#' },
            { name: 'Community', href: '#' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '#' },
            { name: 'Terms of Service', href: '#' },
            { name: 'Cookie Policy', href: '#' },
            { name: 'Guidelines', href: '#' }
        ]
    }

    const socialLinks = [
        { name: 'Twitter', icon: '🐦', href: '#' },
        { name: 'Discord', icon: '💬', href: '#' },
        { name: 'Instagram', icon: '📸', href: '#' },
        { name: 'LinkedIn', icon: '💼', href: '#' }
    ]

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-16">
                    <div className="grid lg:grid-cols-6 gap-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl zalando-sans-expanded-bold">L</span>
                                </div>
                                <h3 className="zalando-sans-expanded-primary text-2xl font-bold">
                                    Leelaaverse
                                </h3>
                            </div>

                            <p className="cabin-regular text-gray-300 mb-6 leading-relaxed">
                                Generate alternate you. The future of AI-powered social creativity where imagination meets technology.
                            </p>

                            {/* Social Links */}
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                                        aria-label={social.name}
                                    >
                                        <span className="text-lg">{social.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Sections */}
                        <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Product */}
                            <div>
                                <h4 className="zalando-sans-expanded-primary font-semibold text-white mb-4">
                                    Product
                                </h4>
                                <ul className="space-y-3">
                                    {links.product.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className="cabin-regular text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Company */}
                            <div>
                                <h4 className="zalando-sans-expanded-primary font-semibold text-white mb-4">
                                    Company
                                </h4>
                                <ul className="space-y-3">
                                    {links.company.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className="cabin-regular text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="zalando-sans-expanded-primary font-semibold text-white mb-4">
                                    Support
                                </h4>
                                <ul className="space-y-3">
                                    {links.support.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className="cabin-regular text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="zalando-sans-expanded-primary font-semibold text-white mb-4">
                                    Legal
                                </h4>
                                <ul className="space-y-3">
                                    {links.legal.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className="cabin-regular text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="border-t border-gray-700 py-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                            <h4 className="zalando-sans-expanded-primary text-lg font-semibold mb-2">
                                Stay Updated
                            </h4>
                            <p className="cabin-regular text-gray-300 text-sm">
                                Get the latest updates and AI creation tips
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cabin-regular min-w-0 sm:w-64"
                            />
                            <button className="cabin-semibold px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-700 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <div className="cabin-regular">
                            © {currentYear} Leelaaverse. All rights reserved.
                        </div>

                        <div className="flex items-center space-x-6">
                            <span className="cabin-regular">Made with ❤️ for AI creators</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="cabin-regular text-emerald-400">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}