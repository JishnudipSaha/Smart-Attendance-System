import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Download, User, Users, XCircle, FileText } from 'lucide-react';
import apiClient, { studentService } from '../../api/client';

interface ReportEntry {
  student_id: number;
  roll_number: string;
  name: string;
  status: string;
  confidence: number | null;
  time: string | null;
}

interface AttendanceReportResponse {
  report: ReportEntry[];
}

const isValidISODate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const ReportsPage: React.FC = () => {
  const [className, setClassName] = useState('');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = (err as { response?: { data?: { detail?: string } } }).response;
      if (response?.data?.detail) {
        return response.data.detail;
      }
    }
    return fallback;
  };

  const fetchAvailableClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const students = await studentService.getAll();
      const uniqueClasses = [...new Set(students.map((student) => student.class_name))]
        .filter((name) => name.trim().length > 0)
        .sort((a, b) => a.localeCompare(b));

      setAvailableClasses(uniqueClasses);
      setClassName((prev) => (prev && uniqueClasses.includes(prev) ? prev : (uniqueClasses[0] ?? '')));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load registered classes.'));
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    if (!className || !isValidISODate(reportDate)) {
      setReport([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AttendanceReportResponse>('/attendance/report', {
        params: { class_name: className, report_date: reportDate },
      });
      setReport(response.data.report);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch attendance report.'));
    } finally {
      setLoading(false);
    }
  }, [className, reportDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailableClasses();
  }, [fetchAvailableClasses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  const handleExport = () => {
    window.location.href = `http://localhost:8000/attendance/export/csv?class_name=${className}&report_date=${reportDate}`;
  };

  const handleReportDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    if (isValidISODate(nextDate)) {
      setReportDate(nextDate);
      if (error) setError(null);
    }
  };

  // Computed stats
  const presentCount = report.filter((r) => r.status === 'Present').length;
  const absentCount = report.filter((r) => r.status !== 'Present').length;
  const attendanceRate = report.length > 0 ? Math.round((presentCount / report.length) * 100) : 0;

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Attendance Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">View and export attendance records for your classes.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!className}
          className="ui-button-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ui-card">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User size={16} /> Class Name
          </label>
          <select
            className="ui-input [&_option]:text-slate-900 [&_option]:bg-white"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={loadingClasses || availableClasses.length === 0}
          >
            {availableClasses.length === 0 ? (
              <option value="">{loadingClasses ? 'Loading classes...' : 'No classes available'}</option>
            ) : (
              availableClasses.map((registeredClass) => (
                <option key={registeredClass} value={registeredClass}>
                  {registeredClass}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar size={16} /> Date
          </label>
          <input
            type="date"
            className="ui-input"
            defaultValue={reportDate}
            onChange={handleReportDateChange}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchReport}
            disabled={!className || loadingClasses}
            className="ui-button-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Refresh Report
          </button>
        </div>
      </div>

      {/* Warnings */}
      {!loadingClasses && availableClasses.length === 0 && (
        <div className="toast-error">
          <Users size={18} />
          <span>No registered classes found. Add students first to load class options.</span>
        </div>
      )}

      {error && (
        <div className="toast-error">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && report.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-primary-500 to-indigo-500" />
            <div className="pl-3">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{report.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="pl-3">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-red-500 to-rose-500" />
            <div className="pl-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent bg-gradient-to-b from-amber-500 to-orange-500" />
            <div className="pl-3">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{attendanceRate}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Attendance Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ui-card-soft">
                <div className="skeleton h-8 w-16 rounded mb-2" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>
          <div className="ui-card p-0 overflow-hidden">
            <div className="skeleton h-14 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 w-full mt-px" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="ui-card p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Student</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Roll No</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Confidence</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {report.length > 0 ? (
                report.map((entry, idx) => (
                  <tr
                    key={entry.student_id}
                    className={`transition-colors ${
                      idx % 2 === 0
                        ? 'bg-white/50 dark:bg-slate-900/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/10'
                    } hover:bg-primary-50/50 dark:hover:bg-primary-900/10`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {entry.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{entry.roll_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          entry.status === 'Present' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          entry.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {entry.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {entry.confidence ? `${(entry.confidence * 100).toFixed(1)}%` : '---'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{entry.time || '---'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={40} className="mb-3 opacity-30" />
                      <p className="font-medium text-slate-500 dark:text-slate-400">No records found</p>
                      <p className="text-sm mt-1">No attendance records for {className} on {reportDate}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
