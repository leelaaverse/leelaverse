import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi';
import {
    FiArrowLeft, FiImage, FiVideo, FiPlay, FiChevronRight,
    FiRefreshCw, FiScissors, FiSun, FiDroplet, FiCamera,
    FiMaximize, FiCrosshair
} from 'react-icons/fi';
import { PiCoinsBold } from 'react-icons/pi';
import { fetchModels } from '../../store/slices/modelsSlice';
import apiService from '../../services/api';

const MODEL_SHOWCASES = [
    { id: 'flux-schnell', name: 'FLUX Schnell', tagline: 'Lightning-fast image generation', description: 'Generate stunning images in seconds.', tag: 'flux-schnell', cost: 50, accent: { dark: '#9b6cf8', light: '#5d5fef' } },
    { id: 'flux-1-srpo', name: 'FLUX.1 SRPO', tagline: 'High-fidelity photorealistic output', description: 'Superior quality with enhanced detail rendering.', tag: 'flux-1-srpo', cost: 100, badge: 'PRO', accent: { dark: '#a78bfa', light: '#7c3aed' } },
    { id: 'flux-1-dev', name: 'FLUX.1 Dev', tagline: 'Developer-grade creative engine', description: 'Fine-tuned for precision. Advanced control.', tag: 'flux-1-dev', cost: 80, accent: { dark: '#60a5fa', light: '#2563eb' } },
    { id: 'flux-1-pro', name: 'FLUX.1 Pro', tagline: 'Cinema-quality image synthesis', description: 'Our most powerful model for commercial projects.', tag: 'flux-1-pro', cost: 150, badge: 'PRO', accent: { dark: '#f472b6', light: '#db2777' } },
];

