import React, { useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { RiLockLine, RiCheckLine } from 'react-icons/ri';
import BadgeIcons from './BadgeSVGs';
import {
  RARITY_CONFIG,
  CATEGORY_CONFIG,
  BADGE_VISUALS,
  FALLBACK_VISUAL,
  FRAME_PATHS,
} from './badgeConfig';
import './BadgeArtifact.css';

// ────────────────────────────────────────────────────────────────────────────────
// BadgeArtifact — The core "micro-product" badge component
// Renders a layered, animated badge with frame, icon, glow, and state handling.
// ────────────────────────────────────────────────────────────────────────────────

const BadgeArtifact = ({
  badge,
  earned = false,
  progress = null, // 0-1 for in-progress state
  compact = false,
  size = 86,
  showRewards = true,
  showTooltip = true,
  onClick = null,
  animationDelay = 0,
}) => {
  const uniqueId = useId();
  const badgeId = `nxa-${badge.name}-${uniqueId.replace(/:/g, '')}`;

  // Resolve visual config
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
  const category = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.special;
  const visual = BADGE_VISUALS[badge.name] || FALLBACK_VISUAL;

  // Determine badge state
  const state = earned ? 'unlocked' : progress !== null && progress > 0 ? 'progress' : 'locked';

  // Resolve icon component
  const IconComponent = BadgeIcons[visual.icon] || BadgeIcons.badge;

  // Frame shape from category
  const frameShape = category.frameShape;
  const framePath = FRAME_PATHS[frameShape] || FRAME_PATHS.hexagon;

  // Memoize frame gradient
  const frameGradientId = `${badgeId}-fg`;
  const iconGradientId = `${badgeId}-ig`;
  const glowFilterId = `${badgeId}-glow`;
  const clipId = `${badgeId}-clip`;

  const actualSize = compact ? Math.min(size, 56) : size;

  // Build CSS class list
  const classes = [
    'nxa-badge',
    `nxa-rarity--${badge.rarity}`,
    state === 'locked' && 'nxa-badge--locked',
    state === 'progress' && 'nxa-badge--progress',
    compact && 'nxa-badge--compact',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: animationDelay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={state !== 'locked' ? onClick : undefined}
      title={!showTooltip ? `${badge.displayName} — ${badge.description}` : undefined}
    >
      {/* Frame wrapper */}
      <div className="nxa-frame" style={{ width: actualSize, height: actualSize }}>
        <svg
          viewBox="0 0 100 100"
          width={actualSize}
          height={actualSize}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Frame gradient */}
            <linearGradient id={frameGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={visual.gradient[0]} />
              <stop offset="100%" stopColor={visual.gradient[1]} />
            </linearGradient>

            {/* Glow filter */}
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={2 + rarity.intensity * 1.5} />
            </filter>

            {/* Clip path */}
            <clipPath id={clipId}>
              <path d={framePath} />
            </clipPath>

            {/* Noise texture pattern */}
            <filter id={`${badgeId}-noise`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.05" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" mode="overlay" />
            </filter>
          </defs>

          {/* Layer 1: Background glow */}
          {state === 'unlocked' && rarity.intensity > 0 && (
            <path
              d={framePath}
              fill={rarity.glow}
              filter={`url(#${glowFilterId})`}
              opacity={0.4 + rarity.intensity * 0.1}
            />
          )}

          {/* Layer 2: Inner fill with gradient */}
          <path
            d={framePath}
            fill={state === 'unlocked'
              ? `url(#${frameGradientId})`
              : 'rgba(15, 15, 25, 0.8)'}
            opacity={state === 'unlocked' ? 0.15 : 0.9}
          />

          {/* Layer 3: Noise texture overlay */}
          {state === 'unlocked' && (
            <path
              d={framePath}
              fill="rgba(255,255,255,0.02)"
              filter={`url(#${badgeId}-noise)`}
              clipPath={`url(#${clipId})`}
            />
          )}

          {/* Layer 4: Frame border */}
          <path
            d={framePath}
            fill="none"
            stroke={state === 'unlocked' ? `url(#${frameGradientId})` : 'rgba(30, 30, 50, 0.5)'}
            strokeWidth={state === 'unlocked' ? (1.2 + rarity.intensity * 0.3) : 0.8}
            opacity={state === 'unlocked' ? (0.6 + rarity.intensity * 0.08) : 0.3}
          />

          {/* Layer 5: Inner secondary frame line */}
          {state === 'unlocked' && rarity.intensity >= 2 && (
            <path
              d={framePath}
              fill="none"
              stroke={`url(#${frameGradientId})`}
              strokeWidth={0.4}
              opacity={0.2}
              transform="scale(0.88) translate(6, 6)"
            />
          )}
        </svg>

        {/* Icon layer (positioned absolutely over SVG) */}
        <div className="nxa-icon">
          {state === 'unlocked' || state === 'progress' ? (
            <IconComponent
              color1={visual.gradient[0]}
              color2={visual.gradient[1]}
              id={badgeId}
            />
          ) : (
            <RiLockLine size={actualSize * 0.25} color="#22223a" />
          )}
        </div>

        {/* Lock overlay for locked state */}
        {state === 'locked' && !compact && (
          <div className="nxa-lock-overlay">
            <RiLockLine />
          </div>
        )}

        {/* Earned check indicator */}
        {state === 'unlocked' && !compact && (
          <div
            className="nxa-earned-check"
            style={{ background: rarity.primary }}
          >
            <RiCheckLine />
          </div>
        )}

        {/* Progress ring for in-progress state */}
        {state === 'progress' && progress !== null && (
          <ProgressRing
            size={actualSize + 8}
            progress={progress}
            color={rarity.primary}
          />
        )}
      </div>

      {/* Badge name */}
      <span className="nxa-label">{badge.displayName}</span>

      {/* Rarity tag */}
      {!compact && (
        <span className="nxa-rarity-tag">{rarity.name}</span>
      )}

      {/* Reward tags */}
      {showRewards && !compact && state === 'unlocked' && (
        <div className="nxa-rewards">
          {badge.coinReward > 0 && (
            <span className="nxa-reward-tag nxa-reward-coin">🪙 {badge.coinReward}</span>
          )}
          {badge.xpReward > 0 && (
            <span className="nxa-reward-tag nxa-reward-xp">+{badge.xpReward} XP</span>
          )}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !compact && (
        <div className="nxa-tooltip">
          <div className="nxa-tooltip-name">{badge.displayName}</div>
          <div className="nxa-tooltip-desc">{badge.description}</div>
          <div className="nxa-tooltip-footer">
            <span className="nxa-rarity-tag">{rarity.name}</span>
            {badge.coinReward > 0 && (
              <span className="nxa-reward-tag nxa-reward-coin">🪙 {badge.coinReward}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Progress Ring Sub-component ──────────────────────────────────────────────
const ProgressRing = ({ size, progress, color }) => {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <svg
      className="nxa-progress-ring"
      width={size}
      height={size}
      style={{ position: 'absolute', top: -4, left: -4 }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={2}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        opacity={0.7}
      />
    </svg>
  );
};

export default BadgeArtifact;
