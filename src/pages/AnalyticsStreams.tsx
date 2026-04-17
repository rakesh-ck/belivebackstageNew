import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight,
  ChevronDown,
  Calendar,
  Globe,
  Grid as GridIcon,
  Disc,
  Play
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for charts
const streamData = [
  { date: '2024-03-01', streams: 120000 },
  { date: '2024-03-02', streams: 150000 },
  { date: '2024-03-03', streams: 180000 },
  { date: '2024-03-04', streams: 160000 },
  { date: '2024-03-05', streams: 210000 },
  { date: '2024-03-06', streams: 250000 },
  { date: '2024-03-07', streams: 230000 },
];

const platformData = [
  { name: 'Spotify', value: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 30, color: '#FC3C44' },
  { name: 'YouTube', value: 15, color: '#FF0000' },
  { name: 'Amazon', value: 10, color: '#00A8E1' },
];

export const AnalyticsStreamsPage: React.FC = () => {
  const [period, setPeriod] = useState('28D');

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <FilterButton label="All territories" />
           <FilterButton label="All stores" />
           <div className="h-8 w-[1px] bg-gray-200 mx-2" />
           <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <Calendar size={16} />
              <span>Oct 14, 2023 - Nov 10, 2023</span>
           </button>
        </div>
        <div className="bg-white p-1 rounded-lg border border-gray-100 flex shadow-sm">
           {['7D', '28D', '90D', '365D'].map(p => (
             <button
               key={p}
               onClick={() => setPeriod(p)}
               className={cn(
                 "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                 period === p ? "bg-[#1976D2] text-white shadow-md shadow-blue-100" : "text-gray-400 hover:text-gray-600"
               )}
             >
               {p}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <LargeStatCard 
           label="Total streams" 
           value="8.7 M" 
           trend="+1%" 
           trendLabel="/ WEEK"
           isPositive={true}
         />
         <ReleaseStatCard 
           label="Most popular release"
           title="Midnight City"
           artist="M83"
           value="1.2M streams"
           trend="▲ +15%"
         />
         <ReleaseStatCard 
           label="Strongest release"
           title="Wait"
           artist="M83"
           value="850K streams"
           trend="▲ +22%"
         />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Overview</h3>
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
               <button className="px-4 py-1.5 text-xs font-bold bg-white text-[#1976D2] rounded shadow-sm">All streams</button>
               <button className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600">Total</button>
            </div>
         </div>
         
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streamData}>
                <defs>
                   <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976D2" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1976D2" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickFormatter={(v) => `${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="streams" 
                  stroke="#1976D2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorStreams)" 
                />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Grid: Top Stores & Territories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-gray-800">Top stores</h3>
               <button className="text-sm font-bold text-[#1976D2] hover:underline">See more</button>
            </div>
            <div className="space-y-4 flex-1">
               {platformData.map((p, i) => (
                 <div key={p.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="font-medium text-gray-600">#{i+1} {p.name}</span>
                       <span className="font-bold text-gray-800">{p.value}%</span>
                    </div>
                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                       <div 
                         className="h-full rounded-full" 
                         style={{ width: `${p.value}%`, backgroundColor: p.color }}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-gray-800">Top territories</h3>
               <button className="text-sm font-bold text-[#1976D2] hover:underline">See more</button>
            </div>
            <div className="space-y-4 flex-1">
               {[
                 { name: 'India', value: 42 },
                 { name: 'Canada', value: 28 },
                 { name: 'United Kingdom', value: 18 },
                 { name: 'Germany', value: 12 },
               ].map((t, i) => (
                 <div key={t.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="font-medium text-gray-600">#{i+1} {t.name}</span>
                       <span className="font-bold text-gray-800">{t.value}%</span>
                    </div>
                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                       <div 
                         className="h-full rounded-full bg-[#1976D2]" 
                         style={{ width: `${t.value}%` }}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex justify-center pt-8 border-t border-gray-100 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
         Last update: Spotify 2024-03-08
      </div>
    </div>
  );
};

const FilterButton: React.FC<{ label: string }> = ({ label }) => (
  <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
     {label}
     <ChevronDown size={14} className="text-gray-400" />
  </button>
);

const LargeStatCard: React.FC<{ label: string; value: string; trend: string; trendLabel: string; isPositive: boolean }> = ({ label, value, trend, trendLabel, isPositive }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</div>
     <div className="flex items-baseline gap-4">
        <div className="text-4xl font-bold text-gray-800">{value}</div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-bold",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trend}</span>
          <span className="text-gray-400 text-[10px] ml-1">{trendLabel}</span>
        </div>
     </div>
  </div>
);

const ReleaseStatCard: React.FC<{ label: string; title: string; artist: string; value: string; trend: string }> = ({ label, title, artist, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
     <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
        <img 
          src={`https://picsum.photos/seed/${title}/100/100`} 
          alt={title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
     </div>
     <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
        <h4 className="font-bold text-gray-800 line-clamp-1 truncate">{title}</h4>
        <div className="flex items-center justify-between mt-1">
           <span className="text-xs text-gray-400 truncate">{artist}</span>
           <span className="text-xs font-bold text-[#1976D2]">{value}</span>
        </div>
     </div>
  </div>
);
