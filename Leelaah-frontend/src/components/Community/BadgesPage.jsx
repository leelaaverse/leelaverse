import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Skeleton } from 'antd';
import { RiLockLine, RiCheckLine, RiMedalLine, RiAwardFill, RiVipCrownFill, RiStarSmileFill, RiTrophyFill, RiShieldStarFill } from 'react-icons/ri';
import { fetchBadges, fetchMyBadges } from '../../store/slices/communitySlice';
import apiService from '../../services/api';

// ── Dummy badges ──────────────────────────────────────────────────────────────
const DUMMY_BADGES = [
  { id: 'b1',  name: 'first_post',      displayName: 'First Creation',    description: 'Published your very first post',             category: 'posting',     rarity: 'common',    coinReward: 10,  xpReward: 25,  isActive: true, iconUrl: null },
  { id: 'b2',  name: 'post_10',         displayName: 'Prolific Creator',  description: 'Published 10 posts',                        category: 'posting',     rarity: 'uncommon',  coinReward: 50,  xpReward: 100, isActive: true, iconUrl: null },
  { id: 'b3',  name: 'post_50',         displayName: 'Content Machine',   description: 'Published 50 posts',                        category: 'posting',     rarity: 'rare',      coinReward: 200, xpReward: 500, isActive: true, iconUrl: null },
  { id: 'b4',  name: 'streak_7',        displayName: '7-Day Streak',      description: 'Posted 7 days in a row',                    category: 'posting',     rarity: 'uncommon',  coinReward: 75,  xpReward: 150, isActive: true, iconUrl: null },
  { id: 'b5',  name: 'streak_30',       displayName: 'On Fire',           description: 'Posted 30 days in a row',                   category: 'posting',     rarity: 'epic',      coinReward: 500, xpReward: 1000, isActive: true, iconUrl: null },
  { id: 'b6',  name: 'like_100',        displayName: 'Crowd Pleaser',     description: 'Received 100 total likes',                  category: 'engagement',  rarity: 'common',    coinReward: 25,  xpReward: 50,  isActive: true, iconUrl: null },
  { id: 'b7',  name: 'like_1000',       displayName: 'Viral Moment',      description: 'Received 1,000 total likes',                category: 'engagement',  rarity: 'rare',      coinReward: 150, xpReward: 350, isActive: true, iconUrl: null },
  { id: 'b8',  name: 'viral_post',      displayName: 'Going Viral',       description: 'A single post got 100+ likes',              category: 'engagement',  rarity: 'uncommon',  coinReward: 100, xpReward: 200, isActive: true, iconUrl: null },
  { id: 'b9',  name: 'comp_enter',      displayName: 'Competitor',        description: 'Entered your first competition',            category: 'competition', rarity: 'common',    coinReward: 20,  xpReward: 50,  isActive: true, iconUrl: null },
  { id: 'b10', name: 'comp_winner',     displayName: 'Champion',          description: 'Won first place in a competition',          category: 'competition', rarity: 'legendary', coinReward: 1000, xpReward: 2500, isActive: true, iconUrl: null },
  { id: 'b11', name: 'comp_3wins',      displayName: 'Hat Trick',         description: 'Won 3 competitions',                       category: 'competition', rarity: 'epic',      coinReward: 750, xpReward: 1500, isActive: true, iconUrl: null },
  { id: 'b12', name: 'silver_tier',     displayName: 'Rising Creator',    description: 'Reached Silver tier (1,000 XP)',            category: 'milestone',   rarity: 'common',    coinReward: 50,  xpReward: 0,   isActive: true, iconUrl: null },
  { id: 'b13', name: 'gold_tier',       displayName: 'Established',       description: 'Reached Gold tier (5,000 XP)',              category: 'milestone',   rarity: 'uncommon',  coinReward: 200, xpReward: 0,   isActive: true, iconUrl: null },
  { id: 'b14', name: 'platinum_tier',   displayName: 'Elite Creator',     description: 'Reached Platinum tier (15,000 XP)',         category: 'milestone',   rarity: 'rare',      coinReward: 800, xpReward: 0,   isActive: true, iconUrl: null },
  { id: 'b15', name: 'diamond_tier',    displayName: 'Legendary',         description: 'Reached Diamond tier (50,000 XP)',          category: 'milestone',   rarity: 'legendary', coinReward: 5000, xpReward: 0,  isActive: true, iconUrl: null },
  { id: 'b16', name: 'early_adopter',   displayName: 'Early Adopter',     description: 'Joined Leelaverse in its early days',      category: 'special',     rarity: 'legendary', coinReward: 500, xpReward: 1000, isActive: true, iconUrl: null },
];

