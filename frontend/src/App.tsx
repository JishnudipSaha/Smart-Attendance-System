import React, { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import StudentsPage from './pages/Students/StudentsPage';
import MarkAttendancePage from './pages/MarkAttendance/MarkAttendancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'students': return <StudentsPage />;
      case 'marking': return <MarkAttendancePage />;
      case 'reports': return <ReportsPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return (
        <div className="page-shell">
          <div className="ui-card relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/10 via-indigo-500/5 to-cyan-500/10" />
            <div className="relative space-y-3">
              <p className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                Smart Attendance Platform
              </p>
              <h1 className="text-4xl font-bold tracking-tight">Welcome to SmartAttend</h1>
              <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                Automate classroom attendance with AI face recognition. Manage students, generate embeddings,
                mark attendance, and monitor trends from one polished workspace.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="ui-card-soft">
              <div className="text-3xl font-bold text-primary-600">100%</div>
              <div className="text-sm text-slate-500">AI Accuracy Focus</div>
            </div>
            <div className="ui-card-soft">
              <div className="text-3xl font-bold text-primary-600">1s</div>
              <div className="text-sm text-slate-500">Fast Recognition Cycle</div>
            </div>
            <div className="ui-card-soft">
              <div className="text-3xl font-bold text-primary-600">Live</div>
              <div className="text-sm text-slate-500">Attendance Insights</div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <DashboardLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
};

export default App;
