import React, { useState, useEffect } from 'react';
import { Calendar, Download, User, FileText } from 'lucide-react';
import apiClient from '../../api/client';

interface ReportEntry {
  student_id: number;
  roll_number: string;
  name: string;
  status: string;
  confidence: number | null;
  time: string | null;
}

const ReportsPage: React.FC = () => {
  const [className, setClassName] = useState('CS101');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<<ReportReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<<stringstring | null>(null);

  useEffect(() => {
    fetchReport();
  }, [className, reportDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/attendance/report', {
        params: { class_name: className, report_date: reportDate },
      });
      setReport(response.data.report);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch attendance report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = `http://localhost:8000/attendance/export/csv?class_name=${className}&report_date=${reportDate}`;
  };

  return (
    <<divdiv className="space-y-8">
      <<divdiv className="flex justify-between items-center">
        <<divdiv className="flex flex-col gap-1">
          <<hh1 className="text-2xl font-bold">Attendance Reports</h1>
          <<pp className="text-slate-500 dark:text-slate-400">View and export attendance records for your classes.</p>
        </div>
        <<buttonbutton
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <<DownloadDownload size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <<divdiv className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <<divdiv className="space-y-2">
          <<labellabel className="text-sm font-medium flex items-center gap-2">
            <<UsersUsers size={16} /> Class Name
          </label>
          <<inputinput
            type="text"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>
        <<divdiv className="space-y-2">
          <<labellabel className="text-sm font-medium flex items-center gap-2">
            <<CalendarCalendar size={16} /> Date
          </label>
          <<inputinput
            type="date"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>
        <<divdiv className="flex items-end">
          <<buttonbutton
            onClick={fetchReport}
            className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Refresh Report
          </button>
        </div>
      </div>

      {error && (
        <<divdiv className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <<divdiv className="flex justify-center py-20">
          <<divdiv className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <<divdiv className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <<tabletable className="w-full text-left border-collapse">
            <<theadthead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <<thth className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Student</th>
                <<thth className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Roll No</th>
                <<thth className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <<thth className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Confidence</th>
                <<thth className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Time</th>
              </tr>
            </thead>
            <<tbodytbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {report.length > 0 ? (
                report.map((entry) => (
                  <<trtr key={entry.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <<tdtd className="px-6 py-4 font-medium">{entry.name}</td>
                    <<tdtd className="px-6 py-4 text-slate-500 dark:text-slate-400">{entry.roll_number}</td>
                    <<tdtd className="px-6 py-4">
                      <<spanspan className={`px-2 py-1 rounded-full text-xs font-bold ${
                        entry.status === 'Present'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <<tdtd className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {entry.confidence ? `${(entry.confidence * 100).toFixed(1)}%` : '—'}
                    </td>
                    <<tdtd className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {entry.time || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <<tdtd colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
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
