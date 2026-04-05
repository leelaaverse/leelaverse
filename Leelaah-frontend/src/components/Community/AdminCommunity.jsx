import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal, Form, Input, InputNumber, Select, DatePicker,
  Switch, message, Skeleton, Tag, Tooltip, Rate,
} from 'antd';
import {
  RiDashboardLine, RiSwordLine, RiMedalLine, RiLayoutGridLine,
  RiGiftLine, RiTrophyLine, RiAddLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiCloseLine, RiFireFill, RiGroupLine, RiStarFill,
  RiAlertLine, RiRefreshLine, RiShieldStarLine, RiCoinsLine,
} from 'react-icons/ri';
import api from '../../services/api';
import Navbar from '../Navbar/Navbar';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ── Shared helpers ─────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  live:      { color: '#10b981', bg: '#0a2218' },
  upcoming:  { color: '#6366f1', bg: '#0f0f28' },
  judging:   { color: '#f59e0b', bg: '#261a00' },
  completed: { color: '#60607a', bg: '#1a1a1a' },
  cancelled: { color: '#ef4444', bg: '#200808' },
};

const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
    style={{ background: 'linear-gradient(145deg, #13131f 0%, #0d0d18 100%)', border: '1px solid #1e1e2e', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
  >
    <div className="flex items-start justify-between mb-6">
      <div className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6a6a8e' }}>{label}</div>
      {Icon && <div className="p-2 rounded-xl" style={{background: `${color}15`}}><Icon size={24} color={color} /></div>}
    </div>
    <div>
      <div className="text-5xl font-black mb-2" style={{ color }}>{value ?? '—'}</div>
      {sub && <div className="text-sm font-medium" style={{ color: '#40406a' }}>{sub}</div>}
    </div>
  </motion.div>
);

// ── Overview Tab ───────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, loading }) => {
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-3xl p-8" style={{ background: '#13131f', border: '1px solid #1e1e2e' }}><Skeleton active paragraph={{ rows: 1 }} /></div>)}</div>;
  if (!stats) return <p style={{ color: '#40406a' }}>No stats available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <StatCard label="Total Competitions" value={stats.totalCompetitions} sub={`${stats.activeCompetitions} active`} color="#6366f1" icon={RiSwordLine} />
      <StatCard label="Total Participants" value={stats.totalParticipants?.toLocaleString()} sub="Across all competitions" color="#10b981" icon={RiGroupLine} />
      <StatCard label="Submissions" value={stats.totalSubmissions?.toLocaleString()} color="#f59e0b" icon={RiTrophyLine} />
      <StatCard label="Badges Awarded" value={stats.totalBadgesAwarded?.toLocaleString()} color="#ec4899" icon={RiMedalLine} />
      <StatCard label="Templates" value={stats.totalTemplates?.toLocaleString()} color="#a78bfa" icon={RiLayoutGridLine} />
      <StatCard label="Live Now" value={stats.activeCompetitions} sub="Competitions running" color="#10b981" icon={RiFireFill} />
    </div>
  );
};

// ── Competitions Tab ───────────────────────────────────────────────────────────

