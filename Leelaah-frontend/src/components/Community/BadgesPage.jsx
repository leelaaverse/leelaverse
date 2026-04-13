import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from 'antd';
import {
  RiShieldStarLine, RiFilterLine,
} from 'react-icons/ri';
import { fetchBadges, fetchMyBadges } from '../../store/slices/communitySlice';
import apiService from '../../services/api';
import BadgeArtifact from '../Badges/BadgeArtifact';
import BadgeDetailModal from '../Badges/BadgeDetailModal';
import { RARITY_CONFIG, CATEGORY_CONFIG } from '../Badges/badgeConfig';

// ────────────────────────────────────────────────────────────────────────────────
// Nexus Artifacts — Badge Vault Page
// ────────────────────────────────────────────────────────────────────────────────

// Demo earned set for logged-out preview
const DEMO_EARNED = new Set([
  'first_post', 'streak_3', 'streak_7', 'followers_10',
  'comp_enter_1', 'xp_silver', 'template_creator_1',
]);

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

const BadgesPage = ({ isLoggedIn, myRank }) => {
  const dispatch = useDispatch();
  const { badges, myBadges } = useSelector((s) => s.community);
  const [filter, setFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    dispatch(fetchBadges());
    if (isLoggedIn) {
      apiService.community.syncBadges()
        .catch(() => {})
        .finally(() => dispatch(fetchMyBadges()));
    }
  }, [dispatch, isLoggedIn]);

  const allBadges = badges.list.length > 0 ? badges.list : [];
  const earnedIds = useMemo(() => {
    if (isLoggedIn) {
      return new Set(myBadges.list.map(b => b.badge?.name || b.badgeName));
    }
    return DEMO_EARNED;
  }, [isLoggedIn, myBadges.list]);

  const earnedCount = allBadges.filter(b => earnedIds.has(b.name)).length;
  const totalCount = allBadges.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Filter tabs
  const categories = ['all', 'earned', ...Object.keys(CATEGORY_CONFIG)];

  // Filter + sort badges
  const filteredBadges = useMemo(() => {
    let result = allBadges;

    if (filter === 'earned') {
      result = allBadges.filter(b => earnedIds.has(b.name));
    } else if (filter !== 'all' && CATEGORY_CONFIG[filter]) {
      result = allBadges.filter(b => b.category === filter);
    }

    // Sort: earned first, then by rarity (highest first), then sortOrder
    return [...result].sort((a, b) => {
      const aEarned = earnedIds.has(a.name) ? 1 : 0;
      const bEarned = earnedIds.has(b.name) ? 1 : 0;
      if (aEarned !== bEarned) return bEarned - aEarned;

      const aRareIdx = RARITY_ORDER.indexOf(a.rarity);
      const bRareIdx = RARITY_ORDER.indexOf(b.rarity);
      if (aRareIdx !== bRareIdx) return aRareIdx - bRareIdx;

      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [allBadges, filter, earnedIds]);

  // Group by category for "all" view
  const groupedBadges = useMemo(() => {
    if (filter !== 'all') return null;

    const groups = {};
    filteredBadges.forEach(badge => {
      const cat = badge.category || 'special';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(badge);
    });
    return groups;
  }, [filter, filteredBadges]);

  // Radial progress for vault header
  const ringRadius = 38;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - progressPercent / 100);

  // Tier display
  const tierEmoji = {
    diamond: '💎', platinum: '💠', gold: '🥇', silver: '🥈', bronze: '🥉',
  };

  return (
    <div>
      {/* ── Vault Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex', gap: 16, marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        {/* Collection Progress — Radial Ring */}
        <div style={{
          flex: '1 1 auto', minWidth: 260,
          padding: '24px 28px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c0c18 0%, #10101e 100%)',
          border: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          {/* Radial ring */}
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle
                cx={45} cy={45} r={ringRadius}
                fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5}
              />
              {/* Progress */}
              <motion.circle
                cx={45} cy={45} r={ringRadius}
                fill="none"
                stroke="url(#vault-progress-grad)"
                strokeWidth={5}
                strokeDasharray={ringCirc}
                initial={{ strokeDashoffset: ringCirc }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="vault-progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#e8e8f0', lineHeight: 1 }}>
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#2a2a48', marginBottom: 8,
            }}>
              Artifact Vault
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#e8e8f0' }}>{earnedCount}</span>
              <span style={{ fontSize: 13, color: '#2a2a48' }}>/ {totalCount}</span>
            </div>
            <div style={{ fontSize: 11, color: '#3a3a58' }}>
              artifacts collected
            </div>
          </div>
        </div>

        {/* Tier Card */}
        <div style={{
          minWidth: 130, padding: '24px 28px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c0c18 0%, #10101e 100%)',
          border: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#2a2a48', marginBottom: 10,
          }}>
            Creator Tier
          </div>
          {myRank ? (
            <>
              <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>
                {tierEmoji[myRank.creatorTier] || '🥉'}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#8888a0',
                textTransform: 'capitalize',
              }}>
                {myRank.creatorTier}
              </div>
            </>
          ) : (
            <>
              <RiShieldStarLine size={30} color="#1a1a2e" style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 11, color: '#22223a' }}>Login to see</div>
            </>
          )}
        </div>

        {/* Rarity Legend Card */}
        <div style={{
          minWidth: 200, padding: '20px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c0c18 0%, #10101e 100%)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#2a2a48', marginBottom: 12,
          }}>
            Rarity Tiers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(RARITY_CONFIG).map(([key, rarCfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: rarCfg.primary,
                  boxShadow: `0 0 6px ${rarCfg.glow}`,
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 600, color: rarCfg.textColor,
                  letterSpacing: '0.06em',
                }}>
                  {rarCfg.name}
                </span>
                <span style={{
                  fontSize: 9, color: '#22223a', marginLeft: 'auto',
                }}>
                  {allBadges.filter(b => b.rarity === key).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 2,
          padding: 4, borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          marginBottom: 28,
          width: 'fit-content',
        }}
      >
        {categories.map(cat => {
          const active = filter === cat;
          const catCfg = CATEGORY_CONFIG[cat];
          const catCount = cat === 'all' ? totalCount
            : cat === 'earned' ? earnedCount
            : allBadges.filter(b => b.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? '#c0c0d8' : '#2a2a48',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {catCfg && <span style={{ fontSize: 12 }}>{catCfg.icon}</span>}
              {cat === 'all' ? 'All' : cat === 'earned' ? '✓ Earned' : catCfg?.label || cat}
              <span style={{
                fontSize: 9, fontWeight: 600,
                color: active ? '#6a6a82' : '#1e1e38',
              }}>
                ({catCount})
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Badge Grid ────────────────────────────────────────────────────── */}
      {badges.loading ? (
        <div className="nxa-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              padding: 20, borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : filteredBadges.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '80px 0',
            color: '#1e1e38', fontSize: 13,
          }}
        >
          {filter === 'earned'
            ? '✨ Start creating to earn your first artifact!'
            : 'No artifacts found in this category.'}
        </motion.div>
      ) : groupedBadges ? (
        // Grouped view (when filter === 'all')
        Object.entries(groupedBadges).map(([cat, items]) => {
          const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.special;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: 36 }}
            >
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 18, paddingBottom: 10,
                borderBottom: `1px solid rgba(255,255,255,0.03)`,
              }}>
                <span style={{
                  fontSize: 16, width: 28, height: 28,
                  borderRadius: 8,
                  background: `${catCfg.accent}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {catCfg.icon}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: catCfg.accent,
                }}>
                  {catCfg.label}
                </span>
                <span style={{
                  fontSize: 10, color: '#22223a', fontWeight: 500,
                }}>
                  — {items.filter(b => earnedIds.has(b.name)).length}/{items.length}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.03)' }} />
              </div>

              {/* Badges */}
              <div className="nxa-grid">
                {items.map((badge, i) => (
                  <BadgeArtifact
                    key={badge.id || badge.name}
                    badge={badge}
                    earned={earnedIds.has(badge.name)}
                    animationDelay={i * 0.04}
                    onClick={() => setSelectedBadge(badge)}
                  />
                ))}
              </div>
            </motion.div>
          );
        })
      ) : (
        // Flat grid view (filtered)
        <div className="nxa-grid">
          {filteredBadges.map((badge, i) => (
            <BadgeArtifact
              key={badge.id || badge.name}
              badge={badge}
              earned={earnedIds.has(badge.name)}
              animationDelay={i * 0.04}
              onClick={() => setSelectedBadge(badge)}
            />
          ))}
        </div>
      )}

      {/* ── Badge Detail Modal ────────────────────────────────────────────── */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={earnedIds.has(selectedBadge.name)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default BadgesPage;
