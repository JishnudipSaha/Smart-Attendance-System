import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, Scan, BarChart3 } from 'lucide-react';
import apiClient from '../../api/client';

interface RecognitionResult {
  student_id: number;
  confidence: number;
}

interface AttendanceSession {
  class_name: string;
  date: string;
}

interface AttendanceMarkResponse {
  session: AttendanceSession;
  marked_present: RecognitionResult[];
  total_count: number;
  debug_image_url: string;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'bg-emerald-500';
  if (confidence >= 0.7) return 'bg-primary-500';
  if (confidence >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
};

const MarkAttendancePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AttendanceMarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = (err as { response?: { data?: { detail?: string } } }).response;
      if (response?.data?.detail) {
        return response.data.detail;
      }
    }
    return 'An error occurred while marking attendance.';
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !className) {
      setError('Please provide both a class name and an image.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('class_name', className);
    formData.append('image', file);

    try {
      const response = await apiClient.post<AttendanceMarkResponse>('/attendance/mark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const avgConfidence = results && results.marked_present.length > 0
    ? (results.marked_present.reduce((sum, s) => sum + s.confidence, 0) / results.marked_present.length * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-6xl mx-auto page-shell">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">AI Attendance Marking</h1>
        <p className="text-slate-500 dark:text-slate-400">Upload a classroom image to automatically mark students present.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleMarkAttendance} className="ui-card space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class Name</label>
              <input
                type="text"
                placeholder="e.g. CS101"
                className="ui-input"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Classroom Image</label>
              <div
                className={`group relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${file
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                  }`}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className={`mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  file
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500'
                }`}>
                  <Upload size={28} className={file ? '' : 'group-hover:animate-bounce'} />
                </div>
                <p className="text-sm font-medium">
                  {file ? file.name : 'Click to upload image'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'JPEG or PNG, up to 10MB'}
                </p>
                {file && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    Ready to process
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file || !className}
              className="ui-button-primary w-full py-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              {loading ? 'Processing...' : 'Mark Attendance'}
            </button>
          </form>

          {error && (
            <div className="toast-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Empty State */}
          {!results && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 ui-card-soft border-dashed">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Scan size={36} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-500 dark:text-slate-400 mb-1">No results yet</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">
                Upload a classroom photo and enter the class name to start AI recognition
              </p>
            </div>
          )}

          {/* Loading State with Steps */}
          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 ui-card-soft border-dashed">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary-600" size={36} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
              <h3 className="text-base font-bold mb-3">AI is analyzing the image</h3>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Image uploaded successfully
                </p>
                <p className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-primary-500" />
                  Detecting faces and matching students...
                </p>
                <p className="flex items-center gap-2 opacity-50">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  Generating attendance report
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="stat-card-accent bg-gradient-to-b from-primary-500 to-indigo-500" />
                  <div className="pl-3">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{results.total_count}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Students Recognized</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-accent bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <div className="pl-3">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgConfidence}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Avg Confidence</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-accent bg-gradient-to-b from-amber-500 to-orange-500" />
                  <div className="pl-3">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{results.session.class_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Class</div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="ui-card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Recognition Results</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                    <CheckCircle2 size={14} />
                    {results.total_count} Students Marked
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    {results.marked_present.length > 0 ? (
                      results.marked_present.map((student, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {student.student_id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium">Student ID: {student.student_id}</span>
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {(student.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="confidence-bar">
                              <div
                                className={`confidence-bar-fill ${getConfidenceColor(student.confidence)}`}
                                style={{ width: `${(student.confidence * 100).toFixed(0)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <AlertCircle size={32} className="mb-2 opacity-50" />
                        <p className="italic">No students recognized above threshold</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Annotated Image</p>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <BarChart3 size={12} />
                        Debug View
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-video flex items-center justify-center">
                      <img
                        src={`http://localhost:8000${results.debug_image_url}`}
                        alt="AI Recognition Result"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendancePage;
