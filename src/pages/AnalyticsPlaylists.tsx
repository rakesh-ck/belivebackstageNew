import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Music2, 
  Play, 
  Plus, 
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const playlistData = [
  { name: 'Today\'s Top Hits', platform: 'Spotify', listeners: 45000, color: '#1DB954' },
  { name: 'New Music Daily', platform: 'Apple Music', listeners: 32000, color: '#FC3C44' },
  { name: 'RapCaviar', platform: 'Spotify', listeners: 28000, color: '#1DB954' },
  { name: 'A-List: Pop', platform: 'Apple Music', listeners: 22000, color: '#FC3C44' },
  { name: 'Viral 50', platform: 'Spotify', listeners: 15000, color: '#1DB954' },
];

export const AnalyticsPlaylistsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Playlists & Charts</h2>
        <p className="text-sm text-gray-500">Monitor your presence on global curated playlists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Active Playlist Placements</h3>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Search playlists..." className="text-sm focus:outline-none" />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
             {playlistData.map((p, i) => (
               <div key={i} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                        <Music2 size={24} className="text-gray-400" />
                     </div>
                     <div>
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.platform}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-12">
                     <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">{p.listeners.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Active Listeners</div>
                     </div>
                     <button className="p-2 text-[#1976D2] hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <ArrowUpRight size={20} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-2xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Growth Opportunity</div>
                 <h4 className="text-xl font-bold leading-tight">Pitch your release to playlist editors</h4>
                 <p className="text-white/80 text-sm">Our AI analyzes your tracks to find the best curated matches.</p>
                 <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors">
                    Start Pitching
                 </button>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                 <Play size={160} fill="white" />
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800">Platform Split</h3>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={playlistData}>
                       <XAxis dataKey="platform" hide />
                       <Tooltip cursor={{fill: 'transparent'}} />
                       <Bar dataKey="listeners" radius={[4, 4, 0, 0]}>
                          {playlistData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
