import React, { useCallback, useEffect, useState } from 'react';
import { Users, Camera, FileText, CheckCircle2, Circle, ArrowRight, Zap, TrendingUp, Activity } from 'lucide-react';
import DashboardLayout from './components/layout/DashboardLayout';
import StudentsPage from './pages/Students/StudentsPage';
import MarkAttendancePage from './pages/MarkAttendance/MarkAttendancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import { studentService, type Student } from './api/client';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch {
      // silently fail — dashboard degrades gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const totalStudents = students.length;
  const uniqueClasses = new Set(students.map((s) => s.class_name)).size;
  const studentsWithEmbeddings = students.filter((s) => s.has_embeddings).length;
  const readinessPct = totalStudents > 0 ? Math.round((studentsWithEmbeddings / totalStudents) * 100) : 0;

  const checklist = [
    { label: 'Register students', done: totalStudents > 0 },
    { label: 'Upload face photos', done: students.some((s) => s.has_uploaded_images) },
    { label: 'Generate AI embeddings', done: students.some((s) => s.has_embeddings) },
    { label: 'Mark your first attendance', done: false },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'students': return <StudentsPage />;
      case 'marking': return <MarkAttendancePage />;
      case 'reports': return <ReportsPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return (
        <div className="page-shell">
          {/* Hero Card */}
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

          {/* Live Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="stat-card-accent bg-gradient-to-b from-primary-500 to-indigo-500" />
              <div className="flex items-center gap-4 pl-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {loading ? <span className="skeleton inline-block w-12 h-8 rounded" /> : totalStudents}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Registered Students</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent bg-gradient-to-b from-emerald-500 to-teal-500" />
              <div className="flex items-center gap-4 pl-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {loading ? <span className="skeleton inline-block w-8 h-8 rounded" /> : uniqueClasses}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Active Classes</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent bg-gradient-to-b from-amber-500 to-orange-500" />
              <div className="flex items-center gap-4 pl-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {loading ? <span className="skeleton inline-block w-16 h-8 rounded" /> : `${readinessPct}%`}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">AI Readiness</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions + Getting Started */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick Actions */}
            <div className="lg:col-span-2 ui-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity size={20} className="text-primary-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActivePage('students')}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-white/40 bg-white/20 dark:border-slate-500/25 dark:bg-slate-900/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 transition-colors group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50">
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Students</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage profiles</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
                </button>

                <button
                  onClick={() => setActivePage('marking')}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-white/40 bg-white/20 dark:border-slate-500/25 dark:bg-slate-900/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 transition-colors group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50">
                    <Camera size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Attendance</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">AI recognition</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
                </button>

                <button
                  onClick={() => setActivePage('reports')}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-white/40 bg-white/20 dark:border-slate-500/25 dark:bg-slate-900/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 transition-colors group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Reports</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">View & export</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
                </button>
              </div>
            </div>

            {/* Getting Started Checklist */}
            <div className="ui-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Getting Started
              </h3>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? 'text-slate-500 dark:text-slate-400 line-through' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              {totalStudents === 0 && (
                <button
                  onClick={() => setActivePage('students')}
                  className="ui-button-primary w-full mt-5"
                >
                  <Users size={16} />
                  Register Your First Student
                </button>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="ui-card-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>API: Connected</span>
                <span>AI Engine: Ready</span>
                <span>Version: 1.0.0</span>
              </div>
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
