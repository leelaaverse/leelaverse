import React from 'react';
import './ProfileBadge.css';

// Unique visual identity per badge name
const BADGE_VISUALS = {
  // ── Posting ──────────────────────────────────────────────────────
  first_post:          { icon: '🎨', shape: 'hexagon',  grad: ['#667eea', '#764ba2'], glow: '#764ba2' },
  post_10:             { icon: '✏️',  shape: 'hexagon',  grad: ['#f093fb', '#f5576c'], glow: '#f5576c' },
  post_50:             { icon: '🖌️', shape: 'hexagon',  grad: ['#4facfe', '#00f2fe'], glow: '#00f2fe' },
  post_100:            { icon: '🎭', shape: 'hexagon',  grad: ['#43e97b', '#38f9d7'], glow: '#43e97b' },
  post_500:            { icon: '👑', shape: 'star',     grad: ['#f7971e', '#ffd200'], glow: '#ffd200' },
  // ── Streak / Engagement ───────────────────────────────────────────
  streak_3:            { icon: '⚡', shape: 'diamond',  grad: ['#fa709a', '#fee140'], glow: '#fee140' },
  streak_7:            { icon: '🔥', shape: 'shield',   grad: ['#f77062', '#fe5196'], glow: '#fe5196' },
  streak_14:           { icon: '💥', shape: 'shield',   grad: ['#ff6a00', '#ee0979'], glow: '#ff6a00' },
  streak_30:           { icon: '🌟', shape: 'shield',   grad: ['#b721ff', '#21d4fd'], glow: '#b721ff' },
  streak_100:          { icon: '🏅', shape: 'star',     grad: ['#f6d365', '#fda085'], glow: '#fda085' },
  // ── Followers ─────────────────────────────────────────────────────
  followers_10:        { icon: '👥', shape: 'circle',   grad: ['#89f7fe', '#66a6ff'], glow: '#66a6ff' },
  followers_100:       { icon: '🌐', shape: 'circle',   grad: ['#96fbc4', '#38ef7d'], glow: '#96fbc4' },
  followers_1000:      { icon: '🎤', shape: 'circle',   grad: ['#a1c4fd', '#c2e9fb'], glow: '#a1c4fd' },
  followers_10000:     { icon: '🚀', shape: 'star',     grad: ['#fd746c', '#ff9068'], glow: '#fd746c' },
  // ── Competition ───────────────────────────────────────────────────
  comp_enter_1:        { icon: '⚔️', shape: 'pentagon', grad: ['#3a7bd5', '#3a6073'], glow: '#3a7bd5' },
  comp_enter_5:        { icon: '🎯', shape: 'pentagon', grad: ['#11998e', '#38ef7d'], glow: '#38ef7d' },
  comp_winner:         { icon: '🏆', shape: 'crown',    grad: ['#f7971e', '#ffd200'], glow: '#ffd200' },
  comp_winner_3:       { icon: '🥇', shape: 'crown',    grad: ['#fc4a1a', '#f7b733'], glow: '#fc4a1a' },
  // ── Templates ─────────────────────────────────────────────────────
  template_creator_1:  { icon: '📝', shape: 'hexagon',  grad: ['#6a11cb', '#2575fc'], glow: '#2575fc' },
  template_creator_10: { icon: '🧠', shape: 'hexagon',  grad: ['#30cfd0', '#330867'], glow: '#30cfd0' },
  // ── XP Milestones ─────────────────────────────────────────────────
  xp_silver:           { icon: '🥈', shape: 'diamond',  grad: ['#bdc3c7', '#2c3e50'], glow: '#bdc3c7' },
  xp_gold:             { icon: '🥇', shape: 'diamond',  grad: ['#f7971e', '#ffd200'], glow: '#ffd200' },
  xp_platinum:         { icon: '💠', shape: 'diamond',  grad: ['#e0eafc', '#a1c4fd'], glow: '#a1c4fd' },
  xp_diamond:          { icon: '💎', shape: 'star',     grad: ['#a8edea', '#fed6e3'], glow: '#a8edea' },
};

// CSS clip-path per shape (circle uses border-radius instead)
const SHAPE_CLIP = {
  hexagon:  'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
  shield:   'polygon(50% 0%,100% 20%,100% 70%,50% 100%,0% 70%,0% 20%)',
  star:     'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
  diamond:  'polygon(50% 5%,95% 50%,50% 95%,5% 50%)',
  pentagon: 'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
  crown:    'polygon(0% 100%,0% 42%,22% 62%,38% 8%,50% 52%,62% 8%,78% 62%,100% 42%,100% 100%)',
  circle:   null,
};

// Fallback for unknown badge names
const FALLBACK = { icon: '🏅', shape: 'hexagon', grad: ['#444', '#888'], glow: '#888' };

const ProfileBadge = ({ badge }) => {
  const vis = BADGE_VISUALS[badge.name] || FALLBACK;
  const clip = SHAPE_CLIP[vis.shape];
  const gradient = `linear-gradient(135deg, ${vis.grad[0]}, ${vis.grad[1]})`;

  const shapeStyle = {
    background: gradient,
    '--badge-glow': vis.glow,
    ...(clip ? { clipPath: clip } : { borderRadius: '50%' }),
  };

  return (
    <div
      className={`pb-item pb-rarity--${badge.rarity}`}
      title={`${badge.displayName} — ${badge.description}`}
    >
      <div className="pb-shape" style={shapeStyle}>
        {badge.iconUrl ? (
          <img src={badge.iconUrl} alt={badge.displayName} className="pb-img" />
        ) : (
          <span className="pb-icon">{vis.icon}</span>
        )}
      </div>
      <span className="pb-label">{badge.displayName}</span>
    </div>
  );
};

export default ProfileBadge;
