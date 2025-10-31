import { useState } from 'react'
import Icon from './Icon'

export default function FAQ() {
    const [openFAQ, setOpenFAQ] = useState(null)

    const faqs = [
        {
            question: "What makes leelaah different from other social platforms?",
            answer: "leelaah is exclusively for AI-generated content. Unlike traditional social media, we focus on AI art, creativity, and providing tools for creators to monetize their AI-generated work with minimal platform fees."
        },
        {
            question: "How do I start creating AI content on leelaah?",
            answer: "Simply sign up, describe your vision in a prompt, choose from our selection of AI models, and generate your content instantly. Our platform supports multiple AI providers to give you the best creative options."
        },
        {
            question: "What's the commission structure for selling AI art?",
            answer: "We believe in empowering creators. leelaah takes only 0.05% commission on sales - one of the lowest in the industry. The rest goes directly to you, the creator."
        },
        {
            question: "Can I upload regular photos or videos?",
            answer: "No, leelaah is AI-only. We maintain quality by accepting only AI-generated images, videos, and text. This ensures a unique, curated experience focused on artificial intelligence creativity."
        },
        {
            question: "How does the voting and trending system work?",
            answer: "Community members can upvote content they love. Our algorithm promotes trending posts and hosts weekly awards for top creators. The more engagement your content gets, the higher it ranks."
        },
        {
            question: "Is leelaah free to use?",
            answer: "Yes! Creating an account and generating AI content is completely free. You only pay when you choose to use premium AI models or features. Selling your art has no upfront costs."
        },
        {
            question: "When will leelaah officially launch?",
            answer: "We're currently in beta development with early access for waitlist members. The full public launch is planned for Q2 2025. Join our waitlist to be among the first users!"
        },
        {
            question: "What AI models and providers do you support?",
            answer: "We integrate with leading AI providers including DALL-E, Midjourney, Stable Diffusion, and more. Users can choose the model that best fits their creative vision and style preferences."
        }
    ]

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index)
    }

    return (
        <section id="faq" className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked <span className="gradient-text-primary">Questions</span>
                    </h2>
                    <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Everything you need to know about leelaah
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass-strong dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <button
                                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none group"
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 className="zalando-sans-expanded-primary text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 pr-4">
                                    {faq.question}
                                </h3>
                                <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-300 ${openFAQ === index ? 'rotate-45' : ''
                                    }`}>
                                    <Icon name={openFAQ === index ? 'x' : 'plus'} className="w-4 h-4 text-white" />
                                </div>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="px-8 pb-6">
                                    <p className="cabin-regular text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Help Section */}
                <div className="text-center mt-16">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 border border-indigo-100 dark:border-gray-600">
                        <div className="text-center sm:text-left">
                            <h3 className="zalando-sans-expanded-primary text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Still have questions?
                            </h3>
                            <p className="cabin-regular text-gray-600 dark:text-gray-300">
                                Our support team is here to help you get started
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="cabin-semibold px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl whitespace-nowrap">
                                <span className="mr-2">💬</span>
                                Live Chat
                            </button>
                            <button className="cabin-semibold px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg border border-gray-200 dark:border-gray-500 whitespace-nowrap">
                                <span className="mr-2">📧</span>
                                Email Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}