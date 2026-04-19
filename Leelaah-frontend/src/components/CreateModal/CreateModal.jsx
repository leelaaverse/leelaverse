import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiX, FiImage, FiVideo, FiUpload, FiChevronDown, FiMapPin, FiTag, FiEye, FiType, FiSend, FiRefreshCw, FiArrowLeft, FiPaperclip, FiMinimize2 } from 'react-icons/fi';
import { usePostProgress } from '../../contexts/PostProgressContext';
import { HiOutlineSparkles } from 'react-icons/hi';
import { PiCoinsBold } from 'react-icons/pi';
import apiService from '../../services/api';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import { fetchModels } from '../../store/slices/modelsSlice';
import SearchableModelDropdown from '../shared/SearchableModelDropdown';
import ProgressiveImageReveal from '../shared/ProgressiveImageReveal';

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
    { value: '4:3', label: '4:3' },
];

// ──────────────────────────────────────────────
// CreateModal
// ──────────────────────────────────────────────
const CreateModal = ({
    isOpen, onClose, onOpenAuth, onNavigate, initialData = null,
    // Draft-posting props (from ViewProfile Drafts tab)
    initialStep, initialImagePreview, initialAiGenerationIds,
    initialModel, initialPrompt, initialAspectRatio, initialIsVideo
}) => {
    const dispatch = useDispatch();
    const { isLoggedIn, user } = useSelector((s) => s.auth);
    const { imageModels, videoModels, status: modelsStatus } = useSelector((s) => s.models);
    const modelsLoading = modelsStatus === 'loading';

    const [step, setStep] = useState(initialStep || 'create');
    const [mediaType, setMediaType] = useState('image');

    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [selectedModel, setSelectedModel] = useState(initialModel || '');
    const [aspectRatio, setAspectRatio] = useState(initialAspectRatio || '1:1');
    const [numInferenceSteps, setNumInferenceSteps] = useState(4);
    const [guidanceScale, setGuidanceScale] = useState(3.5);
    const [duration, setDuration] = useState(null); // video duration — auto-set from model params

    const [isGenerating, setIsGenerating] = useState(false);
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generationRequestId, setGenerationRequestId] = useState(null);
    const [aiGenerationIds, setAiGenerationIds] = useState(initialAiGenerationIds || []);

    // Prompt enhancer state
    const [isEnhancing, setIsEnhancing] = useState(false);
    const enhanceAbortRef = useRef(null);
    const promptTextareaRef = useRef(null);

    // Auto-resize textarea when prompt updates (from enhancer streaming)
    useEffect(() => {
        const ta = promptTextareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        }
    }, [prompt]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialImagePreview || null);
    const [isVideo, setIsVideo] = useState(initialIsVideo || false);

    // ── reference media (for img2img, img2vid, vid2vid) ──
    const [referenceFile, setReferenceFile] = useState(null);
    const [referencePreview, setReferencePreview] = useState(null);
    const [referenceIsVideo, setReferenceIsVideo] = useState(false);

    const [caption, setCaption] = useState('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [locationName, setLocationName] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [isPosting, setIsPosting] = useState(false);

    const fileInputRef = useRef(null);
    const refFileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && modelsStatus === 'idle') dispatch(fetchModels());
    }, [isOpen, modelsStatus, dispatch]);

    useEffect(() => {
        if (!isOpen) return;
        
        // If draft-posting props are provided, skip regular initialData logic
        if (initialStep) return;

        if (initialData) {
            setStep('generate');
            setPrompt(initialData.prompt || '');
            if (initialData.type === 'video' || initialData.type === 'image') {
                setMediaType(initialData.type);
            }
            if (initialData.model) {
                // We'll set the selected model, but we have to wait for the models to load
                setSelectedModel(initialData.model);
            }
        } else {
            setStep('create');
            setPrompt('');
        }
    }, [initialData, isOpen, initialStep]);

    useEffect(() => {
        const models = mediaType === 'image' ? imageModels : videoModels;
        if (models.length > 0 && !models.find(m => m.id === selectedModel)) {
            setSelectedModel(models[0].id);
        }
    }, [mediaType, imageModels, videoModels, selectedModel]);

    useEffect(() => {
        if (!isOpen) return;
        const videos = document.querySelectorAll('video:not(.cm-vid)');
        const playing = [];
        videos.forEach((v) => { if (!v.paused) { v.pause(); playing.push(v); } });
        document.body.style.overflow = 'hidden';
        return () => {
            playing.forEach((v) => { try { v.play(); } catch (_) {} });
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const currentCost = useMemo(() => {
        const models = mediaType === 'image' ? imageModels : videoModels;
        const m = models.find((m) => m.id === selectedModel);
        return m?.creditCost || (selectedModel === 'flux-schnell' ? 50 : 150);
    }, [mediaType, imageModels, videoModels, selectedModel]);

    const availableModels = useMemo(() => {
        if (mediaType === 'image') return imageModels;
        // For video: only show text-to-video when no reference image is provided,
        // show all video models (including image-to-video) when a reference is uploaded
        if (referenceFile) return videoModels;
        return videoModels.filter(m => !m.requiresImage);
    }, [mediaType, imageModels, videoModels, referenceFile]);

    const resetAll = useCallback(() => {
        setStep('create'); setMediaType('image'); setPrompt(''); setSelectedModel(''); setMediaLoaded(false);
        setAspectRatio('1:1'); setNumInferenceSteps(4); setGuidanceScale(3.5); setDuration(null);
        setIsGenerating(false); setGenerationProgress(0); setGenerationStatus('');
        setGenerationRequestId(null); setAiGenerationIds([]); setSelectedFile(null);
        setImagePreview(null); setIsVideo(false); setCaption(''); setTitle('');
        setTags([]); setTagInput(''); setLocationName(''); setVisibility('public');
        setIsPosting(false); setReferenceFile(null); setReferencePreview(null); setReferenceIsVideo(false);
    }, []);

    const handleClose = useCallback(() => { resetAll(); onClose(); }, [resetAll, onClose]);

    const handleModelChange = useCallback((modelId) => {
        const models = mediaType === 'image' ? imageModels : videoModels;
        const m = models.find((m) => m.id === modelId);
        setSelectedModel(modelId);
        if (m) {
            setNumInferenceSteps(m.defaultSteps || 4);
            setGuidanceScale(m.defaultGuidance || 3.5);
            // Auto-set duration from model parameters
            if (m.parameters?.duration) {
                const d = m.parameters.duration;
                setDuration(d.default != null ? String(d.default) : null);
            } else {
                setDuration(null);
            }
        }
        // Video models have restricted aspect ratio support — reset to 16:9 which all support
        if (mediaType === 'video') {
            setAspectRatio('16:9');
        }
    }, [mediaType, imageModels, videoModels]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            setSelectedFile(file); setIsVideo(false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file); setStep('upload');
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 180) { toast.error('Video must be 3 minutes or less'); e.target.value = ''; return; }
                setSelectedFile(file); setIsVideo(true);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file); setStep('upload');
            };
            video.onerror = () => { toast.error('Unable to load video'); e.target.value = ''; };
            video.src = URL.createObjectURL(file);
        } else { toast.error('Please select an image or video file'); e.target.value = ''; }
    }, []);

    // ── reference file upload (for generation panel) ──
    const handleReferenceFile = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            setReferenceFile(file); setReferenceIsVideo(false);
            const reader = new FileReader();
            reader.onloadend = () => setReferencePreview(reader.result);
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 30) { toast.error('Reference video must be 30s or less'); e.target.value = ''; return; }
                setReferenceFile(file); setReferenceIsVideo(true);
                const reader = new FileReader();
                reader.onloadend = () => setReferencePreview(reader.result);
                reader.readAsDataURL(file);
            };
            video.onerror = () => { toast.error('Unable to load video'); e.target.value = ''; };
            video.src = URL.createObjectURL(file);
        } else { toast.error('Please select an image or video'); e.target.value = ''; }
    }, []);

    const removeReference = useCallback(() => {
        setReferenceFile(null); setReferencePreview(null); setReferenceIsVideo(false);
        if (refFileInputRef.current) refFileInputRef.current.value = '';
    }, []);

    // ── smart generation mode label ──
    const generationMode = useMemo(() => {
        if (!referenceFile) return mediaType === 'image' ? 'Text → Image' : 'Text → Video';
        if (referenceIsVideo) return mediaType === 'video' ? 'Video → Video' : 'Video → Image';
        return mediaType === 'image' ? 'Image → Image' : 'Image → Video';
    }, [referenceFile, referenceIsVideo, mediaType]);

    const addTag = useCallback((val) => {
        const t = val.trim();
        if (t && tags.length < 5 && !tags.includes(t)) { setTags((p) => [...p, t]); setTagInput(''); }
        else if (tags.length >= 5) toast.error('Maximum 5 tags allowed');
    }, [tags]);

    const removeTag = useCallback((i) => { setTags((p) => p.filter((_, idx) => idx !== i)); }, []);

    const handleTagKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput.replace(',', '')); }
        else if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags((p) => p.slice(0, -1));
    }, [tagInput, tags, addTag]);

    // ── AI GENERATION ──
    const pollGenerationStatus = useCallback(async (requestId, isVideoGen) => {
        const maxAttempts = isVideoGen ? 120 : 60;
        let attempts = 0;
        const poll = async () => {
            try {
                const response = await apiService.posts.getGenerationResult(requestId);
                if (response.data.success) {
                    const { status, imageUrl, videoUrl } = response.data;
                    const outputUrl = isVideoGen ? videoUrl : imageUrl;
                    if (status === 'completed' && outputUrl) {
                        setGenerationProgress(100); setGenerationStatus(isVideoGen ? 'Video generated!' : 'Image generated!');
                        setImagePreview(outputUrl); setStep('result'); setIsGenerating(false);
                        toast.success(isVideoGen ? 'Video generated successfully!' : 'Image generated successfully!');
                        return;
                    } else if (status === 'failed') throw new Error('Generation failed. Please try again.');
                    else {
                        setGenerationProgress(Math.min(10 + (attempts * (isVideoGen ? 0.75 : 1.5)), 95));
                        const queuePos = response.data.queuePosition;
                        setGenerationStatus(queuePos ? `In queue (position ${queuePos})...` : (isVideoGen ? 'Generating video...' : 'Processing image...'));
                    }
                }
                attempts++;
                if (attempts < maxAttempts) setTimeout(poll, isVideoGen ? 2000 : 1000);
                else throw new Error('Generation is taking longer than expected.');
            } catch (error) {
                setIsGenerating(false); setStep('generate');
                toast.error(error.response?.data?.message || error.message || 'Generation failed.');
            }
        };
        poll();
    }, []);

    // ── PROMPT ENHANCER (SSE streaming — typing effect) ──
    const handleEnhancePrompt = useCallback(async () => {
        if (!prompt.trim() || isEnhancing) return;
        setIsEnhancing(true);

        const abortController = new AbortController();
        enhanceAbortRef.current = abortController;

        try {
            const type = mediaType === 'video' ? 'video' : 'video'; // use video enhancer for both image/video
            const response = await apiService.ai.enhancePromptStream(prompt.trim(), type);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Enhancement failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let enhanced = '';

            // Clear prompt and start typing
            setPrompt('');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (abortController.signal.aborted) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.token) {
                                enhanced += data.token;
                                setPrompt(enhanced);
                            }
                            if (data.done && data.fullText) {
                                enhanced = data.fullText;
                                setPrompt(data.fullText);
                            }
                            if (data.error) {
                                toast.error(data.error);
                            }
                        } catch (e) { /* skip malformed JSON */ }
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                toast.error(err.message || 'Failed to enhance prompt');
            }
        } finally {
            setIsEnhancing(false);
            enhanceAbortRef.current = null;
        }
    }, [prompt, mediaType, isEnhancing]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }

        // Guard: image-to-video models need a reference image
        const isVideoGen = mediaType === 'video';
        if (isVideoGen) {
            const modelInfo = availableModels.find(m => m.id === selectedModel);
            if (modelInfo?.requiresImage && !referencePreview) {
                toast.error('This model requires a reference image. Upload one using the Reference button.');
                return;
            }
            if (!selectedModel) {
                toast.error('Please select a video model');
                return;
            }
        }

        try {
            setIsGenerating(true);
            setGenerationStatus(isVideoGen ? 'Initializing Video AI...' : 'Initializing Image AI...');
            setGenerationProgress(5); setStep('generating');
            setIsVideo(isVideoGen);

            // Build payload for new API
            const payload = {
                modelId: selectedModel,
                prompt: prompt.trim(),
                aspect_ratio: aspectRatio,
            };
            if (!isVideoGen) {
                payload.num_inference_steps = selectedModel.includes('schnell') ? Math.min(numInferenceSteps, 12) : numInferenceSteps;
                payload.guidance_scale = guidanceScale;
                payload.num_images = 1;
            } else {
                // Include duration for video models
                if (duration) {
                    payload.duration = duration;
                }
                if (referencePreview) {
                    // Include reference image for image-to-video models
                    payload.image_url = referencePreview;
                }
            }

            // Progressive progress animation
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) { clearInterval(progressInterval); return prev; }
                    return prev + (isVideoGen ? 0.3 : 0.8);
                });
                setGenerationStatus(() => {
                    const msgs = isVideoGen
                        ? ['Generating video...', 'Processing frames...', 'Rendering...']
                        : ['Generating...', 'Creating image...', 'Rendering details...', 'Finalizing...'];
                    return msgs[Math.floor(Math.random() * msgs.length)];
                });
            }, 1500);

            let response;
            if (isVideoGen) {
                response = await apiService.ai.generateVideo(payload);
            } else {
                response = await apiService.ai.generateImage(payload);
            }

            clearInterval(progressInterval);

            // New API returns result directly
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                const images = data.images || [];
                const resultUrl = images[0]?.url || data.image?.url || data.video?.url || data.resultUrl;
                if (resultUrl) {
                    setGenerationProgress(98); 
                    setGenerationStatus(isVideoGen ? 'Downloading video...' : 'Downloading image...');
                    // Preload the image so it doesn't blink black
                    await new Promise((resolve) => {
                        if (isVideoGen) return resolve();
                        const img = new Image();
                        img.onload = resolve;
                        img.onerror = resolve; // Continue anyway if it fails
                        img.src = resultUrl;
                    });
                    
                    setGenerationProgress(100); setGenerationStatus('Done!');
                    setImagePreview(resultUrl); setStep('result'); setIsGenerating(false);
                    setAiGenerationIds([data.generationId]);
                    toast.success(isVideoGen ? 'Video generated!' : 'Image generated!');
                    return;
                }
            }

            // Fallback: old polling flow
            if (response.data.success && response.data.generations?.length > 0) {
                const gen = response.data.generations[0];
                setGenerationRequestId(gen.requestId); setAiGenerationIds([gen.aiGenerationId]);
                setGenerationStatus(isVideoGen ? 'Video generating...' : 'Generation started...');
                setGenerationProgress(10); pollGenerationStatus(gen.requestId, isVideoGen);
            } else throw new Error('Failed to start generation');
        } catch (error) {
            setIsGenerating(false); setStep('generate');
            // Show the specific error — fal.ai errors, validation errors, credit errors, etc.
            const errMsg = error.response?.data?.errors?.join(', ')
                || error.response?.data?.error
                || error.response?.data?.message
                || error.message
                || 'Failed to start generation.';
            toast.error(errMsg, { duration: 5000 });
        }
    }, [prompt, mediaType, selectedModel, aspectRatio, numInferenceSteps, guidanceScale, pollGenerationStatus, availableModels, referencePreview]);

    // ── POST (via PostProgressContext — minimizable) ──
    const postProgress = usePostProgress();

    const handleMinimize = useCallback(() => {
        postProgress.minimize();
        onClose();  // close the modal overlay but don't reset state
    }, [postProgress, onClose]);

    const handlePost = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !isLoggedIn) { toast.error('Please log in to create a post'); return; }

        if (aiGenerationIds.length > 0) {
            const validIds = aiGenerationIds.filter((id) => id != null);
            if (validIds.length === 0) { toast.error('No valid generation IDs.'); return; }
            const allTags = ['ai-generated', selectedModel, ...tags];
            const postData = { aiGenerationIds: validIds, caption: caption.trim() || `AI generated: ${prompt}`, title: title.trim() || caption.trim() || (isVideo ? 'AI Generated Video' : 'AI Generated Image'), type: isVideo ? 'video' : 'image', category: isVideo ? 'video-post' : 'image-post', tags: allTags, visibility, locationName: locationName.trim() || undefined, aiAspectRatio: aspectRatio };

            setIsPosting(true);

            // Use PostProgressContext — modal stays open showing progress
            const result = await postProgress.startPost(async () => {
                const res = await apiService.posts.createPostFromGeneration(postData);
                if (res.data.success) {
                    try { dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12, forceRefresh: true })); } catch (_) {}
                    return { success: true, message: 'Your creation is now live 🎉' };
                } else {
                    throw new Error(res.data.message || 'Unknown error');
                }
            });

            // After completion, auto-close modal after a brief moment
            if (result?.success) {
                setTimeout(() => { handleClose(); }, 1500);
            } else {
                setIsPosting(false);
            }
        } else if (imagePreview) {
            // For direct uploads
            const uploadData = { image: imagePreview, caption: caption || '', title: title || 'Uploaded Image', tags, locationName: locationName || '', visibility, aiAspectRatio: aspectRatio };
            setIsPosting(true);

            const result = await postProgress.startPost(async () => {
                const res = await apiService.posts.uploadAndCreatePost(uploadData);
                if (res.data.success) {
                    try { dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12, forceRefresh: true })); } catch (_) {}
                    return { success: true, message: 'Post uploaded! 🎉' };
                } else {
                    throw new Error(res.data.message || 'Failed');
                }
            });

            if (result?.success) {
                setTimeout(() => { handleClose(); }, 1500);
            } else {
                setIsPosting(false);
            }
        } else toast.error('No content to share');
    }, [isLoggedIn, aiGenerationIds, selectedModel, tags, caption, title, isVideo, visibility, locationName, prompt, imagePreview, dispatch, handleClose, aspectRatio, postProgress]);

    if (!isOpen) return null;

    // ── Shared inline styles (avoids Tailwind border issues) ──
    const S = {
        overlay: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' },
        panel: { background: '#111113', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' },
        card: { background: 'rgba(255,255,255,0.03)', borderRadius: 16, cursor: 'pointer', transition: 'background 0.2s' },
        cardHover: { background: 'rgba(255,255,255,0.06)' },
        pill: (active) => ({ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.35)' }),
        input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', color: 'rgba(255,255,255,0.85)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' },
        label: { display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 },
        btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '1px solid rgba(93,95,239,0.32)', cursor: 'pointer', background: 'linear-gradient(135deg, #5d5fef 0%, #7c3aed 100%)', color: '#fff', boxShadow: '0 8px 22px rgba(93,95,239,0.28)', transition: 'all 0.15s' },
        btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', transition: 'all 0.15s' },
        select: { appearance: 'none', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 999, padding: '6px 28px 6px 12px', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', outline: 'none' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                    {/* Clickable backdrop */}
                    <div style={{ position: 'absolute', inset: 0 }} onClick={step === 'generating' ? undefined : handleClose} />

                    {/* Snake border animation styles */}
                    <style>{`
                        .snake-glow-purple {
                            background: conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 60%, rgba(155,108,248,0.08) 70%, rgba(155,108,248,0.35) 78%, #9b6cf8 85%, #c084fc 90%, #9b6cf8 95%, rgba(155,108,248,0.15) 99%, transparent 100%);
                            animation: snakeRotate 3s linear infinite;
                        }
                        .snake-glow-cyan {
                            background: conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 60%, rgba(56,189,248,0.08) 70%, rgba(56,189,248,0.35) 78%, #38bdf8 85%, #22d3ee 90%, #38bdf8 95%, rgba(56,189,248,0.15) 99%, transparent 100%);
                            animation: snakeRotate 2s linear infinite;
                        }
                        @keyframes snakeRotate {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>

                    {/* ── CREATE ── */}
                    {step === 'create' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, marginTop: 'auto', width: '100%', maxWidth: 440, margin: 'auto auto 48px', padding: '0 20px' }}
                            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                        >
                            <div style={{ ...S.panel, padding: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>Create</h3>
                                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                        <FiX size={18} color="rgba(255,255,255,0.4)" />
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <button
                                        onClick={() => { if (!isLoggedIn) { onClose(); onOpenAuth?.('signup'); return; } setStep('generate'); }}
                                        style={{ ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '28px 16px', border: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = S.cardHover.background}
                                        onMouseLeave={(e) => e.currentTarget.style.background = S.card.background}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(93,95,239,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <HiOutlineSparkles size={22} color="#9b6cf8" />
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>Generate AI</span>
                                    </button>
                                    <button
                                        onClick={() => { if (!isLoggedIn) { onClose(); onOpenAuth?.('signup'); return; } fileInputRef.current?.click(); }}
                                        style={{ ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '28px 16px', border: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = S.cardHover.background}
                                        onMouseLeave={(e) => e.currentTarget.style.background = S.card.background}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiUpload size={20} color="#60a5fa" />
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>Upload Post</span>
                                    </button>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </motion.div>
                    )}

                    {/* ── GENERATE (bottom panel) ── */}
                    {step === 'generate' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, marginTop: 'auto', width: '100%', maxWidth: 680, margin: 'auto auto 32px', padding: '0 16px' }}
                            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Explore Models link above panel */}
                            <div style={{ textAlign: 'center', marginBottom: 10 }}>
                                <button
                                    onClick={() => { handleClose(); onNavigate && onNavigate('aiStudio'); }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 999, fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s', backdropFilter: 'blur(8px)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(93,95,239,0.12)'; e.currentTarget.style.color = '#9b6cf8'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                                >
                                    <HiOutlineSparkles size={12} /> Explore AI Models
                                </button>
                            </div>
                            <div style={{ ...S.panel, overflow: 'hidden' }}>

                                {/* Reference preview (if uploaded) */}
                                {referencePreview && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 0' }}>
                                        <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                                            {referenceIsVideo
                                                ? <video src={referencePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                                : <img src={referencePreview} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            }
                                            <button onClick={removeReference}
                                                style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                                <FiX size={10} color="#fff" />
                                            </button>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>{generationMode}</span>
                                            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{referenceIsVideo ? 'Video' : 'Image'} reference uploaded</p>
                                        </div>
                                    </div>
                                )}

                                {/* Prompt */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px 10px' }}>
                                    <HiOutlineSparkles size={16} color="rgba(255,255,255,0.2)" style={{ marginTop: 4, flexShrink: 0 }} />
                                    <textarea
                                        ref={promptTextareaRef}
                                        value={prompt} onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the scene you imagine"
                                        rows={1}
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: isEnhancing ? '#c4a5ff' : 'rgba(255,255,255,0.85)', fontSize: 14, outline: 'none', resize: 'none', minHeight: 22, lineHeight: '1.5', fontFamily: 'inherit', transition: 'color 0.2s', overflow: 'hidden' }}
                                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                        disabled={isEnhancing}
                                    />
                                    {/* Enhance button */}
                                    <button
                                        onClick={isEnhancing ? () => { enhanceAbortRef.current?.abort(); setIsEnhancing(false); } : handleEnhancePrompt}
                                        disabled={!prompt.trim() && !isEnhancing}
                                        title={isEnhancing ? 'Stop enhancing' : 'Enhance prompt with AI'}
                                        style={{
                                            background: isEnhancing ? 'rgba(155,108,248,0.15)' : 'rgba(155,108,248,0.08)',
                                            border: `1px solid ${isEnhancing ? 'rgba(155,108,248,0.4)' : 'rgba(155,108,248,0.15)'}`,
                                            borderRadius: 8,
                                            cursor: (!prompt.trim() && !isEnhancing) ? 'not-allowed' : 'pointer',
                                            padding: '5px 10px',
                                            flexShrink: 0,
                                            marginTop: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: isEnhancing ? '#c4a5ff' : '#9b6cf8',
                                            transition: 'all 0.2s',
                                            opacity: (!prompt.trim() && !isEnhancing) ? 0.3 : 1,
                                            animation: isEnhancing ? 'fpPulseEnhance 1.5s ease-in-out infinite' : 'none',
                                        }}
                                        onMouseEnter={(e) => { if (!isEnhancing) e.currentTarget.style.background = 'rgba(155,108,248,0.18)'; }}
                                        onMouseLeave={(e) => { if (!isEnhancing) e.currentTarget.style.background = 'rgba(155,108,248,0.08)'; }}
                                    >
                                        <HiOutlineSparkles size={12} style={{ animation: isEnhancing ? 'fpSpin 1s linear infinite' : 'none' }} />
                                        {isEnhancing ? 'Stop' : 'Enhance'}
                                    </button>
                                    <style>{`
                                        @keyframes fpPulseEnhance {
                                            0%, 100% { box-shadow: 0 0 0 0 rgba(155,108,248,0); }
                                            50% { box-shadow: 0 0 12px 2px rgba(155,108,248,0.15); }
                                        }
                                        @keyframes fpSpin {
                                            to { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                    {/* Close button */}
                                    <button onClick={() => { setStep('create'); removeReference(); if (isEnhancing) { enhanceAbortRef.current?.abort(); setIsEnhancing(false); } }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 2 }}>
                                        <FiX size={16} color="rgba(255,255,255,0.3)" />
                                    </button>
                                </div>

                                {/* Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px 14px', flexWrap: 'wrap' }}>
                                    {/* Upload reference */}
                                    <button onClick={() => refFileInputRef.current?.click()}
                                        style={{ ...S.pill(false), display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                                        <FiPaperclip size={12} /> {referenceFile ? 'Change' : 'Reference'}
                                    </button>

                                    {/* Separator */}
                                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)' }} />

                                    {/* Image / Video toggle */}
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: 3 }}>
                                        <button onClick={() => setMediaType('image')} style={S.pill(mediaType === 'image')}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiImage size={12} /> Image</span>
                                        </button>
                                        <button onClick={() => setMediaType('video')} style={S.pill(mediaType === 'video')}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiVideo size={12} /> Video</span>
                                        </button>
                                    </div>

                                    {/* Model (searchable dropdown) */}
                                    <SearchableModelDropdown
                                        models={availableModels}
                                        selectedModelId={selectedModel}
                                        onSelect={handleModelChange}
                                        disabled={modelsLoading}
                                        isDark={true}
                                        compact={true}
                                        placeholder="Model"
                                    />

                                    {/* Aspect ratio */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {ASPECT_RATIOS.map((ar) => (
                                            <button key={ar.value} onClick={() => setAspectRatio(ar.value)} style={S.pill(aspectRatio === ar.value)}>
                                                {ar.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Duration selector (video models only) */}
                                    {mediaType === 'video' && (() => {
                                        const model = availableModels.find(m => m.id === selectedModel);
                                        const durParam = model?.parameters?.duration;
                                        if (!durParam) return null;
                                        const options = durParam.options
                                            ? durParam.options.map(o => String(o))
                                            : (durParam.min != null && durParam.max != null)
                                                ? Array.from({ length: durParam.max - durParam.min + 1 }, (_, i) => String(durParam.min + i))
                                                : null;
                                        if (!options || options.length === 0) return null;
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500, whiteSpace: 'nowrap' }}>Duration</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {options.map(opt => (
                                                        <button key={opt} onClick={() => setDuration(opt)}
                                                            style={S.pill(duration === opt)}>
                                                            {opt.endsWith('s') ? opt : `${opt}s`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Mode label (when ref is uploaded) */}
                                    {referenceFile && (
                                        <span style={{ fontSize: 10, fontWeight: 600, color: '#9b6cf8', opacity: 0.75, letterSpacing: '0.3px' }}>{generationMode}</span>
                                    )}

                                    <div style={{ flex: 1 }} />

                                    {/* Cost + Generate */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                            <PiCoinsBold size={12} color="#f5a623" /> {currentCost}
                                        </span>
                                        <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
                                            style={{ ...S.btnPrimary, opacity: (!prompt.trim() || isGenerating) ? 0.3 : 1, pointerEvents: (!prompt.trim() || isGenerating) ? 'none' : 'auto' }}>
                                            Generate <HiOutlineSparkles size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <input ref={refFileInputRef} type="file" accept="image/*,video/*" onChange={handleReferenceFile} style={{ display: 'none' }} />
                        </motion.div>
                    )}

                    {/* ── GENERATING (Progressive Reveal) ── */}
                    {step === 'generating' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, margin: 'auto', width: '100%', maxWidth: 420, padding: '0 20px' }}
                            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
                        >
                            <div style={{ position: 'relative', borderRadius: 22, padding: 2 }}>
                                {/* Snake border - purple for AI generation */}
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                                    <div className="snake-glow-purple" style={{ position: 'absolute', inset: '-50%', width: '200%', height: '200%' }} />
                                </div>
                                <div style={{ ...S.panel, padding: 20, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                                    <ProgressiveImageReveal
                                        src={imagePreview}
                                        isGenerating={isGenerating}
                                        progress={generationProgress}
                                        generationStatus={generationStatus}
                                        aspectRatio={aspectRatio}
                                        isDark={true}
                                    />
                                    <p style={{ margin: '12px auto 0', color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt}</p>
                                    {/* Minimize button during generation */}
                                    <button
                                        onClick={() => {
                                            postProgress.startGeneration({ mediaType });
                                            postProgress.updateGenerationProgress(generationProgress, generationStatus);
                                            postProgress.minimize();
                                            onClose();
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            margin: '12px auto 0', padding: '8px 18px',
                                            background: 'rgba(155,108,248,0.1)', border: '1px solid rgba(155,108,248,0.2)',
                                            borderRadius: 12, cursor: 'pointer',
                                            color: '#9b6cf8', fontSize: 12, fontWeight: 600,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(155,108,248,0.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(155,108,248,0.1)'}
                                    >
                                        <FiMinimize2 size={13} /> Minimize & Continue Browsing
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── RESULT ── */}
                    {step === 'result' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, margin: 'auto', width: '100%', maxWidth: 480, padding: '0 20px' }}
                            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ ...S.panel, overflow: 'hidden' }}>
                                <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: mediaLoaded ? 'auto' : 200 }}>
                                    {/* Shimmer skeleton while media loads */}
                                    {!mediaLoaded && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
                                            <div style={{ width: '100%', height: '100%', minHeight: 200, background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite', borderRadius: 4 }} />
                                        </div>
                                    )}
                                    {imagePreview && (isVideo
                                        ? <video src={imagePreview} autoPlay loop muted playsInline className="cm-vid" onCanPlay={() => setMediaLoaded(true)} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', opacity: mediaLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }} />
                                        : <img src={imagePreview} alt="Generated" onLoad={() => setMediaLoaded(true)} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block', opacity: mediaLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }} />
                                    )}
                                </div>
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{selectedModel}</p>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>{aspectRatio}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <button onClick={() => { setStep('generate'); setImagePreview(null); setAiGenerationIds([]); setMediaLoaded(false); }}
                                            style={S.btnGhost}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        >
                                            <FiRefreshCw size={13} /> Regenerate
                                        </button>
                                        <button onClick={() => setStep('postForm')} style={S.btnPrimary}>
                                            <FiSend size={13} /> Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── UPLOAD PREVIEW ── */}
                    {step === 'upload' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, margin: 'auto', width: '100%', maxWidth: 480, padding: '0 20px' }}
                            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ ...S.panel, overflow: 'hidden' }}>
                                <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, maxHeight: 400 }}>
                                    {imagePreview && (isVideo
                                        ? <video src={imagePreview} autoPlay loop muted playsInline className="cm-vid" style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }} />
                                        : <img src={imagePreview} alt="Preview" style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }} />
                                    )}
                                </div>
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <button onClick={() => { setStep('create'); setImagePreview(null); setSelectedFile(null); }}
                                        style={{ ...S.btnGhost, color: 'rgba(255,255,255,0.5)' }}>
                                        <FiArrowLeft size={15} /> Back
                                    </button>
                                    <button onClick={() => setStep('postForm')} style={S.btnPrimary}>
                                        <FiSend size={13} /> Post
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── POST FORM ── */}
                    {step === 'postForm' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, margin: 'auto', width: '100%', maxWidth: 560, padding: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}
                            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ position: 'relative', borderRadius: 22, padding: 2 }}>
                                {/* Snake border - cyan for posting */}
                                {isPosting && (
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                                        <div className="snake-glow-cyan" style={{ position: 'absolute', inset: '-50%', width: '200%', height: '200%' }} />
                                    </div>
                                )}
                                <div style={{ ...S.panel, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button onClick={() => { if (!isPosting) setStep(aiGenerationIds.length > 0 ? 'result' : 'upload'); }}
                                        style={{ background: 'none', border: 'none', cursor: isPosting ? 'default' : 'pointer', padding: 4, display: 'flex', opacity: isPosting ? 0.3 : 1 }}>
                                        <FiArrowLeft size={17} color="rgba(255,255,255,0.45)" />
                                    </button>
                                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                                        {isPosting
                                            ? (postProgress.stage === 'done' ? '✅ Posted!' : postProgress.stage === 'error' ? '❌ Failed' : '⏳ Posting...')
                                            : (aiGenerationIds.length > 0 ? 'Post AI Creation' : 'Upload Post')}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {/* Minimize button — only shows when posting is active */}
                                        {isPosting && postProgress.stage !== 'done' && postProgress.stage !== 'error' && (
                                            <button onClick={handleMinimize} title="Minimize to background"
                                                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8, transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                                                <FiMinimize2 size={15} color="rgba(255,255,255,0.6)" />
                                            </button>
                                        )}
                                        <button onClick={handlePost} disabled={isPosting}
                                            style={{ ...S.btnPrimary, padding: '7px 18px', fontSize: 12, opacity: isPosting ? 0.4 : 1 }}>
                                            {isPosting ? (postProgress.stage === 'done' ? 'Done!' : 'Posting...') : 'Share'}
                                        </button>
                                    </div>
                                </div>

                                {/* Inline posting progress bar */}
                                {isPosting && postProgress.stage !== 'done' && postProgress.stage !== 'error' && (
                                    <div style={{ padding: '0 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                                            <div style={{ width: 20, height: 20, border: '2px solid rgba(155,108,248,0.3)', borderTop: '2px solid #9b6cf8', borderRadius: '50%', animation: 'snakeRotate 0.8s linear infinite', flexShrink: 0 }} />
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{postProgress.message}</span>
                                        </div>
                                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
                                            <div style={{ height: '100%', width: `${postProgress.progress}%`, background: 'linear-gradient(90deg, #9b6cf8, #a78bfa)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {/* Preview - full width on top, adapts to content ratio */}
                                    <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: 320, overflow: 'hidden' }}>
                                        {imagePreview && (isVideo
                                            ? <video src={imagePreview} autoPlay loop muted playsInline className="cm-vid" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
                                            : <img src={imagePreview} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
                                        )}
                                    </div>

                                    {/* Form */}
                                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {/* User */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img src={user?.avatar || '/assets/profile.png'} alt=""
                                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                                onError={(e) => e.target.src = '/assets/profile.png'} />
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>@{user?.username || 'user'}</span>
                                        </div>

                                        {aiGenerationIds.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(155,108,248,0.16)' }}>
                                                <HiOutlineSparkles size={13} color="#9b6cf8" />
                                                <span style={{ color: 'rgba(196,181,253,0.92)', fontSize: 11, fontWeight: 500 }}>AI Generated · {selectedModel}</span>
                                            </div>
                                        )}

                                        {/* Caption */}
                                        <div>
                                            <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                                                placeholder={aiGenerationIds.length > 0 ? `Generated: ${prompt}` : 'Write a caption...'} rows={3} maxLength={2000}
                                                style={{ ...S.input, resize: 'none', minHeight: 70 }} />
                                            <div style={{ textAlign: 'right', marginTop: 4 }}>
                                                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>{caption.length}/2000</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <div style={S.label}><FiType size={11} /> Title</div>
                                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your post a title" style={S.input} />
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <div style={S.label}><FiTag size={11} /> Tags ({tags.length}/5)</div>
                                            <div style={{ ...S.input, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '8px 10px', minHeight: 40 }}>
                                                {tags.map((tag, i) => (
                                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: 11 }}>
                                                        {tag}
                                                        <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#60a5fa' }}>
                                                            <FiX size={10} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                                                    placeholder={tags.length === 0 ? 'Add tags (Enter or comma)' : ''} disabled={tags.length >= 5}
                                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 12, minWidth: 80, padding: '2px 4px' }} />
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <div style={S.label}><FiMapPin size={11} /> Location</div>
                                            <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Add location (optional)" style={S.input} />
                                        </div>

                                        {/* Visibility */}
                                        <div>
                                            <div style={S.label}><FiEye size={11} /> Visibility</div>
                                            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
                                                style={{ ...S.input, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', background: '#111113' }}>
                                                <option value="public" style={{ background: '#111113' }}>Public</option>
                                                <option value="followers" style={{ background: '#111113' }}>Followers Only</option>
                                                <option value="private" style={{ background: '#111113' }}>Private</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateModal;
