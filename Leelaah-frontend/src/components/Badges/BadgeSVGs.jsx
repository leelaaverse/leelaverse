import React from 'react';

// ────────────────────────────────────────────────────────────────────────────────
// Nexus Artifacts — SVG Icon Components
// Each icon is a 24x24 viewBox SVG, designed to sit inside badge frames.
// ────────────────────────────────────────────────────────────────────────────────

export const BadgeIcons = {
  // ── Creator Category ─────────────────────────────────────────────
  paintDrop: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 4 10 4 15a8 8 0 0016 0C20 10 12 2 12 2z" fill={`url(#g-${id})`} opacity="0.9" />
      <ellipse cx="10" cy="15" rx="2.5" ry="3" fill="rgba(255,255,255,0.3)" />
    </svg>
  ),

  quillPen: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M21 3L3 21l4.5-1.5L21 3z" fill={`url(#g-${id})`} />
      <path d="M21 3l-6 18L7.5 19.5 21 3z" fill={`url(#g-${id})`} opacity="0.7" />
      <circle cx="5" cy="19" r="1.5" fill={color2} opacity="0.8" />
    </svg>
  ),

  starCompass: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="12,1 14.5,8.5 22,9 16.5,14 18,22 12,18 6,22 7.5,14 2,9 9.5,8.5" fill={`url(#g-${id})`} />
      <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.25)" />
    </svg>
  ),

  crownedStar: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 2l2.3 5.7L20 8.5l-4 4.2 1 6.3L12 16l-5 3 1-6.3-4-4.2 5.7-.8z" fill={`url(#g-${id})`} />
      <path d="M6 2l2 3.5L12 3l4 2.5L18 2" stroke={color2} strokeWidth="1.2" fill="none" opacity="0.6" />
    </svg>
  ),

  legendFlame: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 23c-4.5 0-7-3.5-7-7.5 0-3 2-6.5 7-12.5 5 6 7 9.5 7 12.5 0 4-2.5 7.5-7 7.5z" fill={`url(#g-${id})`} />
      <path d="M12 23c-2 0-3.5-1.5-3.5-4 0-2 1.5-4 3.5-7 2 3 3.5 5 3.5 7 0 2.5-1.5 4-3.5 4z" fill="rgba(255,255,255,0.35)" />
    </svg>
  ),

  // ── Engagement Category ──────────────────────────────────────────
  bolt: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="13,1 5,14 11,14 10,23 19,10 13,10" fill={`url(#g-${id})`} />
    </svg>
  ),

  flame: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 23c-5 0-8-3.5-8-8 0-4.5 3-7.5 5-10 0 3 2 4.5 3-1 1 5.5 3 6 3 1 2 2.5 5 5.5 5 10 0 4.5-3 8-8 8z" fill={`url(#g-${id})`} />
      <path d="M12 23c-2.5 0-4-2-4-4.5 0-2.5 2-5 4-7 2 2 4 4.5 4 7 0 2.5-1.5 4.5-4 4.5z" fill="rgba(255,255,255,0.3)" />
    </svg>
  ),

  doubleBolt: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="10,1 3,12 8,12 7,21 15,9 10,9" fill={`url(#g-${id})`} />
      <polygon points="16,3 10,13 14,13 13,20 20,10 16,10" fill={`url(#g-${id})`} opacity="0.65" />
    </svg>
  ),

  inferno: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="50%" stopColor={color2} />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <path d="M12 1C8 7 4 11 4 16c0 4.5 3.5 7 8 7s8-2.5 8-7c0-5-4-9-8-15z" fill={`url(#g-${id})`} />
      <path d="M12 23c-3 0-5-1.5-5-5 0-3 2-5.5 5-9 3 3.5 5 6 5 9 0 3.5-2 5-5 5z" fill="rgba(255,255,255,0.2)" />
      <circle cx="12" cy="17" r="2" fill="rgba(255,255,255,0.45)" />
    </svg>
  ),

  phoenix: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 3L8 8l-6 2 4 5-1 6 7-3 7 3-1-6 4-5-6-2z" fill={`url(#g-${id})`} />
      <path d="M12 3v7l-4-2z" fill="rgba(255,255,255,0.2)" />
      <path d="M12 3v7l4-2z" fill="rgba(255,255,255,0.15)" />
    </svg>
  ),

  // ── Community / Followers ────────────────────────────────────────
  users: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx="9" cy="7" r="3.5" fill={`url(#g-${id})`} />
      <path d="M2 20c0-4 3-6 7-6s7 2 7 6" fill={`url(#g-${id})`} opacity="0.7" />
      <circle cx="17" cy="8" r="2.5" fill={`url(#g-${id})`} opacity="0.6" />
      <path d="M16 20c0-3 1.5-5 5-5" stroke={color2} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  ),

  globe: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9.5" fill={`url(#g-${id})`} opacity="0.2" stroke={color1} strokeWidth="1" />
      <ellipse cx="12" cy="12" rx="4" ry="9.5" fill="none" stroke={`url(#g-${id})`} strokeWidth="1" />
      <line x1="2.5" y1="9" x2="21.5" y2="9" stroke={color2} strokeWidth="0.8" opacity="0.5" />
      <line x1="2.5" y1="15" x2="21.5" y2="15" stroke={color2} strokeWidth="0.8" opacity="0.5" />
      <circle cx="12" cy="12" r="9.5" fill="none" stroke={`url(#g-${id})`} strokeWidth="1.2" />
    </svg>
  ),

  megaphone: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M20 4L8 10H4a1 1 0 00-1 1v2a1 1 0 001 1h4l12 6V4z" fill={`url(#g-${id})`} />
      <path d="M6 14v4a1 1 0 001 1h2l1-5H6z" fill={color2} opacity="0.5" />
    </svg>
  ),

  rocket: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 2C8 6 6 12 6 16l3-1v4l3 3 3-3v-4l3 1c0-4-2-10-6-14z" fill={`url(#g-${id})`} />
      <circle cx="12" cy="11" r="2" fill="rgba(255,255,255,0.35)" />
      <path d="M6 16c-2 0-3 2-4 4 2-1 3-1 4-1" fill={color1} opacity="0.5" />
      <path d="M18 16c2 0 3 2 4 4-2-1-3-1-4-1" fill={color1} opacity="0.5" />
    </svg>
  ),

  // ── Competition Category ─────────────────────────────────────────
  swords: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <line x1="4" y1="20" x2="18" y2="4" stroke={`url(#g-${id})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="6" y2="4" stroke={`url(#g-${id})`} strokeWidth="2" strokeLinecap="round" />
      <rect x="2" y="17" width="6" height="2" rx="1" fill={color2} opacity="0.6" transform="rotate(-45 5 18)" />
      <rect x="16" y="17" width="6" height="2" rx="1" fill={color2} opacity="0.6" transform="rotate(45 19 18)" />
    </svg>
  ),

  target: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#g-${id})`} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke={`url(#g-${id})`} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill={`url(#g-${id})`} />
      <circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.5)" />
    </svg>
  ),

  trophy: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M7 4h10v7c0 3-2 5-5 5s-5-2-5-5V4z" fill={`url(#g-${id})`} />
      <path d="M7 6H4c0 3 1.5 4 3 4.5" stroke={color2} strokeWidth="1.2" fill="none" />
      <path d="M17 6h3c0 3-1.5 4-3 4.5" stroke={color2} strokeWidth="1.2" fill="none" />
      <rect x="10" y="16" width="4" height="3" rx="0.5" fill={color2} opacity="0.7" />
      <rect x="8" y="19" width="8" height="2" rx="1" fill={`url(#g-${id})`} opacity="0.8" />
      <ellipse cx="12" cy="9" rx="2" ry="2.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  ),

  tripleCrown: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M2 16L4 6l4 5L12 3l4 8 4-5 2 10z" fill={`url(#g-${id})`} />
      <rect x="3" y="16" width="18" height="3" rx="1.5" fill={color2} opacity="0.6" />
      <circle cx="8" cy="10" r="1" fill="rgba(255,255,255,0.4)" />
      <circle cx="12" cy="7" r="1" fill="rgba(255,255,255,0.4)" />
      <circle cx="16" cy="10" r="1" fill="rgba(255,255,255,0.4)" />
    </svg>
  ),

  // ── Templates / Special ──────────────────────────────────────────
  blueprint: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="2" fill={`url(#g-${id})`} opacity="0.2" stroke={color1} strokeWidth="1" />
      <line x1="3" y1="9" x2="21" y2="9" stroke={color2} strokeWidth="0.7" opacity="0.5" />
      <line x1="3" y1="15" x2="21" y2="15" stroke={color2} strokeWidth="0.7" opacity="0.5" />
      <line x1="9" y1="3" x2="9" y2="21" stroke={color2} strokeWidth="0.7" opacity="0.5" />
      <line x1="15" y1="3" x2="15" y2="21" stroke={color2} strokeWidth="0.7" opacity="0.5" />
      <rect x="6" y="6" width="6" height="6" rx="1" fill={`url(#g-${id})`} opacity="0.5" />
    </svg>
  ),

  brainCircuit: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M12 3C8 3 5 5.5 5 9c0 2 1 3.5 2.5 4.5L7 18h10l-.5-4.5C18 12.5 19 11 19 9c0-3.5-3-6-7-6z" fill={`url(#g-${id})`} opacity="0.7" />
      <circle cx="9" cy="8" r="1" fill="rgba(255,255,255,0.5)" />
      <circle cx="15" cy="8" r="1" fill="rgba(255,255,255,0.5)" />
      <circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.5)" />
      <line x1="9" y1="8" x2="12" y2="11" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <line x1="15" y1="8" x2="12" y2="11" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <rect x="9" y="18" width="6" height="2" rx="1" fill={color2} opacity="0.5" />
    </svg>
  ),

  // ── Milestones (Gems) ────────────────────────────────────────────
  gemSilver: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="12,2 20,8 17,21 7,21 4,8" fill={`url(#g-${id})`} />
      <polygon points="12,2 20,8 12,10 4,8" fill="rgba(255,255,255,0.2)" />
      <line x1="4" y1="8" x2="20" y2="8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="12" y1="2" x2="12" y2="21" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    </svg>
  ),

  gemGold: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="12,2 20,8 17,21 7,21 4,8" fill={`url(#g-${id})`} />
      <polygon points="12,2 20,8 12,10 4,8" fill="rgba(255,255,255,0.25)" />
      <polygon points="12,10 20,8 17,21" fill="rgba(255,255,255,0.08)" />
    </svg>
  ),

  gemPlatinum: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <polygon points="12,1 22,8 18,22 6,22 2,8" fill={`url(#g-${id})`} />
      <polygon points="12,1 22,8 12,11 2,8" fill="rgba(255,255,255,0.3)" />
      <polygon points="12,11 22,8 18,22" fill="rgba(255,255,255,0.1)" />
      <polygon points="12,11 2,8 6,22" fill="rgba(255,255,255,0.05)" />
    </svg>
  ),

  gemDiamond: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="50%" stopColor={color2} />
          <stop offset="100%" stopColor={color1} />
        </linearGradient>
      </defs>
      <polygon points="12,1 22,8 18,23 6,23 2,8" fill={`url(#g-${id})`} />
      <polygon points="12,1 22,8 12,11 2,8" fill="rgba(255,255,255,0.35)" />
      <polygon points="12,11 22,8 18,23" fill="rgba(255,255,255,0.12)" />
      <polygon points="12,11 18,23 6,23" fill="rgba(255,255,255,0.05)" />
      <polygon points="12,11 6,23 2,8" fill="rgba(255,255,255,0.18)" />
    </svg>
  ),

  // ── Fallback ─────────────────────────────────────────────────────
  badge: ({ color1, color2, id }) => (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="10" r="7" fill={`url(#g-${id})`} />
      <polygon points="9,17 12,22 15,17" fill={color2} opacity="0.6" />
      <circle cx="12" cy="10" r="3" fill="rgba(255,255,255,0.2)" />
    </svg>
  ),
};

