import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Download, 
  Disc, 
  Video, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Grid,
  RefreshCw,
  MoreVertical,
  Plus
} from 'lucide-react';
import { Release } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CatalogPageProps {
  statusFilter?: 'all' | 'draft' | 'correction_requested' | 'delivered';
  title: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ statusFilter = 'all', title }) => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalog?status=${statusFilter}&search=${searchTerm}&page=${page}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        setReleases(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [statusFilter, searchTerm, page, accessToken]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
           <div className="relative">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search by title, artist, UPC..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] w-64 text-sm"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
             <Filter size={16} />
             <span>Advanced</span>
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-bold hover:bg-blue-700">
             <Download size={16} />
             <span>Export</span>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">{total} result found</span>
          <button className="p-2 text-gray-400 hover:text-[#1976D2] transition-colors" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Release</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadata</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Distro</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <RefreshCw className="animate-spin" size={32} />
                        <span className="text-sm">Loading catalog...</span>
                      </div>
                   </td>
                </tr>
              ) : releases.length === 0 ? (
                <tr>
                   <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-400">
                        <Disc size={48} className="opacity-20" />
                        <div className="space-y-1">
                          <p className="font-bold text-gray-500">No releases found</p>
                          <p className="text-xs">Start by creating your first release or use the bulk import tool.</p>
                        </div>
                        <button className="mt-2 px-6 py-2 bg-[#1976D2] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700">
                          Create release
                        </button>
                      </div>
                   </td>
                </tr>
              ) : (
                releases.map((release) => (
                  <tr key={release.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      {release.type === 'video' ? <Video size={20} className="text-gray-400" /> : <Disc size={20} className="text-gray-400" />}
                    </td>
                    <td className="px-6 py-4">
                      {release.status === 'delivered' ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          release.status === 'draft' ? "bg-gray-300" : "bg-orange-400"
                        )} />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                           <img 
                             src={`https://picsum.photos/seed/${release.id}/100/100`} 
                             alt="Cover" 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                           />
                        </div>
                        <div>
                          <Link to={`/dashboard/catalog/release/${release.id}`} className="text-sm font-bold text-[#1976D2] hover:underline line-clamp-1">
                            {release.title}
                          </Link>
                          <div className="text-xs text-gray-400">Artist Name</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{release.label || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] text-gray-500">
                         <div className="font-medium text-gray-800">UPC: {release.upc || 'N/A'}</div>
                         <div>{release.releaseDate || 'Draft'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                             <Globe size={12} />
                             <span>240 terrs.</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                             <Grid size={12} />
                             <span>12 stores</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">Showing 1 to {releases.length} of {total} results</span>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#1976D2] text-white rounded-lg font-bold text-sm">
                1
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-white">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
