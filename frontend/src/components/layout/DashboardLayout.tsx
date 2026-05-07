import React from 'react';
import { Home, Users, Camera, FileText, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive
      ? 'bg-primary-600 text-white shadow-md'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const DashboardLayout: React.FC<{ children: React.ReactNode, activePage: string, setActivePage: (page: string) => void }> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            SmartAttend
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<Home size={20} />}
            label="Dashboard"
            isActive={activePage === 'dashboard'}
            onClick={() => setActivePage('dashboard')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Students"
            isActive={activePage === 'students'}
            onClick={() => setActivePage('students')}
          />
          <SidebarItem
            icon={<Camera size={20} />}
            label="Mark Attendance"
            isActive={activePage === 'marking'}
            onClick={() => setActivePage('marking')}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label="Reports"
            isActive={activePage === 'reports'}
            onClick={() => setActivePage('reports')}
          />
          <SidebarItem
            icon={<BarChart3 size={20} />}
            label="Analytics"
            isActive={activePage === 'analytics'}
            onClick={() => setActivePage('analytics')}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">v1.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{activePage.replace(/([a-z])([A-Z])/g, '$1 $2')}</h2>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>
        <div className="p-8 overflow-y-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
