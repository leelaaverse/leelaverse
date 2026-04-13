// ────────────────────────────────────────────────────────────────────────────────
// Nexus Artifacts — Badge Design System Configuration
// ────────────────────────────────────────────────────────────────────────────────

// ── Rarity Tiers ────────────────────────────────────────────────────────────────
export const RARITY_CONFIG = {
  common: {
    name: 'Spark',
    primary: '#4a4a62',
    accent: '#6b7280',
    glow: 'rgba(107, 114, 128, 0.15)',
    glowIntense: 'rgba(107, 114, 128, 0.35)',
    frameBorder: 'rgba(107, 114, 128, 0.3)',
    bgGradient: ['#13131e', '#1a1a2a'],
    textColor: '#8888a0',
    intensity: 0, // no animation
  },
  uncommon: {
    name: 'Prism',
    primary: '#10b981',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.15)',
    glowIntense: 'rgba(52, 211, 153, 0.4)',
    frameBorder: 'rgba(16, 185, 129, 0.4)',
    bgGradient: ['#0a1e17', '#0d2a1e'],
    textColor: '#34d399',
    intensity: 1,
  },
  rare: {
    name: 'Aether',
    primary: '#3b82f6',
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.2)',
    glowIntense: 'rgba(96, 165, 250, 0.5)',
    frameBorder: 'rgba(59, 130, 246, 0.5)',
    bgGradient: ['#0d1528', '#101d38'],
    textColor: '#60a5fa',
    intensity: 2,
  },
  epic: {
    name: 'Celestial',
    primary: '#8b5cf6',
    accent: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.25)',
    glowIntense: 'rgba(167, 139, 250, 0.55)',
    frameBorder: 'rgba(139, 92, 246, 0.55)',
    bgGradient: ['#140e28', '#1e1440'],
    textColor: '#a78bfa',
    intensity: 3,
  },
  legendary: {
    name: 'Mythic',
    primary: '#f59e0b',
    accent: '#fbbf24',
    secondary: '#ef4444',
    glow: 'rgba(245, 158, 11, 0.3)',
    glowIntense: 'rgba(251, 191, 36, 0.65)',
    frameBorder: 'rgba(245, 158, 11, 0.65)',
    bgGradient: ['#1c1400', '#2a1a00'],
    textColor: '#fbbf24',
    intensity: 4,
  },
};

// ── Category Visual Signatures ──────────────────────────────────────────────────
export const CATEGORY_CONFIG = {
  posting: {
    label: 'Creator',
    frameShape: 'hexagon',
    motif: 'quill',
    accent: '#e879a8',
    icon: '✍️',
  },
  engagement: {
    label: 'Viral',
    frameShape: 'shield',
    motif: 'circuit',
    accent: '#22d3ee',
    icon: '⚡',
  },
  competition: {
    label: 'Conqueror',
    frameShape: 'pentagon',
    motif: 'swords',
    accent: '#f59e0b',
    icon: '⚔️',
  },
  milestone: {
    label: 'Ascendant',
    frameShape: 'diamond',
    motif: 'crown',
    accent: '#a78bfa',
    icon: '🏔️',
  },
  special: {
    label: 'Architect',
    frameShape: 'octagon',
    motif: 'neural',
    accent: '#4ade80',
    icon: '✨',
  },
};