const ModelsPage = ({ onBack, onNavigate }) => {
    const dispatch = useDispatch();
    const { status } = useSelector(s => s.models);
    const { theme } = useSelector(s => s.theme);

    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        if (theme === 'Dark') setIsDark(true);
        else if (theme === 'Light') setIsDark(false);
        else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [theme]);

    const [showcasePosts, setShowcasePosts] = useState({});
    const [expandedModel, setExpandedModel] = useState(null);
    const [expandedPosts, setExpandedPosts] = useState([]);
    const [loadingExpanded, setLoadingExpanded] = useState(false);

    useEffect(() => { if (status === 'idle') dispatch(fetchModels()); }, [status, dispatch]);

    useEffect(() => {
        const fetchPosts = async () => {
            const results = {};
            try { const res = await apiService.posts.getFeed({ category: 'featured', limit: 30 }); if (res.data?.posts?.length > 0) results._featured = res.data.posts; } catch (_) {}
            for (const model of MODEL_SHOWCASES) {
                try { const res = await apiService.posts.getFeed({ category: 'featured', limit: 12, tags: model.tag }); if (res.data?.posts?.length > 0) results[model.id] = res.data.posts; } catch (_) {}
            }
            setShowcasePosts(results);
        };
        fetchPosts();
    }, []);

    const getModelPosts = useCallback((modelId) => {
        if (showcasePosts[modelId]?.length > 0) return showcasePosts[modelId];
        const featured = showcasePosts._featured || [];
        const idx = MODEL_SHOWCASES.findIndex(m => m.id === modelId);
        const chunk = Math.ceil(featured.length / MODEL_SHOWCASES.length);
        return featured.slice(idx * chunk, (idx + 1) * chunk);
    }, [showcasePosts]);

    const handleShowMore = useCallback(async (model) => {
        setExpandedModel(model); setLoadingExpanded(true);
        try { const res = await apiService.posts.getFeed({ category: 'featured', limit: 40, tags: model.tag }); setExpandedPosts(res.data?.posts || showcasePosts._featured || []); }
        catch (_) { setExpandedPosts(showcasePosts[model.id] || showcasePosts._featured?.slice(0, 16) || []); }
        finally { setLoadingExpanded(false); }
    }, [showcasePosts]);

    /* ── Theme tokens ── */
    const t = useMemo(() => isDark ? {
        bg: '#0a0a0a', navBg: 'rgba(10,10,10,0.7)', text1: '#fff', text2: 'rgba(255,255,255,0.5)',
        text3: 'rgba(255,255,255,0.2)', surface: 'rgba(255,255,255,0.03)', surfaceHover: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.04)', accent: '#9b6cf8', accentText: '#fff', badgeBg: 'rgba(255,255,255,0.06)',
        badgeColor: 'rgba(255,255,255,0.4)', shadow: 'rgba(0,0,0,0.4)', capBg: 'rgba(255,255,255,0.015)',
        capHover: 'rgba(255,255,255,0.035)', capName: 'rgba(255,255,255,0.65)', capDesc: 'rgba(255,255,255,0.18)',
        overlayBg: 'rgba(10,10,10,0.95)', coinBg: 'rgba(245,166,35,0.06)', coinColor: 'rgba(245,166,35,0.7)',
        orbA: 'rgba(155,108,248,0.12)', orbB: 'rgba(93,95,239,0.08)',
    } : {
        bg: '#fafafa', navBg: 'rgba(255,255,255,0.8)', text1: '#111', text2: 'rgba(0,0,0,0.5)',
        text3: 'rgba(0,0,0,0.2)', surface: 'rgba(0,0,0,0.03)', surfaceHover: 'rgba(0,0,0,0.06)',
        border: 'rgba(0,0,0,0.06)', accent: '#5d5fef', accentText: '#fff', badgeBg: 'rgba(0,0,0,0.06)',
        badgeColor: 'rgba(0,0,0,0.4)', shadow: 'rgba(0,0,0,0.06)', capBg: 'rgba(0,0,0,0.02)',
        capHover: 'rgba(0,0,0,0.04)', capName: 'rgba(0,0,0,0.7)', capDesc: 'rgba(0,0,0,0.35)',
        overlayBg: 'rgba(255,255,255,0.97)', coinBg: 'rgba(245,166,35,0.06)', coinColor: 'rgba(180,120,20,0.8)',
        orbA: 'rgba(93,95,239,0.1)', orbB: 'rgba(155,108,248,0.08)',
    }, [isDark]);

    const getAccent = m => isDark ? m.accent.dark : m.accent.light;

    return (
        <div style={{ background: t.bg, minHeight: '100vh', color: t.text1, overflowX: 'hidden' }}>

            {/* ── Sticky Nav ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: t.navBg, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
                borderBottom: `1px solid ${t.border}`,
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={onBack} style={{
                            width: 34, height: 34, borderRadius: 10, background: t.surface, border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                            <FiArrowLeft size={15} color={t.text2} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <HiOutlineSparkles size={13} color={t.accent} style={{ opacity: 0.7 }} /> Models
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => onNavigate?.('aiStudio')} style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 999,
                            fontSize: 11, fontWeight: 600, background: t.accent, border: 'none', color: t.accentText,
                            cursor: 'pointer', transition: 'transform 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <HiOutlineSparkles size={11} /> Open Studio
                        </button>
                        <button onClick={() => onNavigate?.('coinStore')} style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 999,
                            fontSize: 11, fontWeight: 500, background: t.coinBg, border: 'none', color: t.coinColor, cursor: 'pointer',
                        }}>
                            <PiCoinsBold size={10} /> Coins
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -120, left: '30%', width: 500, height: 500, background: `radial-gradient(circle, ${t.orbA} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -80, right: '15%', width: 400, height: 400, background: `radial-gradient(circle, ${t.orbB} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 40px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent, opacity: 0.5 }}>AI Creative Suite</p>
                    <h1 style={{ margin: '0 0 14px', fontSize: 44, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
                        Create anything you imagine
                    </h1>
                    <p style={{ margin: '0 auto 24px', fontSize: 13, lineHeight: 1.7, color: t.text3, maxWidth: 400 }}>
                        Professional AI models for image and video generation. Transform ideas into stunning visuals.
                    </p>
                    <button onClick={() => onNavigate?.('aiStudio')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: t.accent, color: t.accentText,
                        transition: 'transform 0.15s', boxShadow: `0 0 30px ${isDark ? 'rgba(155,108,248,0.16)' : 'rgba(93,95,239,0.16)'}`,
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Start Creating <HiOutlineSparkles size={14} />
                    </button>
                </div>
            </section>

            {/* ── Model Showcases ── */}
            {MODEL_SHOWCASES.map(model => {
                const posts = getModelPosts(model.id);
                if (!posts || posts.length === 0) return null;
                return (
                    <section key={model.id} style={{ marginBottom: 0 }}>
                        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', color: getAccent(model) }}>
                                        {model.name}
                                        {model.badge && (
                                            <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 7px', borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: '0.5px', verticalAlign: 'middle', background: t.badgeBg, color: t.badgeColor }}>
                                                {model.badge}
                                            </span>
                                        )}
                                    </h2>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: t.text3 }}>{model.tagline}</p>
                                </div>
                                <button onClick={() => handleShowMore(model)} style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999,
                                    fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', background: t.surface, color: t.text2, transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.text1; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.text2; }}
                                >
                                    View all <FiChevronRight size={11} />
                                </button>
                            </div>
                        </div>
                        {/* Gallery */}
                        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                            <div style={{ columnCount: 4, columnGap: 8 }}>
                                {posts.slice(0, 8).map((post, i) => {
                                    const imgUrl = post.imageUrl || post.thumbnailUrl || post.mediaUrl;
                                    if (!imgUrl) return null;
                                    return (
                                        <div key={post._id || i} style={{
                                            breakInside: 'avoid', marginBottom: 8, borderRadius: 12, overflow: 'hidden',
                                            position: 'relative', cursor: 'pointer', transition: 'transform 0.3s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.015)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            onClick={() => onNavigate?.('post', post._id)}
                                        >
                                            <img src={imgUrl} alt="" loading="lazy"
                                                onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                                                style={{ width: '100%', display: 'block' }}
                                            />
                                            {post.type === 'video' && (
                                                <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FiPlay size={9} color="#fff" style={{ marginLeft: 1 }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 0' }}>
                            <span style={{ fontSize: 10, color: t.text3, opacity: 0.6 }}>
                                <PiCoinsBold size={9} style={{ marginRight: 3, verticalAlign: '-1px' }} /> {model.cost} coins/gen
                            </span>
                        </div>
                    </section>
                );
            })}

            {/* ── Capabilities ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 40px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: t.text2 }}>Tools & Capabilities</h2>
                <p style={{ margin: '0 0 16px', fontSize: 11, color: t.text3 }}>Everything you need for AI content creation</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                    {[
                        { name: 'Text to Image', desc: 'Create from prompts', Icon: FiImage, color: isDark ? '#9b6cf8' : '#5d5fef' },
                        { name: 'Text to Video', desc: 'Generate cinematic clips', Icon: FiVideo, color: '#60a5fa' },
                        { name: 'Image to Image', desc: 'Transform any photo', Icon: FiRefreshCw, color: '#a78bfa' },
                        { name: 'Image to Video', desc: 'Bring stills to life', Icon: FiPlay, color: '#f472b6' },
                        { name: 'AI Upscaler', desc: '4× resolution', Icon: FiMaximize, color: '#34d399' },
                        { name: 'Skin Enhancer', desc: 'Natural refinement', Icon: FiSun, color: '#fbbf24' },
                        { name: 'BG Remove', desc: 'Precision cutout', Icon: FiScissors, color: '#e879f9' },
                        { name: 'Face Swap', desc: 'Seamless transfer', Icon: FiCrosshair, color: '#22d3ee' },
                        { name: 'Colorizer', desc: 'B&W restoration', Icon: FiDroplet, color: '#fb7185' },
                        { name: 'Multi-Shot', desc: '9 angles, one image', Icon: FiCamera, color: '#2dd4bf' },
                    ].map((cap, i) => (
                        <div key={i} style={{ padding: '16px 14px', borderRadius: 12, background: t.capBg, cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = t.capHover}
                            onMouseLeave={e => e.currentTarget.style.background = t.capBg}
                        >
                            <cap.Icon size={14} color={cap.color} style={{ marginBottom: 8 }} />
                            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, color: t.capName }}>{cap.name}</p>
                            <p style={{ margin: 0, fontSize: 9, color: t.capDesc, lineHeight: 1.4 }}>{cap.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer CTA ── */}
            <section style={{ textAlign: 'center', padding: '16px 24px 100px' }}>
                <div style={{ maxWidth: 460, margin: '0 auto', padding: '36px 28px', borderRadius: 18, background: t.surface, border: `1px solid ${t.border}` }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 600 }}>Ready to create?</h2>
                    <p style={{ margin: '0 auto 18px', fontSize: 12, color: t.text3, lineHeight: 1.6 }}>Open the studio and start generating</p>
                    <button onClick={() => onNavigate?.('aiStudio')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: t.accent, color: t.accentText,
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Open Studio <HiOutlineSparkles size={12} />
                    </button>
                </div>
            </section>

            {/* ── Expanded Overlay ── */}
            <AnimatePresence>
                {expandedModel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: t.overlayBg, backdropFilter: 'blur(24px)', overflowY: 'auto' }}
                    >
                        <div style={{
                            position: 'sticky', top: 0, zIndex: 10, background: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.border}`, padding: '12px 24px',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <button onClick={() => setExpandedModel(null)} style={{ width: 34, height: 34, borderRadius: 10, background: t.surface, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <FiArrowLeft size={14} color={t.text2} />
                            </button>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: getAccent(expandedModel) }}>{expandedModel.name}</h3>
                                <p style={{ margin: 0, fontSize: 10, color: t.text3 }}>{expandedModel.description}</p>
                            </div>
                        </div>
                        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 100px' }}>
                            {loadingExpanded ? (
                                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                    <div style={{ width: 28, height: 28, border: `2px solid ${t.border}`, borderTop: `2px solid ${t.accent}`, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ color: t.text3, fontSize: 11 }}>Loading...</p>
                                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                </div>
                            ) : (
                                <div style={{ columnCount: 4, columnGap: 8 }}>
                                    {expandedPosts.map((post, i) => {
                                        const imgUrl = post.imageUrl || post.thumbnailUrl || post.mediaUrl;
                                        if (!imgUrl) return null;
                                        return (
                                            <div key={post._id || i} style={{ breakInside: 'avoid', marginBottom: 8, borderRadius: 12, overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'transform 0.3s' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.015)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                onClick={() => { setExpandedModel(null); onNavigate?.('post', post._id); }}
                                            >
                                                <img src={imgUrl} alt="" loading="lazy" onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} style={{ width: '100%', display: 'block' }} />
                                                {post.type === 'video' && (
                                                    <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FiPlay size={9} color="#fff" style={{ marginLeft: 1 }} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {!loadingExpanded && expandedPosts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                    <FiImage size={24} color={t.text3} style={{ marginBottom: 10 }} />
                                    <p style={{ color: t.text3, fontSize: 11 }}>No creations yet. Be the first to create with {expandedModel.name}.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelsPage;
