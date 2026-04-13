import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiLockLine, RiCheckDoubleLine, RiCopperCoinLine, RiFlashlightLine } from 'react-icons/ri';
import BadgeArtifact from './BadgeArtifact';
import { RARITY_CONFIG, CATEGORY_CONFIG } from './badgeConfig';

// ────────────────────────────────────────────────────────────────────────────────
// BadgeDetailModal — Expanded view showing full badge with animations + details
// ────────────────────────────────────────────────────────────────────────────────

const BadgeDetailModal = ({ badge, earned, onClose }) => {
  if (!badge) return null;

  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
  const category = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.special;

  const getRequirementText = (req) => {
    if (!req) return 'Complete the challenge';
    const labels = {
      post_count: `Publish ${req.value} creation${req.value > 1 ? 's' : ''}`,
      streak: `Maintain a ${req.value}-day posting streak`,
      xp: `Earn ${req.value.toLocaleString()} XP`,
      competitions_entered: `Enter ${req.value} competition${req.value > 1 ? 's' : ''}`,
      competitions_won: `Win ${req.value} competition${req.value > 1 ? 's' : ''}`,
      followers: `Reach ${req.value.toLocaleString()} followers`,
      templates_created: `Create ${req.value} template${req.value > 1 ? 's' : ''}`,
    };
    return labels[req.type] || 'Complete the challenge';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'radial-gradient(circle at top, #12121e 0%, #08080f 100%)',
            border: `1px solid ${earned ? rarity.frameBorder : 'rgba(30,30,50,0.5)'}`,
            borderRadius: 24,
            padding: '40px 32px 32px',
            maxWidth: 380,
            width: '100%',
            position: 'relative',
            boxShadow: earned
              ? `0 0 60px ${rarity.glow}, 0 20px 60px rgba(0,0,0,0.5)`
              : '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#6a6a82',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#fff';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6a6a82';
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <RiCloseLine size={16} />
          </button>

          {/* Badge display */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <BadgeArtifact
              badge={badge}
              earned={earned}
              size={120}
              showRewards={false}
              showTooltip={false}
              compact={false}
            />
          </div>

          {/* Badge info */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h3 style={{
              fontSize: 22, fontWeight: 800, color: '#e8e8f0', margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {badge.displayName}
            </h3>
            <p style={{
              fontSize: 13, color: '#4a4a68', marginTop: 8, lineHeight: 1.5,
            }}>
              {badge.description}
            </p>
          </div>

          {/* Category and Rarity */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
              background: `${category.accent}15`, color: category.accent,
              border: `1px solid ${category.accent}25`,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {category.icon} {category.label}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
              background: `${rarity.primary}15`, color: rarity.textColor,
              border: `1px solid ${rarity.primary}25`,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              {rarity.name}
            </span>
          </div>

          {/* Requirement */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#2a2a48', marginBottom: 6,
            }}>
              Requirement
            </div>
            <div style={{
              fontSize: 13, color: earned ? '#10b981' : '#6a6a82', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {earned ? <RiCheckDoubleLine size={14} /> : <RiLockLine size={14} />}
              {getRequirementText(badge.requirement)}
            </div>
          </div>

          {/* Rewards */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}>
            {badge.coinReward > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <RiCopperCoinLine size={18} color="#f59e0b" style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>
                  {badge.coinReward.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: '#4a4a68', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Coins
                </div>
              </div>
            )}
            {badge.xpReward > 0 && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <RiFlashlightLine size={18} color="#818cf8" style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#818cf8' }}>
                  {badge.xpReward.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: '#4a4a68', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  XP Reward
                </div>
              </div>
            )}
          </div>

          {/* Status footer */}
          <div style={{
            marginTop: 20, textAlign: 'center',
            fontSize: 11, fontWeight: 600,
            color: earned ? '#10b981' : '#2a2a48',
          }}>
            {earned ? '✨ Artifact Unlocked' : '🔒 Locked — Complete the requirement to unlock'}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeDetailModal;
