import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Disc, 
  CheckCircle2, 
  Upload, 
  Pencil, 
  Globe, 
  Users, 
  Share2,
  MoreVertical,
  Plus,
  Play
} from 'lucide-react';
import { Release, Track } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PromotionKit } from '../components/PromotionKit';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ReleaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'territories' | 'promotion'>('tracks');
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchRelease = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalog/${id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch release details');
        }

        const data = await response.json();
        setRelease(data);
      } catch (err) {
        console.error(err);
        setRelease(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRelease();
  }, [id, accessToken]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading release details...</div>;
  if (!release) return <div className="p-8 text-center text-red-500 font-bold">Release not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#1976D2] font-bold uppercase tracking-wider">
        <Link to="/dashboard/catalog/all" className="hover:underline flex items-center gap-1">
          <ArrowLeft size={14} />
          All Releases
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cover & Basic Info */}
        <div className="w-full lg:w-[320px] space-y-6">
           <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg group">
              <img 
                src={`https://picsum.photos/seed/${release.id}/600/600`} 
                alt="Cover" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button className="flex items-center gap-2 px-6 py-2 bg-white rounded-full text-xs font-bold uppercase tracking-widest text-gray-800 shadow-lg">
                    <Upload size={14} />
                    Update
                 </button>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadata</div>
                 <button className="text-[#1976D2] hover:text-blue-700">
                    <Pencil size={14} />
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 <MetaItem label="Label" value={release.label || '—'} />
                 <MetaItem label="Creation Date" value={new Date(release.createdAt).toLocaleDateString()} />
                 <MetaItem label="Distribution Type" value={release.distributionType} />
                 <MetaItem label="UPC" value={release.upc || '—'} />
                 <MetaItem label="Release Date" value={release.releaseDate || '—'} />
                 <MetaItem label="Genre #1" value={release.genre} />
              </div>
           </div>
        </div>

        {/* Right: Content & Tabs */}
        <div className="flex-1 space-y-6">
           <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">{release.title}</h1>
                <p className="text-lg text-gray-400 font-medium">Artist Name</p>
              </div>
              <div className="flex items-start gap-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-[#1976D2] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    <Disc size={12} />
                    Music
                 </div>
                 <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-lg">
                    <MoreVertical size={18} />
                 </button>
              </div>
           </div>

           {release.status === 'delivered' && (
             <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                <CheckCircle2 size={24} />
                <span className="font-bold">Delivered</span>
             </div>
           )}

           {/* Tabs */}
           <div className="flex items-center border-b border-gray-100">
              <Tab active={activeTab === 'tracks'} onClick={() => setActiveTab('tracks')} label="Tracks" count={0} />
              <Tab active={activeTab === 'territories'} onClick={() => setActiveTab('territories')} label="Territories" count={240} />
              <Tab active={activeTab === 'promotion'} onClick={() => setActiveTab('promotion')} label="Promotion" icon={<Share2 size={16} />} />
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
              {activeTab === 'tracks' && <TracksList />}
              {activeTab === 'territories' && <TerritoriesList />}
              {activeTab === 'promotion' && <PromotionSection release={release} />}
           </div>
        </div>
      </div>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{label}</div>
    <div className="text-sm font-medium text-gray-800 capitalize">{value}</div>
  </div>
);

const Tab: React.FC<{ active: boolean; onClick: () => void; label: string; count?: number; icon?: React.ReactNode }> = ({ active, onClick, label, count, icon }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-6 py-4 flex items-center gap-2 border-b-2 transition-all relative",
      active ? "border-[#1976D2] text-[#1976D2]" : "border-transparent text-gray-400 hover:text-gray-600"
    )}
  >
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
    {count !== undefined && (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold",
        active ? "bg-blue-50" : "bg-gray-100"
      )}>
        {count}
      </span>
    )}
  </button>
);

const TracksList: React.FC = () => (
  <div>
    <table className="w-full text-left">
      <thead className="bg-[#F5F5F5]">
        <tr>
          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Track#</th>
          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Artist</th>
          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview</th>
        </tr>
      </thead>
      <tbody>
         <tr>
           <td colSpan={5} className="p-20 text-center">
              <div className="flex flex-col items-center gap-4 text-gray-400">
                 <Disc size={48} className="opacity-10" />
                 <p className="text-sm font-medium">No tracks added to this release yet</p>
                 <button className="px-6 py-2 border border-[#1976D2] text-[#1976D2] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    Add Tracks
                 </button>
              </div>
           </td>
         </tr>
      </tbody>
    </table>
  </div>
);

const TerritoriesList: React.FC = () => (
  <div className="p-8">
     <div className="flex items-center gap-4 p-6 border border-blue-50 bg-blue-50/20 rounded-2xl mb-8">
        <div className="w-16 h-16 bg-[#1976D2] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
           <Globe size={32} />
        </div>
        <div>
           <h4 className="text-xl font-bold text-[#1976D2]">Worldwide Distribution</h4>
           <p className="text-gray-500 text-sm">Your music will be delivered to 240+ territories across all major streaming platforms.</p>
        </div>
     </div>
     
     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {['Spotify', 'Apple Music', 'YouTube Music', 'Deezer', 'Amazon Music', 'Tidal', 'TikTok', 'Instagram', 'Facebook', 'Pandora', 'SoundCloud', 'Beatport'].map(store => (
          <div key={store} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
             <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm">
                <CheckCircle2 size={20} className="text-green-500" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{store}</span>
          </div>
        ))}
     </div>
  </div>
);

const PromotionSection: React.FC<{ release: Release }> = ({ release }) => (
  <div className="p-12 space-y-12">
     <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-24 h-24 bg-blue-50 text-[#1976D2] rounded-3xl flex items-center justify-center">
           <Share2 size={48} />
        </div>
        <div className="space-y-2">
           <h4 className="text-2xl font-bold text-gray-800">Promote your new release</h4>
           <p className="text-gray-500 max-w-md mx-auto">Create a SmartLink landing page and generate AI-powered social media promotion kits to boost your streams.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-3 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2">
              <Plus size={20} />
              Create SmartLink
           </button>
        </div>
     </div>

     <div className="pt-12 border-t border-gray-50">
        <PromotionKit 
          releaseTitle={release.title} 
          artistName="Artist Name" 
          genre={release.genre} 
        />
     </div>
  </div>
);
