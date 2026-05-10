import React, { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from '../../api/client';

interface AnalyticsEntry {
  date: string;
  present: number;
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const pieData = [
    { name: 'Present', value: 75 },
    { name: 'Absent', value: 25 },
  ];
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // In a real scenario, we'd have a specialized /analytics endpoint.
      // For now, we will simulate analytics by fetching reports for the last 7 days.
      const reports = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        await apiClient.get('/attendance/report', {
          params: { class_name: 'CS101', report_date: dateStr },
        });
        reports.push({
          date: dateStr,
          present: reports.length, // dummy for now
        });
      }
      setData(reports);
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

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Attendance Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Visualize attendance patterns and student trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="ui-card space-y-6">
          <h3 className="text-lg font-bold">Weekly Attendance Trend</h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="ui-card space-y-6">
          <h3 className="text-lg font-bold">Presence Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
