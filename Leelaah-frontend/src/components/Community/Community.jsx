import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTrophyLine, RiSwordLine, RiLayoutGridLine, RiMedalLine, RiFlashlightLine } from 'react-icons/ri';
import Navbar from '../Navbar/Navbar';
import LeaderboardPage from './LeaderboardPage';
import CompetitionsPage from './CompetitionsPage';
import TemplatesPage from './TemplatesPage';
import BadgesPage from './BadgesPage';
import {
  fetchLeaderboard, fetchCompetitions, fetchTemplates, fetchMyRank, fetchBadges,
} from '../../store/slices/communitySlice';

const TABS = [
  { key: 'leaderboard',  label: 'Leaderboard',  icon: RiTrophyLine },
  { key: 'competitions', label: 'Competitions', icon: RiSwordLine },
  { key: 'templates',    label: 'Templates',    icon: RiLayoutGridLine },
  { key: 'badges',       label: 'Badges',       icon: RiMedalLine },
];

const Community = ({ onBack, onNavigate, onShowAuthModal, onOpenCreateModal }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const { isLoggedIn } = useSelector((s) => s.auth);
  const { competitions, myRank } = useSelector((s) => s.community);

  useEffect(() => {
    dispatch(fetchLeaderboard({ limit: 20 }));
    dispatch(fetchCompetitions({ status: 'live', limit: 8 }));
    dispatch(fetchTemplates({ sort: 'trending', limit: 18 }));
    dispatch(fetchBadges());
    if (isLoggedIn) dispatch(fetchMyRank());
  }, [dispatch, isLoggedIn]);

  const liveCount = competitions.list.filter((c) => c.status === 'live').length;

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e2e2ee' }}>
      {/* Subtle noise texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '256px',
        opacity: 0.6,
      }} />

      <Navbar
        isLoggedIn={isLoggedIn}
        showBackButton={!!onBack}
        onBack={onBack}
        onNavigate={onNavigate}
        onLogin={() => onShowAuthModal?.('login')}
        onSignup={() => onShowAuthModal?.('signup')}
      />

      <main className="relative" style={{ zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '20px 24px 80px' }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 16, marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <RiFlashlightLine size={12} color="#5a5aff" />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5aff' }}>
              Creator Arena
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#f0f0ff', margin: 0 }}>
            Community
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, color: '#36364e', maxWidth: 340 }}>
            Compete. Create. Climb. Where great work gets recognized.
          </p>
        </motion.div>

        {/* ── Tab bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid #12121e', paddingBottom: 0 }}
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key)}
                whileTap={{ scale: 0.97 }}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#e2e2ee' : '#38384e',
                  transition: 'color 0.2s',
                  borderRadius: 0,
                }}
              >
                <Icon size={14} />
                {label}
                {key === 'competitions' && liveCount > 0 && (
                  <span style={{
                    background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700,
                    borderRadius: 99, padding: '1px 5px', lineHeight: 1.6,
                  }}>{liveCount}</span>
                )}
                {active && (
                  <motion.div
                    layoutId="tab-underline"
                    style={{
                      position: 'absolute', bottom: -1, left: 0, right: 0,
                      height: 1, background: '#e2e2ee',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'leaderboard'  && <LeaderboardPage  isLoggedIn={isLoggedIn} onShowAuthModal={onShowAuthModal} />}
            {activeTab === 'competitions' && <CompetitionsPage isLoggedIn={isLoggedIn} onShowAuthModal={onShowAuthModal} />}
            {activeTab === 'templates'    && <TemplatesPage    isLoggedIn={isLoggedIn} onShowAuthModal={onShowAuthModal} onOpenCreateModal={onOpenCreateModal} />}
            {activeTab === 'badges'       && <BadgesPage       isLoggedIn={isLoggedIn} myRank={myRank.data} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Community;
