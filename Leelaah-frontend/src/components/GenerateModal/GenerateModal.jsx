import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './GenerateModal.css';
import apiService from '../../services/api';
import { fetchFeedPosts } from '../../store/slices/postsSlice';

const GenerateModal = ({ isOpen, onClose, onOpenAuth }) => {
    const dispatch = useDispatch();

    // Get authentication state from Redux
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [modalStep, setModalStep] = useState('generate'); // 'generate', 'upload', 'ai', 'next', 'generating', 'generated'
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiTab, setAiTab] = useState('image');
    const [uploadType, setUploadType] = useState('draft');
    const [formData, setFormData] = useState({
        prompt: '',
        caption: '',
        selectedModel: 'flux-schnell', // Changed from 'model' to 'selectedModel' to match backend
        aspectRatio: '1:1', // Backend expects format like '1:1', '16:9', etc.
        numInferenceSteps: 4,
        guidanceScale: 3.5
    });

    // AI Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generationRequestId, setGenerationRequestId] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [aiGenerationIds, setAiGenerationIds] = useState([]);

    // Post creation state
    const [isPosting, setIsPosting] = useState(false);

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setModalStep('generate');
        setSelectedFile(null);
        setImagePreview(null);
        setAiTab('image');
        setUploadType('draft');
        setFormData({
            prompt: '',
            caption: '',
            selectedModel: 'flux-schnell',
            aspectRatio: '1:1',
            numInferenceSteps: 4,
            guidanceScale: 3.5
        });
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
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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

    const handleUploadTypeToggle = (type) => {
        setUploadType(type);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRunAI = async () => {
        if (!formData.prompt.trim()) {
            alert('Please enter a prompt');
            return;
        }

        try {
            setIsGenerating(true);
            setGenerationStatus('Initializing AI generation...');
            setGenerationProgress(10);
            setModalStep('generating');

            // Prepare payload according to backend structure
            const payload = {
                prompt: formData.prompt.trim(),
                selectedModel: formData.selectedModel,
                aspectRatio: formData.aspectRatio,
                numInferenceSteps: formData.selectedModel === 'flux-schnell' ? Math.min(formData.numInferenceSteps, 12) : formData.numInferenceSteps,
                guidanceScale: formData.guidanceScale,
                numImages: 1
            };

            console.log('🎨 Starting AI generation with payload:', payload);

            const response = await apiService.posts.generateImage(payload);

            if (response.data.success && response.data.generations && response.data.generations.length > 0) {
                const generation = response.data.generations[0];

                // Store BOTH requestId AND aiGenerationId from initial response
                console.log('✅ Generation started:', {
                    requestId: generation.requestId,
                    aiGenerationId: generation.aiGenerationId
                });

                setGenerationRequestId(generation.requestId);
                setAiGenerationIds([generation.aiGenerationId]); // ← Store ID from FIRST response!
                setGenerationStatus('Generation started, processing...');
                setGenerationProgress(30);

                // Start polling for result (only to get imageUrl)
                pollGenerationStatus(generation.requestId);
            } else {
                throw new Error('Failed to start generation');
            }

        } catch (error) {
            console.error('❌ AI Generation Error:', error);
            setIsGenerating(false);
            setGenerationStatus('');
            setModalStep('ai');
            alert(error.response?.data?.message || 'Failed to generate image. Please try again.');
        }
    };

    // Poll generation status
    const pollGenerationStatus = async (requestId) => {
        const maxAttempts = 60; // 60 attempts = 60 seconds
        let attempts = 0;

        const poll = setInterval(async () => {
            attempts++;

            try {
                const response = await apiService.posts.getGenerationResult(requestId);

                console.log(`🔄 Poll attempt ${attempts}: Status -`, response.data.status);

                if (response.data.status === 'completed' && response.data.imageUrl) {
                    clearInterval(poll);
                    setGenerationProgress(100);
                    setGenerationStatus('Generation complete!');

                    console.log('✅ Generation completed! Image URL:', response.data.imageUrl);

                    // NOTE: aiGenerationId was already stored from initial response
                    // Polling response only gives us the imageUrl
                    setGeneratedImages([response.data.imageUrl]);
                    setImagePreview(response.data.imageUrl);
                    setIsGenerating(false);
                    setModalStep('generated');
                    console.log('✅ Ready to post!');
                } else if (response.data.status === 'failed') {
                    clearInterval(poll);
                    setIsGenerating(false);
                    setGenerationStatus('');
                    setModalStep('ai');
                    alert('Image generation failed. Please try again.');
                    console.error('❌ Generation failed');
                } else {
                    // Still processing
                    const progress = 30 + Math.min((attempts / maxAttempts) * 60, 60);
                    setGenerationProgress(progress);
                    setGenerationStatus(response.data.status === 'processing' ? 'Processing your image...' : 'Queued for generation...');
                }

            } catch (error) {
                console.error('❌ Poll error:', error);
                // Continue polling unless max attempts reached
            }

            if (attempts >= maxAttempts) {
                clearInterval(poll);
                setIsGenerating(false);
                setGenerationStatus('');
                setModalStep('ai');
                alert('Generation timeout. Please try again.');
                console.error('❌ Generation timeout');
            }
        }, 2000); // Poll every 2 seconds
    };

    const handleShare = async () => {
        // Prevent multiple submissions
        if (isPosting) {
            console.log('⚠️ Already posting, please wait...');
            return;
        }

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
                alert('Please log in to create a post');
                return;
            }

            // Check if this is from AI generation (works for both 'generated' and 'next' steps)
            if (aiGenerationIds.length > 0) {
                setIsPosting(true);

                // Post from AI generation
                console.log('📤 Creating post from AI generation...');
                console.log('🆔 AI Generation IDs (raw):', aiGenerationIds);
                console.log('📝 Caption:', formData.caption);
                console.log('📁 Upload Type:', uploadType);

                // Filter out null/undefined values
                const validGenerationIds = aiGenerationIds.filter(id => id != null && id !== undefined);

                if (validGenerationIds.length === 0) {
                    throw new Error('No valid AI generation IDs found. Please regenerate the image.');
                }

                console.log('✅ Valid AI Generation IDs:', validGenerationIds);

                const postData = {
                    aiGenerationIds: validGenerationIds,
                    caption: formData.caption.trim() || `AI generated: ${formData.prompt}`,
                    title: formData.caption.trim() || 'AI Generated Image',
                    type: 'content',
                    category: 'image-post',
                    tags: ['ai-generated', formData.selectedModel],
                    visibility: 'public' // Always public so posts appear in feed immediately
                };

                console.log('📦 Payload being sent:', JSON.stringify(postData, null, 2));

                const response = await apiService.posts.createPostFromGeneration(postData);

                console.log('✅ Response:', response.data);
                console.log('📋 Created Post:', response.data.post);

                if (response.data.success) {
                    alert('🎉 Post created successfully!');

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
            } else if (imagePreview && selectedFile) {
                // Post from uploaded file
                console.log('📤 Creating post from uploaded file...');
                alert('File upload post creation coming soon!');
                handleClose();
            } else {
                alert('⚠️ No content to share');
            }
        } catch (error) {
            console.error('❌ Share error:', error);
            setIsPosting(false);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create post. Please try again.';
            alert(`❌ Error: ${errorMessage}`);
        }
    };

    if (!isOpen) return null;

    return (
        <>
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
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <div className="text-center position-relative">
                                        <img src={imagePreview} alt="" className="img-fluid" />
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
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="1:1">
                                                            1:1 (Square)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="16:9">
                                                            16:9 (Widescreen)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="4:5">
                                                            4:5 (Portrait)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="9:16">
                                                            9:16 (Story)
                                                        </a>
                                                    </li>
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
                                                Select Image
                                            </button>
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
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <label className="form-label font-12 font-weight-600 mb-2">PROMPT</label>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <img src="/assets/ri_dvd-ai-line.png" alt="" />
                                                                <p className="mb-0 font-12 fadefont">Spend 150 Credit Coins</p>
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
                                                <div className="row mt-3">
                                                    <div className="col-md-4">
                                                        <div className="model-section">
                                                            <label className="model-label mb-2">MODEL</label>
                                                            <div className="model-select-wrapper">
                                                                <select
                                                                    className="model-dropdown"
                                                                    name="selectedModel"
                                                                    value={formData.selectedModel}
                                                                    onChange={handleInputChange}
                                                                    disabled={isGenerating}
                                                                >
                                                                    <option value="flux-schnell">FLUX Schnell (Fast - 15-20s)</option>
                                                                    <option value="flux-1-srpo">FLUX.1 SRPO (Quality - 25-35s)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
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
                                                                    <option value="1:1">1:1 Square</option>
                                                                    <option value="16:9">16:9 Landscape</option>
                                                                    <option value="9:16">9:16 Portrait</option>
                                                                    <option value="4:3">4:3 Landscape</option>
                                                                    <option value="3:4">3:4 Portrait</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="model-label mb-2">UPLOAD TYPE</label>
                                                        <div className="upload-type" role="tablist">
                                                            <button
                                                                type="button"
                                                                className={`upload-btn ${uploadType === 'draft' ? 'upload-btn--active' : 'upload-btn--inactive'}`}
                                                                onClick={() => handleUploadTypeToggle('draft')}
                                                            >
                                                                Upload to Draft
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`upload-btn ${uploadType === 'profile' ? 'upload-btn--active' : 'upload-btn--inactive'}`}
                                                                onClick={() => handleUploadTypeToggle('profile')}
                                                            >
                                                                Upload to Profile
                                                            </button>
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
                                            <p className="text-center text-muted py-5">Video generation coming soon...</p>
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

            {/* Generating Modal - Progress Display */}
            {modalStep === 'generating' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-center align-items-center border-0">
                                <h5 className="m-0 p-0 font-16 font-weight-700">Generating Image</h5>
                            </div>
                            <div className="modal-body text-center py-5">
                                <div className="mb-4">
                                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                                <h6 className="font-14 mb-3">{generationStatus}</h6>
                                <div className="progress mx-auto" style={{ maxWidth: '300px', height: '8px' }}>
                                    <div
                                        className="progress-bar bg-primary"
                                        role="progressbar"
                                        style={{ width: `${generationProgress}%` }}
                                        aria-valuenow={generationProgress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                                <p className="text-muted font-12 mt-3 mb-0">{Math.round(generationProgress)}% Complete</p>
                                <p className="text-muted font-12 mt-2">
                                    {formData.selectedModel === 'flux-schnell'
                                        ? 'ETA: 15-20 seconds (Fast Mode)'
                                        : 'ETA: 25-35 seconds (Quality Mode)'}
                                </p>
                                <div className="mt-4">
                                    <small className="text-muted">Prompt: {formData.prompt.substring(0, 60)}...</small>
                                </div>
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
                                        <img
                                            src={imagePreview}
                                            alt="Generated"
                                            className="img-fluid"
                                            style={{ maxHeight: '500px', objectFit: 'contain', width: '100%' }}
                                        />
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
                                                <img
                                                    src={imagePreview}
                                                    alt=""
                                                    className="img-fluid"
                                                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 m-0 p-0">
                                        <div className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <img src="/assets/ellipse4.png" alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                                <p className="mb-0 font-14 font-weight-600">junaidali0077</p>
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
                                            <div className="border-bottom_1 pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Add Location</h6>
                                                    <img src="/assets/mi_location.png" alt="" />
                                                </div>
                                            </div>
                                            <div className="border-bottom_1 pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Add Collaborators</h6>
                                                    <img src="/assets/hugeicons_ai-user.png" alt="" />
                                                </div>
                                            </div>
                                            <div className="pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Advance setting</h6>
                                                    <img src="/assets/icon-park-outline_down.png" alt="" />
                                                </div>
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
