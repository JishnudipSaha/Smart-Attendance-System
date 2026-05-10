import React from 'react';
import { Home, Users, Camera, FileText, BarChart3 } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${isActive
      ? 'bg-primary-600/72 text-white border border-white/45 backdrop-blur-md shadow-lg shadow-primary-600/35 hover:-translate-y-0.5 hover:bg-primary-600/82 hover:shadow-xl hover:shadow-primary-600/40'
      : 'text-slate-700 dark:text-slate-300 border border-transparent hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/22 hover:shadow-md hover:shadow-slate-300/30 dark:hover:border-slate-500/35 dark:hover:bg-slate-800/35 dark:hover:shadow-black/25'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const DashboardLayout: React.FC<{ children: React.ReactNode, activePage: string, setActivePage: (page: string) => void }> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex min-h-screen gap-6 p-4 text-slate-900 transition-colors duration-300 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-72 glass-panel rounded-3xl flex flex-col">
        <div className="p-6 border-b border-slate-200/70 dark:border-slate-700/70">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">S</div>
            SmartAttend
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">AI-powered classroom intelligence</p>
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

        <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">v1.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-20 mb-5 px-6 glass-panel rounded-2xl flex items-center justify-between">
          <h2 className="text-xl font-semibold capitalize tracking-tight">{activePage.replace(/([a-z])([A-Z])/g, '$1 $2')}</h2>
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-full bg-white/35 dark:bg-slate-800/40 border border-white/45 dark:border-slate-500/35 backdrop-blur-md flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>
        <div className="pb-1 overflow-y-auto h-full">
          <div key={activePage} className="page-transition-fade h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
