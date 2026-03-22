import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FiArrowLeft, FiImage, FiVideo, FiUpload, FiChevronDown,
    FiSend, FiRefreshCw, FiPaperclip, FiX, FiDownload,
    FiMaximize, FiZap, FiSliders, FiCpu, FiCheck
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { PiCoinsBold } from 'react-icons/pi';
import { fetchModels } from '../../store/slices/modelsSlice';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import apiService from '../../services/api';

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
    { value: '4:3', label: '4:3' },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AI Studio Playground — Centered Layout
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const AIStudio = ({ onBack, onNavigate }) => {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector(s => s.auth);
    const { imageModels, videoModels, status: modelsStatus } = useSelector(s => s.models);
    const { theme } = useSelector(s => s.theme);

    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        if (theme === 'Dark') setIsDark(true);
        else if (theme === 'Light') setIsDark(false);
        else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [theme]);

    // Generation state
    const [mediaType, setMediaType] = useState('image');
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [numInferenceSteps, setNumInferenceSteps] = useState(4);
    const [guidanceScale, setGuidanceScale] = useState(3.5);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [enhancePrompt, setEnhancePrompt] = useState(false);

    // Reference media
    const [referenceFile, setReferenceFile] = useState(null);
    const [referencePreview, setReferencePreview] = useState(null);
    const [referenceIsVideo, setReferenceIsVideo] = useState(false);
    const refFileInputRef = useRef(null);
    const modelDropdownRef = useRef(null);

    // Generation progress
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');

    // Results
    const [generations, setGenerations] = useState([]);
    const promptRef = useRef(null);

    useEffect(() => { if (modelsStatus === 'idle') dispatch(fetchModels()); }, [modelsStatus, dispatch]);

    useEffect(() => {
        const models = mediaType === 'image' ? imageModels : videoModels;
        if (models.length > 0 && !models.find(m => m.id === selectedModel)) setSelectedModel(models[0].id);
    }, [mediaType, imageModels, videoModels, selectedModel]);

    // Close model dropdown on outside click
    useEffect(() => {
        const handleClick = e => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) setShowModelDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const availableModels = useMemo(() => mediaType === 'image' ? imageModels : videoModels, [mediaType, imageModels, videoModels]);
    const currentModel = useMemo(() => availableModels.find(m => m.id === selectedModel), [availableModels, selectedModel]);
    const currentCost = currentModel?.creditCost || 50;

    const generationMode = useMemo(() => {
        if (!referenceFile) return mediaType === 'image' ? 'Text → Image' : 'Text → Video';
        if (referenceIsVideo) return mediaType === 'video' ? 'Video → Video' : 'Video → Image';
        return mediaType === 'image' ? 'Image → Image' : 'Image → Video';
    }, [referenceFile, referenceIsVideo, mediaType]);

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
                if (video.duration > 30) { toast.error('Reference video must be 30s or less'); return; }
                setReferenceFile(file); setReferenceIsVideo(true);
                const reader = new FileReader();
                reader.onloadend = () => setReferencePreview(reader.result);
                reader.readAsDataURL(file);
            };
            video.src = URL.createObjectURL(file);
        } else { toast.error('Please select an image or video'); }
    }, []);

    const removeReference = useCallback(() => {
        setReferenceFile(null); setReferencePreview(null); setReferenceIsVideo(false);
        if (refFileInputRef.current) refFileInputRef.current.value = '';
    }, []);

    // Poll generation
    const pollGenerationStatus = useCallback(async (requestId, isVideoGen, promptText, modelId) => {
        const maxAttempts = isVideoGen ? 120 : 60;
        let attempts = 0;
        const poll = async () => {
            try {
                const response = await apiService.posts.getGenerationResult(requestId);
                if (response.data.success) {
                    const { status, imageUrl, videoUrl } = response.data;
                    const outputUrl = isVideoGen ? videoUrl : imageUrl;
                    if (status === 'completed' && outputUrl) {
                        setGenerationProgress(100); setGenerationStatus('Done!'); setIsGenerating(false);
                        setGenerations(prev => [{ id: Date.now(), url: outputUrl, isVideo: isVideoGen, prompt: promptText, model: modelId, timestamp: new Date(), requestId, aiGenerationId: response.data.aiGenerationId }, ...prev]);
                        toast.success(isVideoGen ? 'Video generated!' : 'Image generated!');
                        return;
                    } else if (status === 'failed') throw new Error('Generation failed');
                    else {
                        setGenerationProgress(Math.min(10 + (attempts * (isVideoGen ? 0.75 : 1.5)), 95));
                        const qp = response.data.queuePosition;
                        setGenerationStatus(qp ? `Queue #${qp}` : (isVideoGen ? 'Generating video...' : 'Processing...'));
                    }
                }
                attempts++;
                if (attempts < maxAttempts) setTimeout(poll, isVideoGen ? 2000 : 1000);
                else throw new Error('Generation is taking too long.');
            } catch (error) { setIsGenerating(false); toast.error(error.message || 'Generation failed.'); }
        };
        poll();
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
        if (!isLoggedIn) { toast.error('Please log in to generate'); return; }
        try {
            setIsGenerating(true); setGenerationStatus('Initializing...'); setGenerationProgress(5);
            const isVideoGen = mediaType === 'video';
            let finalPrompt = prompt.trim();
            if (enhancePrompt) finalPrompt = `(masterpiece, best quality, highly detailed) ${finalPrompt}, professional lighting, sharp focus, 8k resolution`;
            const payload = { prompt: finalPrompt, selectedModel, aspectRatio };
            if (!isVideoGen) {
                payload.numInferenceSteps = selectedModel === 'flux-schnell' ? Math.min(numInferenceSteps, 12) : numInferenceSteps;
                payload.guidanceScale = guidanceScale; payload.numImages = 1;
            } else { payload.duration = '5'; }
            const response = isVideoGen ? await apiService.posts.generateVideo(payload) : await apiService.posts.generateImage(payload);
            if (response.data.success && response.data.generations?.length > 0) {
                const gen = response.data.generations[0];
                setGenerationStatus(isVideoGen ? 'Generating video...' : 'Generating...');
                setGenerationProgress(10);
                pollGenerationStatus(gen.requestId, isVideoGen, prompt.trim(), selectedModel);
            } else throw new Error('Failed to start generation');
        } catch (error) { setIsGenerating(false); toast.error(error.response?.data?.message || 'Failed to start generation.'); }
    }, [prompt, mediaType, selectedModel, aspectRatio, numInferenceSteps, guidanceScale, isLoggedIn, enhancePrompt, pollGenerationStatus]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isGenerating) { e.preventDefault(); handleGenerate(); }
    }, [handleGenerate, isGenerating]);

    const handlePostGeneration = useCallback(async (gen) => {
        try {
            const postData = { aiGenerationIds: [gen.aiGenerationId].filter(Boolean), caption: gen.prompt, title: gen.prompt?.slice(0, 60) || 'AI Generated', type: gen.isVideo ? 'video' : 'image', tags: ['ai-generated', gen.model], visibility: 'public' };
            const res = await apiService.posts.createPostFromGeneration(postData);
            if (res.data.success) { toast.success('Posted to feed!'); dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 })); }
            else throw new Error('Failed');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    }, [dispatch]);

    /* ── Theme-aware colors ── */
    const t = useMemo(() => isDark ? {
        bg: '#0a0a0a', surface: 'rgba(255,255,255,0.03)', surfaceHover: 'rgba(255,255,255,0.06)',
        surface2: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.06)',
        text1: '#fff', text2: 'rgba(255,255,255,0.5)', text3: 'rgba(255,255,255,0.2)',
        accent: '#c8ff00', accentDim: 'rgba(200,255,0,0.12)', shadow: 'rgba(0,0,0,0.4)',
        cardBg: 'rgba(255,255,255,0.02)', dropdownBg: '#141414',
    } : {
        bg: '#fafafa', surface: 'rgba(0,0,0,0.03)', surfaceHover: 'rgba(0,0,0,0.06)',
        surface2: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.08)',
        text1: '#111', text2: 'rgba(0,0,0,0.5)', text3: 'rgba(0,0,0,0.25)',
        accent: '#4f46e5', accentDim: 'rgba(79,70,229,0.08)', shadow: 'rgba(0,0,0,0.08)',
        cardBg: '#fff', dropdownBg: '#fff',
    }, [isDark]);

    return (
        <div style={{ minHeight: '100vh', background: t.bg, color: t.text1, display: 'flex', flexDirection: 'column' }}>

            {/* ── Top Bar ── */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 24px', borderBottom: `1px solid ${t.border}`,
                background: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onBack} style={{
                        width: 34, height: 34, borderRadius: 10, background: t.surface, border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                        <FiArrowLeft size={15} color={t.text2} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiOutlineSparkles size={14} color={t.accent} style={{ opacity: 0.7 }} /> AI Studio
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => onNavigate?.('modelsPage')} style={{
                        padding: '6px 14px', borderRadius: 999, border: 'none', fontSize: 11, fontWeight: 500,
                        background: t.surface, color: t.text2, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                        Browse Models
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, fontSize: 11, background: t.accentDim, color: t.accent }}>
                        <PiCoinsBold size={10} /> {currentCost} coins
                    </div>
                </div>
            </header>

            {/* ── Centered Workspace ── */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 120px' }}>
                <div style={{ width: '100%', maxWidth: 720 }}>

                    {/* ── Prompt Card ── */}
                    <div style={{
                        background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 20,
                        padding: 20, marginBottom: 20, boxShadow: `0 4px 24px ${t.shadow}`,
                    }}>
                        {/* Prompt textarea */}
                        <textarea
                            ref={promptRef} value={prompt} onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you want to create..."
                            rows={3}
                            style={{
                                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                                color: t.text1, fontSize: 15, lineHeight: 1.6, resize: 'none',
                                minHeight: 60, fontFamily: 'inherit',
                            }}
                        />

                        {/* Reference preview */}
                        {referencePreview && (
                            <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
                                {referenceIsVideo ? (
                                    <video src={referencePreview} style={{ height: 72, borderRadius: 10 }} muted />
                                ) : (
                                    <img src={referencePreview} alt="" style={{ height: 72, borderRadius: 10, objectFit: 'cover' }} />
                                )}
                                <button onClick={removeReference} style={{
                                    position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                                    background: isDark ? '#333' : '#ddd', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                }}>
                                    <FiX size={10} color={t.text1} />
                                </button>
                                <div style={{ position: 'absolute', bottom: 4, left: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.6)', fontSize: 8, fontWeight: 600, color: '#c8ff00' }}>
                                    {generationMode}
                                </div>
                            </div>
                        )}

                        {/* Bottom toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {/* Media type toggle */}
                                <div style={{ display: 'flex', gap: 2, background: t.surface, borderRadius: 8, padding: 2 }}>
                                    {['image', 'video'].map(type => (
                                        <button key={type} onClick={() => setMediaType(type)} style={{
                                            padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 500,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                            background: mediaType === type ? t.surfaceHover : 'transparent',
                                            color: mediaType === type ? t.text1 : t.text3,
                                        }}>
                                            {type === 'image' ? <FiImage size={11} /> : <FiVideo size={11} />}
                                            {type === 'image' ? 'Image' : 'Video'}
                                        </button>
                                    ))}
                                </div>

                                {/* Upload reference */}
                                <button onClick={() => refFileInputRef.current?.click()} title="Upload reference" style={{
                                    width: 30, height: 30, borderRadius: 8, border: 'none', background: t.surface,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.text3,
                                }}>
                                    <FiPaperclip size={13} />
                                </button>

                                {/* Prompt enhancer toggle */}
                                <button onClick={() => setEnhancePrompt(!enhancePrompt)} title="Prompt Enhancer" style={{
                                    padding: '5px 10px', borderRadius: 8, border: 'none', fontSize: 10, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                    background: enhancePrompt ? t.accentDim : t.surface,
                                    color: enhancePrompt ? t.accent : t.text3,
                                }}>
                                    <HiOutlineSparkles size={10} /> Enhance
                                </button>

                                {/* Advanced toggle */}
                                <button onClick={() => setShowAdvanced(!showAdvanced)} title="Advanced Settings" style={{
                                    width: 30, height: 30, borderRadius: 8, border: 'none', background: showAdvanced ? t.accentDim : t.surface,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    color: showAdvanced ? t.accent : t.text3,
                                }}>
                                    <FiSliders size={12} />
                                </button>
                            </div>

                            {/* Generate button */}
                            <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 999, border: 'none',
                                fontSize: 12, fontWeight: 600, cursor: prompt.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                                background: prompt.trim() && !isGenerating ? t.accent : t.surface,
                                color: prompt.trim() && !isGenerating ? (isDark ? '#000' : '#fff') : t.text3,
                                transition: 'all 0.15s',
                            }}>
                                {isGenerating ? <FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FiZap size={13} />}
                                {isGenerating ? generationStatus : 'Generate'}
                            </button>
                        </div>
                    </div>

                    {/* ── Settings Row ── */}
                    <div style={{
                        display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 20, flexWrap: 'wrap',
                    }}>
                        {/* Model selector (custom dropdown) */}
                        <div ref={modelDropdownRef} style={{ position: 'relative', flex: '1 1 220px' }}>
                            <button onClick={() => setShowModelDropdown(!showModelDropdown)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', borderRadius: 12, border: `1px solid ${t.border}`,
                                background: t.cardBg, cursor: 'pointer', color: t.text1, fontSize: 12,
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCpu size={13} color={t.text3} />
                                    <span>
                                        <span style={{ fontWeight: 600 }}>{currentModel?.name || 'Select model'}</span>
                                        {currentModel && <span style={{ color: t.text3, marginLeft: 6, fontSize: 10 }}>{currentModel.creditCost} coins</span>}
                                    </span>
                                </span>
                                <FiChevronDown size={12} color={t.text3} style={{ transform: showModelDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            <AnimatePresence>
                                {showModelDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50,
                                            background: t.dropdownBg, border: `1px solid ${t.border}`, borderRadius: 14,
                                            boxShadow: `0 12px 40px ${t.shadow}`, overflow: 'hidden', maxHeight: 260, overflowY: 'auto',
                                        }}
                                    >
                                        {availableModels.map(m => (
                                            <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); setNumInferenceSteps(m.defaultSteps || 4); setGuidanceScale(m.defaultGuidance || 3.5); }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '10px 14px', border: 'none', background: 'transparent',
                                                    cursor: 'pointer', color: t.text1, fontSize: 12, textAlign: 'left',
                                                    transition: 'background 0.1s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {selectedModel === m.id && <FiCheck size={12} color={t.accent} />}
                                                    <span style={{ fontWeight: selectedModel === m.id ? 600 : 400 }}>{m.name}</span>
                                                </span>
                                                <span style={{ fontSize: 10, color: t.text3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <PiCoinsBold size={9} /> {m.creditCost}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Aspect ratio */}
                        <div style={{ display: 'flex', gap: 3, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 3 }}>
                            {ASPECT_RATIOS.map(r => (
                                <button key={r.value} onClick={() => setAspectRatio(r.value)} style={{
                                    padding: '8px 11px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                    background: aspectRatio === r.value ? t.accentDim : 'transparent',
                                    color: aspectRatio === r.value ? t.accent : t.text3, transition: 'all 0.15s',
                                }}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Advanced Settings (expandable) ── */}
                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden', marginBottom: 20 }}
                            >
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                                    padding: 16, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14,
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 11, color: t.text2 }}>Inference Steps</span>
                                            <span style={{ fontSize: 11, color: t.text1, fontWeight: 600 }}>{numInferenceSteps}</span>
                                        </div>
                                        <input type="range" min={1} max={selectedModel === 'flux-schnell' ? 12 : 50} value={numInferenceSteps}
                                            onChange={e => setNumInferenceSteps(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: t.accent }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 11, color: t.text2 }}>Guidance Scale</span>
                                            <span style={{ fontSize: 11, color: t.text1, fontWeight: 600 }}>{guidanceScale}</span>
                                        </div>
                                        <input type="range" min={1} max={20} step={0.5} value={guidanceScale}
                                            onChange={e => setGuidanceScale(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: t.accent }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Generation Progress ── */}
                    {isGenerating && (
                        <div style={{
                            marginBottom: 20, padding: 24, borderRadius: 16,
                            background: t.cardBg, border: `1px solid ${t.border}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 12,
                                border: `2px solid ${t.border}`, borderTop: `2px solid ${t.accent}`,
                                animation: 'spin 1s linear infinite',
                            }} />
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text1 }}>{generationStatus}</p>
                            <div style={{ width: '100%', maxWidth: 240, height: 4, borderRadius: 2, background: t.surface, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: t.accent, width: `${generationProgress}%`, transition: 'width 0.3s', borderRadius: 2 }} />
                            </div>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* ── Results ── */}
                    {generations.length === 0 && !isGenerating ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 20, background: t.surface,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                            }}>
                                <HiOutlineSparkles size={24} color={t.text3} />
                            </div>
                            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: t.text1 }}>Start creating</h2>
                            <p style={{ margin: '0 0 20px', fontSize: 12, color: t.text3, lineHeight: 1.6 }}>
                                Enter a prompt above and generate. Your creations appear here.
                            </p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {['A cinematic sunset over mountains', 'Portrait of a futuristic robot', 'Abstract digital art, neon colors'].map((s, i) => (
                                    <button key={i} onClick={() => setPrompt(s)} style={{
                                        padding: '7px 14px', borderRadius: 999, border: 'none', background: t.surface,
                                        color: t.text2, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.text1; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.text2; }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                            {generations.map(gen => (
                                <div key={gen.id} style={{
                                    borderRadius: 16, overflow: 'hidden', background: t.cardBg,
                                    border: `1px solid ${t.border}`, transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = `0 8px 30px ${t.shadow}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{ background: isDark ? '#000' : '#f0f0f0' }}>
                                        {gen.isVideo ? (
                                            <video src={gen.url} style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'contain' }} controls muted />
                                        ) : (
                                            <img src={gen.url} alt="" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'contain' }} />
                                        )}
                                    </div>
                                    <div style={{ padding: '12px 14px' }}>
                                        <p style={{ margin: '0 0 8px', fontSize: 12, color: t.text2, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {gen.prompt}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 10, color: t.text3 }}>
                                                {gen.model} · {new Date(gen.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <a href={gen.url} download target="_blank" rel="noopener noreferrer" style={{
                                                    width: 28, height: 28, borderRadius: 8, background: t.surface, border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                                                }}>
                                                    <FiDownload size={12} color={t.text2} />
                                                </a>
                                                <button onClick={() => handlePostGeneration(gen)} style={{
                                                    padding: '5px 12px', borderRadius: 8, background: t.accentDim, border: 'none',
                                                    fontSize: 10, fontWeight: 600, color: t.accent, cursor: 'pointer',
                                                }}>
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <input ref={refFileInputRef} type="file" accept="image/*,video/*" onChange={handleReferenceFile} style={{ display: 'none' }} />
        </div>
    );
};

export default AIStudio;
