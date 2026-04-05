import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, Rate, Skeleton, message } from 'antd';
import {
  RiSearchLine, RiCloseLine, RiMagicLine, RiEditLine, RiCheckLine, RiFlashlightLine, RiStarFill, RiFileCopyLine, RiCameraLensLine
} from 'react-icons/ri';
import { fetchTemplates, fetchTemplateDetails, useTemplate, rateTemplate, clearSelectedTemplate } from '../../store/slices/communitySlice';

// ── Dummy templates ───────────────────────────────────────────────────────────
const DUMMY_TEMPLATES = [
  { id: 't1', name: 'Cinematic Portrait', category: 'portrait', description: 'Ultra-cinematic close-up with dramatic lighting and shallow depth of field.', prompt: 'Ultra-cinematic close-up portrait of [subject], dramatic side lighting, shallow depth of field, film grain, 35mm, high contrast, cinematic sharp focus, [mood]', rating: 4.9, ratingCount: 1204, usageCount: 8740, isFeatured: true, coinCost: 0, aiModel: 'FLUX Pro', aspectRatio: '4:5', style: 'Cinematic', thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format', creator: { username: 'nova_create', avatar: null }, tags: ['portrait', 'cinematic', 'film'] },
  { id: 't2', name: 'Neon City Night', category: 'landscape', description: 'Rain-slicked streets, neon reflections, cyberpunk mood.', prompt: 'Neon-lit city street at night, rain reflections on pavement, [subject] walking, cyberpunk atmosphere, bokeh lights, ultra-detailed, 8K', rating: 4.7, ratingCount: 876, usageCount: 6120, isFeatured: true, coinCost: 0, aiModel: 'FLUX Dev', aspectRatio: '16:9', style: 'Cyberpunk', thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&auto=format', creator: { username: 'aether_vis', avatar: null }, tags: ['city', 'neon', 'night'] },
  { id: 't3', name: 'Misty Forest', category: 'landscape', description: 'Ancient forest, morning mist, ethereal light shafts.', prompt: 'Ancient forest with [time of day] mist, god rays through tall trees, moss-covered ground, ethereal atmosphere, photorealistic, DSLR, [color palette]', rating: 4.8, ratingCount: 654, usageCount: 5340, isFeatured: false, coinCost: 0, aiModel: 'FLUX Pro', aspectRatio: '16:9', style: 'Photorealism', thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format', creator: { username: 'luna.frames', avatar: null }, tags: ['forest', 'nature', 'mist'] },
  { id: 't4', name: 'Abstract Flow', category: 'abstract', description: 'Fluid dynamics meets generative geometry.', prompt: 'Abstract fluid art, [color1] and [color2] flowing forms, metallic sheen, macro lens, clean background, ultra HD', rating: 4.6, ratingCount: 432, usageCount: 4200, isFeatured: false, coinCost: 0, aiModel: 'Stable Diffusion XL', aspectRatio: '1:1', style: 'Abstract', thumbnailUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&auto=format', creator: { username: 'flux_studio', avatar: null }, tags: ['abstract', 'fluid', 'geometry'] },
  { id: 't5', name: 'Golden Hour Portrait', category: 'portrait', description: 'Warm light, natural bokeh, editorial feel.', prompt: 'Editorial portrait of [subject] during golden hour, warm backlighting, natural bokeh, analog film aesthetic, Kodak Portra 400', rating: 4.8, ratingCount: 987, usageCount: 7200, isFeatured: true, coinCost: 0, aiModel: 'FLUX Pro', aspectRatio: '4:5', style: 'Editorial', thumbnailUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&auto=format', creator: { username: 'pixel.sage', avatar: null }, tags: ['portrait', 'golden hour', 'editorial'] },
  { id: 't6', name: 'Sci-Fi Interior', category: 'concept-art', description: 'Futuristic architecture, clean minimal spaces.', prompt: 'Interior of a futuristic [space type], clean minimalist design, soft indirect lighting, [material] surfaces, concept art, Unreal Engine 5 render, 8K', rating: 4.5, ratingCount: 321, usageCount: 3100, isFeatured: false, coinCost: 0, aiModel: 'Midjourney v6', aspectRatio: '16:9', style: 'Concept Art', thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format', creator: { username: 'echo.render', avatar: null }, tags: ['scifi', 'architecture', 'concept'] },
  { id: 't7', name: 'Ink Wash Portrait', category: 'anime', description: 'Traditional East Asian ink wash meets modern portrait.', prompt: 'Ink wash portrait of [subject], sumi-e style, minimalist composition, splattered ink texture, [expression], white background', rating: 4.7, ratingCount: 543, usageCount: 4800, isFeatured: false, coinCost: 0, aiModel: 'FLUX Dev', aspectRatio: '3:4', style: 'Ink Wash', thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&auto=format', creator: { username: 'drift_form', avatar: null }, tags: ['ink', 'traditional', 'portrait'] },
  { id: 't8', name: 'Product Hero Shot', category: 'photography', description: 'Studio-quality product photography with dramatic lighting.', prompt: '[Product] on [surface], studio lighting, clean white or [color] background, sharp focus, commercial photography, 8K product shot', rating: 4.4, ratingCount: 267, usageCount: 2890, isFeatured: false, coinCost: 0, aiModel: 'FLUX Pro', aspectRatio: '1:1', style: 'Commercial', thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format', creator: { username: 'veil_motion', avatar: null }, tags: ['product', 'commercial', 'studio'] },
  { id: 't9', name: 'Lo-fi Anime', category: 'anime', description: 'Cozy lo-fi aesthetic with anime character.', prompt: 'Lo-fi anime style illustration of [character] in [cozy setting], soft muted colors, warm lighting, Studio Ghibli inspired, peaceful atmosphere', rating: 4.9, ratingCount: 1567, usageCount: 11200, isFeatured: true, coinCost: 0, aiModel: 'Stable Diffusion XL', aspectRatio: '16:9', style: 'Anime', thumbnailUrl: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&auto=format', creator: { username: 'nova_create', avatar: null }, tags: ['anime', 'lofi', 'cozy'] },
];

const SORT_OPTS = [
  { value: 'trending',  label: 'Trending' },
  { value: 'rated',     label: 'Top Rated' },
  { value: 'most-used', label: 'Most Used' },
  { value: 'newest',    label: 'Newest' },
];

const CAT_OPTS = [
  { value: '', label: 'All' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'anime', label: 'Anime' },
  { value: 'concept-art', label: 'Concept' },
  { value: 'photography', label: 'Photo' },
];

// ── Template card ─────────────────────────────────────────────────────────────
const TplCard = ({ tpl, index, onClick }) => {
  const aspectRatios = ['3/4', '4/5', '1/1', '16/9'];
  const ar = tpl.aspectRatio === '16:9' ? '16/9' : tpl.aspectRatio === '1:1' ? '1/1' : tpl.aspectRatio === '4:5' ? '4/5' : aspectRatios[index % 4];

  return (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    onClick={() => onClick(tpl)}
    whileHover={{ y: -4, transition: { duration: 0.18 } }}
    style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: '#0c0c18', border: '1px solid #14142a', position: 'relative', breakInside: 'avoid', marginBottom: 12 }}
  >
    <div style={{ position: 'relative', aspectRatio: ar, overflow: 'hidden' }}>
      <img
        src={tpl.thumbnailUrl}
        alt={tpl.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,24,0.9) 0%, transparent 50%)' }} />
      {tpl.isFeatured && (
        <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: 'rgba(212,160,23,0.18)', color: '#d4a017' }}>
          ★
        </div>
      )}
      <div className="flex gap-2" style={{ position: 'absolute', top: 8, right: 8 }}>
        <div style={{ padding: '4px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <RiFileCopyLine size={12} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#d8d8ee', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#4a4a68' }}>{tpl.usageCount?.toLocaleString()} uses</span>
          <span style={{ fontSize: 10, color: '#d4a017', display: 'flex', alignItems: 'center', gap: 2 }}>
            <RiStarFill size={9} />{(tpl.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
  );
};

// ── Detail drawer ─────────────────────────────────────────────────────────────
const TplDrawer = ({ tpl, open, onClose, isLoggedIn, onShowAuthModal }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((s) => s.theme || { theme: 'Dark' });
  const { selectedTemplate } = useSelector((s) => s.community);
  const [editMode, setEditMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [using, setUsing] = useState(false);

  const data = tpl || selectedTemplate.data;
  useEffect(() => { if (data?.prompt) setPrompt(data.prompt); setEditMode(false); setRated(false); setUserRating(0); }, [data?.id]);

  const handleUse = async () => {
    if (!isLoggedIn) { onShowAuthModal?.('login'); return; }
    setUsing(true);
    try {
      if (data.id && !data.id.startsWith('t')) await dispatch(useTemplate(data.id)).unwrap();
      await navigator.clipboard.writeText(prompt || data.prompt).catch(() => {});
      message.success('Prompt copied to clipboard 📋');
    } catch { message.error('Failed'); }
    finally { setUsing(false); }
  };

  const handleRate = async (val) => {
    if (!isLoggedIn) { onShowAuthModal?.('login'); return; }
    setUserRating(val);
    try {
      if (data.id && !data.id.startsWith('t')) await dispatch(rateTemplate({ id: data.id, rating: val })).unwrap();
      setRated(true);
      message.success(`Rated ${val} ★`);
    } catch { message.error('Failed to rate'); }
  };

  if (!data) return null;

  const promptParts = (prompt || data.prompt || '').split(/(\[[^\]]+\])/g);

  const isLight = theme === 'Light' || (theme === 'Auto' && window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const btnBg = isLight ? '#000000' : '#d0ff14';
  const btnColor = isLight ? '#ffffff' : '#000000';

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); if (!tpl?.id?.startsWith('t')) dispatch(clearSelectedTemplate()); }}
      placement="right"
      width={420}
      styles={{
        body: { background: '#0a0a14', padding: 0 },
        header: { background: '#0a0a14', borderBottom: '1px solid #12121e' },
        mask: { backdropFilter: 'blur(10px)', background: 'rgba(4,4,12,0.7)' },
      }}
      title={<span style={{ color: '#b0b0c8', fontSize: 13, fontWeight: 600 }}>Template</span>}
      closeIcon={<RiCloseLine color="#28284e" size={18} />}
    >
      {/* Preview */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img src={data.thumbnailUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a14 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 6 }}>
          {data.aiModel && (
            <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <RiCameraLensLine size={12} /> {data.aiModel}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '20px 22px' }}>
        {/* Creator Header (Higgsfield Style) */}
        {data.creator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <img
              src={data.creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.creator.username}`}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5a5aff' }}
              alt={data.creator.username}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0f8' }}>{data.creator.username}</div>
              <div style={{ fontSize: 11, color: '#888898' }}>Author</div>
            </div>
            <button style={{ marginLeft: 'auto', background: '#1c1c2e', color: '#fff', border: '1px solid #2a2a4e', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Follow
            </button>
          </div>
        )}

        <div style={{ height: '1px', background: '#1a1a2e', marginBottom: 20 }} />
        {/* Title + rating */}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e0e0f8', letterSpacing: '-0.02em', marginBottom: 4 }}>{data.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Rate disabled value={data.rating || 0} allowHalf style={{ fontSize: 12, color: '#d4a017' }} />
          <span style={{ fontSize: 11, color: '#28284e' }}>{(data.rating || 0).toFixed(1)} ({data.ratingCount || 0})</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#22223a' }}>{data.usageCount?.toLocaleString() || 0} uses</span>
        </div>

        {data.description && (
          <div style={{ fontSize: 13, color: '#2e2e4e', lineHeight: 1.6, marginBottom: 16 }}>{data.description}</div>
        )}

        {/* Prompt */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#888898', letterSpacing: '0.05em' }}>
              <RiMagicLine size={14} color="#888898" /> PROMPT
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(prompt || data.prompt).catch(() => {});
                message.success('Prompt copied to clipboard 📋');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#e0e0f8', background: '#1e1e32', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
            >
              <RiFileCopyLine size={12} /> Copy
            </button>
          </div>
          {editMode ? (
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#0e0e1a', border: '1px solid rgba(90,90,255,0.2)', color: '#c0c0d8', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
          ) : (
            <div
              onClick={() => setEditMode(true)}
              style={{ padding: '12px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7, cursor: 'text', color: '#888898' }}
            >
              {promptParts.map((part, i) =>
                part.startsWith('[')
                  ? <span key={i} style={{ color: '#5a5aff', fontWeight: 700 }}>{part}</span>
                  : part
              )}
            </div>
          )}
        </div>

        {/* Information Table */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888898', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
             <RiCameraLensLine size={14} /> INFORMATION
          </div>
          <div style={{ background: '#0e0e1a', borderRadius: 12, padding: '12px 16px', border: '1px solid #1a1a2e' }}>
            {data.aiModel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
                <span style={{ color: '#888898', fontSize: 13 }}>Model</span>
                <span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{data.aiModel}</span>
              </div>
            )}
            {data.style && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
                <span style={{ color: '#888898', fontSize: 13 }}>Style / Moodboard</span>
                <span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{data.style}</span>
              </div>
            )}
            {data.aspectRatio && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#888898', fontSize: 13 }}>Aspect Ratio</span>
                <span style={{ color: '#e0e0f8', fontSize: 13, fontWeight: 600 }}>{data.aspectRatio}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rate */}
        {isLoggedIn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: '#28284e' }}>Rate this:</span>
            <Rate value={userRating} onChange={handleRate} disabled={rated} style={{ fontSize: 16, color: '#d4a017' }} />
            {rated && <RiCheckLine color="#3dd68c" size={14} />}
          </div>
        )}

        {/* Use button fixed at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px', background: '#0a0a14', borderTop: '1px solid #16162a' }}>
          <button
            onClick={handleUse}
            disabled={using}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: using ? 'not-allowed' : 'pointer',
              background: using ? `${btnBg}ab` : btnBg,
              color: btnColor, fontSize: 15, fontWeight: 800, opacity: using ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: '-0.01em',
            }}
          >
            <RiMagicLine size={18} />
            {using ? 'Recreating…' : `Recreate Pattern`}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TemplatesPage = ({ isLoggedIn, onShowAuthModal }) => {
  const dispatch = useDispatch();
  const { templates } = useSelector((s) => s.community);
  const [sort, setSort] = useState('trending');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTemplates({ sort, category: category || undefined, limit: 24 }));
  }, [dispatch, sort, category]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    if (val.length !== 1) dispatch(fetchTemplates({ sort, category: category || undefined, search: val || undefined, limit: 24 }));
  }, [dispatch, sort, category]);

  const list = (templates.list.length > 0 ? templates.list : DUMMY_TEMPLATES)
    .filter(t => !category || t.category === category)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const handleClick = (tpl) => {
    setSelectedTpl(tpl);
    if (tpl.id && !tpl.id.startsWith('t')) dispatch(fetchTemplateDetails(tpl.id));
    setDrawerOpen(true);
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <RiSearchLine size={14} color="#28284e" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search templates…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a', color: '#c0c0d8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        {/* Sort */}
        <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a' }}>
          {SORT_OPTS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
              background: sort === o.value ? '#18182e' : 'transparent',
              color: sort === o.value ? '#c0c0d8' : '#28284e',
            }}>{o.label}</button>
          ))}
        </div>
        {/* Category */}
        <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a', overflowX: 'auto' }}>
          {CAT_OPTS.map(o => (
            <button key={o.value} onClick={() => setCategory(o.value)} style={{
              padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.15s',
              background: category === o.value ? '#18182e' : 'transparent',
              color: category === o.value ? '#c0c0d8' : '#28284e',
            }}>{o.label}</button>
          ))}
        </div>
      </div>

      {!templates.loading && (
        <div style={{ fontSize: 11, color: '#1e1e3a', marginBottom: 16 }}>{list.length} templates</div>
      )}

      {/* Grid */}
      {templates.loading && templates.list.length === 0 ? (
        <div style={{ columnCount: 3, columnGap: 16 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: 'hidden', background: '#0c0c18', border: '1px solid #14142a', breakInside: 'avoid', marginBottom: 16 }}>
              <div style={{ aspectRatio: '3/4', background: '#111120' }} />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#1e1e3a', fontSize: 13 }}>No templates found</div>
      ) : (
        <div style={{
          columnCount: window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 3 : 4,
          columnGap: 16
        }}>
          {list.map((tpl, i) => <TplCard key={tpl.id} tpl={tpl} index={i} onClick={handleClick} />)}
        </div>
      )}

      {templates.hasMore && (
        <button
          onClick={() => dispatch(fetchTemplates({ sort, category: category || undefined, search: search || undefined, page: templates.page + 1, limit: 24 }))}
          style={{ width: '100%', marginTop: 16, padding: '10px 0', borderRadius: 10, border: '1px solid #16162a', background: 'transparent', color: '#28284e', fontSize: 13, cursor: 'pointer' }}
        >
          Load more
        </button>
      )}

      <TplDrawer
        tpl={selectedTpl}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedTpl(null); }}
        isLoggedIn={isLoggedIn}
        onShowAuthModal={onShowAuthModal}
      />
    </div>
  );
};

export default TemplatesPage;