const CompetitionsTab = () => {
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editComp, setEditComp] = useState(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminCommunity.getCompetitions({ limit: 50 });
      setComps(res.data.data.competitions || []);
    } catch { message.error('Failed to load competitions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (vals) => {
    try {
      const payload = {
        ...vals,
        startsAt: vals.dateRange?.[0]?.toISOString(),
        endsAt: vals.dateRange?.[1]?.toISOString(),
        prizePool: vals.prizePool || 0,
      };
      delete payload.dateRange;
      await api.adminCommunity.createCompetition(payload);
      message.success('Competition created!');
      setCreating(false);
      form.resetFields();
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.adminCommunity.updateCompetition(id, data);
      message.success('Updated!');
      setEditComp(null);
      load();
    } catch { message.error('Failed to update'); }
  };

  const handleFinalize = async (id) => {
    Modal.confirm({
      title: 'Finalize Competition',
      content: 'This will distribute prizes to top submissions. Continue?',
      okText: 'Finalize',
      okButtonProps: { style: { background: '#6366f1', border: 'none' } },
      cancelButtonProps: { style: { background: '#13131f', border: '1px solid #1e1e2e', color: '#a0a0b8' } },
      onOk: async () => {
        try {
          await api.adminCommunity.finalizeCompetition(id);
          message.success('Prizes distributed!');
          load();
        } catch { message.error('Failed to finalize'); }
      },
    });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Competition',
      content: 'This is permanent. All data will be lost.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.adminCommunity.deleteCompetition(id);
          message.success('Deleted');
          load();
        } catch { message.error('Failed to delete'); }
      },
    });
  };

  const statusCfg = (s) => STATUS_COLOR[s] || STATUS_COLOR.upcoming;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <span className="text-sm" style={{ color: '#40406a' }}>{comps.length} competitions</span>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#6366f1', color: '#fff', border: 'none' }}
        >
          <RiAddLine size={16} /> New Competition
        </button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e2e' }}>
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#13131f' }}>
              <tr>
                {['Title', 'Status', 'Participants', 'Prize', 'Ends', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#40406a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: '#0d0d18' }}>
              {comps.map((comp) => {
                const cfg = statusCfg(comp.status);
                return (
                  <tr key={comp.id} className="border-t transition-colors hover:bg-white/2" style={{ borderColor: '#1e1e2e' }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold" style={{ color: '#e8e8f0' }}>{comp.title}</div>
                      <div className="text-xs truncate max-w-xs" style={{ color: '#40406a' }}>{comp.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#a0a0b8' }}>
                      {comp._count?.participants ?? comp.participantsCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: '#f59e0b' }}>🪙 {comp.prizePool?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#40406a' }}>
                      {comp.endsAt ? new Date(comp.endsAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {comp.status !== 'completed' && (
                          <Tooltip title="Finalize & Distribute Prizes">
                            <button
                              onClick={() => handleFinalize(comp.id)}
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: '#0a2218', border: '1px solid #10b98130', color: '#10b981' }}
                            >
                              <RiCheckLine size={14} />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Status">
                          <select
                            defaultValue={comp.status}
                            onChange={(e) => handleUpdate(comp.id, { status: e.target.value })}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: '#13131f', color: '#a0a0b8', border: '1px solid #1e1e2e' }}
                          >
                            {['upcoming', 'live', 'judging', 'completed', 'cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button
                            onClick={() => handleDelete(comp.id)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#200808', border: '1px solid #ef444430', color: '#ef4444' }}
                          >
                            <RiDeleteBinLine size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={creating}
        onCancel={() => { setCreating(false); form.resetFields(); }}
        footer={null}
        title={<span style={{ color: '#e8e8f0' }}>Create Competition</span>}
        styles={{ content: { background: '#0d0d18', border: '1px solid #1e1e2e' }, header: { background: '#0d0d18' }, mask: { backdropFilter: 'blur(4px)' } }}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="title" label={<span style={{ color: '#a0a0b8' }}>Title</span>} rules={[{ required: true }]}>
            <Input style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
          </Form.Item>
          <Form.Item name="description" label={<span style={{ color: '#a0a0b8' }}>Description</span>} rules={[{ required: true }]}>
            <TextArea rows={3} style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="category" label={<span style={{ color: '#a0a0b8' }}>Category</span>} rules={[{ required: true }]}>
              <Select style={{ background: '#13131f' }}>
                {['ai-art', 'storytelling', 'video', 'music'].map(c => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="submissionType" label={<span style={{ color: '#a0a0b8' }}>Submission Type</span>} rules={[{ required: true }]}>
              <Select>
                {['image', 'video', 'text', 'any'].map(t => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="dateRange" label={<span style={{ color: '#a0a0b8' }}>Start → End</span>} rules={[{ required: true }]}>
            <RangePicker showTime style={{ width: '100%', background: '#13131f', border: '1px solid #1e1e2e' }} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="prizePool" label={<span style={{ color: '#a0a0b8' }}>Prize Pool 🪙</span>}>
              <InputNumber min={0} style={{ width: '100%', background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
            <Form.Item name="coverImage" label={<span style={{ color: '#a0a0b8' }}>Cover Image URL</span>}>
              <Input style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
          </div>
          <Form.Item name="rules" label={<span style={{ color: '#a0a0b8' }}>Rules</span>}>
            <TextArea rows={2} style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => { setCreating(false); form.resetFields(); }}
              className="px-4 py-2 rounded-xl text-sm" style={{ background: '#13131f', color: '#a0a0b8', border: '1px solid #1e1e2e' }}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#6366f1', color: '#fff', border: 'none' }}>
              Create
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// ── Badges Tab ─────────────────────────────────────────────────────────────────

const BadgesTab = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminCommunity.getBadges();
      setBadges(res.data.data || []);
    } catch { message.error('Failed to load badges'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (vals) => {
    try {
      const req = { ...vals, requirement: { type: vals.requirementType, value: vals.requirementValue } };
      delete req.requirementType; delete req.requirementValue;
      await api.adminCommunity.createBadge(req);
      message.success('Badge created!');
      setCreating(false);
      form.resetFields();
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to create badge');
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.adminCommunity.updateBadge(id, { isActive });
      message.success(isActive ? 'Badge activated' : 'Badge deactivated');
      load();
    } catch { message.error('Failed to update'); }
  };

  const RARITY_COLOR = { common: '#a0a0b8', uncommon: '#10b981', rare: '#6366f1', epic: '#a78bfa', legendary: '#f59e0b' };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <span className="text-sm" style={{ color: '#40406a' }}>{badges.length} badges</span>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#ec4899', color: '#fff', border: 'none' }}>
          <RiAddLine size={16} /> New Badge
        </button>
      </div>

      {loading ? <Skeleton active /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="rounded-2xl p-4 flex flex-col items-center text-center"
              style={{ background: '#13131f', border: '1px solid #1e1e2e' }}>
              {badge.iconUrl ? (
                <img src={badge.iconUrl} alt={badge.displayName} className="w-14 h-14 rounded-xl object-contain mb-3" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 text-2xl"
                  style={{ background: '#0d0d18' }}>🏅</div>
              )}
              <div className="font-bold text-sm mb-1" style={{ color: '#e8e8f0' }}>{badge.displayName}</div>
              <div className="text-xs mb-2" style={{ color: '#40406a' }}>{badge.category}</div>
              <div className="text-xs font-semibold mb-3"
                style={{ color: RARITY_COLOR[badge.rarity] || '#a0a0b8' }}>
                {badge.rarity}
              </div>
              <div className="flex gap-2 text-xs mb-3">
                <span style={{ color: '#f59e0b' }}>🪙 {badge.coinReward}</span>
                <span style={{ color: '#a78bfa' }}>✦ {badge.xpReward} XP</span>
              </div>
              <div className="flex items-center justify-between w-full pt-2" style={{ borderTop: '1px solid #1e1e2e' }}>
                <span className="text-xs" style={{ color: '#30305a' }}>
                  {badge._count?.earnedBy || 0} earned
                </span>
                <Switch
                  checked={badge.isActive}
                  onChange={(v) => handleToggle(badge.id, v)}
                  size="small"
                  style={{ background: badge.isActive ? '#10b981' : '#30305a' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onCancel={() => { setCreating(false); form.resetFields(); }}
        footer={null}
        title={<span style={{ color: '#e8e8f0' }}>Create Badge</span>}
        styles={{ content: { background: '#0d0d18', border: '1px solid #1e1e2e' }, header: { background: '#0d0d18' }, mask: { backdropFilter: 'blur(4px)' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="name" label={<span style={{ color: '#a0a0b8' }}>Name (slug)</span>} rules={[{ required: true }]}>
              <Input placeholder="first_post" style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
            <Form.Item name="displayName" label={<span style={{ color: '#a0a0b8' }}>Display Name</span>} rules={[{ required: true }]}>
              <Input placeholder="First Post!" style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
          </div>
          <Form.Item name="description" label={<span style={{ color: '#a0a0b8' }}>Description</span>} rules={[{ required: true }]}>
            <Input style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="category" label={<span style={{ color: '#a0a0b8' }}>Category</span>} rules={[{ required: true }]}>
              <Select>
                {['posting', 'engagement', 'competition', 'milestone', 'special'].map(c => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="rarity" label={<span style={{ color: '#a0a0b8' }}>Rarity</span>} initialValue="common">
              <Select>
                {['common', 'uncommon', 'rare', 'epic', 'legendary'].map(r => <Option key={r} value={r}>{r}</Option>)}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="requirementType" label={<span style={{ color: '#a0a0b8' }}>Requirement Type</span>} rules={[{ required: true }]}>
              <Select>
                {['post_count', 'like_count', 'streak_days', 'comp_wins', 'xp_total'].map(t => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="requirementValue" label={<span style={{ color: '#a0a0b8' }}>Requirement Value</span>} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%', background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="coinReward" label={<span style={{ color: '#a0a0b8' }}>Coin Reward</span>} initialValue={0}>
              <InputNumber min={0} style={{ width: '100%', background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
            <Form.Item name="xpReward" label={<span style={{ color: '#a0a0b8' }}>XP Reward</span>} initialValue={0}>
              <InputNumber min={0} style={{ width: '100%', background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
            </Form.Item>
          </div>
          <Form.Item name="iconUrl" label={<span style={{ color: '#a0a0b8' }}>Icon URL</span>}>
            <Input style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#e8e8f0' }} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setCreating(false); form.resetFields(); }}
              className="px-4 py-2 rounded-xl text-sm" style={{ background: '#13131f', color: '#a0a0b8', border: '1px solid #1e1e2e' }}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#ec4899', color: '#fff', border: 'none' }}>
              Create
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// ── Rewards Tab ────────────────────────────────────────────────────────────────

const RewardsTab = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminCommunity.getRewards();
      setRewards(res.data.data || []);
    } catch { message.error('Failed to load rewards'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (key, vals) => {
    try {
      await api.adminCommunity.updateReward(key, vals);
      message.success('Reward updated!');
      setEditing(null);
      load();
    } catch { message.error('Failed to update reward'); }
  };

  return (
    <div>
      <p className="text-xs mb-5" style={{ color: '#40406a' }}>
        Tune how many coins and XP users earn for each action.
      </p>
      {loading ? <Skeleton active /> : (
        <div className="flex flex-col gap-3">
          {rewards.map((reward) => (
            <div key={reward.key} className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{ background: '#13131f', border: '1px solid #1e1e2e' }}>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: '#e8e8f0' }}>
                  {reward.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                {reward.description && (
                  <div className="text-xs mt-0.5" style={{ color: '#40406a' }}>{reward.description}</div>
                )}
              </div>

              {editing === reward.key ? (
                <Form
                  initialValues={{ coinReward: reward.coinReward, xpReward: reward.xpReward }}
                  onFinish={(vals) => handleSave(reward.key, vals)}
                  layout="inline"
                  className="flex items-center gap-2"
                >
                  <Form.Item name="coinReward" noStyle>
                    <InputNumber
                      min={0}
                      prefix="🪙"
                      size="small"
                      style={{ width: 90, background: '#0d0d18', border: '1px solid #f59e0b40', borderRadius: 8, color: '#e8e8f0' }}
                    />
                  </Form.Item>
                  <Form.Item name="xpReward" noStyle>
                    <InputNumber
                      min={0}
                      prefix="✦"
                      size="small"
                      style={{ width: 90, background: '#0d0d18', border: '1px solid #a78bfa40', borderRadius: 8, color: '#e8e8f0' }}
                    />
                  </Form.Item>
                  <button type="submit" className="p-1.5 rounded-lg" style={{ background: '#10b981', color: '#fff', border: 'none' }}>
                    <RiCheckLine size={14} />
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg"
                    style={{ background: '#200808', color: '#ef4444', border: 'none' }}>
                    <RiCloseLine size={14} />
                  </button>
                </Form>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>🪙 {reward.coinReward}</span>
                  <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>✦ {reward.xpReward} XP</span>
                  <Switch
                    checked={reward.isActive}
                    onChange={(v) => handleSave(reward.key, { isActive: v })}
                    size="small"
                    style={{ background: reward.isActive ? '#10b981' : '#30305a' }}
                  />
                  <button onClick={() => setEditing(reward.key)} className="p-1.5 rounded-lg transition-all"
                    style={{ background: '#13131f', border: '1px solid #1e1e2e', color: '#a0a0b8' }}>
                    <RiEditLine size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Templates Admin Tab ────────────────────────────────────────────────────────

const TemplatesAdminTab = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.community.getTemplates({ limit: 50, sort: 'newest' });
      setTemplates(res.data.data.templates || []);
    } catch { message.error('Failed to load templates'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <p className="text-xs mb-5" style={{ color: '#40406a' }}>{templates.length} total templates</p>
      {loading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e2e' }}>
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#13131f' }}>
              <tr>
                {['Template', 'Category', 'Creator', 'Rating', 'Uses', 'Featured'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#40406a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: '#0d0d18' }}>
              {templates.map((tpl) => (
                <tr key={tpl.id} className="border-t" style={{ borderColor: '#1e1e2e' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {tpl.thumbnailUrl && (
                        <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-semibold" style={{ color: '#e8e8f0' }}>{tpl.name}</div>
                        <div className="text-xs truncate max-w-xs" style={{ color: '#40406a' }}>{tpl.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize" style={{ color: '#a0a0b8' }}>{tpl.category}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a0a0b8' }}>@{tpl.creator?.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <RiStarFill color="#f59e0b" size={12} />
                      <span className="text-xs" style={{ color: '#a0a0b8' }}>{(tpl.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a0a0b8' }}>{tpl.usageCount?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tpl.isFeatured ? 'text-yellow-400' : 'text-zinc-600'}`}
                      style={{ background: tpl.isFeatured ? '#261a00' : '#1a1a1a' }}>
                      {tpl.isFeatured ? '⭐ Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Leaderboard Admin Tab ──────────────────────────────────────────────────────

const LeaderboardAdminTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.adminCommunity.getLeaderboard({ limit: 30 });
        setUsers(res.data.data.users || []);
      } catch { message.error('Failed to load leaderboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  const TIER_COLOR = { bronze: '#cd7f32', silver: '#a0a0b8', gold: '#f59e0b', platinum: '#60d0ff', diamond: '#a78bfa' };

  return (
    <div>
      {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e2e' }}>
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#13131f' }}>
              <tr>
                {['#', 'Creator', 'Tier', 'XP', 'Score', 'Streak', 'Wins'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#40406a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: '#0d0d18' }}>
              {users.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: '#1e1e2e' }}>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: u.rank <= 3 ? '#f59e0b' : '#40406a' }}>
                    {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        className="w-8 h-8 rounded-lg object-cover" alt={u.username} />
                      <span className="font-semibold text-sm" style={{ color: '#e8e8f0' }}>{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize" style={{ color: TIER_COLOR[u.creatorTier] || '#a0a0b8' }}>
                      {u.creatorTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#a78bfa' }}>{u.creatorXP?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a0a0b8' }}>{u.creatorScore?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: u.currentStreak > 0 ? '#f59e0b' : '#30305a' }}>
                    {u.currentStreak > 0 ? `🔥 ${u.currentStreak}d` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a0a0b8' }}>{u.competitionsWon || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main Admin Panel ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',      label: 'Overview',     icon: RiDashboardLine },
  { key: 'competitions',  label: 'Competitions', icon: RiSwordLine },
  { key: 'badges',        label: 'Badges',       icon: RiMedalLine },
  { key: 'templates',     label: 'Templates',    icon: RiLayoutGridLine },
  { key: 'rewards',       label: 'Rewards',      icon: RiCoinsLine },
  { key: 'leaderboard',   label: 'Leaderboard',  icon: RiTrophyLine },
];

const AdminCommunity = ({ onShowAuthModal }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      (async () => {
        setStatsLoading(true);
        try {
          const res = await api.adminCommunity.getStats();
          setStats(res.data.data);
        } catch { console.error('Failed to fetch admin stats'); }
        finally { setStatsLoading(false); }
      })();
    }
  }, [isAdmin]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center">
          <RiShieldStarLine size={48} color="#20204a" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-3" style={{ color: '#e8e8f0' }}>Authentication Required</h2>
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#6366f1', color: '#fff' }}
            onClick={() => onShowAuthModal?.('login')}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center">
          <RiAlertLine size={48} color="#ef4444" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold" style={{ color: '#e8e8f0' }}>Unauthorized</h2>
          <p className="text-sm mt-1" style={{ color: '#40406a' }}>Admin access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e8e8f0' }}>
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <RiShieldStarLine size={20} color="#6366f1" />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#6366f1' }}>Admin Panel</span>
          </div>
          <h1 className="text-5xl font-black mb-3" style={{ color: '#f0f0fa' }}>Community Management</h1>
          <p className="text-base" style={{ color: '#6a6a8e' }}>Manage competitions, badges, templates and reward rates.</p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl mb-12" style={{ background: '#13131f', border: '1px solid #1e1e2e', width: 'fit-content' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === key ? '#1e1e2e' : 'transparent',
                color: activeTab === key ? '#e8e8f0' : '#40406a',
              }}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview'     && <OverviewTab stats={stats} loading={statsLoading} />}
            {activeTab === 'competitions' && <CompetitionsTab />}
            {activeTab === 'badges'       && <BadgesTab />}
            {activeTab === 'templates'    && <TemplatesAdminTab />}
            {activeTab === 'rewards'      && <RewardsTab />}
            {activeTab === 'leaderboard'  && <LeaderboardAdminTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminCommunity;
