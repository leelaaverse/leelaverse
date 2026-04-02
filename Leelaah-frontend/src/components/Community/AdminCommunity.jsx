import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../Navbar/Navbar';

const AdminCommunity = ({ onShowAuthModal }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // VERY minimal fallback for admin check
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Direct raw API calls since these aren't in Redux
      const [statsRes, compRes, badgeRes] = await Promise.all([
        api.get('/api/admin/community/stats'),
        api.get('/api/community/competitions?status=all'), // We can reuse public for list, or make an admin one
        api.get('/api/admin/community/badges')
      ]);
      setStats(statsRes.data.data);
      setCompetitions(compRes.data.data.competitions);
      setBadges(badgeRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const finalizeCompetition = async (id) => {
    if (!window.confirm('Are you sure you want to finalize this competition and distribute rewards?')) return;
    try {
      await api.post(`/api/admin/community/competitions/${id}/finalize`);
      alert('Competition Finalized!');
      fetchAdminData(); // Refresh
    } catch (e) {
      alert('Failed to finalize');
      console.error(e);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 text-center">
        <h2>Please log in to access this page.</h2>
        <button className="mt-4 bg-fuchsia-600 px-6 py-2 rounded-full" onClick={() => onShowAuthModal('login')}>Log In</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 text-center">
        <h2>Unauthorized. Admin access only.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar isLoggedIn={isLoggedIn} />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-fuchsia-500">
            Community Admin Panel
          </h1>
          <div className="flex gap-2 bg-zinc-900 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('competitions')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'competitions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Competitions
            </button>
            <button 
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'badges' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Badges
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-zinc-900/80 rounded-xl w-full" />
            <div className="h-64 bg-zinc-900/80 rounded-xl w-full" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
          >
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="text-zinc-400 text-sm mb-2">Total Competitions</div>
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalCompetitions}</div>
                  <div className="text-emerald-400 text-xs">{stats.activeCompetitions} Active Currently</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="text-zinc-400 text-sm mb-2">Total Participants</div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">{stats.totalParticipants}</div>
                  <div className="text-zinc-500 text-xs">Across all competitions</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="text-zinc-400 text-sm mb-2">Badges Awarded</div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalBadgesAwarded}</div>
                  <div className="text-zinc-500 text-xs">Total milestones hit</div>
                </div>
              </div>
            )}

            {activeTab === 'competitions' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-800/50 text-zinc-400 text-sm border-b border-zinc-800">
                    <tr>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Participants</th>
                      <th className="p-4 font-semibold">Prize Pool</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {competitions.map(comp => (
                      <tr key={comp.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{comp.title}</div>
                          <div className="text-xs text-zinc-500 max-w-sm truncate">{comp.description}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                            comp.status === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            comp.status === 'completed' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-300">{comp._count?.participants || comp.participantsCount || 0}</td>
                        <td className="p-4 text-yellow-500">🪙 {comp.prizePool}</td>
                        <td className="p-4 text-right">
                          {comp.status !== 'completed' && (
                            <button 
                              onClick={() => finalizeCompetition(comp.id)}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Finalize
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
                    <img src={badge.iconUrl || `https://ui-avatars.com/api/?name=${badge.displayName}&background=random`} alt={badge.name} className="w-16 h-16 rounded-lg mb-3" />
                    <div className="font-bold text-white mb-1">{badge.displayName}</div>
                    <div className="text-xs text-zinc-400 mb-3 line-clamp-2">{badge.description}</div>
                    
                    <div className="mt-auto w-full flex justify-between items-center text-xs border-t border-zinc-800 pt-3">
                      <span className="text-zinc-500">{badge.category}</span>
                      <span className="text-yellow-500">🪙 {badge.coinReward}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminCommunity;
