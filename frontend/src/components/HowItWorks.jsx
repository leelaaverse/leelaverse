import Icon from './Icon';

export default function HowItWorks() {
    const steps = [
        {
            number: '1',
            title: 'Create Your Prompt',
            description: 'Describe your vision in words. Our AI understands natural language and artistic concepts.',
            icon: 'wand',
            color: 'from-blue-500 to-cyan-600'
        },
        {
            number: '2',
            title: 'Choose AI Model',
            description: 'Select from multiple AI providers and models. Each offers unique styles and capabilities.',
            icon: 'brain',
            color: 'from-purple-500 to-pink-600'
        },
        {
            number: '3',
            title: 'Generate & Share',
            description: 'Watch your creation come to life instantly. Share with the community and start earning.',
            icon: 'magic',
            color: 'from-emerald-500 to-teal-600'
        }
    ]

    return (
        <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="zalando-sans-expanded-bold text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        How <span className="gradient-text-primary">leelaah</span> Works
                    </h2>
                    <p className="cabin-regular text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        From prompt to viral post in 3 simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Lines */}
                    <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
                        <div className="flex justify-between items-center">
                            <div className="w-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <div className="w-1/3 h-0.5 bg-gradient-to-r from-purple-500 to-emerald-500"></div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center group">
                                {/* Step Number Circle */}
                                <div className="relative mb-8">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-300 animate-pulse-glow`}>
                                        <span className="zalando-sans-expanded-bold text-2xl font-bold text-white">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Floating Icon */}
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300">
                                        <Icon name={step.icon} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="max-w-sm mx-auto">
                                    <h3 className="zalando-sans-expanded-primary text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="cabin-regular text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Visual Example */}
                                <div className="mt-8">
                                    <div className={`bg-gradient-to-br ${step.color} bg-opacity-10 dark:bg-opacity-20 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl h-32 flex items-center justify-center shadow-inner">
                                            <Icon name={step.icon} className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                        <div className="text-center sm:text-left">
                            <h3 className="zalando-sans-expanded-primary text-xl font-semibold text-gray-900 mb-2">
                                Ready to start creating?
                            </h3>
                            <p className="cabin-regular text-gray-600">
                                Join thousands of creators waiting for launch
                            </p>
                        </div>
                        <button className="cabin-semibold px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap">
                            Get Early Access
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
