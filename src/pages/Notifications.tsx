import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Music, 
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [accessToken]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <button 
            onClick={markAllRead}
            className="text-sm font-bold text-[#1976D2] hover:underline flex items-center gap-2"
          >
             <Check size={16} />
             Mark all as read
          </button>
       </div>

       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {loading ? (
             <div className="p-12 text-center text-gray-400 italic">Loading notifications...</div>
          ) : notifications.length === 0 ? (
             <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                   <Bell size={32} />
                </div>
                <p className="text-gray-500">You're all caught up! No new notifications.</p>
             </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={cn(
                "p-6 flex gap-4 transition-colors",
                !n.read ? "bg-blue-50/20" : "hover:bg-gray-50"
              )}>
                 <NotificationIcon type={n.type} />
                 <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                       <h4 className={cn("text-sm font-bold", !n.read ? "text-gray-900" : "text-gray-600")}>{n.title}</h4>
                       <span className="text-[10px] text-gray-400 font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-500">{n.message}</p>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'release_status_change':
      return <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0"><Music size={20} /></div>;
    case 'rights_issue_update':
      return <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"><AlertCircle size={20} /></div>;
    case 'bulk_import_complete':
      return <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1976D2] flex items-center justify-center shrink-0"><FileSpreadsheet size={20} /></div>;
    default:
      return <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0"><Info size={20} /></div>;
  }
};
