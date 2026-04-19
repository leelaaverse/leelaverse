import React, { useState, useCallback, useRef, useEffect } from 'react';
import { usePostProgress } from '../../contexts/PostProgressContext';

const FloatingPostProgress = () => {
    const { isActive, isMinimized, stage, progress, message, errorMsg, dismiss, taskType } = usePostProgress();
    const [pos, setPos] = useState({ x: 20, y: 20 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const widgetRef = useRef(null);

    // Drag handlers
    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.fp-close-btn')) return;
        setDragging(true);
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        e.preventDefault();
    }, []);

    useEffect(() => {
        if (!dragging) return;
        const handleMove = (e) => {
            const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 310));
            const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 80));
            setPos({ x, y });
        };
        const handleUp = () => setDragging(false);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [dragging]);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e) => {
        if (e.target.closest('.fp-close-btn')) return;
        const touch = e.touches[0];
        setDragging(true);
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        }
    }, []);

    useEffect(() => {
        if (!dragging) return;
        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            const x = Math.max(0, Math.min(touch.clientX - dragOffset.current.x, window.innerWidth - 310));
            const y = Math.max(0, Math.min(touch.clientY - dragOffset.current.y, window.innerHeight - 80));
            setPos({ x, y });
        };
        const handleTouchEnd = () => setDragging(false);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [dragging]);

    if (!isActive || !isMinimized) return null;

    const isDone = stage === 'done';
    const isError = stage === 'error';

    const accentColor = isDone ? '#22c55e' : isError ? '#ef4444' : '#9b6cf8';
    const bgGlow = isDone
        ? 'rgba(34,197,94,0.08)'
        : isError
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(155,108,248,0.08)';

    return (
        <div
            ref={widgetRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(17,17,19,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${accentColor}33`,
                borderRadius: 16,
                padding: '12px 16px',
                minWidth: 280,
                maxWidth: 320,
                boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${bgGlow}`,
                cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                transition: dragging ? 'none' : 'box-shadow 0.3s ease',
                fontFamily: "'Inter', -apple-system, sans-serif",
                animation: 'fpSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
        >
            <style>{`
                @keyframes fpSlideIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fpSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fpPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .fp-close-btn:hover {
                    background: rgba(255,255,255,0.12) !important;
                }
            `}</style>

            {/* Icon */}
            <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: `${accentColor}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {isDone ? (
                    <span style={{ fontSize: 18, animation: 'fpPulse 0.6s ease' }}>✅</span>
                ) : isError ? (
                    <span style={{ fontSize: 18 }}>❌</span>
                ) : (
                    <div style={{
                        width: 18,
                        height: 18,
                        border: `2.5px solid ${accentColor}40`,
                        borderTop: `2.5px solid ${accentColor}`,
                        borderRadius: '50%',
                        animation: 'fpSpin 0.8s linear infinite',
                    }} />
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {isDone
                        ? (taskType === 'generate' ? 'Generation complete!' : 'Post published!')
                        : isError
                            ? (taskType === 'generate' ? 'Generation failed' : 'Post failed')
                            : (taskType === 'generate' ? 'Generating your content' : 'Posting your creation')
                    }
                </div>
                <div style={{
                    color: isDone ? `${accentColor}cc` : isError ? `${accentColor}cc` : 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    marginBottom: isDone || isError ? 0 : 5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {isError ? errorMsg : message}
                </div>
                {!isDone && !isError && (
                    <div style={{
                        height: 3,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}bb)`,
                            borderRadius: 2,
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                )}
            </div>

            {/* Close button */}
            <button
                className="fp-close-btn"
                onClick={(e) => { e.stopPropagation(); dismiss(); }}
                style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    border: 'none',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                    transition: 'background 0.15s',
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default FloatingPostProgress;
