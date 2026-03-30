import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiX, FiImage, FiVideo, FiUpload, FiChevronDown, FiMapPin, FiTag, FiEye, FiType, FiSend, FiRefreshCw, FiArrowLeft, FiPaperclip } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { PiCoinsBold } from 'react-icons/pi';
import apiService from '../../services/api';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import { fetchModels } from '../../store/slices/modelsSlice';

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
    { value: '4:3', label: '4:3' },
];

// ──────────────────────────────────────────────
// CreateModal
// ──────────────────────────────────────────────
const CreateModal = ({ isOpen, onClose, onOpenAuth, onNavigate }) => {
    const dispatch = useDispatch();
    const { isLoggedIn, user } = useSelector((s) => s.auth);
    const { imageModels, videoModels, status: modelsStatus } = useSelector((s) => s.models);
    const modelsLoading = modelsStatus === 'loading';

    const [step, setStep] = useState('create');
    const [mediaType, setMediaType] = useState('image');

    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [numInferenceSteps, setNumInferenceSteps] = useState(4);
    const [guidanceScale, setGuidanceScale] = useState(3.5);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generationRequestId, setGenerationRequestId] = useState(null);
    const [aiGenerationIds, setAiGenerationIds] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);

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
        return mediaType === 'image' ? imageModels : videoModels;
    }, [mediaType, imageModels, videoModels]);

    const resetAll = useCallback(() => {
        setStep('create'); setMediaType('image'); setPrompt(''); setSelectedModel('');
        setAspectRatio('1:1'); setNumInferenceSteps(4); setGuidanceScale(3.5);
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
        if (m) { setNumInferenceSteps(m.defaultSteps || 4); setGuidanceScale(m.defaultGuidance || 3.5); }
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

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
        try {
            setIsGenerating(true);
            setGenerationStatus(mediaType === 'video' ? 'Initializing Video AI...' : 'Initializing Image AI...');
            setGenerationProgress(5); setStep('generating');
            const isVideoGen = mediaType === 'video'; setIsVideo(isVideoGen);
            const payload = { prompt: prompt.trim(), selectedModel, aspectRatio };
            if (!isVideoGen) {
                payload.numInferenceSteps = selectedModel === 'flux-schnell' ? Math.min(numInferenceSteps, 12) : numInferenceSteps;
                payload.guidanceScale = guidanceScale; payload.numImages = 1;
            } else { payload.duration = '5'; }
            const response = isVideoGen ? await apiService.posts.generateVideo(payload) : await apiService.posts.generateImage(payload);
            if (response.data.success && response.data.generations?.length > 0) {
                const gen = response.data.generations[0];
                setGenerationRequestId(gen.requestId); setAiGenerationIds([gen.aiGenerationId]);
                setGenerationStatus(isVideoGen ? 'Video generating (1-2 mins)...' : 'Generation started...');
                setGenerationProgress(10); pollGenerationStatus(gen.requestId, isVideoGen);
            } else throw new Error('Failed to start generation');
        } catch (error) {
            setIsGenerating(false); setStep('generate');
            toast.error(error.response?.data?.message || 'Failed to start generation.');
        }
    }, [prompt, mediaType, selectedModel, aspectRatio, numInferenceSteps, guidanceScale, pollGenerationStatus]);

    // ── POST ──
    const handlePost = useCallback(async () => {
        setIsPosting(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token || !isLoggedIn) { toast.error('Please log in to create a post'); setIsPosting(false); return; }
            if (aiGenerationIds.length > 0) {
                const validIds = aiGenerationIds.filter((id) => id != null);
                if (validIds.length === 0) throw new Error('No valid generation IDs.');
                const allTags = ['ai-generated', selectedModel, ...tags];
                const postData = { aiGenerationIds: validIds, caption: caption.trim() || `AI generated: ${prompt}`, title: title.trim() || caption.trim() || 'AI Generated Image', type: isVideo ? 'video' : 'image', tags: allTags, visibility, locationName: locationName.trim() || undefined };
                const res = await apiService.posts.createPostFromGeneration(postData);
                if (res.data.success) { toast.success('Post created successfully!'); dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 })); handleClose(); }
                else throw new Error(res.data.message || 'Failed');
            } else if (imagePreview) {
                toast.loading('Uploading post...', { id: 'upload' });
                const uploadData = { image: imagePreview, caption: caption || '', title: title || 'Uploaded Image', tags, locationName: locationName || '', visibility };
                const res = await apiService.posts.uploadAndCreatePost(uploadData);
                if (res.data.success) { toast.success('Post uploaded!', { id: 'upload' }); dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 })); handleClose(); }
                else throw new Error(res.data.message || 'Failed');
            } else toast.error('No content to share');
        } catch (error) {
            let msg = 'Failed to create post.';
            if (error.response?.status === 401) msg = 'Please log in again.';
            else if (error.response?.status === 413) msg = 'File too large.';
            else if (error.response?.status === 429) msg = 'Too many requests.';
            else if (error.response?.data?.message) msg = error.response.data.message;
            toast.error(msg);
        } finally { setIsPosting(false); }
    }, [isLoggedIn, aiGenerationIds, selectedModel, tags, caption, title, isVideo, visibility, locationName, prompt, imagePreview, dispatch, handleClose]);

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
                                        value={prompt} onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the scene you imagine"
                                        rows={1}
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 14, outline: 'none', resize: 'none', minHeight: 22, maxHeight: 80, lineHeight: '1.5', fontFamily: 'inherit' }}
                                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                    />
                                    {/* Close button */}
                                    <button onClick={() => { setStep('create'); removeReference(); }}
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

                                    {/* Model */}
                                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                        <select value={selectedModel} onChange={(e) => handleModelChange(e.target.value)} disabled={modelsLoading} style={S.select}>
                                            {modelsLoading ? <option>Loading...</option> : availableModels.map((m) => (
                                                <option key={m.id} value={m.id} style={{ background: '#111113' }}>{m.name}</option>
                                            ))}
                                        </select>
                                        <FiChevronDown size={11} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                                    </div>

                                    {/* Aspect ratio */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {ASPECT_RATIOS.map((ar) => (
                                            <button key={ar.value} onClick={() => setAspectRatio(ar.value)} style={S.pill(aspectRatio === ar.value)}>
                                                {ar.label}
                                            </button>
                                        ))}
                                    </div>

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

                    {/* ── GENERATING ── */}
                    {step === 'generating' && (
                        <motion.div
                            style={{ position: 'relative', zIndex: 10, margin: 'auto', width: '100%', maxWidth: 380, padding: '0 20px' }}
                            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
                        >
                            <div style={{ ...S.panel, padding: 40, textAlign: 'center' }}>
                                <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
                                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: 'cm-spin 2s linear infinite' }}>
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3.5" />
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="#9b6cf8" strokeWidth="3.5" strokeLinecap="round"
                                            strokeDasharray={`${generationProgress * 2.14} 214`} transform="rotate(-90 40 40)" />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{Math.round(generationProgress)}%</span>
                                    </div>
                                </div>
                                <p style={{ margin: '0 0 6px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{generationStatus}</p>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
                                    {mediaType === 'video' ? 'ETA: 1-2 minutes' : selectedModel === 'flux-schnell' ? 'ETA: 15-20 seconds' : 'ETA: 25-35 seconds'}
                                </p>
                                <p style={{ margin: '16px auto 0', color: 'rgba(255,255,255,0.15)', fontSize: 11, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt}</p>
                            </div>
                            <style>{`@keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
                                <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, maxHeight: 400 }}>
                                    {imagePreview && (isVideo
                                        ? <video src={imagePreview} controls autoPlay loop className="cm-vid" style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }} />
                                        : <img src={imagePreview} alt="Generated" style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }} />
                                    )}
                                </div>
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{selectedModel}</p>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>{aspectRatio}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <button onClick={() => { setStep('generate'); setImagePreview(null); setAiGenerationIds([]); }}
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
                                        ? <video src={imagePreview} controls className="cm-vid" style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }} />
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
                            <div style={{ ...S.panel, overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button onClick={() => setStep(aiGenerationIds.length > 0 ? 'result' : 'upload')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                                        <FiArrowLeft size={17} color="rgba(255,255,255,0.45)" />
                                    </button>
                                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                                        {aiGenerationIds.length > 0 ? 'Post AI Creation' : 'Upload Post'}
                                    </span>
                                    <button onClick={handlePost} disabled={isPosting}
                                        style={{ ...S.btnPrimary, padding: '7px 18px', fontSize: 12, opacity: isPosting ? 0.4 : 1 }}>
                                        {isPosting ? 'Posting...' : 'Share'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {/* Preview */}
                                    <div style={{ flex: '0 0 40%', minWidth: 180, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                                        {imagePreview && (isVideo
                                            ? <video src={imagePreview} controls className="cm-vid" style={{ maxHeight: 320, width: '100%', objectFit: 'contain' }} />
                                            : <img src={imagePreview} alt="" style={{ maxHeight: 320, width: '100%', objectFit: 'contain' }} />
                                        )}
                                    </div>

                                    {/* Form */}
                                    <div style={{ flex: 1, minWidth: 220, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                        </motion.div>
                    )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateModal;
