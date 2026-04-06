import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FiArrowLeft, FiImage, FiVideo, FiChevronDown,
    FiSend, FiRefreshCw, FiPaperclip, FiX, FiDownload,
    FiZap, FiSliders, FiCpu, FiCheck,
    FiTag, FiEye, FiType
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { PiCoinsBold } from 'react-icons/pi';
import { fetchModels } from '../../store/slices/modelsSlice';
import { fetchFeedPosts } from '../../store/slices/postsSlice';
import apiService from '../../services/api';
import SearchableModelDropdown from '../shared/SearchableModelDropdown';
import ProgressiveImageReveal from '../shared/ProgressiveImageReveal';

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
    { value: '4:3', label: '4:3' },
];

const MAX_REFERENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_REFERENCE_IMAGE_LIMIT = 10;

const getUniqueModels = (models = []) => Array.from(new Map(models.map(model => [model.id, model])).values());

const revokeReferencePreviews = (references = []) => {
    references.forEach(reference => {
        if (reference?.preview) {
            URL.revokeObjectURL(reference.preview);
        }
    });
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
});

const validateReferenceVideo = (file) => new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(video.duration <= 30);
    };
    video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to read ${file.name}`));
    };
    video.src = objectUrl;
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AI Studio Playground — Centered Layout
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const AIStudio = ({ onBack, onNavigate }) => {
    const dispatch = useDispatch();
    const { isLoggedIn, user } = useSelector(s => s.auth);
    const { imageModels, imageEditModels, videoModels, allModels, status: modelsStatus } = useSelector(s => s.models);
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
    const [referenceFiles, setReferenceFiles] = useState([]);
    const refFileInputRef = useRef(null);
    const modelDropdownRef = useRef(null);
    const referenceFilesRef = useRef([]);

    // Generation progress
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');

    // Results
    const [generations, setGenerations] = useState([]);
    const promptRef = useRef(null);

    // Inline post form state — keyed by generation id
    const [postingGenId, setPostingGenId] = useState(null);
    const [postCaption, setPostCaption] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [postTags, setPostTags] = useState([]);
    const [postTagInput, setPostTagInput] = useState('');
    const [postVisibility, setPostVisibility] = useState('public');
    const [isPosting, setIsPosting] = useState(false);

    // Drafts
    const [drafts, setDrafts] = useState([]);
    const [draftsLoading, setDraftsLoading] = useState(false);
    // Active tab: 'create' | 'drafts'
    const [activeTab, setActiveTab] = useState('create');

    useEffect(() => { if (modelsStatus === 'idle') dispatch(fetchModels()); }, [modelsStatus, dispatch]);

    useEffect(() => {
        const models = mediaType === 'video'
            ? videoModels
            : getUniqueModels([...(imageModels || []), ...(imageEditModels || [])]);
        if (models.length > 0 && !models.find(m => m.id === selectedModel)) setSelectedModel(models[0].id);
    }, [mediaType, imageModels, imageEditModels, videoModels, selectedModel]);

    // Close model dropdown on outside click
    useEffect(() => {
        const handleClick = e => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) setShowModelDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Fetch drafts on mount
    const fetchDrafts = useCallback(async () => {
        if (!isLoggedIn) return;
        setDraftsLoading(true);
        try {
            const res = await apiService.posts.getMyGenerations();
            if (res.data?.generations) {
                setDrafts(res.data.generations);
            }
        } catch (err) {
            // silently fail
        } finally {
            setDraftsLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

    useEffect(() => {
        referenceFilesRef.current = referenceFiles;
    }, [referenceFiles]);

    useEffect(() => () => {
        revokeReferencePreviews(referenceFilesRef.current);
    }, []);

    const availableModels = useMemo(() => {
        if (mediaType === 'video') return videoModels;
        return getUniqueModels([...(imageModels || []), ...(imageEditModels || [])]);
    }, [mediaType, imageModels, imageEditModels, videoModels]);
    const currentModel = useMemo(() => availableModels.find(m => m.id === selectedModel) || allModels?.find(m => m.id === selectedModel), [availableModels, allModels, selectedModel]);
    const currentCost = currentModel?.creditCost || 50;
    const currentModelRequiresImage = mediaType === 'image' && Boolean(currentModel?.requiresImage);
    const currentModelMinImages = currentModelRequiresImage ? Math.max(currentModel?.minImages || 1, 1) : 0;
    const currentModelMaxImages = mediaType === 'image'
        ? Math.max(currentModel?.maxImages || (currentModel?.supportsMultipleImages ? DEFAULT_REFERENCE_IMAGE_LIMIT : 1), 1)
        : 1;
    const canSelectMultipleReferences = mediaType === 'image' && currentModelMaxImages > 1;
    const missingRequiredReferences = currentModelRequiresImage && referenceFiles.length < currentModelMinImages;

    const generationMode = useMemo(() => {
        if (referenceFiles.length === 0) return mediaType === 'image' ? 'Text → Image' : 'Text → Video';
        if (referenceFiles.some(reference => reference.isVideo)) return mediaType === 'video' ? 'Video → Video' : 'Video → Image';
        return mediaType === 'image' ? 'Image → Image' : 'Image → Video';
    }, [referenceFiles, mediaType]);

    useEffect(() => {
        if (mediaType !== 'image' || referenceFiles.length === 0) return;

        const hasVideoReference = referenceFiles.some(reference => reference.isVideo);
        if (!hasVideoReference) return;

        setReferenceFiles(prevReferences => {
            const imageReferences = prevReferences.filter(reference => !reference.isVideo);
            const videoReferences = prevReferences.filter(reference => reference.isVideo);
            revokeReferencePreviews(videoReferences);
            return imageReferences;
        });
    }, [mediaType, referenceFiles]);

    useEffect(() => {
        if (referenceFiles.length <= currentModelMaxImages) return;

        setReferenceFiles(prevReferences => {
            const nextReferences = prevReferences.slice(0, currentModelMaxImages);
            const removedReferences = prevReferences.slice(currentModelMaxImages);
            revokeReferencePreviews(removedReferences);
            return nextReferences;
        });
    }, [referenceFiles.length, currentModelMaxImages]);

    const handleReferenceFile = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const nextReferences = [];
        const maxReferenceCount = canSelectMultipleReferences ? currentModelMaxImages : 1;
        const remainingSlots = canSelectMultipleReferences
            ? Math.max(currentModelMaxImages - referenceFiles.length, 0)
            : maxReferenceCount;

        if (remainingSlots === 0) {
            toast.error(`You can only add up to ${currentModelMaxImages} reference image${currentModelMaxImages > 1 ? 's' : ''}.`);
            e.target.value = '';
            return;
        }

        for (const file of files) {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (mediaType === 'image' && !isImage) {
                toast.error('Please select image files only for this model.');
                continue;
            }

            if (mediaType === 'video' && !isImage && !isVideo) {
                toast.error('Please select an image or video.');
                continue;
            }

            if (isImage && file.size > MAX_REFERENCE_FILE_SIZE_BYTES) {
                toast.error(`${file.name} exceeds the 5MB limit.`);
                continue;
            }

            if (isVideo) {
                try {
                    const isVideoDurationValid = await validateReferenceVideo(file);
                    if (!isVideoDurationValid) {
                        toast.error('Reference video must be 30s or less.');
                        continue;
                    }
                } catch (error) {
                    toast.error(error.message || 'Failed to read reference video.');
                    continue;
                }
            }

            if (nextReferences.length >= remainingSlots) {
                toast.error(`You can only add up to ${currentModelMaxImages} reference image${currentModelMaxImages > 1 ? 's' : ''}.`);
                break;
            }

            nextReferences.push({
                file,
                preview: URL.createObjectURL(file),
                isVideo
            });
        }

        if (nextReferences.length === 0) {
            e.target.value = '';
            return;
        }

        if (canSelectMultipleReferences) {
            setReferenceFiles(prevReferences => [...prevReferences, ...nextReferences].slice(0, currentModelMaxImages));
        } else {
            revokeReferencePreviews(referenceFiles);
            setReferenceFiles(nextReferences.slice(0, maxReferenceCount));
        }

        e.target.value = '';
    }, [canSelectMultipleReferences, currentModelMaxImages, mediaType, referenceFiles]);

    const removeReference = useCallback((indexToRemove) => {
        setReferenceFiles(prevReferences => {
            const referenceToRemove = prevReferences[indexToRemove];
            if (referenceToRemove?.preview) {
                URL.revokeObjectURL(referenceToRemove.preview);
            }

            return prevReferences.filter((_, index) => index !== indexToRemove);
        });

        if (refFileInputRef.current) refFileInputRef.current.value = '';
    }, []);

    // Generation handler — uses new /api/ai/* endpoints
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
        if (!isLoggedIn) { toast.error('Please log in to generate'); return; }
        if (missingRequiredReferences) {
            toast.error(currentModelMinImages > 1 ? `Please add ${currentModelMinImages} reference images.` : 'Please add a reference image.');
            return;
        }

        let progressInterval;
        try {
            setIsGenerating(true); setGenerationStatus('Initializing...'); setGenerationProgress(5);
            setActiveTab('create');
            const isVideoGen = mediaType === 'video';
            let finalPrompt = prompt.trim();
            if (enhancePrompt) finalPrompt = `(masterpiece, best quality, highly detailed) ${finalPrompt}, professional lighting, sharp focus, 8k resolution`;

            // Build payload for new API
            const payload = {
                modelId: selectedModel,
                prompt: finalPrompt,
                aspect_ratio: aspectRatio,
            };

            if (!isVideoGen) {
                payload.num_inference_steps = selectedModel.includes('schnell') ? Math.min(numInferenceSteps, 12) : numInferenceSteps;
                payload.guidance_scale = guidanceScale;
                payload.num_images = 1;
            }

            setGenerationStatus('Generating...');
            setGenerationProgress(15);

            // Simulate progressive progress while waiting
            progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) { clearInterval(progressInterval); return prev; }
                    return prev + (isVideoGen ? 0.3 : 0.8);
                });
                setGenerationStatus(prev => {
                    const msgs = isVideoGen
                        ? ['Generating video...', 'Processing frames...', 'Rendering...']
                        : ['Generating...', 'Creating image...', 'Rendering details...', 'Finalizing...'];
                    return msgs[Math.floor(Math.random() * msgs.length)];
                });
            }, 1500);

            // Determine which endpoint: if reference file present & model is I2I, use edit
            let response;
            const model = currentModel;
            const isEditModel = model?.category === 'image-to-image' || model?.category === 'image_to_image' || model?.category === 'image_editing';

            if (isEditModel) {
                const imageReferenceFiles = referenceFiles.filter(reference => !reference.isVideo);
                const referenceDataUrls = await Promise.all(imageReferenceFiles.map(reference => readFileAsDataUrl(reference.file)));

                if (model?.supportsMultipleImages) {
                    payload.image_urls = referenceDataUrls;
                } else if (referenceDataUrls[0]) {
                    payload.image_url = referenceDataUrls[0];
                }

                response = await apiService.ai.editImage(payload);
            } else if (isVideoGen) {
                // For now video uses old endpoint or new upscale
                response = await apiService.posts.generateVideo({ prompt: finalPrompt, selectedModel, aspectRatio, duration: '5' });
            } else {
                response = await apiService.ai.generateImage(payload);
            }

            clearInterval(progressInterval);

            if (response.data.success) {
                const data = response.data.data || response.data;
                const images = data.images || [];
                const resultUrl = images[0]?.url || data.image?.url || data.resultUrl;

                if (resultUrl) {
                    setGenerationProgress(98);
                    setGenerationStatus('Downloading image...');
                    await new Promise((resolve) => {
                        if (isVideoGen) return resolve();
                        const img = new Image();
                        img.onload = resolve;
                        img.onerror = resolve; // Continue on error
                        img.src = resultUrl;
                    });
                    
                    setGenerationProgress(100);
                    setGenerationStatus('Done!');
                    setIsGenerating(false);
                    const newGen = {
                        id: data.generationId || Date.now(),
                        url: resultUrl,
                        isVideo: isVideoGen,
                        prompt: finalPrompt,
                        model: data.model || selectedModel,
                        timestamp: new Date(),
                        aiGenerationId: data.generationId,
                        creditsUsed: data.creditsUsed,
                        seed: data.seed,
                    };
                    setGenerations(prev => [newGen, ...prev]);
                    toast.success(isVideoGen ? 'Video generated!' : 'Image generated!');
                    fetchDrafts();
                } else {
                    throw new Error('No result URL in response');
                }
            } else if (response.data.generations?.length > 0) {
                // Fallback: old polling-based flow
                const gen = response.data.generations[0];
                setGenerationStatus(isVideoGen ? 'Generating video...' : 'Generating...');
                const maxAttempts = isVideoGen ? 120 : 60;
                let attempts = 0;
                const poll = async () => {
                    try {
                        const res = await apiService.posts.getGenerationResult(gen.requestId);
                        if (res.data.success) {
                            const outputUrl = isVideoGen ? res.data.videoUrl : res.data.imageUrl;
                            if (res.data.status === 'completed' && outputUrl) {
                                setGenerationProgress(100); setGenerationStatus('Done!'); setIsGenerating(false);
                                setGenerations(prev => [{ id: Date.now(), url: outputUrl, isVideo: isVideoGen, prompt: finalPrompt, model: selectedModel, timestamp: new Date(), requestId: gen.requestId, aiGenerationId: res.data.aiGenerationId }, ...prev]);
                                toast.success(isVideoGen ? 'Video generated!' : 'Image generated!');
                                fetchDrafts();
                                return;
                            } else if (res.data.status === 'failed') throw new Error('Generation failed');
                            setGenerationProgress(Math.min(10 + (attempts * (isVideoGen ? 0.75 : 1.5)), 95));
                        }
                        attempts++;
                        if (attempts < maxAttempts) setTimeout(poll, isVideoGen ? 2000 : 1000);
                        else throw new Error('Timeout');
                    } catch (err) { setIsGenerating(false); toast.error(err.message || 'Failed'); }
                };
                poll();
            } else {
                throw new Error(response.data.message || 'Generation failed');
            }
        } catch (error) {
            if (progressInterval) clearInterval(progressInterval);
            setIsGenerating(false);
            toast.error(error.response?.data?.message || error.message || 'Failed to start generation.');
        }
    }, [prompt, mediaType, selectedModel, aspectRatio, numInferenceSteps, guidanceScale, isLoggedIn, enhancePrompt, missingRequiredReferences, currentModelMinImages, referenceFiles, currentModel, fetchDrafts]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isGenerating) { e.preventDefault(); handleGenerate(); }
    }, [handleGenerate, isGenerating]);

    // ── Inline Post Form Helpers ──
    const openPostForm = useCallback((gen) => {
        setPostingGenId(gen.id || gen.aiGenerationId);
        setPostCaption(gen.prompt || '');
        setPostTitle(gen.prompt?.slice(0, 60) || 'AI Generated');
        setPostTags([]);
        setPostTagInput('');
        setPostVisibility('public');
    }, []);

    const closePostForm = useCallback(() => {
        setPostingGenId(null);
        setPostCaption('');
        setPostTitle('');
        setPostTags([]);
        setPostTagInput('');
        setPostVisibility('public');
    }, []);

    const addPostTag = useCallback((val) => {
        const t = val.trim();
        if (t && postTags.length < 5 && !postTags.includes(t)) { setPostTags(p => [...p, t]); setPostTagInput(''); }
        else if (postTags.length >= 5) toast.error('Maximum 5 tags');
    }, [postTags]);

    const removePostTag = useCallback((i) => { setPostTags(p => p.filter((_, idx) => idx !== i)); }, []);

    const handlePostTagKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addPostTag(postTagInput.replace(',', '')); }
        else if (e.key === 'Backspace' && !postTagInput && postTags.length > 0) setPostTags(p => p.slice(0, -1));
    }, [postTagInput, postTags, addPostTag]);

    // Post a generation (from session or from drafts)
    const handlePostGeneration = useCallback(async (gen) => {
        const genId = gen.aiGenerationId || gen.id;
        if (!genId) { toast.error('Missing generation ID'); return; }
        setIsPosting(true);
        try {
            const allTags = ['ai-generated', gen.model, ...postTags].filter(Boolean);
            const postData = {
                aiGenerationIds: [genId],
                caption: postCaption.trim() || gen.prompt || '',
                title: postTitle.trim() || gen.prompt?.slice(0, 60) || 'AI Generated',
                type: gen.isVideo || gen.type === 'video' ? 'video' : 'image',
                tags: allTags,
                visibility: postVisibility,
            };
            const res = await apiService.posts.createPostFromGeneration(postData);
            if (res.data.success) {
                toast.success('Posted to feed!');
                dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 }));
                closePostForm();
                // Remove from session generations
                setGenerations(prev => prev.filter(g => (g.id !== gen.id) && (g.aiGenerationId !== genId)));
                // Remove from drafts
                setDrafts(prev => prev.filter(d => d.id !== genId));
            } else throw new Error('Failed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post');
        } finally { setIsPosting(false); }
    }, [dispatch, postCaption, postTitle, postTags, postVisibility, closePostForm]);

    // Post a draft directly
    const handlePostDraft = useCallback(async (draft) => {
        const genId = draft.id;
        if (!genId) { toast.error('Missing generation ID'); return; }
        setIsPosting(true);
        try {
            const allTags = ['ai-generated', draft.model, ...postTags].filter(Boolean);
            const postData = {
                aiGenerationIds: [genId],
                caption: postCaption.trim() || draft.prompt || '',
                title: postTitle.trim() || draft.prompt?.slice(0, 60) || 'AI Generated',
                type: draft.type === 'video' ? 'video' : 'image',
                tags: allTags,
                visibility: postVisibility,
            };
            const res = await apiService.posts.createPostFromGeneration(postData);
            if (res.data.success) {
                toast.success('Posted to feed!');
                dispatch(fetchFeedPosts({ category: 'featured', page: 1, limit: 12 }));
                closePostForm();
                setDrafts(prev => prev.filter(d => d.id !== genId));
            } else throw new Error('Failed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post');
        } finally { setIsPosting(false); }
    }, [dispatch, postCaption, postTitle, postTags, postVisibility, closePostForm]);

    /* ── Theme-aware colors ── */
    const t = useMemo(() => isDark ? {
        bg: '#0a0a0a', surface: 'rgba(255,255,255,0.03)', surfaceHover: 'rgba(255,255,255,0.06)',
        surface2: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.06)',
        text1: '#fff', text2: 'rgba(255,255,255,0.5)', text3: 'rgba(255,255,255,0.2)',
        accent: '#9b6cf8', accentDim: 'rgba(155,108,248,0.16)', accentText: '#fff', shadow: 'rgba(0,0,0,0.4)',
        cardBg: 'rgba(255,255,255,0.02)', dropdownBg: '#141414',
        inputBg: 'rgba(255,255,255,0.04)', inputBorder: 'rgba(255,255,255,0.06)',
        tagBg: 'rgba(59,130,246,0.12)', tagColor: '#60a5fa',
        successBg: 'rgba(34,197,94,0.1)', successColor: '#22c55e',
        dangerBg: 'rgba(239,68,68,0.1)', dangerColor: '#ef4444',
    } : {
        bg: '#fafafa', surface: 'rgba(0,0,0,0.03)', surfaceHover: 'rgba(0,0,0,0.06)',
        surface2: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.08)',
        text1: '#111', text2: 'rgba(0,0,0,0.5)', text3: 'rgba(0,0,0,0.25)',
        accent: '#5d5fef', accentDim: 'rgba(93,95,239,0.1)', accentText: '#fff', shadow: 'rgba(0,0,0,0.08)',
        cardBg: '#fff', dropdownBg: '#fff',
        inputBg: 'rgba(0,0,0,0.03)', inputBorder: 'rgba(0,0,0,0.08)',
        tagBg: 'rgba(59,130,246,0.08)', tagColor: '#3b82f6',
        successBg: 'rgba(34,197,94,0.08)', successColor: '#16a34a',
        dangerBg: 'rgba(239,68,68,0.08)', dangerColor: '#dc2626',
    }, [isDark]);

    /* ── Inline Post Form Component ── */
    const renderPostForm = (gen, isDraft = false) => {
        const genIdentifier = isDraft ? gen.id : (gen.id || gen.aiGenerationId);
        const isActive = postingGenId === genIdentifier;
        if (!isActive) return null;

        return (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
            >
                <div style={{
                    padding: 16, borderTop: `1px solid ${t.border}`,
                    background: isDark ? 'rgba(155,108,248,0.03)' : 'rgba(93,95,239,0.02)',
                }}>
                    {/* User row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <img
                            src={user?.avatar || '/assets/profile.png'} alt=""
                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = '/assets/profile.png'}
                        />
                        <span style={{ fontSize: 12, fontWeight: 500, color: t.text2 }}>@{user?.username || 'you'}</span>
                        <div style={{ flex: 1 }} />
                        <button onClick={closePostForm} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        }}>
                            <FiX size={14} color={t.text3} />
                        </button>
                    </div>

                    {/* Caption */}
                    <textarea
                        value={postCaption}
                        onChange={(e) => setPostCaption(e.target.value)}
                        placeholder="Write a caption..."
                        rows={2}
                        maxLength={2000}
                        style={{
                            width: '100%', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                            borderRadius: 12, padding: '10px 14px', color: t.text1, fontSize: 13,
                            outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = t.accent}
                        onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                    />
                    <div style={{ textAlign: 'right', marginTop: 3, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, color: t.text3 }}>{postCaption.length}/2000</span>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <FiType size={10} color={t.text3} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</span>
                        </div>
                        <input
                            type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="Give your post a title"
                            style={{
                                width: '100%', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                                borderRadius: 10, padding: '8px 12px', color: t.text1, fontSize: 12,
                                outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = t.accent}
                            onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                        />
                    </div>

                    {/* Tags */}
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <FiTag size={10} color={t.text3} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags ({postTags.length}/5)</span>
                        </div>
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5,
                            background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                            borderRadius: 10, padding: '6px 10px', minHeight: 34,
                        }}>
                            {postTags.map((tag, i) => (
                                <span key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px',
                                    borderRadius: 6, background: t.tagBg, color: t.tagColor, fontSize: 10,
                                }}>
                                    {tag}
                                    <button onClick={() => removePostTag(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: t.tagColor }}>
                                        <FiX size={9} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text" value={postTagInput} onChange={(e) => setPostTagInput(e.target.value)}
                                onKeyDown={handlePostTagKeyDown}
                                placeholder={postTags.length === 0 ? 'Add tags...' : ''}
                                disabled={postTags.length >= 5}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text1, fontSize: 11, minWidth: 60, padding: '2px 4px' }}
                            />
                        </div>
                    </div>

                    {/* Visibility + Post button row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FiEye size={10} color={t.text3} />
                            <select value={postVisibility} onChange={(e) => setPostVisibility(e.target.value)} style={{
                                background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8,
                                padding: '5px 8px', fontSize: 11, color: t.text2, cursor: 'pointer', outline: 'none',
                                fontFamily: 'inherit',
                            }}>
                                <option value="public">Public</option>
                                <option value="followers">Followers</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }} />
                        <button
                            onClick={() => isDraft ? handlePostDraft(gen) : handlePostGeneration(gen)}
                            disabled={isPosting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 999,
                                border: 'none', fontSize: 12, fontWeight: 600, cursor: isPosting ? 'not-allowed' : 'pointer',
                                background: isPosting ? t.surface : `linear-gradient(135deg, ${isDark ? '#9b6cf8' : '#5d5fef'} 0%, #7c3aed 100%)`,
                                color: '#fff', transition: 'all 0.2s',
                                boxShadow: isPosting ? 'none' : `0 4px 16px ${isDark ? 'rgba(155,108,248,0.3)' : 'rgba(93,95,239,0.25)'}`,
                            }}
                        >
                            <FiSend size={12} />
                            {isPosting ? 'Posting...' : 'Share to Feed'}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    /* ── Render a generation card (session result) ── */
    const renderGenerationCard = (gen) => {
        const genIdentifier = gen.id || gen.aiGenerationId;
        const isFormOpen = postingGenId === genIdentifier;

        return (
            <motion.div
                key={gen.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    borderRadius: 18, overflow: 'hidden', background: t.cardBg,
                    border: `1px solid ${isFormOpen ? t.accent : t.border}`,
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: isFormOpen ? `0 0 0 1px ${t.accent}, 0 8px 30px ${t.shadow}` : 'none',
                }}
                onMouseEnter={e => { if (!isFormOpen) { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = `0 8px 30px ${t.shadow}`; } }}
                onMouseLeave={e => { if (!isFormOpen) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; } }}
            >
                {/* Media */}
                <div style={{ background: isDark ? '#000' : '#f0f0f0', position: 'relative' }}>
                    {gen.isVideo ? (
                        <video src={gen.url} style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'contain' }} controls muted />
                    ) : (
                        <img src={gen.url} alt="" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'contain' }} />
                    )}
                    {/* AI badge */}
                    <div style={{
                        position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 999,
                        background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <HiOutlineSparkles size={10} color={t.accent} />
                        <span style={{ fontSize: 9, fontWeight: 600, color: t.accent }}>AI</span>
                    </div>
                </div>

                {/* Info + Actions */}
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
                            <button
                                onClick={() => isFormOpen ? closePostForm() : openPostForm(gen)}
                                style={{
                                    padding: '5px 14px', borderRadius: 8,
                                    background: isFormOpen ? t.surface : t.accentDim,
                                    border: 'none', fontSize: 10, fontWeight: 600,
                                    color: isFormOpen ? t.text2 : t.accent, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {isFormOpen ? 'Cancel' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inline post form */}
                <AnimatePresence>
                    {renderPostForm(gen, false)}
                </AnimatePresence>
            </motion.div>
        );
    };

    /* ── Render a draft card ── */
    const renderDraftCard = (draft) => {
        const isFormOpen = postingGenId === draft.id;
        const isVideoMedia = draft.type === 'video';
        const mediaUrl = draft.resultUrl || draft.thumbnailUrl;

        if (!mediaUrl) return null;

        return (
            <motion.div
                key={draft.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    borderRadius: 18, overflow: 'hidden', background: t.cardBg,
                    border: `1px solid ${isFormOpen ? t.accent : t.border}`,
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: isFormOpen ? `0 0 0 1px ${t.accent}, 0 8px 30px ${t.shadow}` : 'none',
                }}
                onMouseEnter={e => { if (!isFormOpen) { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = `0 8px 30px ${t.shadow}`; } }}
                onMouseLeave={e => { if (!isFormOpen) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; } }}
            >
                {/* Media */}
                <div style={{ background: isDark ? '#000' : '#f0f0f0', position: 'relative' }}>
                    {isVideoMedia ? (
                        <video src={mediaUrl} style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'contain' }} controls muted />
                    ) : (
                        <img src={mediaUrl} alt="" style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'contain' }} />
                    )}
                    {/* Draft badge */}
                    <div style={{
                        position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 999,
                        background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#f59e0b' }}>DRAFT</span>
                    </div>
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 12, color: t.text2, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {draft.prompt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        {draft.model && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: t.accentDim, color: t.accent, fontWeight: 600 }}>{draft.model}</span>}
                        {draft.aspectRatio && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: t.surface, color: t.text3, fontWeight: 500 }}>{draft.aspectRatio}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: t.text3 }}>
                            {new Date(draft.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {mediaUrl && (
                                <a href={mediaUrl} download target="_blank" rel="noopener noreferrer" style={{
                                    width: 28, height: 28, borderRadius: 8, background: t.surface, border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                                }}>
                                    <FiDownload size={12} color={t.text2} />
                                </a>
                            )}
                            <button
                                onClick={() => isFormOpen ? closePostForm() : openPostForm({ ...draft, aiGenerationId: draft.id })}
                                style={{
                                    padding: '5px 14px', borderRadius: 8,
                                    background: isFormOpen ? t.surface : `linear-gradient(135deg, ${isDark ? '#9b6cf8' : '#5d5fef'} 0%, #7c3aed 100%)`,
                                    border: 'none', fontSize: 10, fontWeight: 600,
                                    color: '#fff', cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    boxShadow: isFormOpen ? 'none' : `0 2px 8px ${isDark ? 'rgba(155,108,248,0.25)' : 'rgba(93,95,239,0.2)'}`,
                                }}
                            >
                                {isFormOpen ? 'Cancel' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inline post form */}
                <AnimatePresence>
                    {renderPostForm(draft, true)}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: t.bg, color: t.text1, display: 'flex', flexDirection: 'column' }}>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes referencePulse {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-1px); }
                }
            `}</style>

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
                        <FiArrowLeft size={17} color={t.text2} />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiOutlineSparkles size={16} color={t.accent} style={{ opacity: 0.7 }} /> AI Studio
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => onNavigate?.('modelsPage')} style={{
                        padding: '6px 14px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 500,
                        background: t.surface, color: t.text2, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                        Browse Models
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, fontSize: 13, background: t.accentDim, color: t.accent }}>
                        <PiCoinsBold size={12} /> Cost: {currentCost}
                    </div>
                </div>
            </header>

            {/* ── Centered Workspace ── */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 120px' }}>
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
                                color: t.text1, fontSize: 17, lineHeight: 1.6, resize: 'none',
                                minHeight: 60, fontFamily: 'inherit',
                            }}
                        />

                        {currentModelRequiresImage && (
                            <div style={{
                                marginTop: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                                padding: '9px 12px',
                                borderRadius: 12,
                                background: missingRequiredReferences ? t.dangerBg : t.accentDim,
                                color: missingRequiredReferences ? t.dangerColor : t.accent,
                            }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Required</span>
                                <span style={{ fontSize: 11, fontWeight: 600 }}>
                                    This model requires {currentModelMinImages} reference image{currentModelMinImages > 1 ? 's' : ''}{currentModelMaxImages > currentModelMinImages ? ` (up to ${currentModelMaxImages})` : ''}.
                                </span>
                            </div>
                        )}

                        {/* Reference previews */}
                        {referenceFiles.length > 0 && (
                            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                                {referenceFiles.map((reference, index) => (
                                    <div key={`${reference.file.name}-${index}`} style={{
                                        position: 'relative',
                                        width: 72,
                                        height: 72,
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: `1px solid ${missingRequiredReferences ? t.dangerColor : t.border}`,
                                        background: isDark ? '#111' : '#f1f1f1',
                                    }}>
                                        {reference.isVideo ? (
                                            <video src={reference.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                        ) : (
                                            <img src={reference.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                        <button onClick={() => removeReference(index)} style={{
                                            position: 'absolute',
                                            top: 6,
                                            right: 6,
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.72)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}>
                                            <FiX size={10} color="#fff" />
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 5,
                                            left: 5,
                                            padding: '2px 6px',
                                            borderRadius: 999,
                                            background: 'rgba(0,0,0,0.65)',
                                            fontSize: 8,
                                            fontWeight: 700,
                                            color: '#fff',
                                            letterSpacing: '0.3px',
                                        }}>
                                            {reference.isVideo ? 'VIDEO' : `REF ${index + 1}`}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 10, color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                        {generationMode}
                                    </span>
                                    <span style={{ fontSize: 11, color: t.text2 }}>
                                        {referenceFiles.length} attached{mediaType === 'image' ? ` • ${referenceFiles.length}/${currentModelMaxImages}` : ''}
                                    </span>
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
                                    height: 30,
                                    padding: '0 12px',
                                    borderRadius: 999,
                                    border: 'none',
                                    background: missingRequiredReferences ? t.accentDim : t.surface,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    cursor: 'pointer',
                                    color: missingRequiredReferences ? t.accent : t.text3,
                                    boxShadow: missingRequiredReferences ? `0 0 0 1px ${t.accent}, 0 0 18px ${isDark ? 'rgba(155,108,248,0.28)' : 'rgba(93,95,239,0.18)'}` : 'none',
                                    animation: missingRequiredReferences ? 'referencePulse 1.4s ease-in-out infinite' : 'none',
                                }}>
                                    <FiPaperclip size={13} />
                                    <span style={{ fontSize: 11, fontWeight: 600 }}>
                                        {referenceFiles.length > 0 ? `Add Reference (${referenceFiles.length}/${currentModelMaxImages})` : 'Add Reference'}
                                    </span>
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
                                color: prompt.trim() && !isGenerating ? t.accentText : t.text3,
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
                        {/* Model selector (searchable dropdown) */}
                        <div style={{ flex: '1 1 220px' }}>
                            <SearchableModelDropdown
                                models={availableModels}
                                selectedModelId={selectedModel}
                                onSelect={(id) => {
                                    setSelectedModel(id);
                                    const m = availableModels.find(m => m.id === id);
                                    setNumInferenceSteps(m?.defaultSteps || 4);
                                    setGuidanceScale(m?.defaultGuidance || 3.5);
                                }}
                                isDark={isDark}
                                placeholder="Select model"
                            />
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

                    {/* ── Generation Progress — Progressive Reveal ── */}
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginBottom: 20 }}
                        >
                            <ProgressiveImageReveal
                                src={generations.length > 0 ? generations[0]?.url : null}
                                isGenerating={isGenerating}
                                progress={generationProgress}
                                generationStatus={generationStatus}
                                aspectRatio={aspectRatio}
                                isDark={isDark}
                            />
                        </motion.div>
                    )}

                    {/* ── Tabs: Creations / Drafts ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 2, marginBottom: 20,
                        background: t.surface, borderRadius: 12, padding: 3, alignSelf: 'flex-start',
                    }}>
                        {[
                            { key: 'create', label: 'Creations', count: generations.length },
                            { key: 'drafts', label: 'Drafts', count: drafts.length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    background: activeTab === tab.key ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                    color: activeTab === tab.key ? t.text1 : t.text3,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                                        background: activeTab === tab.key ? t.accentDim : t.surface,
                                        color: activeTab === tab.key ? t.accent : t.text3,
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Creations Tab ── */}
                    {activeTab === 'create' && (
                        <>
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
                                    {generations.map(gen => renderGenerationCard(gen))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Drafts Tab ── */}
                    {activeTab === 'drafts' && (
                        <>
                            {draftsLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 12, margin: '0 auto 14px',
                                        border: `2px solid ${t.border}`, borderTop: `2px solid ${t.accent}`,
                                        animation: 'spin 1s linear infinite',
                                    }} />
                                    <p style={{ fontSize: 12, color: t.text3 }}>Loading drafts...</p>
                                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                </div>
                            ) : drafts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <div style={{
                                        width: 64, height: 64, borderRadius: 20, background: t.surface,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                                    }}>
                                        <FiImage size={24} color={t.text3} />
                                    </div>
                                    <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: t.text1 }}>No drafts yet</h2>
                                    <p style={{ margin: 0, fontSize: 12, color: t.text3, lineHeight: 1.6 }}>
                                        Generations that haven't been posted will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                                    {drafts.map(draft => renderDraftCard(draft))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <input
                ref={refFileInputRef}
                type="file"
                accept={mediaType === 'video' ? 'image/*,video/*' : 'image/*'}
                multiple={canSelectMultipleReferences}
                onChange={handleReferenceFile}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default AIStudio;