// Dummy earned (simulate user has a few)
const DUMMY_EARNED = new Set(['first_post', 'streak_7', 'like_100', 'comp_enter', 'silver_tier', 'early_adopter']);

const RARITY_CFG = {
  common:    { color: '#6a6a82', bg: '#111118', glow: 'none',                        label: 'Common' },
  uncommon:  { color: '#3db87a', bg: '#0a1e14', glow: 'rgba(61,184,122,0.12)',       label: 'Uncommon' },
  rare:      { color: '#5a80ff', bg: '#0d1028', glow: 'rgba(90,128,255,0.14)',       label: 'Rare' },
  epic:      { color: '#9870f0', bg: '#140e28', glow: 'rgba(152,112,240,0.14)',      label: 'Epic' },
  legendary: { color: '#d4a017', bg: '#1c1400', glow: 'rgba(212,160,23,0.18)',       label: 'Legendary' },
};

const CAT_EMOJI = {
  posting:     '✍️',
  engagement:  '❤️',
  competition: '⚔️',
  milestone:   '🏔️',
  special:     '✨',
};

const CAT_LABEL = {
  posting: 'Posting', engagement: 'Engagement', competition: 'Competition', milestone: 'Milestone', special: 'Special',
};

// ── Badge card ────────────────────────────────────────────────────────────────
const BadgeCard = ({ badge, earned, index }) => {
  const r = RARITY_CFG[badge.rarity] || RARITY_CFG.common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      style={{
        borderRadius: 14, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative',
        background: earned ? r.bg : '#0a0a12',
        border: earned ? `1px solid ${r.color}22` : '1px solid #10101c',
        filter: earned ? 'none' : 'grayscale(0.85) opacity(0.35)',
        boxShadow: earned && r.glow !== 'none' ? `0 0 20px ${r.glow}` : 'none',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Check or lock */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        width: 18, height: 18, borderRadius: '50%',
        background: earned ? r.color : '#14141e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {earned
          ? <RiCheckLine size={10} color="#fff" />
          : <RiLockLine size={9} color="#22223a" />
        }
      </div>

      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 20, marginBottom: 12,
        background: earned ? `linear-gradient(135deg, ${r.bg}, ${r.color}30)` : '#0e0e18',
        border: earned ? `2px solid ${r.color}50` : '2px solid #12121e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: earned ? `inset 0 2px 10px ${r.color}50, 0 4px 15px rgba(0,0,0,0.4)` : 'none',
      }}>
        {badge.iconUrl ? (
          <img src={badge.iconUrl} alt={badge.displayName} style={{ width: 36, height: 36, objectFit: 'contain', filter: earned ? `drop-shadow(0 2px 8px ${r.color})` : 'none' }} />
        ) : earned ? (
          badge.category === 'competition' ? <RiTrophyFill size={36} color={r.color} style={{ filter: `drop-shadow(0 2px 8px ${r.color})` }} /> :
          badge.category === 'posting' ? <RiAwardFill size={36} color={r.color} style={{ filter: `drop-shadow(0 2px 8px ${r.color})` }} /> :
          badge.category === 'milestone' ? <RiVipCrownFill size={36} color={r.color} style={{ filter: `drop-shadow(0 2px 8px ${r.color})` }} /> :
          badge.category === 'special' ? <RiShieldStarFill size={36} color={r.color} style={{ filter: `drop-shadow(0 2px 8px ${r.color})` }} /> :
          <RiStarSmileFill size={36} color={r.color} style={{ filter: `drop-shadow(0 2px 8px ${r.color})` }} />
        ) : (
          <RiLockLine size={28} color="#22223a" />
        )}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: earned ? '#d0d0e8' : '#22223a', marginBottom: 4, lineHeight: 1.2 }}>
        {badge.displayName}
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, color: r.color, marginBottom: 6 }}>{r.label}</div>

      <div style={{ fontSize: 10, color: '#22223a', lineHeight: 1.5, marginBottom: 8 }}>{badge.description}</div>

      {(badge.coinReward > 0 || badge.xpReward > 0) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {badge.coinReward > 0 && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,160,23,0.08)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.15)' }}>
              🪙 {badge.coinReward}
            </span>
          )}
          {badge.xpReward > 0 && (
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(90,90,255,0.08)', color: '#5a5aff', border: '1px solid rgba(90,90,255,0.15)' }}>
              +{badge.xpReward} XP
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const BadgesPage = ({ isLoggedIn, myRank }) => {
  const dispatch = useDispatch();
  const { badges, myBadges } = useSelector((s) => s.community);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBadges());
    if (isLoggedIn) {
      // Sync first (awards any newly qualified badges), then fetch
      apiService.community.syncBadges()
        .catch(() => {})
        .finally(() => dispatch(fetchMyBadges()));
    }
  }, [dispatch, isLoggedIn]);

  const allBadges = badges.list.length > 0 ? badges.list : DUMMY_BADGES;
  // When logged in, show only real earned badges (empty = 0 earned, not dummy)
  // When not logged in, use DUMMY_EARNED to show a demo preview
  const earnedIds = isLoggedIn
    ? new Set(myBadges.list.map(b => b.badge?.name || b.badgeName))
    : DUMMY_EARNED;

  const earnedCount = allBadges.filter(b => earnedIds.has(b.name)).length;

  const cats = ['all', 'earned', ...Object.keys(CAT_LABEL)];

  const filtered = filter === 'all' ? allBadges
    : filter === 'earned' ? allBadges.filter(b => earnedIds.has(b.name))
    : allBadges.filter(b => b.category === filter);

  // Group by category when showing all
  const grouped = filtered.reduce((acc, b) => {
    const key = b.category || 'special';
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div>
      {/* Progress header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 28 }}>
        <div style={{ padding: '20px 24px', borderRadius: 16, background: '#0e0e1a', border: '1px solid #16162a' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#28284e', marginBottom: 8 }}>
            Collection progress
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#d0d0e8' }}>{earnedCount}</span>
            <span style={{ fontSize: 14, color: '#22223a' }}>/ {allBadges.length} badges</span>
          </div>
          <div style={{ height: 3, borderRadius: 99, background: '#12122a', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((earnedCount / Math.max(allBadges.length, 1)) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #5a5aff, #9870f0)', borderRadius: 99 }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#22223a', marginTop: 6 }}>
            {Math.round((earnedCount / Math.max(allBadges.length, 1)) * 100)}% complete
          </div>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: 16, background: '#0e0e1a', border: '1px solid #16162a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 120 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#28284e', marginBottom: 8 }}>
            Your tier
          </div>
          {myRank ? (
            <>
              <div style={{ fontSize: 28 }}>
                {myRank.creatorTier === 'diamond' ? '💎' : myRank.creatorTier === 'platinum' ? '💠' : myRank.creatorTier === 'gold' ? '🥇' : myRank.creatorTier === 'silver' ? '🥈' : '🥉'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888898', textTransform: 'capitalize', marginTop: 4 }}>{myRank.creatorTier}</div>
            </>
          ) : (
            <RiMedalLine size={28} color="#1a1a2e" />
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 4, borderRadius: 10, background: '#0e0e1a', border: '1px solid #16162a', marginBottom: 24, width: 'fit-content' }}>
        {cats.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.15s',
              background: filter === cat ? '#18182e' : 'transparent',
              color: filter === cat ? '#c0c0d8' : '#28284e',
            }}
          >
            {cat === 'all' ? `All (${allBadges.length})` : cat === 'earned' ? `Earned (${earnedCount})` : `${CAT_EMOJI[cat] || ''} ${CAT_LABEL[cat]}`}
          </button>
        ))}
      </div>

      {/* Badges */}
      {badges.loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 14, background: '#0a0a12', border: '1px solid #10101c' }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#1a1a2e', fontSize: 13 }}>
          {filter === 'earned' ? 'Start creating to earn badges!' : 'No badges found'}
        </div>
      ) : (filter === 'all' || (filter !== 'earned' && Object.keys(grouped).length > 1)) && filter !== 'earned' ? (
        // Grouped by category
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>{CAT_EMOJI[cat] || '🏅'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22223a' }}>
                {CAT_LABEL[cat] || cat}
              </span>
              <div style={{ flex: 1, height: 1, background: '#10101e' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {items.map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.name)} index={i} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {filtered.map((badge, i) => (
            <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.name)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
