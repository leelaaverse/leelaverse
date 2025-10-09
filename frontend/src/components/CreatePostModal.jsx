import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const CreatePostModal = ({ isOpen, onClose, currentUser }) => {
    const [mode, setMode] = useState('manual'); // manual, agent
    const [prompt, setPrompt] = useState('');
    const [postType, setPostType] = useState('auto'); // auto, image, video, text, upload-image, upload-video
    const [selectedModel, setSelectedModel] = useState('auto');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [style, setStyle] = useState('auto');
    const [isGenerating, setIsGenerating] = useState(false);
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [agentAnalysis, setAgentAnalysis] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const imageModels = [
        { id: 'auto', name: 'Auto Select', icon: 'sparkles', description: 'AI picks the best model' },
        { id: 'dalle3', name: 'DALL-E 3', icon: 'image', cost: 10, quality: 'Premium' },
        { id: 'midjourney', name: 'Midjourney v6', icon: 'wand', cost: 15, quality: 'Ultra' },
        { id: 'stable-diffusion', name: 'SD XL', icon: 'zap', cost: 5, quality: 'Fast' },
    ];

    const videoModels = [
        { id: 'auto', name: 'Auto Select', icon: 'sparkles', description: 'AI picks the best model' },
        { id: 'runway', name: 'Runway Gen-2', icon: 'video', cost: 25, duration: '4s' },
        { id: 'pika', name: 'Pika Labs', icon: 'film', cost: 20, duration: '3s' },
    ];

    // Agent Mode: Analyze prompt and suggest best configuration
    useEffect(() => {
        if (mode === 'agent' && prompt.length > 10) {
            const timer = setTimeout(() => {
                analyzePrompt();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [prompt, mode]);

    const analyzePrompt = () => {
        // Simulate AI analysis
        const hasVideoKeywords = /video|animation|motion|moving|dance|fly/i.test(prompt);
        const hasTextKeywords = /thought|opinion|discuss|think|believe/i.test(prompt);

        setAgentAnalysis({
            suggestedType: hasVideoKeywords ? 'video' : hasTextKeywords ? 'text' : 'image',
            suggestedModel: hasVideoKeywords ? 'runway' : 'dalle3',
            confidence: Math.floor(Math.random() * 20) + 80,
            reasoning: hasVideoKeywords
                ? 'Detected motion-related keywords. Video generation recommended.'
                : hasTextKeywords
                ? 'Detected discussion keywords. Text post recommended.'
                : 'Image generation will work best for this prompt.',
        });
    };

    const enhancePrompt = () => {
        setIsEnhancing(true);
        setTimeout(() => {
            const enhanced = `${prompt}, ultra detailed, professional quality, cinematic lighting, 8k resolution, trending on artstation`;
            setEnhancedPrompt(enhanced);
            setIsEnhancing(false);
        }, 1500);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearUpload = () => {
        setUploadedFile(null);
        setFilePreview(null);
    };

    if (!isOpen) return null;

    const getCost = () => {
        if (mode === 'agent') return 'Auto';
        if (postType === 'text') return 0;
        const models = postType === 'video' ? videoModels : imageModels;
        const model = models.find(m => m.id === selectedModel);
        return model?.cost || 0;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
                {/* Minimalist Header */}
                <div className="relative p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Icon name="sparkles" className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl cabin-semibold text-gray-900 dark:text-white">Create</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Turn your ideas into reality</p>
                        </div>
                    </div>

                    {/* Mode Selector - Minimalist Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-2 px-4 rounded-lg cabin-medium text-sm transition-all ${
                                mode === 'manual'
                                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon name="edit-3" className="w-4 h-4 inline mr-1.5" />
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('agent')}
                            className={`flex-1 py-2 px-4 rounded-lg cabin-medium text-sm transition-all relative ${
                                mode === 'agent'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon name="cpu" className="w-4 h-4 inline mr-1.5" />
                            AI Agent
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)] space-y-6">
                    {/* Main Prompt Area - Clean & Focused */}
                    <div className="relative">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'agent'
                                    ? "Describe what you want to create... AI will handle the rest ✨"
                                    : "What would you like to create today?"}
                                rows={mode === 'agent' ? 4 : 6}
                                className="w-full px-4 py-4 bg-transparent border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 cabin-regular transition-all"
                            />

                            {/* Character Count & AI Enhance */}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">{prompt.length}/500</span>
                                {prompt.length > 10 && mode === 'manual' && (
                                    <button
                                        onClick={enhancePrompt}
                                        disabled={isEnhancing}
                                        className="text-xs cabin-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50"
                                    >
                                        {isEnhancing ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                                                Enhancing...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="sparkles" className="w-3 h-3" />
                                                Enhance with AI
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Enhanced Prompt Display */}
                            {enhancedPrompt && (
                                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 animate-slideDown">
                                    <div className="flex items-start gap-2">
                                        <Icon name="sparkles" className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs cabin-medium text-purple-900 dark:text-purple-100 mb-1">Enhanced Prompt</p>
                                            <p className="text-sm text-purple-700 dark:text-purple-300">{enhancedPrompt}</p>
                                            <button
                                                onClick={() => setPrompt(enhancedPrompt)}
                                                className="mt-2 text-xs cabin-medium text-purple-600 dark:text-purple-400 hover:underline"
                                            >
                                                Use this version
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agent Analysis Display */}
                    {mode === 'agent' && agentAnalysis && (
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 animate-slideDown">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Icon name="cpu" className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="cabin-semibold text-gray-900 dark:text-white">Agent Analysis</h4>
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs cabin-medium rounded-full">
                                            {agentAnalysis.confidence}% confident
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{agentAnalysis.reasoning}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs cabin-medium">
                                            <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                                            <span className="text-purple-600 dark:text-purple-400 capitalize">{agentAnalysis.suggestedType}</span>
                                        </div>
                                        <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs cabin-medium">
                                            <span className="text-gray-500 dark:text-gray-400">Model:</span>{' '}
                                            <span className="text-purple-600 dark:text-purple-400">{agentAnalysis.suggestedModel}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manual Mode Controls */}
                    {mode === 'manual' && (
                        <>
                            {/* Content Type - Minimalist Pills */}
                            <div>
                                <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Content Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { type: 'auto', icon: 'sparkles', label: 'Auto' },
                                        { type: 'image', icon: 'image', label: 'Generate Image' },
                                        { type: 'video', icon: 'video', label: 'Generate Video' },
                                        { type: 'upload-image', icon: 'upload', label: 'Upload Image' },
                                        { type: 'upload-video', icon: 'film', label: 'Upload Video' },
                                        { type: 'text', icon: 'type', label: 'Text Post' },
                                    ].map(({ type, icon, label }) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setPostType(type);
                                                if (!type.startsWith('upload')) {
                                                    clearUpload();
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cabin-medium text-sm transition-all ${
                                                postType === type
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <Icon name={icon} className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload Section */}
                            {(postType === 'upload-image' || postType === 'upload-video') && (
                                <div>
                                    <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                                        {postType === 'upload-image' ? 'Upload Image' : 'Upload Video'}
                                    </label>

                                    {!uploadedFile ? (
                                        <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer group">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={postType === 'upload-image' ? 'image/*' : 'video/*'}
                                                onChange={handleFileUpload}
                                            />
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                                                    <Icon name="upload-cloud" className="w-8 h-8 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 cabin-medium mb-2">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {postType === 'upload-image'
                                                        ? 'PNG, JPG, GIF up to 10MB'
                                                        : 'MP4, MOV, AVI up to 100MB'}
                                                </p>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 bg-gray-50 dark:bg-gray-800">
                                            {postType === 'upload-image' ? (
                                                <img
                                                    src={filePreview}
                                                    alt="Upload preview"
                                                    className="w-full h-64 object-contain"
                                                />
                                            ) : (
                                                <video
                                                    src={filePreview}
                                                    className="w-full h-64 object-contain"
                                                    controls
                                                />
                                            )}
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <button
                                                    onClick={clearUpload}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                >
                                                    <Icon name="x" className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-sm cabin-medium text-gray-900 dark:text-white truncate">
                                                    {uploadedFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Model Selection - Compact Cards */}
                            {(postType === 'image' || postType === 'video') && (
                                <div>
                                    <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                                        AI Model
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(postType === 'image' ? imageModels : videoModels).map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                    selectedModel === model.id
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <Icon name={model.icon} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    {model.cost && (
                                                        <span className="text-xs cabin-medium text-orange-600 dark:text-orange-400">
                                                            {model.cost} coins
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="cabin-semibold text-sm text-gray-900 dark:text-white mb-1">{model.name}</h4>
                                                {model.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{model.description}</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Advanced Settings - Collapsible */}
                            {(postType === 'image' || postType === 'video') && (
                                <div>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2 text-sm cabin-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 mb-3"
                                    >
                                        <Icon name={showAdvanced ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
                                        Advanced Options
                                    </button>

                                    {showAdvanced && (
                                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-slideDown">
                                            <div>
                                                <label className="block text-xs cabin-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Aspect Ratio
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => setAspectRatio(ratio)}
                                                            className={`py-2 px-3 rounded-lg text-xs cabin-medium transition-all ${
                                                                aspectRatio === ratio
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {ratio}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs cabin-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Style
                                                </label>
                                                <select
                                                    value={style}
                                                    onChange={(e) => setStyle(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm cabin-regular text-gray-900 dark:text-white"
                                                >
                                                    <option value="auto">Auto Detect</option>
                                                    <option value="realistic">Realistic</option>
                                                    <option value="artistic">Artistic</option>
                                                    <option value="anime">Anime</option>
                                                    <option value="3d">3D Render</option>
                                                    <option value="cyberpunk">Cyberpunk</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Quick Tags - Minimalist Design */}
                    <div>
                        <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                            Quick Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['#AIArt', '#GenerativeAI', '#Creative', '#DigitalArt', '#Innovation'].map((tag) => (
                                <button
                                    key={tag}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs cabin-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer - Clean Action Bar */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Icon name="hexagon" className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                <p className="text-sm cabin-semibold text-gray-900 dark:text-white">{currentUser.coins} coins</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cost</p>
                            <p className="text-sm cabin-semibold text-orange-600 dark:text-orange-400">
                                {getCost()} {getCost() !== 'Auto' && 'coins'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl cabin-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={
                                isGenerating ||
                                (postType.startsWith('upload') && !uploadedFile) ||
                                (!postType.startsWith('upload') && (!prompt.trim() || prompt.length < 5))
                            }
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cabin-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {postType.startsWith('upload') ? 'Uploading...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Icon name={postType.startsWith('upload') ? 'upload' : mode === 'agent' ? 'cpu' : 'sparkles'} className="w-5 h-5" />
                                    {postType.startsWith('upload')
                                        ? 'Upload & Post'
                                        : mode === 'agent'
                                        ? 'Let AI Create'
                                        : 'Generate'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
