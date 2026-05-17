import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import apiClient, { studentService } from '../../api/client';

interface DayData {
  date: string;
  label: string;
  present: number;
  total: number;
  rate: number;
}

interface PieSlice {
  name: string;
  value: number;
}

const COLORS = ['#10b981', '#ef4444'];
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#f8fafc',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    fontSize: '13px',
  },
  cursor: { fill: 'rgba(59, 130, 246, 0.08)' },
};

const AnalyticsPage: React.FC = () => {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [pieData, setPieData] = useState<PieSlice[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Get available classes
      const students = await studentService.getAll();
      const classes = [...new Set(students.map((s) => s.class_name))].filter((c) => c.trim().length > 0);
      setAvailableClasses(classes);

      if (classes.length === 0) {
        setWeekData([]);
        setPieData([]);
        return;
      }

      // Fetch last 7 days of reports for the first available class
      const targetClass = classes[0];
      const days: DayData[] = [];
      let totalPresent = 0;
      let totalRecords = 0;

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('en-US', { weekday: 'short' });

        try {
          const response = await apiClient.get<{ report: { status: string }[] }>('/attendance/report', {
            params: { class_name: targetClass, report_date: dateStr },
          });
          const report = response.data.report;
          const present = report.filter((r) => r.status === 'Present').length;
          const total = report.length;
          const rate = total > 0 ? Math.round((present / total) * 100) : 0;

          days.push({ date: dateStr, label, present, total, rate });
          totalPresent += present;
          totalRecords += total;
        } catch {
          days.push({ date: dateStr, label, present: 0, total: 0, rate: 0 });
        }
      }

      setWeekData(days);

      // Pie data from aggregated totals
      const totalAbsent = totalRecords - totalPresent;
      if (totalRecords > 0) {
        setPieData([
          { name: 'Present', value: totalPresent },
          { name: 'Absent', value: totalAbsent },
        ]);
      } else {
        setPieData([]);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Summary stats
  const totalPresent = weekData.reduce((sum, d) => sum + d.present, 0);
  const totalRecords = weekData.reduce((sum, d) => sum + d.total, 0);
  const avgRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  const bestDay = weekData.length > 0
    ? weekData.reduce((best, d) => (d.rate > best.rate ? d : best), weekData[0])
    : null;
  const daysWithData = weekData.filter((d) => d.total > 0).length;

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Attendance Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Visualize attendance patterns and student trends
          {availableClasses.length > 0 && (
            <span className="ml-1 text-primary-600 dark:text-primary-400 font-medium">
              for {availableClasses[0]}
            </span>
          )}
        </p>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ui-card-soft">
              <div className="skeleton h-8 w-16 rounded mb-2" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : weekData.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="flex items-center gap-3 pl-3">
              <TrendingUp size={20} className="text-emerald-500" />
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgRate}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Avg Attendance</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-primary-500 to-indigo-500" />
            <div className="flex items-center gap-3 pl-3">
              <Users size={20} className="text-primary-500" />
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalPresent}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Present (7d)</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-amber-500 to-orange-500" />
            <div className="flex items-center gap-3 pl-3">
              <Calendar size={20} className="text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{daysWithData}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Active Days</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-violet-500 to-purple-500" />
            <div className="flex items-center gap-3 pl-3">
              <BarChart3 size={20} className="text-violet-500" />
              <div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {bestDay ? bestDay.label : '---'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Best Day</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 ui-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Weekly Attendance Trend</h3>
            <span className="text-xs text-slate-400">Last 7 days</span>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex flex-col gap-3 justify-end">
                {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="skeleton w-12 h-4 rounded" />
                    <div className="skeleton flex-1 rounded" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            ) : weekData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available yet
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="ui-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Distribution</h3>
            <span className="text-xs text-slate-400">7-day aggregate</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <div className="w-40 h-40 rounded-full skeleton" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm">No data available</div>
            )}
          </div>

          {/* Rate Cards */}
          {!loading && pieData.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {pieData[0]?.value ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Present</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {pieData[1]?.value ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Absent</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!loading && availableClasses.length === 0 && (
        <div className="ui-card-soft border-dashed flex flex-col items-center justify-center py-12">
          <BarChart3 size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-500 dark:text-slate-400 mb-1">No data to analyze</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-sm">
            Register students and mark attendance to see analytics here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
