import { useState, useEffect, useRef } from 'react';

/**
 * ChatGPT-style Progressive Image Reveal
 * Shows a blurry placeholder that progressively sharpens as the image loads.
 * 
 * Props:
 *  - src: string (image URL)
 *  - isGenerating: boolean (show the generating animation)
 *  - progress: number (0-100, generation progress)
 *  - generationStatus: string (status text to show)
 *  - aspectRatio: string (e.g. '1:1', '16:9')
 *  - onComplete: function (called when reveal animation finishes)
 *  - isDark: boolean
 */
const ProgressiveImageReveal = ({
    src,
    isGenerating = false,
    progress = 0,
    generationStatus = '',
    aspectRatio = '1:1',
    onComplete,
    isDark = true
}) => {
    const [phase, setPhase] = useState('idle'); // idle | generating | revealing | done
    const [blurAmount, setBlurAmount] = useState(50);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [noiseOpacity, setNoiseOpacity] = useState(1);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);

    // Generate noise pattern on canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;

        const generateNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;
            const hueBase = Math.random() * 360;

            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor((i / 4) / canvas.width);
                
                // Create colored gradient noise
                const gradientX = x / canvas.width;
                const gradientY = y / canvas.height;
                const noise = Math.random() * 40;
                
                // Purple-blue tones that match the app theme
                const r = Math.floor(80 + gradientX * 60 + noise);
                const g = Math.floor(40 + gradientY * 30 + noise * 0.5);
                const b = Math.floor(140 + (1 - gradientX) * 80 + noise);
                
                data[i] = Math.min(255, r);
                data[i + 1] = Math.min(255, g);
                data[i + 2] = Math.min(255, b);
                data[i + 3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);
        };

        generateNoise();

        // Animate noise during generation
        if (isGenerating && phase === 'generating') {
            let frame = 0;
            const animate = () => {
                frame++;
                if (frame % 8 === 0) generateNoise(); // Refresh noise every ~8 frames
                animFrameRef.current = requestAnimationFrame(animate);
            };
            animFrameRef.current = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(animFrameRef.current);
        }
    }, [isGenerating, phase]);

    // Phase management
    useEffect(() => {
        if (isGenerating && !src) {
            setPhase('generating');
            setBlurAmount(50);
            setNoiseOpacity(1);
            setImageLoaded(false);
        } else if (src && phase === 'generating') {
            setPhase('revealing');
        } else if (!isGenerating && !src) {
            setPhase('idle');
        }
    }, [isGenerating, src]);

    // Progressive reveal animation when image arrives
    useEffect(() => {
        if (phase !== 'revealing' || !imageLoaded) return;

        // Animate blur from 50 to 0 over ~2 seconds
        const steps = [
            { blur: 40, noise: 0.8, delay: 0 },
            { blur: 30, noise: 0.6, delay: 200 },
            { blur: 20, noise: 0.4, delay: 400 },
            { blur: 14, noise: 0.25, delay: 600 },
            { blur: 8, noise: 0.15, delay: 900 },
            { blur: 4, noise: 0.08, delay: 1200 },
            { blur: 2, noise: 0.03, delay: 1500 },
            { blur: 0, noise: 0, delay: 1800 },
        ];

        const timeouts = steps.map(step =>
            setTimeout(() => {
                setBlurAmount(step.blur);
                setNoiseOpacity(step.noise);
            }, step.delay)
        );

        // Done
        const doneTimeout = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 2200);

        return () => {
            timeouts.forEach(clearTimeout);
            clearTimeout(doneTimeout);
        };
    }, [phase, imageLoaded, onComplete]);

    const getAspectPadding = () => {
        const map = { '1:1': '100%', '16:9': '56.25%', '9:16': '177.78%', '4:3': '75%', '3:4': '133.33%', '3:2': '66.67%', '2:3': '150%', '21:9': '42.86%' };
        return map[aspectRatio] || '100%';
    };

    if (phase === 'idle') return null;

    const accentColor = isDark ? '#9b6cf8' : '#5d5fef';
    const surfaceBg = isDark ? '#0d0d0d' : '#f0f0f0';

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            paddingBottom: getAspectPadding(),
            borderRadius: 16,
            overflow: 'hidden',
            background: surfaceBg,
        }}>
            {/* Noise canvas (visible during generating + early reveal) */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: noiseOpacity,
                    filter: `blur(${Math.max(blurAmount * 0.6, 4)}px)`,
                    transition: 'opacity 0.4s ease, filter 0.4s ease',
                    zIndex: 2,
                }}
            />

            {/* Actual image (loads behind noise, then revealed) */}
            {src && (
                <img
                    ref={imgRef}
                    src={src}
                    alt="AI Generated"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: `blur(${blurAmount}px)`,
                        transform: `scale(${1 + blurAmount * 0.001})`,
                        transition: 'filter 0.35s ease-out, transform 0.35s ease-out',
                        zIndex: 3,
                        opacity: imageLoaded ? 1 : 0,
                    }}
                />
            )}

            {/* Shimmer overlay during generation */}
            {(phase === 'generating' || (phase === 'revealing' && blurAmount > 10)) && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 4,
                    background: `linear-gradient(105deg, transparent 40%, ${isDark ? 'rgba(155,108,248,0.08)' : 'rgba(93,95,239,0.06)'} 50%, transparent 60%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Progress info overlay */}
            {phase === 'generating' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                }}>
                    {/* Soft glow pulse */}
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${accentColor}55 0%, ${accentColor}15 50%, transparent 70%)`,
                        animation: 'pulseOrb 3s ease-in-out infinite',
                        filter: 'blur(2px)',
                    }} />

                    {/* Status text */}
                    <p style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isDark ? '#fff' : '#111',
                        textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                        letterSpacing: '0.3px',
                    }}>
                        {generationStatus || 'Creating...'}
                    </p>

                    {/* Progress bar */}
                    <div style={{
                        width: '60%',
                        maxWidth: 200,
                        height: 3,
                        borderRadius: 2,
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${accentColor}, ${isDark ? '#c084fc' : '#818cf8'})`,
                            borderRadius: 2,
                            transition: 'width 0.5s ease',
                        }} />
                    </div>

                    {/* Progress percentage */}
                    <span style={{
                        fontSize: 10,
                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        fontWeight: 500,
                    }}>
                        {Math.round(progress)}%
                    </span>
                </div>
            )}

            {/* Styles */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes pulseOrb {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.15); opacity: 1; }
                }

            `}</style>
        </div>
    );
};

export default ProgressiveImageReveal;
