import { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { FiSearch, FiCheck, FiChevronDown, FiCpu, FiX, FiZap, FiBox, FiVideo, FiMaximize, FiScissors, FiImage } from 'react-icons/fi';
import { PiCoinsBold } from 'react-icons/pi';
import { HiOutlineSparkles } from 'react-icons/hi';

/**
 * Searchable Model Dropdown
 * Shared between AIStudio and GenerateModal.
 *
 * Props:
 *  - models: Array of { id, name, description, provider, creditCost, featured, category }
 *  - selectedModelId: string
 *  - onSelect: (modelId) => void
 *  - disabled: boolean
 *  - isDark: boolean
 *  - placeholder: string
 *  - compact: boolean (for smaller UIs like GenerateModal)
 */
const SearchableModelDropdown = ({
    models = [],
    selectedModelId,
    onSelect,
    disabled = false,
    isDark = true,
    placeholder = 'Select model',
    compact = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [search, setSearch] = useState('');
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectedModel = useMemo(() => models.find(m => m.id === selectedModelId), [models, selectedModelId]);

    // Debounce search so we don't lag on fast typing
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchTerm), 150);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filtered + grouped models
    const filteredModels = useMemo(() => {
        if (!search.trim()) return models;
        const q = search.toLowerCase();
        return models.filter(m =>
            m.name.toLowerCase().includes(q) ||
            (m.provider || '').toLowerCase().includes(q) ||
            (m.description || '').toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q)
        );
    }, [models, search]);

    // Group by provider
    const groupedModels = useMemo(() => {
        const groups = {};
        filteredModels.forEach(m => {
            const provider = m.provider || 'Other';
            if (!groups[provider]) groups[provider] = [];
            groups[provider].push(m);
        });
        return groups;
    }, [filteredModels]);

    // Flat list for keyboard nav
    const flatFiltered = filteredModels;

    // Position dropdown
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const update = () => {
                const rect = triggerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropHeight = Math.min(420, filteredModels.length * 52 + 100);
                const openUp = spaceBelow < dropHeight && rect.top > spaceBelow;

                setPosition({
                    top: openUp ? rect.top - 4 : rect.bottom + 4,
                    left: rect.left,
                    width: Math.max(rect.width, 340),
                    openUp
                });
            };
            update();
            window.addEventListener('scroll', update, true);
            window.addEventListener('resize', update);
            return () => {
                window.removeEventListener('scroll', update, true);
                window.removeEventListener('resize', update);
            };
        }
    }, [isOpen, filteredModels.length]);

    // Focus search on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
            setSearch('');
            setHighlightIdx(-1);
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (triggerRef.current?.contains(e.target)) return;
            if (dropdownRef.current?.contains(e.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const handleSelect = (model) => {
        onSelect(model.id);
        setIsOpen(false);
    };

    // Keyboard nav
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIdx(i => Math.min(i + 1, flatFiltered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && highlightIdx >= 0 && flatFiltered[highlightIdx]) {
            e.preventDefault();
            handleSelect(flatFiltered[highlightIdx]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const getModelIcon = (model) => {
        const n = (model.name || '').toLowerCase();
        const id = (model.id || '').toLowerCase();
        if (n.includes('flux') || id.includes('flux')) return <FiZap size={15} />;
        if (n.includes('gpt') || id.includes('gpt')) return <FiCpu size={15} />;
        if (n.includes('nano') || n.includes('banana')) return <FiBox size={15} />;
        if (n.includes('seedream') || n.includes('dreamina')) return <FiImage size={15} />;
        if (n.includes('birefnet') || n.includes('bria') || n.includes('background')) return <FiScissors size={15} />;
        if (n.includes('topaz') || n.includes('upscale') || n.includes('seedvr')) return <FiMaximize size={15} />;
        if (n.includes('video')) return <FiVideo size={15} />;
        return <HiOutlineSparkles size={15} />;
    };

    // Theme
    const t = isDark ? {
        bg: '#141414', border: 'rgba(255,255,255,0.08)', surface: 'rgba(255,255,255,0.04)',
        surfaceHover: 'rgba(255,255,255,0.08)', text1: '#fff', text2: 'rgba(255,255,255,0.55)',
        text3: 'rgba(255,255,255,0.25)', accent: '#9b6cf8', accentDim: 'rgba(155,108,248,0.15)',
        searchBg: 'rgba(255,255,255,0.06)', shadow: '0 16px 60px rgba(0,0,0,0.5)',
        inputBg: 'rgba(255,255,255,0.04)', featuredBg: 'rgba(250,204,21,0.12)', featuredColor: '#facc15',
    } : {
        bg: '#ffffff', border: 'rgba(0,0,0,0.1)', surface: 'rgba(0,0,0,0.03)',
        surfaceHover: 'rgba(0,0,0,0.06)', text1: '#111', text2: 'rgba(0,0,0,0.55)',
        text3: 'rgba(0,0,0,0.25)', accent: '#5d5fef', accentDim: 'rgba(93,95,239,0.1)',
        searchBg: 'rgba(0,0,0,0.04)', shadow: '0 16px 60px rgba(0,0,0,0.15)',
        inputBg: 'rgba(0,0,0,0.03)', featuredBg: 'rgba(234,179,8,0.1)', featuredColor: '#ca8a04',
    };

    const dropdownContent = (
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top: position.openUp ? 'auto' : position.top,
                bottom: position.openUp ? (window.innerHeight - position.top) : 'auto',
                left: position.left,
                width: position.width,
                zIndex: 999999,
            }}
            onKeyDown={handleKeyDown}
        >
            <div style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                boxShadow: t.shadow,
                overflow: 'hidden',
                animation: 'smdFadeIn 0.15s ease-out',
            }}>
                {/* Search */}
                <div style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${t.border}`,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: t.searchBg,
                        borderRadius: 10,
                        border: `1px solid ${t.border}`,
                    }}>
                        <FiSearch size={14} color={t.text3} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setHighlightIdx(-1); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search models..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: t.text1,
                                fontSize: 13,
                                fontFamily: 'inherit',
                            }}
                        />
                        {searchTerm && (
                            <button onClick={() => { setSearchTerm(''); setSearch(''); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                display: 'flex', alignItems: 'center',
                            }}>
                                <FiX size={12} color={t.text3} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Models list */}
                <div style={{
                    maxHeight: 340,
                    overflowY: 'auto',
                    padding: '6px',
                }}>
                    {filteredModels.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: 12, color: t.text3 }}>
                                No models found for "{search}"
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedModels).map(([provider, providerModels]) => (
                            <div key={provider}>
                                {/* Provider header */}
                                <div style={{
                                    padding: '8px 10px 4px',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: t.text3,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                }}>
                                    {provider}
                                </div>

                                {/* Models in this group */}
                                {providerModels.map((model) => {
                                    const flatIdx = flatFiltered.indexOf(model);
                                    const isSelected = selectedModelId === model.id;
                                    const isHighlighted = highlightIdx === flatIdx;

                                    return (
                                        <button
                                            key={model.id}
                                            onClick={() => handleSelect(model)}
                                            className={`smd-model-btn ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                            style={{ color: t.text1 }}
                                        >
                                            {/* Icon */}
                                            <span style={{
                                                width: 32, height: 32,
                                                borderRadius: 8,
                                                background: t.surface,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 15,
                                                flexShrink: 0,
                                            }}>
                                                {getModelIcon(model)}
                                            </span>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                }}>
                                                    <span style={{
                                                        fontSize: 12,
                                                        fontWeight: isSelected ? 700 : 500,
                                                        color: isSelected ? t.accent : t.text1,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}>
                                                        {model.name}
                                                    </span>
                                                    {model.featured && (
                                                        <span style={{
                                                            fontSize: 8,
                                                            fontWeight: 700,
                                                            padding: '1px 5px',
                                                            borderRadius: 4,
                                                            background: t.featuredBg,
                                                            color: t.featuredColor,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            flexShrink: 0,
                                                        }}>
                                                            ★ Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: 10,
                                                    color: t.text3,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    marginTop: 1,
                                                }}>
                                                    {model.description}
                                                </p>
                                            </div>

                                            {/* Cost + check */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                flexShrink: 0,
                                            }}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 3,
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    color: t.text2,
                                                    padding: '2px 7px',
                                                    borderRadius: 6,
                                                    background: t.surface,
                                                }}>
                                                    <PiCoinsBold size={9} />
                                                    {model.creditCost}
                                                </span>
                                                {isSelected && (
                                                    <FiCheck size={14} color={t.accent} strokeWidth={3} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer showing count */}
                <div style={{
                    padding: '8px 14px',
                    borderTop: `1px solid ${t.border}`,
                    fontSize: 10,
                    color: t.text3,
                    display: 'flex',
                    justifyContent: 'space-between',
                }}>
                    <span>{filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}</span>
                    <span>↑↓ navigate · Enter select · Esc close</span>
                </div>
            </div>

            <style>{`
                @keyframes smdFadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .smd-model-btn {
                    width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px;
                    border: none; border-radius: 10px; cursor: pointer; text-align: left;
                    transition: background 0.1s; background: transparent;
                }
                .smd-model-btn:hover, .smd-model-btn.highlighted {
                    background: ${t.surfaceHover};
                }
                .smd-model-btn.selected, .smd-model-btn.selected:hover {
                    background: ${t.accentDim};
                }
            `}</style>
        </div>
    );

    return (
        <>
            {/* Trigger button */}
            <button
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: compact ? '8px 12px' : '10px 14px',
                    borderRadius: 12,
                    border: `1px solid ${isOpen ? t.accent : t.border}`,
                    background: t.inputBg,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    color: t.text1,
                    fontSize: compact ? 12 : 13,
                    transition: 'all 0.15s',
                    opacity: disabled ? 0.6 : 1,
                    fontFamily: 'inherit',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {selectedModel ? (
                        <>
                            <span style={{ fontSize: 16 }}>{getModelIcon(selectedModel)}</span>
                            <span style={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {selectedModel.name}
                            </span>
                            <span style={{
                                fontSize: 10, color: t.text3,
                                display: 'flex', alignItems: 'center', gap: 3,
                                flexShrink: 0,
                            }}>
                                <PiCoinsBold size={9} /> {selectedModel.creditCost}
                            </span>
                        </>
                    ) : (
                        <>
                            <FiCpu size={14} color={t.text3} />
                            <span style={{ color: t.text3 }}>{placeholder}</span>
                        </>
                    )}
                </span>
                <FiChevronDown
                    size={12}
                    color={t.text3}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                    }}
                />
            </button>

            {/* Portal dropdown */}
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
};

export default SearchableModelDropdown;
