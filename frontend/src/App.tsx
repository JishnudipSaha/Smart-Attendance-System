import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StudentsPage from './Students/StudentsPage';
import MarkAttendancePage from './MarkAttendance/MarkAttendancePage';
import ReportsPage from './Reports/ReportsPage';
import AnalyticsPage from './Analytics/AnalyticsPage';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'students': return <StudentsPage />;
      case 'marking': return <MarkAttendancePage />;
      case 'reports': return <ReportsPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to SmartAttend</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Automate your classroom attendance using cutting-edge AI face recognition.
            Manage students, mark attendance, and track patterns in one place.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-bold text-primary-600">100%</div>
              <div className="text-sm text-slate-500">AI Accuracy</div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-bold text-primary-600">1s</div>
              <div className="text-sm text-slate-500">Processing Time</div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-bold text-primary-600">Real-time</div>
              <div className="text-sm text-slate-500">Tracking</div>
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
