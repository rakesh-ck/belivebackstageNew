import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { CreateReleaseModal } from './CreateReleaseModal';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sans text-[#141414]">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onOpenCreateModal={() => setIsModalOpen(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <CreateReleaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={(id) => {
          navigate(`/dashboard/catalog/release/${id}`);
          // Potential toast implementation here
        }}
      />
    </div>
  );
};
