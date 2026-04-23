import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mic2, TrendingUp, Music, DollarSign, ArrowUpRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/summary', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div className="relative h-[240px] rounded-xl overflow-hidden shadow-lg group">
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Dashboard Hero" 
          className="w-full h-full object-cover brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Mic2 className="text-white" size={24} />
             </div>
             <h2 className="text-4xl font-bold">Welcome, {user?.name || 'Artist'}</h2>
          </div>
          <p className="text-xl text-white/80 max-w-xl">
            Welcome back to Backstage! Manage your music, track performance, and grow your audience all in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Streams" 
          value={stats?.totalStreams || '—'} 
          trend={stats?.trends?.streams || '—'} 
          icon={<TrendingUp size={20} className="text-blue-500" />}
        />
        <StatCard 
          title="Active Releases" 
          value={stats?.activeReleases?.toString() || '0'} 
          trend={`+${stats?.activeReleases || 0}`} 
          icon={<Music size={20} className="text-purple-500" />}
        />
        <StatCard 
          title="Royalties (Current)" 
          value={stats?.royalties || '$0'} 
          trend={stats?.trends?.royalties || '—'} 
          icon={<DollarSign size={20} className="text-green-500" />}
        />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-10">
        <div className="flex-1 space-y-4">
           <h3 className="text-xl font-bold text-gray-800">Performance Overview</h3>
           <p className="text-gray-500 text-sm">Your catalog is growing! You've delivered {stats?.deliveredReleases || 0} releases successfully this month.</p>
           <button className="px-6 py-2 bg-[#1976D2] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
              View full analytics
              <ArrowUpRight size={14} />
           </button>
        </div>
        <div className="hidden lg:block w-64 h-32 relative">
           {/* Mock sparkline */}
           <div className="absolute inset-0 flex items-end gap-1 px-4">
              {[40, 70, 45, 90, 65, 85, 55, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-50 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode }> = ({ title, value, trend, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">{trend}</div>
    </div>
  </div>
);
