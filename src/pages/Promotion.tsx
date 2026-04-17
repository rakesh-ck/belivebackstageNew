import React, { useState } from 'react';
import { 
  Share2, 
  Users, 
  Settings, 
  Plus, 
  MoreVertical, 
  Globe, 
  ExternalLink,
  Mail,
  Calendar,
  MousePointer2,
  Trash2,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PromotionPage: React.FC = () => {
  const [setupDone, setSetupDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'fans'>('links');
  
  if (!setupDone) {
    return <PromotionSetup onComplete={() => setSetupDone(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
       {/* Top Nav for Promotion */}
       <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1976D2] rounded-lg flex items-center justify-center text-white font-bold text-xl">b</div>
                <span className="font-bold text-gray-800">Promotion</span>
             </div>
             <div className="h-6 w-[1px] bg-gray-200" />
             <div className="flex bg-gray-100 p-1 rounded-full">
                <button 
                  onClick={() => setActiveTab('links')}
                  className={cn(
                    "px-6 py-1.5 text-xs font-bold rounded-full transition-all",
                    activeTab === 'links' ? "bg-white text-[#1976D2] shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Links
                </button>
                <button 
                  onClick={() => setActiveTab('fans')}
                  className={cn(
                    "px-6 py-1.5 text-xs font-bold rounded-full transition-all",
                    activeTab === 'fans' ? "bg-white text-[#1976D2] shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Fans
                </button>
             </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
             <Settings size={20} />
          </button>
       </header>

       <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'links' ? <LinksTab /> : <FansTab />}
       </main>
    </div>
  );
};

const PromotionSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl text-center space-y-8">
          <div className="w-20 h-20 bg-blue-50 text-[#1976D2] rounded-[32px] flex items-center justify-center mx-auto shadow-lg shadow-blue-100">
             <Share2 size={40} />
          </div>
          <div className="space-y-3">
             <h2 className="text-3xl font-bold text-gray-800">First things first</h2>
             <p className="text-gray-500">Some of Backstage Promotion tools require you to provide your legal information. Those details might be shared with fans publicly.</p>
          </div>
          
          <div className="space-y-4 text-left">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Legal identity</label>
                <input type="text" placeholder="Your full legal name" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] transition-all" />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Fan contact email</label>
                <input type="email" placeholder="contact@artist.com" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] transition-all" />
             </div>
          </div>

          <label className="flex items-center gap-3 justify-center cursor-pointer group">
             <input type="checkbox" className="w-5 h-5 rounded border-gray-200 text-[#1976D2] focus:ring-[#1976D2]" />
             <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">I accept the Backstage Promotion Terms & Conditions</span>
          </label>

          <button 
            onClick={onComplete}
            className="w-full py-4 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
          >
             Get started
          </button>
       </div>
    </div>
  );
};

const LinksTab: React.FC = () => (
  <div className="space-y-6">
     <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">SmartLinks</h2>
        <button className="px-6 py-2.5 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
           <Plus size={18} />
           <span>Create a link</span>
        </button>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
             <div className="relative aspect-video bg-gray-100">
                <img 
                  src={`https://picsum.photos/seed/link${i}/600/400`} 
                  alt="Release" 
                  className="w-full h-full object-cover brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                   <button className="p-2 bg-white/80 backdrop-blur-md rounded-lg text-gray-600 hover:text-[#1976D2] transition-colors"><Edit2 size={16} /></button>
                   <button className="p-2 bg-white/80 backdrop-blur-md rounded-lg text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
             </div>
             <div className="p-6 space-y-4">
                <div>
                   <h4 className="font-bold text-gray-800 line-clamp-1">Midnight City - Remix Pack</h4>
                   <p className="text-xs text-gray-400 font-medium">backstage.link/midnight-remix</p>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Clicks</span>
                      <span className="text-lg font-bold text-gray-800">1,240</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Stores</span>
                      <span className="text-lg font-bold text-gray-800">8</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Collected</span>
                      <span className="text-lg font-bold text-gray-800">45</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <span className="text-[10px] text-gray-400 font-medium italic">Created Oct 12, 2023</span>
                   <button className="text-[#1976D2] hover:underline flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                      <ExternalLink size={12} />
                      View Page
                   </button>
                </div>
             </div>
          </div>
        ))}
     </div>
  </div>
);

const FansTab: React.FC = () => (
  <div className="space-y-6">
     <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Fan Data Capture</h2>
           <p className="text-sm text-gray-400">Manage and export fan contact details collected through your SmartLinks.</p>
        </div>
        <div className="bg-blue-50 px-6 py-4 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 bg-[#1976D2] text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Mail size={20} />
           </div>
           <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total emails</div>
              <div className="text-xl font-bold text-gray-800">1,452</div>
           </div>
        </div>
     </div>

     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-[#F5F5F5]">
              <tr>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Release Linked</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Captured</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 text-sm font-bold text-gray-800">Fan #{i}</td>
                   <td className="px-6 py-4 text-sm text-gray-600">fan{i}@example.com</td>
                   <td className="px-6 py-4 text-sm text-[#1976D2] hover:underline cursor-pointer font-medium">Midnight City</td>
                   <td className="px-6 py-4 text-sm text-gray-400">Oct 14, 2023</td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);
