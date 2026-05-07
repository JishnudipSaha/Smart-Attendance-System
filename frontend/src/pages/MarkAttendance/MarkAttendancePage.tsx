import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';

interface RecognitionResult {
  student_id: number;
  confidence: number;
}

const MarkAttendancePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    session: { class_name: string; date: string };
    marked_present: RecognitionResult[];
    total_count: number;
    debug_image_url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
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
      const response = await apiClient.post('/attendance/mark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while marking attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">AI Attendance Marking</h1>
        <p className="text-slate-500 dark:text-slate-400">Upload a classroom image to automatically mark students present.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleMarkAttendance} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class Name</label>
              <input
                type="text"
                placeholder="e.g. CS101"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Classroom Image</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                  ${file ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'}`}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Upload className={`mx-auto mb-4 ${file ? 'text-primary-600' : 'text-slate-400'}`} size={32} />
                <p className="text-sm font-medium">
                  {file ? file.name : 'Click to upload image'}
                </p>
                <p className="text-xs text-slate-500 mt-1">JPEG or PNG</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              {loading ? 'Processing...' : 'Mark Attendance'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!results && !loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 border-dashed">
              <Camera size={48} className="mb-4 opacity-20" />
              <p>Upload an image to see recognition results</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 border-dashed">
              <Loader2 className="animate-spin mb-4 text-primary-600" size={48} />
              <p>AI is analyzing the image and marking attendance...</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
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
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                              {student.student_id}
                            </div>
                            <span className="font-medium">Student ID: {student.student_id}</span>
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {(student.confidence * 100).toFixed(1)}% Match
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-slate-400 italic">No students recognized above threshold</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">AI Annotated Image</p>
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
