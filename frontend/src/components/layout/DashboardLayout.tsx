import React from 'react';
import { Home, Users, Camera, FileText, BarChart3, Bell, Shield } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your attendance system' },
  students: { title: 'Students', subtitle: 'Manage student profiles and AI embeddings' },
  marking: { title: 'Mark Attendance', subtitle: 'AI-powered classroom recognition' },
  reports: { title: 'Reports', subtitle: 'View and export attendance records' },
  analytics: { title: 'Analytics', subtitle: 'Visualize attendance trends and patterns' },
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${isActive
      ? 'bg-primary-600/72 text-white border border-white/45 backdrop-blur-md shadow-lg shadow-primary-600/35 hover:-translate-y-0.5 hover:bg-primary-600/82 hover:shadow-xl hover:shadow-primary-600/40'
      : 'text-slate-700 dark:text-slate-300 border border-transparent hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/22 hover:shadow-md hover:shadow-slate-300/30 dark:hover:border-slate-500/35 dark:hover:bg-slate-800/35 dark:hover:shadow-black/25'}`}
  >
    {isActive && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm shadow-white/50" />
    )}
    <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

const DashboardLayout: React.FC<{ children: React.ReactNode, activePage: string, setActivePage: (page: string) => void }> = ({ children, activePage, setActivePage }) => {
  const meta = PAGE_META[activePage] ?? PAGE_META.dashboard;

  return (
    <div className="flex min-h-screen gap-6 p-4 text-slate-900 transition-colors duration-300 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-72 glass-panel rounded-3xl flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/70 dark:border-slate-700/70">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">S</div>
            SmartAttend
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">AI-powered classroom intelligence</p>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Shield size={10} />
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </p>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">v1.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-20 mb-5 px-6 glass-panel rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold capitalize tracking-tight">{meta.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl border border-slate-200/70 bg-white/80 text-slate-500 shadow-sm transition-colors duration-200 hover:text-primary-600 hover:ring-2 ring-primary-500/40 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-primary-300">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-primary-500/20">AD</div>
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
