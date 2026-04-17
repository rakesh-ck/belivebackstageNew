import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  ChevronDown, 
  ArrowRight,
  Youtube,
  Globe,
  Flame,
  Droplets,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RightsManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'analytics' | 'resources'>('pending');
  const [platform, setPlatform] = useState('YouTube');

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Rights Manager</h2>
          <button className="px-6 py-2.5 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
             Send request form
          </button>
       </div>

       {/* Tabs */}
       <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-widest",
              activeTab === 'pending' ? "bg-[#1976D2] text-white shadow-lg shadow-blue-100" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            )}
          >
            Pending rights issues
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-widest",
              activeTab === 'analytics' ? "bg-[#1976D2] text-white shadow-lg shadow-blue-100" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            )}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-widest",
              activeTab === 'resources' ? "bg-[#1976D2] text-white shadow-lg shadow-blue-100" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            )}
          >
            Resources
          </button>
       </div>

       {activeTab === 'pending' && (
         <div className="space-y-6">
            {/* Platform Filters */}
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setPlatform('YouTube')}
                 className={cn(
                   "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold",
                   platform === 'YouTube' ? "border-red-500 bg-red-50 text-red-600" : "border-gray-100 bg-white text-gray-400"
                 )}
               >
                  <Youtube size={20} />
                  <span>YouTube [6] [0]</span>
                  {platform === 'YouTube' && <Flame size={16} className="text-red-500 fill-red-500" />}
               </button>
               <button 
                 onClick={() => setPlatform('Other')}
                 className={cn(
                   "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold",
                   platform === 'Other' ? "border-[#1976D2] bg-blue-50 text-[#1976D2]" : "border-gray-100 bg-white text-gray-400"
                 )}
               >
                  <Globe size={20} />
                  <span>All platform issues</span>
               </button>
            </div>

            {/* Main Filters */}
            <div className="flex flex-wrap items-center gap-4">
               <FilterDropdown label="My action" value="All (8)" />
               <FilterDropdown label="Category" value="All (8)" />
               <FilterDropdown label="Label" value="All" />
               <FilterDropdown label="Artist" value="All" />
            </div>

            {/* Issues Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-[#F5F5F5]">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                           <th className="px-6 py-4">Store</th>
                           <th className="px-6 py-4">Category</th>
                           <th className="px-6 py-4">Asset</th>
                           <th className="px-6 py-4">Release</th>
                           <th className="px-6 py-4">UPC / Partner</th>
                           <th className="px-6 py-4">Daily Views</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                             <td className="px-6 py-4">
                                <Youtube size={20} className="text-red-600" />
                             </td>
                             <td className="px-6 py-4">
                                <span className="text-xs font-bold text-gray-800">Copyright Check</span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-sm font-bold text-[#1976D2] hover:underline">Midnight City (Official Video)</div>
                                <div className="text-xs text-gray-400">M83 / AS-12345</div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-sm text-gray-800">Midnight City - EP</div>
                                <div className="text-xs text-gray-400">Naïve</div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-xs text-gray-800 font-medium">UPC: 1234567890</div>
                                <div className="text-xs text-gray-400">Warner Music Group</div>
                             </td>
                             <td className="px-6 py-4 font-bold text-gray-800">12.4K</td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <StatusBadge status={i % 3 === 0 ? 'new' : i % 3 === 1 ? 'pending' : 'resolved'} />
                                   {i % 2 === 0 && <Flame size={14} className="text-red-500" />}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-600" />
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               {/* Pagination */}
               <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Showing 1 to 6 of 8 results</span>
                  <div className="flex gap-2">
                     <button className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                        <ChevronLeft size={18} />
                     </button>
                     <button className="w-10 h-10 flex items-center justify-center bg-[#1976D2] text-white rounded-lg font-bold text-sm">1</button>
                     <button className="p-2 border border-gray-200 rounded-lg hover:bg-white">
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
            </div>
         </div>
       )}

       {activeTab === 'resources' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Understanding Content ID",
              "How to dispute a claim",
              "Guidelines for cover songs",
              "Managing YouTube permissions",
              "Global rights territories explain",
              "Filing a takedown request"
            ].map(article => (
              <div key={article} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                 <div className="w-12 h-12 bg-blue-50 text-[#1976D2] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1976D2] group-hover:text-white transition-colors">
                    <Info size={24} />
                 </div>
                 <h4 className="font-bold text-gray-800 mb-2">{article}</h4>
                 <p className="text-sm text-gray-400 line-clamp-2">Learn more about our policies and how to manage your intellectual property on various platforms.</p>
                 <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1976D2] uppercase tracking-widest">
                    Read more
                    <ArrowRight size={14} />
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

const FilterDropdown: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <button className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
     <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">{label}</span>
     <span className="text-sm font-bold text-gray-800">{value}</span>
     <ChevronDown size={14} className="text-gray-400" />
  </button>
);

const StatusBadge: React.FC<{ status: 'new' | 'pending' | 'rejected' | 'resolved' }> = ({ status }) => {
  const styles = {
    new: "text-[#1976D2] font-bold",
    pending: "bg-orange-50 text-orange-500 border-orange-100 px-3 py-1 rounded-full",
    rejected: "bg-red-50 text-red-500 border-red-100 px-3 py-1 rounded-full",
    resolved: "bg-green-50 text-green-500 border-green-100 px-3 py-1 rounded-full"
  };
  
  return (
    <div className={cn("text-[10px] uppercase tracking-widest border border-transparent", styles[status])}>
      {status === 'new' ? 'New' : status}
    </div>
  );
};
