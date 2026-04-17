import React from 'react';
import { Users, Disc, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', users: 24, releases: 12 },
  { name: 'Tue', users: 32, releases: 18 },
  { name: 'Wed', users: 28, releases: 15 },
  { name: 'Thu', users: 45, releases: 22 },
  { name: 'Fri', users: 52, releases: 28 },
  { name: 'Sat', users: 38, releases: 20 },
  { name: 'Sun', users: 42, releases: 25 },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
       <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500">Welcome back, here's what's happening across the platform today.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard label="Total Users" value="1,240" trend="+12%" icon={<Users className="text-blue-500" />} />
          <AdminStatCard label="Total Releases" value="4,582" trend="+8%" icon={<Disc className="text-purple-500" />} />
          <AdminStatCard label="Delivered" value="3,912" trend="+15%" icon={<CheckCircle2 className="text-green-500" />} />
          <AdminStatCard label="Rights Issues" value="12" trend="-4%" icon={<AlertCircle className="text-red-500" />} isNegative />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">User Growth</h3>
                <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                   <TrendingUp size={16} />
                   <span>+24% vs last month</span>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Release Submissions</h3>
                <div className="flex items-center gap-2 text-purple-500 font-bold text-sm">
                   <TrendingUp size={16} />
                   <span>+18% vs last month</span>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <Tooltip cursor={{ fill: '#F9FAFB' }} />
                      <Bar dataKey="releases" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  );
};

const AdminStatCard: React.FC<{ label: string; value: string; trend: string; icon: React.ReactNode; isNegative?: boolean }> = ({ label, value, trend, icon, isNegative }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
     <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
           {icon}
        </div>
        <div className={clsx(
          "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
          isNegative ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
        )}>
          {trend}
          <ArrowUpRight size={12} className={isNegative ? "rotate-90" : ""} />
        </div>
     </div>
     <div className="mt-4">
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</div>
     </div>
  </div>
);