// ── Badge-specific Visual Overrides ─────────────────────────────────────────────
// Maps badge.name → unique visual characteristics
export const BADGE_VISUALS = {
  // ── Posting ──────────────────────────────────────────────────────
  first_post: {
    icon: 'paintDrop',
    gradient: ['#667eea', '#764ba2'],
    particleColor: '#764ba2',
  },
  post_10: {
    icon: 'quillPen',
    gradient: ['#f093fb', '#f5576c'],
    particleColor: '#f5576c',
  },
  post_50: {
    icon: 'starCompass',
    gradient: ['#4facfe', '#00f2fe'],
    particleColor: '#00f2fe',
  },
  post_100: {
    icon: 'crownedStar',
    gradient: ['#43e97b', '#38f9d7'],
    particleColor: '#43e97b',
  },
  post_500: {
    icon: 'legendFlame',
    gradient: ['#f7971e', '#ffd200'],
    particleColor: '#ffd200',
  },

  // ── Streak / Engagement ──────────────────────────────────────────
  streak_3: {
    icon: 'bolt',
    gradient: ['#fa709a', '#fee140'],
    particleColor: '#fee140',
  },
  streak_7: {
    icon: 'flame',
    gradient: ['#f77062', '#fe5196'],
    particleColor: '#fe5196',
  },
  streak_14: {
    icon: 'doubleBolt',
    gradient: ['#ff6a00', '#ee0979'],
    particleColor: '#ff6a00',
  },
  streak_30: {
    icon: 'inferno',
    gradient: ['#b721ff', '#21d4fd'],
    particleColor: '#b721ff',
  },
  streak_100: {
    icon: 'phoenix',
    gradient: ['#f6d365', '#fda085'],
    particleColor: '#fda085',
  },

  // ── Followers ────────────────────────────────────────────────────
  followers_10: {
    icon: 'users',
    gradient: ['#89f7fe', '#66a6ff'],
    particleColor: '#66a6ff',
  },
  followers_100: {
    icon: 'globe',
    gradient: ['#96fbc4', '#38ef7d'],
    particleColor: '#96fbc4',
  },
  followers_1000: {
    icon: 'megaphone',
    gradient: ['#a1c4fd', '#c2e9fb'],
    particleColor: '#a1c4fd',
  },
  followers_10000: {
    icon: 'rocket',
    gradient: ['#fd746c', '#ff9068'],
    particleColor: '#fd746c',
  },

  // ── Competition ──────────────────────────────────────────────────
  comp_enter_1: {
    icon: 'swords',
    gradient: ['#3a7bd5', '#3a6073'],
    particleColor: '#3a7bd5',
  },
  comp_enter_5: {
    icon: 'target',
    gradient: ['#11998e', '#38ef7d'],
    particleColor: '#38ef7d',
  },
  comp_winner: {
    icon: 'trophy',
    gradient: ['#f7971e', '#ffd200'],
    particleColor: '#ffd200',
  },
  comp_winner_3: {
    icon: 'tripleCrown',
    gradient: ['#fc4a1a', '#f7b733'],
    particleColor: '#fc4a1a',
  },

  // ── Templates ────────────────────────────────────────────────────
  template_creator_1: {
    icon: 'blueprint',
    gradient: ['#6a11cb', '#2575fc'],
    particleColor: '#2575fc',
  },
  template_creator_10: {
    icon: 'brainCircuit',
    gradient: ['#30cfd0', '#330867'],
    particleColor: '#30cfd0',
  },

  // ── XP Milestones ────────────────────────────────────────────────
  xp_silver: {
    icon: 'gemSilver',
    gradient: ['#bdc3c7', '#636e72'],
    particleColor: '#bdc3c7',
  },
  xp_gold: {
    icon: 'gemGold',
    gradient: ['#f7971e', '#ffd200'],
    particleColor: '#ffd200',
  },
  xp_platinum: {
    icon: 'gemPlatinum',
    gradient: ['#e0eafc', '#a1c4fd'],
    particleColor: '#a1c4fd',
  },
  xp_diamond: {
    icon: 'gemDiamond',
    gradient: ['#a8edea', '#fed6e3'],
    particleColor: '#a8edea',
  },
};

// ── SVG Frame clip paths ────────────────────────────────────────────────────────
export const FRAME_PATHS = {
  hexagon: 'M50 2 L93 25 L93 75 L50 98 L7 75 L7 25 Z',
  shield: 'M50 2 L95 22 L95 65 L50 98 L5 65 L5 22 Z',
  pentagon: 'M50 2 L97 38 L80 97 L20 97 L3 38 Z',
  diamond: 'M50 3 L97 50 L50 97 L3 50 Z',
  octagon: 'M30 3 L70 3 L97 30 L97 70 L70 97 L30 97 L3 70 L3 30 Z',
  crystal: 'M50 0 L85 15 L98 50 L85 85 L50 100 L15 85 L2 50 L15 15 Z',
};

// ── Fallback for unknown badges ─────────────────────────────────────────────────
export const FALLBACK_VISUAL = {
  icon: 'badge',
  gradient: ['#444', '#888'],
  particleColor: '#888',
};
