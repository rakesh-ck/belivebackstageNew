import React from 'react';

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="relative h-[240px] rounded-xl overflow-hidden shadow-lg group">
        <img 
          src="https://picsum.photos/seed/studio/1200/400" 
          alt="Dashboard Hero" 
          className="w-full h-full object-cover brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
             </div>
             <h2 className="text-4xl font-bold">Welcome, John Doe</h2>
          </div>
          <p className="text-xl text-white/80 max-w-xl">
            Welcome back to Backstage! Manage your music, track performance, and grow your audience all in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for Phase 1/3 */}
        <StatCard title="Total Streams" value="1.2M" trend="+12.5%" />
        <StatCard title="Active Releases" value="24" trend="+2" />
        <StatCard title="Royalties (Current)" value="$4,520" trend="+8.4%" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Performance Overview</h3>
        <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 italic">
          Analytics chart will be implemented in Phase 7
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; trend: string }> = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">{title}</div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">{trend}</div>
    </div>
  </div>
);
