import React from 'react';
import { 
  Users, 
  Disc, 
  BarChart2, 
  AlertCircle, 
  UploadCloud, 
  Settings, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Bell,
  Search
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
     return <Navigate to="/dashboard/overview" replace />;
  }

  const handleLogout = async () => {
     await logout();
     navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: '/admin/dashboard' },
    { label: 'Users', icon: <Users size={20} />, to: '/admin/users' },
    { label: 'Releases', icon: <Disc size={20} />, to: '/admin/releases' },
    { label: 'Catalog', icon: <GridIcon size={20} />, to: '/admin/catalog' },
    { label: 'Analytics', icon: <BarChart2 size={20} />, to: '/admin/analytics' },
    { label: 'Rights Issues', icon: <AlertCircle size={20} />, to: '/admin/rights' },
    { label: 'Bulk Imports', icon: <UploadCloud size={20} />, to: '/admin/imports' },
    { label: 'Settings', icon: <Settings size={20} />, to: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className={cn(
        "bg-[#1A1C1E] text-white flex flex-col transition-all duration-300 shadow-2xl",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}>
        <div className="p-6 flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white uppercase tracking-widest">A</div>
           {!isCollapsed && <span className="font-bold text-lg uppercase tracking-tight">Admin<span className="text-blue-500">Panel</span></span>}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
           {menuItems.map(item => (
             <Link
               key={item.to}
               to={item.to}
               className={cn(
                 "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                 location.pathname.startsWith(item.to) 
                   ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                   : "text-gray-400 hover:text-white hover:bg-white/5"
               )}
             >
               {item.icon}
               {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
             </Link>
           ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-all"
           >
              <LogOut size={20} />
              {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setIsCollapsed(!isCollapsed)}
                 className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
               >
                  {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
               </button>
               <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="text" placeholder="Global search..." className="pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm w-64" />
               </div>
            </div>

            <div className="flex items-center gap-6">
               <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-xl">
                  <div className="text-right">
                     <div className="text-xs font-bold text-gray-800 uppercase tracking-widest">{user?.name}</div>
                     <div className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] -mt-0.5">Super Admin</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                     {user?.name.charAt(0)}
                  </div>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
         </main>
      </div>
    </div>
  );
};

const GridIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
