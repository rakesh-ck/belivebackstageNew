import React from 'react';
import { ChevronLeft, ChevronRight, User, Bell } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onCollapse: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onCollapse, isSidebarCollapsed }) => {
  const { user, accessToken } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const location = useLocation();

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/notifications/count', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (err) {}
    };
    if (accessToken) fetchCount();
  }, [accessToken]);
  
  // Breadcrumb logic
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts[pathParts.length - 1]?.replace(/-/g, ' ');
  
  return (
    <header className="h-16 bg-white border-bottom border-gray-100 px-6 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onCollapse}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <h1 className="text-lg font-medium capitalize text-gray-800">
          {pageTitle || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/dashboard/notifications" className="relative p-1.5 text-gray-500 hover:text-[#1976D2] transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-800 line-clamp-1">{user?.name || 'User'}</div>
            <div className="text-[10px] text-gray-400 uppercase font-medium">Client Number : {user?.clientNumber || 'XXXXXX'}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1976D2] font-bold">
            {user?.name.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
