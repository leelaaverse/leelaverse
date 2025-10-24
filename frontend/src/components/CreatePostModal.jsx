import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import ImageGrid from './ImageGrid';

const CreatePostModal = ({ isOpen, onClose, currentUser, onPostCreated, prefilledData }) => {
    const { user, accessToken } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // UI State
    const [mode, setMode] = useState('manual'); // manual, agent
    const [postType, setPostType] = useState('auto'); // auto, image, video, upload
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Content
    const [prompt, setPrompt] = useState('');
    const [caption, setCaption] = useState('');

    // AI Settings
    const [selectedModel, setSelectedModel] = useState('flux-schnell');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [style, setStyle] = useState('auto');
    const [numImages, setNumImages] = useState(1);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationMessage, setGenerationMessage] = useState('');

    // Media State - Unified for mixed media support
    const [mediaItems, setMediaItems] = useState([]); // [{type: 'image'|'video', url: string, thumbnail?: string}]
    const [generationIds, setGenerationIds] = useState([]);
    const [aiGenerationIds, setAiGenerationIds] = useState([]);

    // Upload State
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Other State
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [agentAnalysis, setAgentAnalysis] = useState(null);

    // Model Dropdown State
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [modelSearchQuery, setModelSearchQuery] = useState('');
    const modelDropdownRef = useRef(null);

    // Handle prefilled data
    useEffect(() => {
        if (prefilledData && isOpen) {
            console.log('Loading prefilled data:', prefilledData);

            // Convert existing images to media items
            if (prefilledData.imageUrls && prefilledData.imageUrls.length > 0) {
                const imageMediaItems = prefilledData.imageUrls.map(url => ({
                    type: 'image',
                    url: url,
                    thumbnail: url
                }));
                setMediaItems(imageMediaItems);
            }

            if (prefilledData.aiGenerationIds) setAiGenerationIds(prefilledData.aiGenerationIds);
            if (prefilledData.prompt) setPrompt(prefilledData.prompt);
            if (prefilledData.selectedModel) setSelectedModel(prefilledData.selectedModel);
            if (prefilledData.aspectRatio) setAspectRatio(prefilledData.aspectRatio);
            if (prefilledData.style) setStyle(prefilledData.style);

            setPostType('image');
        }
    }, [prefilledData, isOpen]);

    // Image/Video Models
    const imageModels = [
        { id: 'flux-schnell', name: 'FLUX Schnell', icon: 'zap', cost: 5, quality: 'Fast', description: 'Quick 4-step generation' },
        { id: 'flux-1-srpo', name: 'FLUX.1 SRPO', icon: 'sparkles', cost: 10, quality: 'Premium', description: 'High quality 28-step' },
        { id: 'dalle3', name: 'DALL-E 3', icon: 'image', cost: 10, quality: 'Premium', description: 'OpenAI premium model' },
        { id: 'stable-diffusion', name: 'Stable Diffusion XL', icon: 'zap', cost: 5, quality: 'Fast', description: 'SD XL turbo' },
    ];

    const videoModels = [
        { id: 'auto', name: 'Auto Select', icon: 'sparkles', cost: 0, description: 'AI picks best model' },
        { id: 'runway', name: 'Runway Gen-2', icon: 'video', cost: 25, description: '4s video generation' },
        { id: 'pika', name: 'Pika Labs', icon: 'film', cost: 20, description: '3s video generation' },
    ];

    const allModels = postType === 'video' ? videoModels : imageModels;
    const filteredModels = allModels.filter(model =>
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
                setModelDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            // Optional user-controlled enhancement - only if user explicitly requests it
            const enhanced = `${prompt}, ultra detailed, professional quality, cinematic lighting, 8k resolution, trending on artstation`;
            setEnhancedPrompt(enhanced);
            setIsEnhancing(false);
        }, 1500);
    };

    // File Upload Handler - Support multiple files
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newMediaItems = [];
        const newUploadedFiles = [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                newMediaItems.push({
                    type: mediaType,
                    url: reader.result,
                    thumbnail: reader.result,
                    file: file
                });
                newUploadedFiles.push(file);

                // Update state when all files are read
                if (newMediaItems.length === files.length) {
                    setMediaItems(prev => [...prev, ...newMediaItems]);
                    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMediaItem = (index) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllMedia = () => {
        setMediaItems([]);
        setUploadedFiles([]);
        setGenerationIds([]);
        setAiGenerationIds([]);
        setGenerationProgress(0);
        setGenerationMessage('');
        setError(null);
    };

    // Poll generation status
    useEffect(() => {
        if (!generationIds || generationIds.length === 0 || !isGenerating) return;

        const pollInterval = setInterval(async () => {
            try {
                if (!accessToken) throw new Error('No authentication token');

                const pollPromises = generationIds.map(reqId =>
                    fetch(`${API_URL}/api/posts/generation/${reqId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    }).then(r => r.json())
                );

                const results = await Promise.all(pollPromises);

                const completed = results.filter(r => r.success && r.status === 'completed');
                const processing = results.filter(r => r.success && (r.status === 'processing' || r.status === 'in_progress'));
                const failed = results.filter(r => !r.success || r.status === 'failed');

                const progress = Math.floor((completed.length / generationIds.length) * 100);
                setGenerationProgress(progress);
                setGenerationMessage(`Generated ${completed.length}/${generationIds.length} image(s)...`);

                // Add completed images as media items
                const completedImages = completed.map(r => ({
                    type: 'image',
                    url: r.imageUrl,
                    thumbnail: r.imageUrl
                }));

                if (completedImages.length > 0) {
                    setMediaItems(prev => {
                        const existingUrls = prev.map(item => item.url);
                        const newItems = completedImages.filter(item => !existingUrls.includes(item.url));
                        return [...prev, ...newItems];
                    });
                }

                if (completed.length === generationIds.length) {
                    setGenerationProgress(100);
                    setGenerationMessage('All images generated!');
                    setIsGenerating(false);
                    setSuccessMessage(`🎉 ${completed.length} image(s) generated successfully!`);
                    setTimeout(() => setSuccessMessage(null), 3000);
                    clearInterval(pollInterval);
                }

                if (failed.length > 0) {
                    setError(`${failed.length} generation(s) failed`);
                    if (completed.length === 0) {
                        setIsGenerating(false);
                        clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                setError('Failed to check generation status');
                setIsGenerating(false);
                clearInterval(pollInterval);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [generationIds, isGenerating, API_URL, accessToken]);

    // Generate Image
    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGenerationProgress(0);
        setGenerationMessage(`Starting generation of ${numImages} image(s)...`);

        try {
            if (!accessToken || !user) {
                setError('Please login to generate images');
                setIsGenerating(false);
                return;
            }

            const modelConfig = {
                'flux-schnell': { numInferenceSteps: 4, guidanceScale: 3.5 },
                'flux-1-srpo': { numInferenceSteps: 28, guidanceScale: 4.5 },
                'dalle3': { numInferenceSteps: 50, guidanceScale: 7.5 },
                'stable-diffusion': { numInferenceSteps: 20, guidanceScale: 7.0 }
            };

            const config = modelConfig[selectedModel] || modelConfig['flux-schnell'];

            const response = await fetch(`${API_URL}/api/posts/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    imageSize: aspectRatio,
                    style,
                    aspectRatio,
                    selectedModel,
                    numInferenceSteps: config.numInferenceSteps,
                    guidanceScale: config.guidanceScale,
                    numImages: numImages
                })
            });

            const data = await response.json();

            if (data.success) {
                const requestIds = data.generations.map(g => g.requestId);
                const aiGenIds = data.generations.map(g => g.aiGenerationId);
                setGenerationIds(prev => [...prev, ...requestIds]);
                setAiGenerationIds(prev => [...prev, ...aiGenIds]);
                setGenerationMessage(`Generating ${data.count} image(s)...`);
            } else {
                throw new Error(data.message || 'Failed to start generation');
            }
        } catch (error) {
            console.error('Generate image error:', error);
            setError(error.message || 'Failed to generate image');
            setIsGenerating(false);
        }
    };



    // Create Post
    const handleCreatePost = async () => {
        if (!caption.trim() && mediaItems.length === 0) {
            setError('Please add content or media');
            return;
        }

        setIsPosting(true);
        setError(null);
        setGenerationMessage('Creating post...');

        try {
            if (!accessToken) throw new Error('Please login to create posts');

            // Separate images and videos
            const imageUrls = mediaItems.filter(item => item.type === 'image').map(item => item.url);
            const videoUrls = mediaItems.filter(item => item.type === 'video').map(item => item.url);

            // Determine post category
            let category = 'text-post';
            if (imageUrls.length > 0 && videoUrls.length === 0) {
                category = caption.trim() ? 'image-text-post' : 'image-post';
            } else if (videoUrls.length > 0) {
                category = 'normal-video';
            } else if (imageUrls.length > 0 && videoUrls.length > 0) {
                category = 'mixed-media-post';
            }

            const postData = {
                caption: caption.trim() || null,
                title: null,
                type: videoUrls.length > 0 ? 'video' : imageUrls.length > 0 ? 'image' : 'text',
                category,
                imageUrls: imageUrls,
                videoUrls: videoUrls,
                mediaItems: mediaItems, // NEW: Mixed media support
                aiGenerationIds: aiGenerationIds,
                aiGenerated: imageUrls.length > 0 && generationIds.length > 0,
                aiDetails: generationIds.length > 0 ? {
                    model: selectedModel,
                    prompt: prompt.trim(),
                    enhancedPrompt: enhancedPrompt || null,
                    style: style || null,
                    aspectRatio: aspectRatio || '16:9',
                    steps: selectedModel === 'flux-schnell' ? 4 : 28
                } : {},
                tags: [],
                visibility: 'public'
            };

            console.log('Creating post with data:', postData);

            const response = await fetch(`${API_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(postData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('🎉 Post created successfully!');
                if (onPostCreated) onPostCreated();
                setTimeout(() => handleCloseModal(), 1500);
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Create post error:', error);
            setError(error.message || 'Failed to create post');
        } finally {
            setIsPosting(false);
            setGenerationMessage('');
        }
    };

    const handleCloseModal = () => {
        setPrompt('');
        setCaption('');
        setEnhancedPrompt('');
        clearAllMedia();
        setIsGenerating(false);
        setIsPosting(false);
        setError(null);
        setSuccessMessage(null);
        onClose();
    };

    if (!isOpen) return null;

    const selectedModelData = allModels.find(m => m.id === selectedModel);
    const getCost = () => {
        if (mode === 'agent') return 'Auto';
        return selectedModelData?.cost || 0;
    };

    const getAspectRatioStyle = () => {
        switch (aspectRatio) {
            case '1:1': return '1 / 1';
            case '16:9': return '16 / 9';
            case '9:16': return '9 / 16';
            case '4:3': return '4 / 3';
            default: return '16 / 9';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
            <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
                {/* Minimalist Header */}
                <div className="sticky top-0 z-10 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Icon name="sparkles" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl cabin-bold text-gray-900 dark:text-white">Create Magic</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Turn your imagination into reality with AI</p>
                        </div>
                    </div>

                    {/* Mode Selector - Minimalist Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-2 px-4 rounded-lg cabin-medium text-sm transition-all ${mode === 'manual'
                                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon name="edit-3" className="w-4 h-4 inline mr-1.5" />
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('agent')}
                            className={`flex-1 py-2 px-4 rounded-lg cabin-medium text-sm transition-all relative ${mode === 'agent'
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
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)] space-y-6 custom-scrollbar">
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

                    {/* Media Preview Section - Moved here after prompt */}
                    {(postType === 'image' || postType === 'auto') && (
                        <>
                            {/* Generation Progress */}
                            {isGenerating && (
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                                        <span className="text-sm cabin-semibold text-purple-900 dark:text-purple-200">
                                            {generationMessage}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transition-all duration-300 ease-out bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
                                            style={{ width: `${generationProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-purple-600 dark:text-purple-400 cabin-medium">
                                            {generationProgress}% complete
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedModel === 'flux-schnell' ? '~10s' : '~30s'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Media Preview - Show generated images */}
                            {mediaItems.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Generated Images ({mediaItems.length})
                                        </label>
                                        <button
                                            onClick={clearAllMedia}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Icon name="trash-2" className="w-3 h-3" />
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="relative rounded-xl overflow-hidden border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800">
                                        {/* Compact Image Grid */}
                                        <div className="p-2">
                                            {mediaItems.length === 1 && (
                                                <div
                                                    className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                    style={{ maxHeight: '300px' }}
                                                    onClick={() => window.open(mediaItems[0].url, '_blank')}
                                                >
                                                    <img
                                                        src={mediaItems[0].url}
                                                        alt="Generated"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            )}

                                            {mediaItems.length === 2 && (
                                                <div className="grid grid-cols-2 gap-1">
                                                    {mediaItems.slice(0, 2).map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                            style={{ height: '180px' }}
                                                            onClick={() => window.open(item.url, '_blank')}
                                                        >
                                                            <img
                                                                src={item.url}
                                                                alt={`Generated ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {mediaItems.length === 3 && (
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div
                                                        className="relative row-span-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                        style={{ height: '250px' }}
                                                        onClick={() => window.open(mediaItems[0].url, '_blank')}
                                                    >
                                                        <img
                                                            src={mediaItems[0].url}
                                                            alt="Generated 1"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {mediaItems.slice(1, 3).map((item, idx) => (
                                                            <div
                                                                key={idx + 1}
                                                                className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                                style={{ height: '124.5px' }}
                                                                onClick={() => window.open(item.url, '_blank')}
                                                            >
                                                                <img
                                                                    src={item.url}
                                                                    alt={`Generated ${idx + 2}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {mediaItems.length >= 4 && (
                                                <div className="grid grid-cols-2 gap-1">
                                                    {mediaItems.slice(0, 4).map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                            style={{ height: '150px' }}
                                                            onClick={() => window.open(item.url, '_blank')}
                                                        >
                                                            <img
                                                                src={item.url}
                                                                alt={`Generated ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {idx === 3 && mediaItems.length > 4 && (
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                    <span className="text-white text-2xl font-bold">+{mediaItems.length - 4}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Bar */}
                                        <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="image" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {mediaItems.filter(m => m.type === 'image').length} Image(s)
                                                        {mediaItems.filter(m => m.type === 'video').length > 0 &&
                                                            ` • ${mediaItems.filter(m => m.type === 'video').length} Video(s)`
                                                        }
                                                    </span>
                                                </div>
                                                <span className="text-xs text-purple-600 dark:text-purple-400">
                                                    Click to view full size
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Manual Mode Controls */}
                    {mode === 'manual' && (
                        <>
                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Content Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { type: 'auto', icon: 'sparkles', label: 'Auto' },
                                        { type: 'image', icon: 'image', label: 'Generate Image' },
                                        { type: 'video', icon: 'video', label: 'Generate Video' },
                                        { type: 'upload', icon: 'upload', label: 'Upload Media' },
                                        { type: 'text', icon: 'type', label: 'Text Only' },
                                    ].map(({ type, icon, label }) => (
                                        <button
                                            key={type}
                                            onClick={() => setPostType(type)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${postType === type
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
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${selectedModel === model.id
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
                                            {/* Number of Images Selector */}
                                            <div>
                                                <label className="block text-xs cabin-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Number of Images (1-4)
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[1, 2, 3, 4].map((count) => (
                                                        <button
                                                            key={count}
                                                            onClick={() => setNumImages(count)}
                                                            disabled={isGenerating}
                                                            className={`py-2 px-3 rounded-lg text-sm cabin-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${numImages === count
                                                                ? 'bg-purple-600 text-white shadow-md'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {count}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Generate multiple variations at once
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs cabin-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Aspect Ratio
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => setAspectRatio(ratio)}
                                                            className={`py-2 px-3 rounded-lg text-xs cabin-medium transition-all ${aspectRatio === ratio
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

                    {/* Video Generation Preview Area */}
                    {postType === 'video' && (
                        <div>
                            <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                                Generated Videos
                            </label>

                            {/* Video Generation Skeleton */}
                            {isGenerating && (
                                <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-pink-200 dark:border-pink-800">
                                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-600/20 animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-3 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center animate-pulse">
                                                    <Icon name="video" className="w-8 h-8 text-pink-400 dark:text-pink-500" />
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 cabin-medium">
                                                    Generating your video...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Empty State for videos */}
                            {!isGenerating && (
                                <div className="mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Icon name="video" className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 cabin-medium mb-2">
                                        Video generation coming soon
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Try image generation for now
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Generation Preview Area */}
                    {postType === 'text' && (
                        <div>
                            <label className="block text-sm cabin-medium text-gray-700 dark:text-gray-300 mb-3">
                                Generated Text
                            </label>

                            {/* Text Generation Skeleton */}
                            {isGenerating && (
                                <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800 p-4">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 rounded animate-pulse">
                                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-500/20 animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
                                        </div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 rounded animate-pulse w-3/4">
                                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-500/20 animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
                                        </div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 rounded animate-pulse w-1/2">
                                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-500/20 animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center animate-pulse">
                                            <Icon name="type" className="w-4 h-4 text-green-400 dark:text-green-500" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 cabin-medium mt-3 text-center">
                                        Generating your text content...
                                    </p>
                                </div>
                            )}

                            {/* Generated Text Preview */}
                            {filePreview === 'text-generated' && !isGenerating && (
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon name="type" className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-green-800 dark:text-green-200 mb-2">✍️ AI Generated Text</p>
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{caption}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={clearUpload}
                                            className="p-1.5 text-green-600 hover:text-red-600 transition-colors"
                                        >
                                            <Icon name="x" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Empty State for text */}
                            {!filePreview && !isGenerating && (
                                <div className="mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Icon name="type" className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 cabin-medium mb-2">
                                        No text generated yet
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Enter a prompt above and click "Generate Text"
                                    </p>
                                </div>
                            )}
                        </div>
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
                <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-6 shadow-2xl z-10">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2 animate-slideDown">
                            <Icon name="check-circle" className="w-4 h-4 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Caption Input */}
                    <div className="mb-3">
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption... (optional)"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            rows="3"
                            maxLength="2200"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {caption.length}/2200
                        </p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Icon name="hexagon" className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                <p className="text-sm cabin-semibold text-gray-900 dark:text-white">{currentUser?.coins || 0} coins</p>
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
                            onClick={handleCloseModal}
                            disabled={isGenerating || isPosting}
                            className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl cabin-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>

                        {/* Generate Button - Always available for image generation */}
                        {!isGenerating && (postType === 'image' || postType === 'auto') && (
                            <button
                                onClick={handleGenerateImage}
                                disabled={!prompt.trim() || !accessToken || isPosting}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Icon name="sparkles" className="w-5 h-5" />
                                {mediaItems.length > 0 ? 'Generate More' : 'Generate'}
                            </button>
                        )}

                        {/* Post Button - Show when there's content to post */}
                        {(mediaItems.length > 0 || caption.trim()) && !isGenerating && (
                            <button
                                onClick={handleCreatePost}
                                disabled={isPosting}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl cabin-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPosting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" className="w-5 h-5" />
                                        <span>Post {mediaItems.length > 1 ? `(${mediaItems.length})` : ''}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
