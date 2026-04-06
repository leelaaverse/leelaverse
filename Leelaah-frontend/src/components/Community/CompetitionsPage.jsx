import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, Skeleton, message } from 'antd';
import {
  RiSearchLine, RiTimeLine, RiGroupLine, RiCloseLine,
  RiGiftLine, RiCheckboxCircleFill, RiSwordLine, RiArrowRightLine,
  RiImageLine, RiVideoLine, RiFileTextLine, RiTrophyFill,
} from 'react-icons/ri';
import {
  fetchCompetitions, fetchCompetitionDetails, fetchSubmissions,
  joinCompetition, clearSelectedCompetition,
} from '../../store/slices/communitySlice';

// ── Dummy competitions ────────────────────────────────────────────────────────
const DUMMY_COMPS = [
  {
    id: 'c1', title: 'Neon Dreamscapes', description: 'Create cinematic AI art set in neon-drenched futures. No limits on style — only imagination.',
    category: 'ai-art', submissionType: 'image', status: 'live', isFeatured: true, isTrending: true,
    prizePool: 2500, prizeBreakdown: { '1st': 1200, '2nd': 800, '3rd': 500 }, participantsCount: 847,
    submissionsCount: 312, startsAt: new Date(Date.now() - 86400000).toISOString(), endsAt: new Date(Date.now() + 172800000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
  {
    id: 'c2', title: 'Short Story Sprint', description: 'Write a 300-word story using an AI-generated image as your prompt. Judges score for voice and originality.',
    category: 'storytelling', submissionType: 'text', status: 'live', isFeatured: false, isTrending: true,
    prizePool: 1000, prizeBreakdown: { '1st': 500, '2nd': 300, '3rd': 200 }, participantsCount: 423,
    submissionsCount: 189, startsAt: new Date(Date.now() - 43200000).toISOString(), endsAt: new Date(Date.now() + 259200000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
  {
    id: 'c3', title: 'Cinematic Reel Challenge', description: 'Produce a 15–30 second AI-assisted video loop. Any genre, any mood.',
    category: 'video', submissionType: 'video', status: 'upcoming', isFeatured: true, isTrending: false,
    prizePool: 5000, prizeBreakdown: { '1st': 2500, '2nd': 1500, '3rd': 1000 }, participantsCount: 0,
    submissionsCount: 0, startsAt: new Date(Date.now() + 432000000).toISOString(), endsAt: new Date(Date.now() + 864000000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
  {
    id: 'c4', title: 'Portrait Masters', description: 'AI portrait photography — push the boundaries of what a portrait can be.',
    category: 'ai-art', submissionType: 'image', status: 'judging', isFeatured: false, isTrending: false,
    prizePool: 800, prizeBreakdown: { '1st': 400, '2nd': 250, '3rd': 150 }, participantsCount: 1204,
    submissionsCount: 891, startsAt: new Date(Date.now() - 604800000).toISOString(), endsAt: new Date(Date.now() - 86400000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
  {
    id: 'c5', title: 'Abstract Geometry', description: 'Generative art meets geometry. Create something mathematically beautiful.',
    category: 'ai-art', submissionType: 'image', status: 'completed', isFeatured: false, isTrending: false,
    prizePool: 600, prizeBreakdown: { '1st': 300, '2nd': 200, '3rd': 100 }, participantsCount: 678,
    submissionsCount: 445, startsAt: new Date(Date.now() - 1209600000).toISOString(), endsAt: new Date(Date.now() - 604800000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
  {
    id: 'c6', title: 'Lo-fi Landscapes', description: 'Peaceful, muted, atmospheric — create a world you want to get lost in.',
    category: 'ai-art', submissionType: 'image', status: 'live', isFeatured: false, isTrending: false,
    prizePool: 1200, prizeBreakdown: { '1st': 600, '2nd': 400, '3rd': 200 }, participantsCount: 392,
    submissionsCount: 147, startsAt: new Date(Date.now() - 86400000).toISOString(), endsAt: new Date(Date.now() + 345600000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    creator: { username: 'leelaverse', avatar: null },
  },
];

const STATUS_CFG = {
  live:      { label: 'Live',      color: '#3dd68c', bg: 'rgba(61,214,140,0.08)',  dot: true },
  upcoming:  { label: 'Upcoming',  color: '#6080ff', bg: 'rgba(96,128,255,0.08)', dot: false },
  judging:   { label: 'Judging',   color: '#f0a040', bg: 'rgba(240,160,64,0.08)', dot: false },
  completed: { label: 'Completed', color: '#484860', bg: 'rgba(72,72,96,0.08)',   dot: false },
};

const TYPE_ICON = { image: RiImageLine, video: RiVideoLine, text: RiFileTextLine, any: RiSwordLine };

const FILTERS = [
  { value: 'live',      label: 'Live' },
  { value: 'upcoming',  label: 'Upcoming' },
  { value: 'judging',   label: 'Judging' },
  { value: 'completed', label: 'Completed' },
  { value: '',          label: 'All' },
];

// ── Countdown ─────────────────────────────────────────────────────────────────
const Countdown = ({ endsAt }) => {
  const [t, setT] = useState('');
  useEffect(() => {
    const calc = () => {
      const ms = new Date(endsAt) - Date.now();
      if (ms <= 0) { setT('Ended'); return; }
      const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
      setT(h > 48 ? `${Math.floor(h/24)}d ${h%24}h` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return <>{t}</>;
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.upcoming;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, animation: 'pulse 2s infinite' }} />}
      {cfg.label}
    </span>
  );
};

// ── Competition card ──────────────────────────────────────────────────────────
const CompCard = ({ comp, onClick, index }) => {
  const TypeIcon = TYPE_ICON[comp.submissionType] || RiSwordLine;
  const cfg = STATUS_CFG[comp.status] || STATUS_CFG.upcoming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onClick(comp)}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      style={{
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        background: '#0c0c18', border: '1px solid #14142a',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <img
          src={comp.coverImage}
          alt={comp.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0c0c18 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}><StatusBadge status={comp.status} /></div>
        {comp.isFeatured && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
            background: 'rgba(212,160,23,0.15)', color: '#d4a017',
          }}>Featured</div>
        )}
        <div style={{ position: 'absolute', bottom: 10, right: 10, color: 'rgba(255,255,255,0.4)' }}>
          <TypeIcon size={14} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#d8d8ee', marginBottom: 4, lineHeight: 1.3 }}>{comp.title}</div>
        <div style={{ fontSize: 12, color: '#24244a', lineHeight: 1.5, marginBottom: 12, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {comp.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#28284e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <RiGroupLine size={11} />{comp.participantsCount?.toLocaleString() || 0}
            </span>
            {comp.prizePool > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#d4a017' }}>
                🪙 {comp.prizePool.toLocaleString()}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: comp.status === 'live' ? '#3dd68c' : '#28284e', display: 'flex', alignItems: 'center', gap: 4 }}>
            {comp.status === 'live' ? (
              <><RiTimeLine size={11} /><Countdown endsAt={comp.endsAt} /></>
            ) : (
              new Date(comp.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Detail drawer ─────────────────────────────────────────────────────────────
const CompDrawer = ({ comp, open, onClose, isLoggedIn, onShowAuthModal }) => {
  const dispatch = useDispatch();
  const { selectedCompetition, submissions } = useSelector((s) => s.community);
  const [section, setSection] = useState('info');
  const [joining, setJoining] = useState(false);

  const data = comp || selectedCompetition.data;

  useEffect(() => {
    if (open && data?.id) dispatch(fetchSubmissions({ id: data.id }));
  }, [open, data?.id, dispatch]);

  const handleJoin = async () => {
    if (!isLoggedIn) { onShowAuthModal?.('login'); return; }
    setJoining(true);
    try {
      await dispatch(joinCompetition(data.id)).unwrap();
      message.success('Joined! Good luck 🎉');
    } catch (e) { message.error(typeof e === 'string' ? e : 'Could not join'); }
    finally { setJoining(false); }
  };

  if (!data) return null;
  const cfg = STATUS_CFG[data.status] || STATUS_CFG.upcoming;

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); setSection('info'); }}
      placement="right"
      width={440}
      styles={{
        body: { background: '#0a0a14', padding: 0 },
        header: { background: '#0a0a14', borderBottom: '1px solid #12121e' },
        mask: { backdropFilter: 'blur(10px)', background: 'rgba(4,4,12,0.7)' },
      }}
      title={<span style={{ color: '#b0b0c8', fontSize: 13, fontWeight: 600 }}>Competition</span>}
      closeIcon={<RiCloseLine color="#28284e" size={18} />}
    >
      {/* Cover */}
      <div style={{ position: 'relative', height: 200 }}>
        <img src={data.coverImage || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800'} alt={data.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a14 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}><StatusBadge status={data.status} /></div>
      </div>

      <div style={{ padding: '20px 22px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e0e0f8', letterSpacing: '-0.02em', marginBottom: 6 }}>{data.title}</div>
        <div style={{ fontSize: 13, color: '#24244a', lineHeight: 1.6, marginBottom: 18 }}>{data.description}</div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Participants', v: (data._count?.participants ?? data.participantsCount ?? 0).toLocaleString(), c: '#6080ff' },
            { l: 'Prize Pool',   v: `${(data.prizePool || 0).toLocaleString()} 🪙`,                              c: '#d4a017' },
            { l: 'Submissions',  v: (data._count?.submissions ?? data.submissionsCount ?? 0).toLocaleString(),   c: '#3dd68c' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#1e1e3a', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Timer */}
        {data.status === 'live' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(61,214,140,0.06)', border: '1px solid rgba(61,214,140,0.12)', marginBottom: 16 }}>
            <RiTimeLine color="#3dd68c" size={14} />
            <span style={{ fontSize: 13, color: '#3dd68c', fontWeight: 600 }}>Ends in: <Countdown endsAt={data.endsAt} /></span>
          </div>
        )}

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 10, background: '#0e0e1a', marginBottom: 16 }}>
          {['info', 'prizes', 'submissions'].map(s => (
            <button key={s} onClick={() => setSection(s)} style={{
              flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.15s',
              background: section === s ? '#18182e' : 'transparent',
              color: section === s ? '#c0c0d8' : '#28284e',
            }}>{s}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
            {section === 'info' && (
              <div>
                {data.rules && (
                  <div style={{ fontSize: 13, color: '#888890', lineHeight: 1.7, padding: '12px 14px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a', marginBottom: 12, whiteSpace: 'pre-line' }}>
                    {data.rules}
                  </div>
                )}
                {[
                  { l: 'Category', v: data.category },
                  { l: 'Type', v: data.submissionType },
                  { l: 'Ends', v: new Date(data.endsAt).toLocaleString() },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #10101e', fontSize: 12 }}>
                    <span style={{ color: '#28284e' }}>{r.l}</span>
                    <span style={{ color: '#888898', fontWeight: 500, textTransform: 'capitalize' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            )}
            {section === 'prizes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.prizeBreakdown ? Object.entries(data.prizeBreakdown).map(([pos, coins]) => {
                  const medals = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };
                  return (
                    <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #14142a' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#c0c0d8' }}>{medals[pos] || '🏅'} {pos} Place</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#d4a017' }}>{coins.toLocaleString()} 🪙</span>
                    </div>
                  );
                }) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#28284e', fontSize: 13 }}>
                    Total pool: {(data.prizePool || 0).toLocaleString()} 🪙
                  </div>
                )}
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(96,128,255,0.06)', border: '1px solid rgba(96,128,255,0.12)', fontSize: 12, color: '#6080ff' }}>
                  All participants receive +5 XP badge
                </div>
              </div>
            )}
            {section === 'submissions' && (
              <div>
                {submissions.loading ? <Skeleton active /> :
                 submissions.list.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#22223a', fontSize: 13 }}>No submissions yet</div>
                 ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {submissions.list.slice(0, 8).map((sub, i) => {
                      const media = sub.post?.mediaUrl || sub.mediaUrl;
                      return (
                        <div key={sub.id} style={{ borderRadius: 10, overflow: 'hidden', background: '#0e0e1a', border: '1px solid #14142a' }}>
                          {media && <img src={media} alt="" style={{ width: '100%', height: 90, objectFit: 'cover' }} />}
                          <div style={{ padding: '8px 10px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#888898' }}>@{sub.user?.username}</div>
                            <div style={{ fontSize: 11, color: '#28284e' }}>▲ {sub.votesCount || 0}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        {data.status === 'live' && (
          <div style={{ marginTop: 20 }}>
            {selectedCompetition.userStatus?.hasSubmitted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 10, background: 'rgba(61,214,140,0.06)', border: '1px solid rgba(61,214,140,0.15)', color: '#3dd68c', fontSize: 13, fontWeight: 600 }}>
                <RiCheckboxCircleFill size={16} /> Entry Submitted
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: joining ? 'not-allowed' : 'pointer',
                  background: joining ? '#1a1a2e' : 'linear-gradient(90deg, #5a5aff, #7070ff)',
                  color: '#fff', fontSize: 14, fontWeight: 700, opacity: joining ? 0.6 : 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {selectedCompetition.userStatus?.hasJoined ? 'Submit Your Entry' : joining ? 'Joining…' : 'Join Competition'}
              </button>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CompetitionsPage = ({ isLoggedIn, onShowAuthModal }) => {
  const dispatch = useDispatch();
  const { competitions } = useSelector((s) => s.community);
  const [statusFilter, setStatusFilter] = useState('live');
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompetitions({ status: statusFilter || undefined, limit: 12 }));
  }, [dispatch, statusFilter]);

  const list = (competitions.list.length > 0 ? competitions.list : DUMMY_COMPS)
    .filter(c => !statusFilter || c.status === statusFilter)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  const handleClick = (comp) => {
    setSelectedComp(comp);
    if (comp.id && !comp.id.startsWith('c')) dispatch(fetchCompetitionDetails(comp.id));
    setDrawerOpen(true);
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <RiSearchLine size={14} color="#28284e" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search competitions…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a', color: '#c0c0d8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 10, background: '#0e0e1c', border: '1px solid #16162a' }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
              background: statusFilter === f.value ? '#18182e' : 'transparent',
              color: statusFilter === f.value ? '#c0c0d8' : '#28284e',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Count */}
      {list.length > 0 && (
        <div style={{ fontSize: 11, color: '#22223a', marginBottom: 16 }}>
          {list.filter(c => c.status === 'live').length} live · {list.length} total
        </div>
      )}

      {/* Grid */}
      {competitions.loading && competitions.list.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#0c0c18', border: '1px solid #14142a' }}>
              <div style={{ height: 160, background: '#111120' }} />
              <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 2 }} /></div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <RiSwordLine size={40} color="#14142a" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, color: '#22223a' }}>No competitions match this filter</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {list.map((comp, i) => (
            <CompCard key={comp.id} comp={comp} onClick={handleClick} index={i} />
          ))}
        </div>
      )}

      <CompDrawer
        comp={selectedComp}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedComp(null); dispatch(clearSelectedCompetition()); }}
        isLoggedIn={isLoggedIn}
        onShowAuthModal={onShowAuthModal}
      />
    </div>
  );
};

export default CompetitionsPage;
