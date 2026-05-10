import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Download, User } from 'lucide-react';
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

  return (
    <div className="page-shell">
      <div className="flex justify-between items-center">
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

      {!loadingClasses && availableClasses.length === 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
          No registered classes found. Add students first to load class options.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
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
                report.map((entry) => (
                  <tr key={entry.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{entry.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{entry.roll_number}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          entry.status === 'Present'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {entry.confidence ? `${(entry.confidence * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{entry.time || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No attendance records found for this class and date.
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
