import React from 'react';
import { 
  LayoutDashboard, 
  Music, 
  ChevronRight, 
  ChevronDown, 
  BarChart2, 
  Megaphone, 
  Globe, 
  Plus,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
  isOpen?: boolean;
  onToggle?: () => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, children, isOpen, onToggle, isCollapsed }) => {
  const location = useLocation();
  const isActive = to ? location.pathname.startsWith(to) : children?.some(c => location.pathname.startsWith(c.to));

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-3 text-gray-500 hover:text-[#1976D2] transition-colors cursor-pointer group relative">
        {icon}
        <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1">
      {to ? (
        <Link
          to={to}
          className={cn(
            "flex items-center justify-between px-4 py-2 rounded-md transition-colors",
            isActive ? "text-[#1976D2] font-semibold bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn(isActive ? "text-[#1976D2]" : "text-gray-400")}>{icon}</span>
            <span className="text-sm">{label}</span>
          </div>
        </Link>
      ) : (
        <div
          onClick={onToggle}
          className={cn(
            "flex items-center justify-between px-4 py-2 rounded-md transition-colors cursor-pointer",
            isActive ? "text-[#1976D2] font-semibold" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn(isActive ? "text-[#1976D2]" : "text-gray-400")}>{icon}</span>
            <span className="text-sm">{label}</span>
          </div>
          {children && (
            <span>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
          )}
        </div>
      )}

      {children && isOpen && (
        <div className="ml-11 mt-1 flex flex-col gap-1">
          {children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={cn(
                "text-sm py-1.5 transition-colors",
                location.pathname === child.to ? "text-[#1976D2] font-medium" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<{ isCollapsed: boolean; onOpenCreateModal: () => void }> = ({ isCollapsed, onOpenCreateModal }) => {
  const [openMenus, setOpenMenus] = React.useState<string[]>(['Catalog', 'Analytics']);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-100 flex flex-col transition-all duration-300",
        isCollapsed ? "w-[64px]" : "w-[210px]"
      )}
    >
      <div className="p-4 mb-4">
        <div className={cn("flex flex-col", isCollapsed && "items-center")}>
          <span className="text-[#1976D2] font-bold text-xl leading-none">believe.</span>
          {!isCollapsed && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Backstage</span>}
        </div>
      </div>

      <div className="px-3 mb-6">
        <button 
          onClick={onOpenCreateModal}
          className={cn(
            "bg-[#1976D2] text-white rounded-full flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm",
            isCollapsed ? "w-10 h-10 p-0" : "w-full py-2.5 px-4"
          )}
        >
          <Plus size={isCollapsed ? 20 : 18} />
          {!isCollapsed && <span className="text-sm font-medium">One release</span>}
        </button>
        {!isCollapsed && (
          <Link 
            to="/dashboard/catalog/bulk-import"
            className="w-full mt-3 flex items-center justify-center gap-2 text-[#1976D2] text-sm hover:underline"
          >
            <Plus size={16} />
            <span>Multiple releases</span>
          </Link>
        )}
      </div>

      <div className="flex-1 px-3 overflow-y-auto">
        <NavItem 
          isCollapsed={isCollapsed}
          icon={<LayoutDashboard size={20} />} 
          label="Overview" 
          to="/dashboard/overview" 
        />
        
        <NavItem 
          isCollapsed={isCollapsed}
          icon={<Music size={20} />} 
          label="Catalog" 
          isOpen={openMenus.includes('Catalog')}
          onToggle={() => toggleMenu('Catalog')}
          children={[
            { label: 'All Releases', to: '/dashboard/catalog/all' },
            { label: 'Drafts', to: '/dashboard/catalog/drafts' },
            { label: 'Correction Requested', to: '/dashboard/catalog/correction' },
          ]}
        />

        <NavItem 
          isCollapsed={isCollapsed}
          icon={<BarChart2 size={20} />} 
          label="Analytics" 
          isOpen={openMenus.includes('Analytics')}
          onToggle={() => toggleMenu('Analytics')}
          children={[
            { label: 'Streams', to: '/dashboard/analytics/streams' },
            { label: 'Daily Trends', to: '/dashboard/analytics/trends' },
            { label: 'Playlists & Charts', to: '/dashboard/analytics/playlists' },
            { label: 'Views', to: '/dashboard/analytics/views' },
            { label: 'Short-form videos', to: '/dashboard/analytics/shortform' },
            { label: 'Catalog optimization', to: '/dashboard/analytics/optimization' },
          ]}
        />

        <NavItem 
          isCollapsed={isCollapsed}
          icon={<Megaphone size={20} />} 
          label="Promotion" 
          to="/dashboard/promotion" 
        />

        <NavItem 
          isCollapsed={isCollapsed}
          icon={<Globe size={20} />} 
          label="Legal" 
          isOpen={openMenus.includes('Legal')}
          onToggle={() => toggleMenu('Legal')}
          children={[
            { label: 'Rights Manager', to: '/dashboard/legal/rights' },
          ]}
        />
      </div>

      <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
        {!isCollapsed && (
          <Link to="/legal" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
            Backstage Terms & conditions
          </Link>
        )}
        <div className={cn("text-[10px] text-gray-300", isCollapsed && "text-center")}>
          v1.0.0
        </div>
      </div>
    </aside>
  );
};
