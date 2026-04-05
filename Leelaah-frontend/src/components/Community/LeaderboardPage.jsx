import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, Skeleton } from 'antd';
import {
  RiSearchLine, RiTrophyFill, RiMedalFill, RiFireFill,
  RiCloseLine, RiUserFollowLine, RiVipCrownFill, RiBarChartBoxLine,
  RiArrowUpLine,
} from 'react-icons/ri';
import { fetchLeaderboard } from '../../store/slices/communitySlice';

// ── Dummy data (shown when API returns empty) ─────────────────────────────────
const DUMMY_USERS = [
  { id: 'd1', username: 'nova_create', firstName: 'Nova', lastName: 'Chen', rank: 1, creatorXP: 84200, creatorScore: 91400, creatorTier: 'diamond', currentStreak: 47, competitionsWon: 12, competitionsEntered: 18, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', _count: { posts: 234, followers: 8700 } },
  { id: 'd2', username: 'aether_vis', firstName: 'Aether', lastName: 'Park', rank: 2, creatorXP: 62100, creatorScore: 68900, creatorTier: 'diamond', currentStreak: 31, competitionsWon: 9, competitionsEntered: 14, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aether', _count: { posts: 178, followers: 6200 } },
  { id: 'd3', username: 'luna.frames', firstName: 'Luna', lastName: 'Vasquez', rank: 3, creatorXP: 48700, creatorScore: 52100, creatorTier: 'platinum', currentStreak: 19, competitionsWon: 6, competitionsEntered: 11, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', _count: { posts: 132, followers: 4100 } },
  { id: 'd4', username: 'flux_studio', firstName: 'Felix', lastName: 'Müller', rank: 4, creatorXP: 31400, creatorScore: 34800, creatorTier: 'platinum', currentStreak: 8, competitionsWon: 4, competitionsEntered: 9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=flux', _count: { posts: 98, followers: 2900 } },
  { id: 'd5', username: 'pixel.sage', firstName: 'Priya', lastName: 'Nair', rank: 5, creatorXP: 22300, creatorScore: 25600, creatorTier: 'gold', currentStreak: 14, competitionsWon: 3, competitionsEntered: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', _count: { posts: 67, followers: 1800 } },
  { id: 'd6', username: 'echo.render', firstName: 'Ethan', lastName: 'Cole', rank: 6, creatorXP: 18100, creatorScore: 19400, creatorTier: 'gold', currentStreak: 5, competitionsWon: 2, competitionsEntered: 6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ethan', _count: { posts: 54, followers: 1200 } },
  { id: 'd7', username: 'drift_form', firstName: 'Dana', lastName: 'Li', rank: 7, creatorXP: 12800, creatorScore: 13900, creatorTier: 'gold', currentStreak: 3, competitionsWon: 1, competitionsEntered: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dana', _count: { posts: 41, followers: 870 } },
  { id: 'd8', username: 'veil_motion', firstName: 'Victor', lastName: 'Osei', rank: 8, creatorXP: 7600, creatorScore: 8200, creatorTier: 'silver', currentStreak: 0, competitionsWon: 0, competitionsEntered: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor', _count: { posts: 29, followers: 540 } },
];

const TIER_CONFIG = {
  bronze:   { color: '#b87333', label: 'Bronze',   dot: '#b87333' },
  silver:   { color: '#9090a8', label: 'Silver',   dot: '#9090a8' },
  gold:     { color: '#d4a017', label: 'Gold',     dot: '#d4a017' },
  platinum: { color: '#4ab8d8', label: 'Platinum', dot: '#4ab8d8' },
  diamond:  { color: '#8b6fe8', label: 'Diamond',  dot: '#8b6fe8' },
};

const PERIODS = [
  { value: 'all-time', label: 'All time' },
  { value: 'monthly',  label: 'Month' },
  { value: 'weekly',   label: 'Week' },
];

// ── Small components ──────────────────────────────────────────────────────────

const TierDot = ({ tier }) => {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: cfg.color, fontWeight: 500 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

const RankNum = ({ rank }) => {
  if (rank === 1) return <RiVipCrownFill size={18} color="#d4a017" />;
  if (rank === 2) return <RiTrophyFill   size={16} color="#9090a8" />;
  if (rank === 3) return <RiMedalFill    size={16} color="#b87333" />;
  return <span style={{ fontSize: 12, color: '#32324a', fontWeight: 600, minWidth: 22, textAlign: 'center' }}>#{rank}</span>;
};

// ── Podium strip ──────────────────────────────────────────────────────────────
const Podium = ({ users, onUserClick }) => {
  const order = [users[1], users[0], users[2]].filter(Boolean);
  const sizes  = [52, 68, 52];   // avatar px
  const barH   = [56, 80, 44];   // bar px

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
      {order.map((u, i) => {
        const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
        const cfg = TIER_CONFIG[u.creatorTier] || TIER_CONFIG.bronze;
        const sz  = sizes[i];
        return (
          <motion.div
            key={u.id}
            onClick={() => onUserClick(u)}
            whileHover={{ y: -4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: i === 1 ? '1.3 1 0' : '1 1 0' }}
          >
            {realRank === 1 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <RiVipCrownFill size={18} color="#d4a017" style={{ marginBottom: 4 }} />
              </motion.div>
            )}
            <img
              src={u.avatar}
              alt={u.username}
              style={{ width: sz, height: sz, borderRadius: 14, objectFit: 'cover', border: `2px solid ${cfg.color}50`, marginBottom: 6 }}
            />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#c8c8e0', marginBottom: 2, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.username}
            </div>
            <div style={{ fontSize: 11, color: cfg.color, marginBottom: 6 }}>
              {(u.creatorXP / 1000).toFixed(1)}k XP
            </div>
            <div style={{
              width: '100%', height: barH[i], borderRadius: '6px 6px 0 0',
              background: `linear-gradient(180deg, ${cfg.color}20 0%, ${cfg.color}06 100%)`,
              border: `1px solid ${cfg.color}20`, borderBottom: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: cfg.color,
            }}>
              {realRank}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ── Row card ──────────────────────────────────────────────────────────────────
const LeaderRow = ({ user, index, onClick, isMe }) => {
  const rank = user.rank || index + 1;
  const cfg  = TIER_CONFIG[user.creatorTier] || TIER_CONFIG.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, ease: 'easeOut' }}
      onClick={() => onClick(user)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
        background: isMe ? 'rgba(90,90,255,0.06)' : 'transparent',
        border: isMe ? '1px solid rgba(90,90,255,0.15)' : '1px solid transparent',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.03)', transition: { duration: 0.1 } }}
    >
      <div style={{ width: 28, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <RankNum rank={rank} />
      </div>

      <img
        src={user.avatar}
        alt={user.username}
        style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: `1.5px solid ${cfg.color}40` }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? '#a0a0ff' : '#d8d8ee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.username}
          </span>
          <TierDot tier={user.creatorTier} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#2e2e48' }}>{user.creatorScore?.toLocaleString()} score</span>
          {user.currentStreak > 0 && (
            <span style={{ fontSize: 11, color: '#d4a017', display: 'flex', alignItems: 'center', gap: 3 }}>
              <RiFireFill size={10} />{user.currentStreak}d
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6060c8' }}>
          {(user.creatorXP / 1000).toFixed(1)}k XP
        </span>
        {user.competitionsWon > 0 && (
          <span style={{ fontSize: 10, color: '#d4a017' }}>🏆 {user.competitionsWon}W</span>
        )}
      </div>
    </motion.div>
  );
};

// ── Profile drawer ────────────────────────────────────────────────────────────
const ProfileDrawer = ({ user, open, onClose }) => {
  if (!user) return null;
  const cfg = TIER_CONFIG[user.creatorTier] || TIER_CONFIG.bronze;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={340}
      styles={{
        body: { background: '#0c0c18', padding: 0, overflowX: 'hidden' },
        header: { background: '#0c0c18', borderBottom: '1px solid #14141e' },
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(4,4,12,0.6)' },
      }}
      title={<span style={{ color: '#c0c0d8', fontWeight: 600, fontSize: 13 }}>Creator</span>}
      closeIcon={<RiCloseLine color="#38384e" size={18} />}
    >
      <div style={{ padding: 24 }}>
        {/* Hero block */}
        <div style={{
          borderRadius: 16, padding: 24, marginBottom: 20,
          background: `linear-gradient(135deg, rgba(${cfg.color === '#d4a017' ? '212,160,23' : cfg.color === '#8b6fe8' ? '139,111,232' : '74,184,216'},0.08) 0%, transparent 100%)`,
          border: `1px solid ${cfg.color}18`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10,
        }}>
          <img
            src={user.avatar}
            alt={user.username}
            style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover', border: `2px solid ${cfg.color}50` }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0f8' }}>{user.username}</div>
            <TierDot tier={user.creatorTier} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
            {[
              { l: 'Rank', v: `#${user.rank}`, c: cfg.color },
              { l: 'XP',   v: `${(user.creatorXP/1000).toFixed(1)}k`, c: '#6060c8' },
              { l: 'Wins', v: user.competitionsWon || 0, c: '#d4a017' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#28284e', marginTop: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Score', v: user.creatorScore?.toLocaleString() || 0 },
            { l: 'Streak', v: `${user.currentStreak || 0}d` },
            { l: 'Competitions', v: user.competitionsEntered || 0 },
            { l: 'Posts', v: user._count?.posts || 0 },
          ].map(s => (
            <div key={s.l} style={{ padding: '10px 12px', borderRadius: 10, background: '#111120', border: '1px solid #18182a' }}>
              <div style={{ fontSize: 10, color: '#28284e', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#c0c0d8' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {user._count?.followers > 0 && (
          <div style={{ fontSize: 12, color: '#28284e', marginBottom: 16 }}>
            {user._count.followers.toLocaleString()} followers
          </div>
        )}

        <button style={{
          width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: '#5a5aff', color: '#fff', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <RiUserFollowLine size={14} /> Follow
        </button>
      </div>
    </Drawer>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const LeaderboardPage = ({ isLoggedIn, onShowAuthModal }) => {
  const dispatch  = useDispatch();
  const { leaderboard, myRank } = useSelector((s) => s.community);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [period, setPeriod] = useState('all-time');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const users = leaderboard.users.length > 0 ? leaderboard.users : DUMMY_USERS;

  const filtered = search
    ? users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
    : users;

  const handleSearch = useCallback((val) => {
    setSearch(val);
    if (!val) dispatch(fetchLeaderboard({ period, limit: 20 }));
  }, [dispatch, period]);

  const handlePeriodChange = (val) => {
    setPeriod(val);
    dispatch(fetchLeaderboard({ period: val, limit: 20 }));
  };

  const openDrawer = (user) => { setSelectedUser(user); setDrawerOpen(true); };

  const top3    = filtered.slice(0, 3);
  const theRest = filtered.slice(3);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

      {/* ── Left: list ── */}
      <div>
        {/* Podium */}
        {top3.length >= 2 && <Podium users={top3} onUserClick={openDrawer} />}

        {/* Search + period filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <RiSearchLine size={14} color="#28284e" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search creators…"
              style={{
                width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10,
                background: '#0e0e1c', border: '1px solid #16162a',
                color: '#c0c0d8', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 2, padding: '4px', borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a' }}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: period === p.value ? '#1a1a2e' : 'transparent',
                  color: period === p.value ? '#c0c0d8' : '#28284e',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Separator line */}
        <div style={{ borderBottom: '1px solid #10101e', marginBottom: 8 }} />

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaderboard.loading && leaderboard.users.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 16px' }}><Skeleton active avatar={{ size: 38, shape: 'square' }} paragraph={{ rows: 1 }} /></div>
            ))
          ) : (
            filtered.map((u, i) => (
              <LeaderRow key={u.id} user={u} index={i} onClick={openDrawer} isMe={currentUser?.id === u.id} />
            ))
          )}
        </div>

        {leaderboard.hasMore && (
          <button
            onClick={() => dispatch(fetchLeaderboard({ period, search, page: leaderboard.page + 1, limit: 20 }))}
            style={{ width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 10, border: '1px solid #16162a', background: 'transparent', color: '#28284e', fontSize: 13, cursor: 'pointer' }}
          >
            Load more
          </button>
        )}
      </div>

      {/* ── Right: sidebar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* My standing */}
        {isLoggedIn && myRank.data ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ borderRadius: 14, padding: 20, background: '#0e0e1c', border: '1px solid rgba(90,90,255,0.12)' }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a5aff', marginBottom: 14 }}>
              Your standing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img
                src={myRank.data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myRank.data.username}`}
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
                alt="me"
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#d0d0e8' }}>{myRank.data.username}</div>
                <TierDot tier={myRank.data.creatorTier || 'bronze'} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
              {[
                { l: 'Rank', v: `#${myRank.data.rank}`, c: '#d4a017' },
                { l: 'XP', v: `${((myRank.data.creatorXP || 0)/1000).toFixed(1)}k`, c: '#6060c8' },
                { l: 'Wins', v: myRank.data.competitionsWon || 0, c: '#4ab8a8' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: '#0a0a16' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: '#22223a', marginTop: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {myRank.data.currentStreak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.12)' }}>
                <RiFireFill color="#d4a017" size={13} />
                <span style={{ fontSize: 12, color: '#d4a017', fontWeight: 500 }}>{myRank.data.currentStreak} day streak</span>
              </div>
            )}
          </motion.div>
        ) : !isLoggedIn && (
          <div style={{ borderRadius: 14, padding: 20, background: '#0e0e1c', border: '1px solid #16162a', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#22223a', marginBottom: 12 }}>Sign in to track your rank</div>
            <button
              onClick={() => onShowAuthModal?.('login')}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#5a5aff', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Tier guide */}
        <div style={{ borderRadius: 14, padding: 20, background: '#0e0e1c', border: '1px solid #16162a' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22223a', marginBottom: 14 }}>
            Tiers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(TIER_CONFIG).map(([key, cfg]) => {
              const ranges = { bronze: '0 – 999', silver: '1k – 4.9k', gold: '5k – 14.9k', platinum: '15k – 49.9k', diamond: '50k+' };
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
                    <div style={{ fontSize: 10, color: '#22223a' }}>{ranges[key]} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ProfileDrawer user={selectedUser} open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedUser(null); }} />
    </div>
  );
};

export default LeaderboardPage;