// ── Frame SVG Component ─────────────────────────────────────────────────────────
export const BadgeFrame = ({ shape, color, glowColor, intensity, children, size = 100 }) => {
  const frameId = `frame-${shape}-${Math.random().toString(36).substr(2, 9)}`;
  
  const framePaths = {
    hexagon: `M50 4 L90 25 L90 75 L50 96 L10 75 L10 25 Z`,
    shield: `M50 4 L92 22 L92 65 L50 96 L8 65 L8 22 Z`,
    pentagon: `M50 4 L94 38 L78 94 L22 94 L6 38 Z`,
    diamond: `M50 5 L95 50 L50 95 L5 50 Z`,
    octagon: `M32 4 L68 4 L96 32 L96 68 L68 96 L32 96 L4 68 L4 32 Z`,
    crystal: `M50 2 L82 16 L96 50 L82 84 L50 98 L18 84 L4 50 L18 16 Z`,
  };

  const path = framePaths[shape] || framePaths.hexagon;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`clip-${frameId}`}>
          <path d={path} />
        </clipPath>
        <filter id={`glow-${frameId}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={3 + intensity * 2} />
        </filter>
      </defs>

      {/* Glow layer */}
      {intensity > 0 && (
        <path
          d={path}
          fill={glowColor}
          filter={`url(#glow-${frameId})`}
          opacity={0.3 + intensity * 0.12}
        />
      )}

      {/* Frame border */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.2 + intensity * 0.3}
        opacity={0.5 + intensity * 0.1}
      />

      {/* Inner fill */}
      <path
        d={path}
        fill="rgba(10, 10, 20, 0.6)"
        stroke="none"
      />

      {/* Content area */}
      <g clipPath={`url(#clip-${frameId})`}>
        {children}
      </g>

      {/* Frame border again on top */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1 + intensity * 0.2}
        opacity={0.7 + intensity * 0.08}
      />
    </svg>
  );
};

export default BadgeIcons;
