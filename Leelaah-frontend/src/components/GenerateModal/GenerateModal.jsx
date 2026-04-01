import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import './GenerateModal.css';
import apiService from '../../services/api';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import { fetchModels } from '../../store/slices/modelsSlice';
import SearchableModelDropdown from '../shared/SearchableModelDropdown';
import ProgressiveImageReveal from '../shared/ProgressiveImageReveal';

const GenerateModal = ({ isOpen, onClose, onOpenAuth }) => {
    const dispatch = useDispatch();

    // Get authentication state and user from Redux
    const { isLoggedIn, user } = useSelector((state) => state.auth);

    const [modalStep, setModalStep] = useState('generate'); // 'generate', 'upload', 'ai', 'next', 'generating', 'generated'
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiTab, setAiTab] = useState('image');

    // Dynamic AI Models state
    const { imageModels, videoModels, status: modelsStatus } = useSelector((state) => state.models);
    const modelsLoading = modelsStatus === 'loading';
    const [isVideo, setIsVideo] = useState(false);

    const [formData, setFormData] = useState({
        prompt: '',
        caption: '',
        title: '',
        tags: [],
        locationName: '',
        visibility: 'public',
        selectedModel: 'flux-schnell',
        aspectRatio: '1:1',
        numInferenceSteps: 4,
        guidanceScale: 3.5
    });

    const [tagInput, setTagInput] = useState('');

    // AI Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generationRequestId, setGenerationRequestId] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [aiGenerationIds, setAiGenerationIds] = useState([]);

    // Post creation state
    const [isPosting, setIsPosting] = useState(false);

    // Fetch AI models when navigating to AI tab
    useEffect(() => {
        if (modalStep === 'ai' && modelsStatus === 'idle') {
            dispatch(fetchModels());
        }
    }, [modalStep, modelsStatus, dispatch]);

    // Calculate dynamic cost based on selected model
    const currentCost = React.useMemo(() => {
        const currentModels = aiTab === 'image' ? imageModels : videoModels;
        const selectedModelData = currentModels.find(m => m.id === formData.selectedModel);
        return selectedModelData?.creditCost || (formData.selectedModel === 'flux-schnell' ? 50 : 150);
    }, [aiTab, imageModels, videoModels, formData.selectedModel]);

    // Update form defaults when model changes
    const handleModelChange = (modelId) => {
        const currentModels = aiTab === 'image' ? imageModels : videoModels;
        const selectedModelData = currentModels.find(m => m.id === modelId);

        setFormData(prev => ({
            ...prev,
            selectedModel: modelId,
            numInferenceSteps: selectedModelData?.defaultSteps || 4,
            guidanceScale: selectedModelData?.defaultGuidance || 3.5
        }));
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setModalStep('generate');
        setSelectedFile(null);
        setImagePreview(null);
        setAiTab('image');
        setFormData({
            prompt: '',
            caption: '',
            title: '',
            tags: [],
            locationName: '',
            visibility: 'public',
            selectedModel: 'flux-schnell',
            aspectRatio: '1:1',
            numInferenceSteps: 4,
            guidanceScale: 3.5
        });
        setTagInput('');
        setIsGenerating(false);
        setGenerationProgress(0);
        setGenerationStatus('');
        setGenerationRequestId(null);
        setGeneratedImages([]);
        setAiGenerationIds([]);
        setIsPosting(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Check if it's an image
        if (file.type.startsWith('image/')) {
            setSelectedFile(file);
            setIsVideo(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        // Check if it's a video
        else if (file.type.startsWith('video/')) {
            // Create a video element to check duration
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration; // in seconds

                // Check if duration is more than 3 minutes (180 seconds)
                if (duration > 180) {
                    toast.error('Video duration must be 3 minutes or less', {
                        duration: 4000,
                        position: 'top-center'
                    });
                    e.target.value = ''; // Clear the input
                    return;
                }

                // Video is valid
                setSelectedFile(file);
                setIsVideo(true);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            };

            video.onerror = () => {
                toast.error('Unable to load video file', {
                    duration: 3000,
                    position: 'top-center'
                });
                e.target.value = '';
            };

            video.src = URL.createObjectURL(file);
        } else {
            toast.error('Please select an image or video file', {
                duration: 3000,
                position: 'top-center'
            });
            e.target.value = '';
        }
    };

    const handleBrowseFiles = () => {
        setModalStep('upload');
    };

    const handleGenerateAI = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            // Close generate modal and open auth modal
            onClose();
            if (onOpenAuth) {
                onOpenAuth('signup'); // Open signup modal by default
            }
            return;
        }
        setModalStep('ai');
    };

    const handleBackToGenerate = () => {
        setModalStep('generate');
    };

    const handleNext = () => {
        if (imagePreview) {
            setModalStep('next');
        }
    };

    const handleBackToCrop = () => {
        setModalStep('upload');
    };

    const handleBackToAI = () => {
        setModalStep('ai');
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTagInput = (e) => {
        const value = e.target.value;

        // Handle comma or Enter key to add tag
        if (value.endsWith(',') || e.key === 'Enter') {
            e.preventDefault();
            const newTag = value.replace(',', '').trim();

            if (newTag && formData.tags.length < 5 && !formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
                setTagInput('');
            } else if (formData.tags.length >= 5) {
                toast.error('Maximum 5 tags allowed', {
                    duration: 2000,
                    position: 'top-center'
                });
            }
        } else {
            setTagInput(value);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();

            if (newTag && formData.tags.length < 5 && !formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
                setTagInput('');
            } else if (formData.tags.length >= 5) {
                toast.error('Maximum 5 tags allowed', {
                    duration: 2000,
                    position: 'top-center'
                });
            }
        } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
            // Remove last tag on backspace if input is empty
            setFormData(prev => ({
                ...prev,
                tags: prev.tags.slice(0, -1)
            }));
        }
    };

    const removeTag = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Polling function for AI generation status
    const pollGenerationStatus = async (requestId, isVideoGeneration) => {
        const maxAttempts = isVideoGeneration ? 120 : 60; // 2 min for video, 1 min for image
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await apiService.posts.getGenerationResult(requestId);

                if (response.data.success) {
                    const { status, imageUrl, videoUrl } = response.data;
                    const outputUrl = isVideoGeneration ? videoUrl : imageUrl;

                    if (status === 'completed' && outputUrl) {
                        setGenerationProgress(100);
                        setGenerationStatus(isVideoGeneration ? 'Video generated!' : 'Image generated!');
                        setImagePreview(outputUrl);
                        setModalStep('generated');
                        setIsGenerating(false);
                        toast.success(isVideoGeneration ? '🎬 Video generated successfully!' : '🎨 Image generated successfully!', {
                            duration: 3000,
                            position: 'top-center'
                        });
                        return;
                    } else if (status === 'failed') {
                        throw new Error('Generation failed. Please try again.');
                    } else if (status === 'in_progress' || status === 'in_queue' || status === 'processing') {
                        // Update progress
                        const progress = Math.min(10 + (attempts * (isVideoGeneration ? 0.75 : 1.5)), 95);
                        setGenerationProgress(progress);
                        const queuePos = response.data.queuePosition;
                        const statusMsg = queuePos
                            ? `In queue (position ${queuePos})...`
                            : (isVideoGeneration ? 'Generating video...' : 'Processing image...');
                        setGenerationStatus(statusMsg);
                    }
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, isVideoGeneration ? 2000 : 1000);
                } else {
                    throw new Error('Generation is taking longer than expected. Please check back later.');
                }
            } catch (error) {
                console.error('❌ Polling error:', error);
                setIsGenerating(false);
                setModalStep('ai');

                // User-friendly error message without technical details
                const userMessage = error.response?.status === 404
                    ? 'Generation request not found. Please try again.'
                    : error.response?.data?.message || error.message || 'Generation failed. Please try again.';

                toast.error(userMessage, {
                    duration: 4000,
                    position: 'top-center'
                });
            }
        };

        poll();
    };

    const handleRunAI = async () => {
        if (!formData.prompt.trim()) {
            toast.error('Please enter a prompt', { duration: 3000, position: 'top-center' });
            return;
        }

        try {
            setIsGenerating(true);
            setGenerationStatus(aiTab === 'video' ? 'Initializing Video AI...' : 'Initializing Image AI...');
            setGenerationProgress(5);
            setModalStep('generating');

            const isVideoGeneration = aiTab === 'video';
            setIsVideo(isVideoGeneration);

            // Build payload for new API
            const payload = {
                modelId: formData.selectedModel,
                prompt: formData.prompt.trim(),
                aspect_ratio: formData.aspectRatio,
            };

            if (!isVideoGeneration) {
                payload.num_inference_steps = formData.selectedModel.includes('schnell') ? Math.min(formData.numInferenceSteps, 12) : formData.numInferenceSteps;
                payload.guidance_scale = formData.guidanceScale;
                payload.num_images = 1;
            }

            // Progressive progress animation
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) { clearInterval(progressInterval); return prev; }
                    return prev + (isVideoGeneration ? 0.3 : 0.8);
                });
                setGenerationStatus(() => {
                    const msgs = isVideoGeneration
                        ? ['Generating video...', 'Processing frames...', 'Rendering...']
                        : ['Generating...', 'Creating image...', 'Rendering details...', 'Finalizing...'];
                    return msgs[Math.floor(Math.random() * msgs.length)];
                });
            }, 1500);

            let response;
            if (isVideoGeneration) {
                // Video: still uses old endpoint for now
                response = await apiService.posts.generateVideo({
                    prompt: formData.prompt.trim(),
                    selectedModel: formData.selectedModel,
                    aspectRatio: formData.aspectRatio,
                    duration: '5'
                });
            } else {
                // Image: use new /api/ai/image/generate
                response = await apiService.ai.generateImage(payload);
            }

            clearInterval(progressInterval);

            // New API returns result directly (no polling needed)
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                const images = data.images || [];
                const resultUrl = images[0]?.url || data.image?.url;

                if (resultUrl) {
                    setGenerationProgress(98);
                    setGenerationStatus('Downloading image...');
                    await new Promise((resolve) => {
                        if (isVideoGeneration) return resolve();
                        const img = new Image();
                        img.onload = resolve;
                        img.onerror = resolve; // Continue on error
                        img.src = resultUrl;
                    });
                    
                    setGenerationProgress(100);
                    setGenerationStatus(isVideoGeneration ? 'Video generated!' : 'Image generated!');
                    setImagePreview(resultUrl);
                    setAiGenerationIds([data.generationId]);
                    setModalStep('generated');
                    setIsGenerating(false);
                    toast.success(isVideoGeneration ? '🎬 Video generated!' : '🎨 Image generated!', { duration: 3000, position: 'top-center' });
                    return;
                }
            }

            // Fallback: old polling flow
            if (response.data.success && response.data.generations?.length > 0) {
                const generation = response.data.generations[0];
                setGenerationRequestId(generation.requestId);
                setAiGenerationIds([generation.aiGenerationId]);
                setGenerationStatus(isVideoGeneration ? 'Video generating...' : 'Processing...');
                setGenerationProgress(10);
                pollGenerationStatus(generation.requestId, isVideoGeneration);
            } else {
                throw new Error('Failed to start generation');
            }

        } catch (error) {
            console.error('AI Generation Error:', error);
            setIsGenerating(false);
            setGenerationStatus('');
            setModalStep('ai');

            const userMessage = error.response?.data?.message
                || (error.response?.status === 401 ? 'Please login to generate images' : null)
                || (error.response?.status === 402 ? 'Insufficient credits. Please purchase more coins.' : null)
                || (error.response?.status === 429 ? 'Too many requests. Please wait a moment.' : null)
                || 'Failed to start generation. Please try again.';

            toast.error(userMessage, { duration: 4000, position: 'top-center' });
        }
    };

    const handleShare = async () => {
        // Set posting state immediately
        setIsPosting(true);

        try {
            // Check authentication status
            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');
            console.log('🔐 Auth Check:', {
                hasToken: !!token,
                hasUser: !!user,
                isLoggedIn: isLoggedIn,
                tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
            });

            if (!token || !isLoggedIn) {
                console.error('❌ Not authenticated! Cannot create post.');
                toast.error('Please log in to create a post', {
                    duration: 3000,
                    position: 'top-center'
                });
                setIsPosting(false);
                return;
            }

            // Check if this is from AI generation (works for both 'generated' and 'next' steps)
            if (aiGenerationIds.length > 0) {

                // Post from AI generation
                console.log('📤 Creating post from AI generation...');
                console.log('🆔 AI Generation IDs (raw):', aiGenerationIds);
                console.log('📝 Caption:', formData.caption);
                console.log('📁 Media Type:', isVideo ? 'video' : 'image');

                // Filter out null/undefined values
                const validGenerationIds = aiGenerationIds.filter(id => id != null && id !== undefined);

                if (validGenerationIds.length === 0) {
                    throw new Error('No valid AI generation IDs found. Please regenerate the image.');
                }

                console.log('✅ Valid AI Generation IDs:', validGenerationIds);

                // Use tags array directly
                const allTags = ['ai-generated', formData.selectedModel, ...formData.tags];

                const postData = {
                    aiGenerationIds: validGenerationIds,
                    caption: formData.caption.trim() || `AI generated: ${formData.prompt}`,
                    title: formData.title.trim() || formData.caption.trim() || 'AI Generated Image',
                    type: isVideo ? 'video' : 'image',
                    category: formData.category,
                    tags: allTags,
                    visibility: formData.visibility,
                    locationName: formData.locationName.trim() || undefined,
                    isPremium: formData.isPremium,
                    isScheduled: formData.isScheduled,
                    scheduledFor: formData.isScheduled && formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : undefined
                };

                console.log('📦 Payload being sent:', JSON.stringify(postData, null, 2));

                const response = await apiService.posts.createPostFromGeneration(postData);

                console.log('✅ Response:', response.data);
                console.log('📋 Created Post:', response.data.post);

                if (response.data.success) {
                    toast.success('🎉 Post created successfully!', {
                        duration: 3000,
                        position: 'top-center'
                    });

                    // Refresh feed to show new post
                    console.log('🔄 Refreshing feed...');
                    await dispatch(fetchFeedPosts({
                        category: 'featured',
                        page: 1,
                        limit: 12
                    }));

                    handleClose();
                    console.log('✅ Feed refreshed! New post should be visible.');
                } else {
                    throw new Error(response.data.message || 'Failed to create post');
                }
            } else if (imagePreview) {
                // Post from uploaded file
                console.log('📤 Creating post from uploaded file...');

                toast.loading('Uploading post...', {
                    duration: 2000,
                    position: 'top-center'
                });

                const uploadData = {
                    image: imagePreview, // Base64 encoded image
                    caption: formData.caption || '',
                    title: formData.title || 'Uploaded Image',
                    tags: formData.tags,
                    locationName: formData.locationName || '',
                    visibility: formData.visibility
                };

                const uploadResponse = await apiService.posts.uploadAndCreatePost(uploadData);

                if (uploadResponse.data.success) {
                    toast.success('✅ Post uploaded successfully!', {
                        duration: 3000,
                        position: 'top-center'
                    });

                    // Refresh feed
                    dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 }));
                    handleClose();
                } else {
                    throw new Error(uploadResponse.data.message || 'Failed to upload post');
                }
            } else {
                toast.warning('⚠️ No content to share', {
                    duration: 3000,
                    position: 'top-center'
                });
            }
        } catch (error) {
            console.error('❌ Share error:', error);
            setIsPosting(false);

            // User-friendly error messages without exposing technical details
            let userMessage = 'Failed to create post. Please try again.';

            if (error.response?.status === 401 || error.response?.status === 403) {
                userMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.status === 413) {
                userMessage = 'File size too large. Please use a smaller image.';
            } else if (error.response?.status === 429) {
                userMessage = 'Too many requests. Please wait a moment.';
            } else if (error.response?.data?.message) {
                // Only show backend message if it's user-friendly (doesn't contain technical terms)
                const backendMsg = error.response.data.message;
                if (!backendMsg.toLowerCase().includes('undefined') &&
                    !backendMsg.toLowerCase().includes('null') &&
                    !backendMsg.toLowerCase().includes('error:') &&
                    backendMsg.length < 100) {
                    userMessage = backendMsg;
                }
            }

            toast.error(userMessage, {
                duration: 4000,
                position: 'top-center'
            });
        } finally {
            setIsPosting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName="react-hot-toast"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(28, 28, 35, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Generate Modal - First Modal */}
            {modalStep === 'generate' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleClose}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4 p-3">
                            <div className="modal-header justify-content-center border-0">
                                <h4 className="modal-title font-20 font-weight-700">Choose An Option</h4>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute end-0 me-3"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="rounded-20 bghightlight border-grey p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                            <h5 className="font-16 font-weight-700 mb-3">Upload Post</h5>
                                            <div className="mb-3">
                                                <img src="/assets/upload-2.png" alt="" />
                                            </div>
                                            <button
                                                className="btn btn-primary w-75 font-14 rounded-pill"
                                                onClick={handleBrowseFiles}
                                            >
                                                Browse Files
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="rounded-20 bghightlight border-grey p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                            <h5 className="font-16 font-weight-700 mb-3">Create Ai</h5>
                                            <div className="mb-3">
                                                <img src="/assets/ai-idea.png" alt="" />
                                            </div>
                                            <button
                                                className="btn btn-success w-75 font-14 rounded-pill"
                                                onClick={handleGenerateAI}
                                            >
                                                Generate AI
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Second Modal */}
            {modalStep === 'upload' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToGenerate}>
                    <div className="modal-dialog modal-dialog-1 modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-between align-items-center border-0">
                                <button className="btn_none" onClick={handleBackToGenerate}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <h5 className="m-0 p-0 font-16 font-weight-700">Crop</h5>
                                <button className="btn_none" onClick={handleNext}>
                                    <h5 className="text-primary m-0 p-0 font-14">Next</h5>
                                </button>
                            </div>
                            <div className="modal-body position-relative p-0">
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <div className="text-center position-relative">
                                        {isVideo ? (
                                            <video
                                                src={imagePreview}
                                                controls
                                                className="img-fluid"
                                                style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <img src={imagePreview} alt="" className="img-fluid" />
                                        )}
                                        <div className="crop-btns d-flex justify-content-between align-items-center position-relative">
                                            <div className="dropdown">
                                                <button
                                                    className="btn_none crop-btns-2"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <img src="/assets/gg_ratio.png" alt="" />
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-dark">
                                                    <li><a className="dropdown-item ratio-item" href="#" data-ratio="1:1">1:1 (Square)</a></li>
                                                    <li><a className="dropdown-item ratio-item" href="#" data-ratio="16:9">16:9 (Widescreen)</a></li>
                                                    <li><a className="dropdown-item ratio-item" href="#" data-ratio="4:5">4:5 (Portrait)</a></li>
                                                    <li><a className="dropdown-item ratio-item" href="#" data-ratio="9:16">9:16 (Story)</a></li>
                                                </ul>
                                            </div>
                                            <button className="btn_none crop-btns-1">
                                                <img src="/assets/box-multiple.png" alt="" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-5">
                                        <img src="/assets/demo-image.png" alt="" className="img-fluid" />
                                        <div className="mt-3">
                                            <button
                                                className="btn btn-primary rounded-pill px-4"
                                                onClick={() => document.getElementById('fileInput').click()}
                                            >
                                                Select Image or Video
                                            </button>
                                            <p className="text-muted font-12 mt-2 mb-0">Images or videos up to 3 minutes</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Modal - Third Modal */}
            {modalStep === 'ai' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToGenerate}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-center align-items-center border-0">
                                <button className="btn_none position-absolute start-0 ms-3" onClick={handleBackToGenerate}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <ul className="nav nav-pills rounded-pill border-grey px-3 py-1" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link nav-linkImage font-12 ${aiTab === 'image' ? 'active' : ''}`}
                                            onClick={() => setAiTab('image')}
                                        >
                                            image
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link font-12 nav-linkImage ${aiTab === 'video' ? 'active' : ''}`}
                                            onClick={() => setAiTab('video')}
                                        >
                                            video
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link font-12 nav-linkImage ${aiTab === 'audio' ? 'active' : ''}`}
                                            onClick={() => setAiTab('audio')}
                                        >
                                            audio
                                        </button>
                                    </li>
                                </ul>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute end-0 me-3"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="tab-content">
                                    {aiTab === 'image' && (
                                        <div className="tab-pane fade show active">
                                            <div className="mb-1">
                                                {/* PROMPT - First Row */}
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <label className="form-label font-12 font-weight-600 mb-2">PROMPT</label>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <img src="/assets/ri_dvd-ai-line.png" alt="" />
                                                                <p className="mb-0 font-12 fadefont">Spend {currentCost} Credit Coins</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-md-12 position-relative">
                                                        <textarea
                                                            className="form-control prompttextarea fadefont font-12"
                                                            rows="4"
                                                            name="prompt"
                                                            value={formData.prompt}
                                                            onChange={handleInputChange}
                                                            placeholder="Describe what you want to generate..."
                                                        ></textarea>
                                                        <div className="prompt-btns-1">
                                                            <button className="btn_none">
                                                                <img src="/assets/mage_image-upload.png" alt="" />
                                                            </button>
                                                        </div>
                                                        <div className="prompt-btns-2">
                                                            <button className="btn_none">
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* MODEL & ASPECT RATIO - Second Row */}
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="model-section">
                                                            <label className="model-label mb-2">MODEL</label>
                                                            <SearchableModelDropdown
                                                                models={imageModels}
                                                                selectedModelId={formData.selectedModel}
                                                                onSelect={handleModelChange}
                                                                disabled={isGenerating || modelsLoading}
                                                                isDark={true}
                                                                compact={true}
                                                                placeholder="Select a model"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="aspect-section">
                                                            <label className="aspect-label mb-2">ASPECT RATIO</label>
                                                            <div className="aspect-wrapper">
                                                                <select
                                                                    className="form-control"
                                                                    name="aspectRatio"
                                                                    value={formData.aspectRatio}
                                                                    onChange={handleInputChange}
                                                                    disabled={isGenerating}
                                                                    style={{
                                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '12px',
                                                                        padding: '12px 16px',
                                                                        color: '#fff',
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        height: '48px'
                                                                    }}
                                                                >
                                                                    <option value="1:1" style={{ backgroundColor: '#1a1a1a' }}>1:1 Square</option>
                                                                    <option value="16:9" style={{ backgroundColor: '#1a1a1a' }}>16:9 Landscape</option>
                                                                    <option value="9:16" style={{ backgroundColor: '#1a1a1a' }}>9:16 Portrait</option>
                                                                    <option value="4:3" style={{ backgroundColor: '#1a1a1a' }}>4:3 Landscape</option>
                                                                    <option value="3:4" style={{ backgroundColor: '#1a1a1a' }}>3:4 Portrait</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-md-12 text-center">
                                                        <button
                                                            className="btn btn-primary rounded-pill px-5 py-2 font-14"
                                                            onClick={handleRunAI}
                                                            disabled={isGenerating || !formData.prompt.trim()}
                                                        >
                                                            {isGenerating ? 'Generating...' : 'Generate'} <img src="/assets/si_ai-fill.png" alt="" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {aiTab === 'video' && (
                                        <div className="tab-pane fade show active">
                                            <div className="p-4">
                                                <div className="row">
                                                    <div className="col-md-12 position-relative">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <label className="form-label font-12 font-weight-600 mb-0">PROMPT</label>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <img src="/assets/ri_dvd-ai-line.png" alt="" />
                                                                <p className="mb-0 font-12 fadefont">Spend {currentCost} Credit Coins</p>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            className="form-control prompttextarea fadefont font-12"
                                                            rows="4"
                                                            name="prompt"
                                                            value={formData.prompt}
                                                            onChange={handleInputChange}
                                                            placeholder="Describe the video you want to generate..."
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="model-section">
                                                            <label className="model-label mb-2">VIDEO MODEL</label>
                                                            <SearchableModelDropdown
                                                                models={videoModels}
                                                                selectedModelId={formData.selectedModel}
                                                                onSelect={handleModelChange}
                                                                disabled={isGenerating || modelsLoading}
                                                                isDark={true}
                                                                compact={true}
                                                                placeholder="Select video model"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="aspect-section">
                                                            <label className="aspect-label mb-2">ASPECT RATIO</label>
                                                            <div className="aspect-wrapper">
                                                                <select
                                                                    className="aspect-select"
                                                                    name="aspectRatio"
                                                                    value={formData.aspectRatio}
                                                                    onChange={handleInputChange}
                                                                    disabled={isGenerating}
                                                                >
                                                                    <option value="16:9">16:9 Landscape</option>
                                                                    <option value="9:16">9:16 Portrait</option>
                                                                    <option value="1:1">1:1 Square</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-md-12 text-center">
                                                        <button
                                                            className="btn btn-success rounded-pill px-5 py-2 font-14"
                                                            onClick={handleRunAI}
                                                            disabled={isGenerating || !formData.prompt.trim()}
                                                        >
                                                            {isGenerating ? 'Generating Video...' : 'Generate Video'} <i className="fa-solid fa-video ms-2"></i>
                                                        </button>
                                                        <p className="text-muted font-12 mt-2">
                                                            Video models: {videoModels.length} available
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {aiTab === 'audio' && (
                                        <div className="tab-pane fade show active">
                                            <p className="text-center text-muted py-5">Audio generation coming soon...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generating Modal — Progressive Image Reveal */}
            {modalStep === 'generating' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-center align-items-center border-0">
                                <h5 className="m-0 p-0 font-16 font-weight-700">Generating {isVideo ? 'Video' : 'Image'}</h5>
                            </div>
                            <div className="modal-body p-3">
                                <ProgressiveImageReveal
                                    src={imagePreview}
                                    isGenerating={isGenerating}
                                    progress={generationProgress}
                                    generationStatus={generationStatus}
                                    aspectRatio={formData.aspectRatio}
                                    isDark={true}
                                />
                                <p className="text-muted font-12 mt-3 text-center mb-0">
                                    {formData.prompt.substring(0, 80)}{formData.prompt.length > 80 ? '...' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Modal - Show Result and Post Button */}
            {modalStep === 'generated' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToAI}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-between align-items-center border-0">
                                <button className="btn_none" onClick={handleBackToAI}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <h5 className="m-0 p-0 font-16 font-weight-700">Generated Image</h5>
                                <button className="btn_none" onClick={() => setModalStep('next')}>
                                    <h5 className="text-primary m-0 p-0 font-14">Next</h5>
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="text-center bg-black" style={{ minHeight: '400px' }}>
                                    {imagePreview && (
                                        isVideo ? (
                                            <video
                                                src={imagePreview}
                                                controls
                                                autoPlay
                                                loop
                                                className="img-fluid"
                                                style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <img
                                                src={imagePreview}
                                                alt="Generated"
                                                className="img-fluid"
                                                style={{ maxHeight: '500px', objectFit: 'contain', width: '100%' }}
                                            />
                                        )
                                    )}
                                </div>
                                <div className="px-4 py-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <small className="text-muted d-block">Model: {formData.selectedModel}</small>
                                            <small className="text-muted d-block">Aspect Ratio: {formData.aspectRatio}</small>
                                        </div>
                                        <button
                                            className="btn btn-success rounded-pill px-4 py-2 font-14"
                                            onClick={() => setModalStep('next')}
                                        >
                                            Post Now
                                        </button>
                                    </div>
                                    <div className="alert alert-success font-12 mb-0">
                                        <i className="fa-solid fa-check-circle me-2"></i>
                                        Image generated successfully! Click "Post Now" to share.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Next Modal - Fourth Modal */}
            {modalStep === 'next' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={() => aiGenerationIds.length > 0 ? setModalStep('generated') : handleBackToCrop()}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-between align-items-center border-0">
                                <button className="btn_none" onClick={() => aiGenerationIds.length > 0 ? setModalStep('generated') : handleBackToCrop()}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <h5 className="m-0 p-0 font-16 font-weight-700">
                                    {aiGenerationIds.length > 0 ? 'Post AI Creation' : 'Upload Post'}
                                </h5>
                                <button className="btn_none" onClick={handleShare} disabled={isPosting}>
                                    <h5 className={`m-0 p-0 font-14 ${isPosting ? 'text-muted' : 'text-primary'}`}>
                                        {isPosting ? 'Posting...' : (aiGenerationIds.length > 0 ? 'Post' : 'Share')}
                                    </h5>
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="row p-0 m-0">
                                    <div className="col-md-6 m-0 p-0">
                                        <div className="text-center bg-black" style={{ minHeight: '500px' }}>
                                            {imagePreview && (
                                                isVideo ? (
                                                    <video
                                                        src={imagePreview}
                                                        controls
                                                        className="img-fluid"
                                                        style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={imagePreview}
                                                        alt=""
                                                        className="img-fluid"
                                                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 m-0 p-0">
                                        <div className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <img
                                                    src={user?.avatar || '/assets/ellipse4.png'}
                                                    alt={user?.username || 'User'}
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                                <p className="mb-0 font-14 font-weight-600">@{user?.username || 'username'}</p>
                                            </div>

                                            {aiGenerationIds.length > 0 && (
                                                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
                                                    <img src="/assets/si_ai-fill.png" alt="" style={{ width: '16px' }} />
                                                    <small className="mb-0">AI Generated with {formData.selectedModel}</small>
                                                </div>
                                            )}

                                            <div className="position-relative mb-3">
                                                <textarea
                                                    className="posttextarea fadefont font-13"
                                                    rows="4"
                                                    name="caption"
                                                    value={formData.caption}
                                                    onChange={handleInputChange}
                                                    placeholder={aiGenerationIds.length > 0 ? `Generated prompt: ${formData.prompt}` : "Share something about the picture..."}
                                                ></textarea>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <button className="btn_none">
                                                        <img src="/assets/emoji-16-regular.png" alt="" />
                                                    </button>
                                                    <p className="mb-0 font-12 fadefont">0/2000</p>
                                                </div>
                                            </div>
                                            {/* Location Input */}
                                            <div className="mb-3">
                                                <label className="form-label font-12 font-weight-600 mb-2">
                                                    <img src="/assets/mi_location.png" alt="" className="me-2" style={{ width: '16px' }} />
                                                    Location (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-dark text-light border-grey font-13"
                                                    name="locationName"
                                                    value={formData.locationName}
                                                    onChange={handleInputChange}
                                                    placeholder="Add location"
                                                    style={{
                                                        backgroundColor: '#1a1a1a',
                                                        color: '#fff',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
                                            </div>

                                            {/* Title Input */}
                                            <div className="mb-3">
                                                <label className="form-label font-12 font-weight-600 mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-dark text-light border-grey font-13"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Give your post a title"
                                                    style={{
                                                        backgroundColor: '#1a1a1a',
                                                        color: '#fff',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    }}
                                                />
                                            </div>

                                            {/* Tags Input */}
                                            <div className="mb-3">
                                                <label className="form-label font-12 font-weight-600 mb-2">
                                                    Tags ({formData.tags.length}/5)
                                                </label>
                                                <div
                                                    className="d-flex flex-wrap align-items-center gap-2 p-2"
                                                    style={{
                                                        backgroundColor: '#1a1a1a',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        minHeight: '42px'
                                                    }}
                                                >
                                                    {formData.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="d-inline-flex align-items-center gap-1 px-2 py-1 font-12"
                                                            style={{
                                                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                                color: '#3b82f6',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)'
                                                            }}
                                                        >
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                className="btn_none p-0 ms-1"
                                                                onClick={() => removeTag(index)}
                                                                style={{ lineHeight: 1 }}
                                                            >
                                                                <i className="fa-solid fa-xmark" style={{ fontSize: '10px', color: '#3b82f6' }}></i>
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        className="grow border-0 bg-transparent text-light font-13"
                                                        value={tagInput}
                                                        onChange={handleTagInput}
                                                        onKeyDown={handleTagKeyDown}
                                                        placeholder={formData.tags.length === 0 ? "Add tags (press Enter or comma)" : ""}
                                                        disabled={formData.tags.length >= 5}
                                                        style={{
                                                            outline: 'none',
                                                            minWidth: '150px',
                                                            padding: '4px 8px'
                                                        }}
                                                    />
                                                </div>
                                                {formData.tags.length >= 5 && (
                                                    <small className="text-warning font-11 mt-1 d-block">Maximum 5 tags reached</small>
                                                )}
                                            </div>

                                            {/* Visibility Select */}
                                            <div className="mb-3">
                                                <label className="form-label font-12 font-weight-600 mb-2">Visibility</label>
                                                <select
                                                    className="form-select bg-dark text-light border-grey font-13"
                                                    name="visibility"
                                                    value={formData.visibility}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        backgroundColor: '#1a1a1a',
                                                        color: '#fff',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <option value="public" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>🌍 Public</option>
                                                    <option value="followers" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>👥 Followers Only</option>
                                                    <option value="private" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>🔒 Private</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateModal;
