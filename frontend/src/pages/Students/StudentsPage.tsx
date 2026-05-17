import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Trash2, Upload, Zap, Search, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { studentService, type Student, type StudentCreateInput } from '../../api/client';

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return fallback;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<StudentCreateInput>({
    name: '',
    roll_number: '',
    class_name: '',
    section: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingStudentId, setUploadingStudentId] = useState<number | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = useCallback((msg: StatusMessage) => {
    setStatusMessage(msg);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch {
      showStatus({ type: 'error', text: 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  }, [showStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentService.create(newStudent);
      setNewStudent({ name: '', roll_number: '', class_name: '', section: '' });
      setIsModalOpen(false);
      await fetchStudents();
      showStatus({ type: 'success', text: 'Student registered successfully.' });
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error, 'Error creating student.') });
    }
  };

  const handleUploadImages = async (
    studentId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingStudentId(studentId);
    try {
      await studentService.uploadImages(studentId, files);
      await fetchStudents();
      showStatus({ type: 'success', text: 'Images uploaded successfully.' });
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error, 'Error uploading images.') });
    } finally {
      setUploadingStudentId(null);
      e.target.value = '';
    }
  };

  const handleGenerateEmbeddings = async (studentId: number) => {
    try {
      await studentService.generateEmbeddings(studentId);
      await fetchStudents();
      showStatus({ type: 'success', text: 'Embeddings generated successfully.' });
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error, 'Error generating embeddings.') });
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setDeletingStudentId(studentToDelete.id);
    try {
      await studentService.delete(studentToDelete.id);
      setStudents((prev) => prev.filter((student) => student.id !== studentToDelete.id));
      delete fileInputRefs.current[studentToDelete.id];
      showStatus({ type: 'success', text: 'Student deleted with related data.' });
      setStudentToDelete(null);
    } catch (error) {
      showStatus({ type: 'error', text: getErrorMessage(error, 'Error deleting student.') });
    } finally {
      setDeletingStudentId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      s.class_name.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your students and their AI embeddings.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="ui-button-primary">
          <Plus size={20} /> Add Student
        </button>
      </div>

      {/* Toast */}
      {statusMessage && (
        <div className={statusMessage.type === 'success' ? 'toast-success' : 'toast-error'}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search + Stats Bar */}
      {!loading && students.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll number, or class..."
              className="ui-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {filteredStudents.length} of {students.length} students
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ui-card-soft space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 ui-card-soft border-dashed">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <Users size={36} className="text-primary-500" />
          </div>
          <h3 className="text-lg font-bold mb-1">No students registered</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 text-center max-w-sm">
            Get started by registering your first student. You can then upload photos and generate AI embeddings.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="ui-button-primary">
            <Plus size={18} /> Register First Student
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 ui-card-soft border-dashed">
          <Search size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No students match "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className="text-sm text-primary-600 dark:text-primary-400 mt-2 hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* Student Cards */}
      {!loading && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="group relative ui-card-soft overflow-hidden">
              {/* Left accent stripe */}
              <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-colors ${
                student.has_embeddings
                  ? 'bg-emerald-500'
                  : student.has_uploaded_images
                  ? 'bg-amber-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`} />

              <div className="pl-4 space-y-4">
                {/* Top: Avatar + Info + Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20 shrink-0">
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{student.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {student.roll_number} &bull; {student.class_name} {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      ref={(el) => { fileInputRefs.current[student.id] = el; }}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUploadImages(student.id, e)}
                    />
                    <button
                      onClick={() => fileInputRefs.current[student.id]?.click()}
                      disabled={uploadingStudentId === student.id}
                      className="ui-icon-btn"
                      title="Upload Images"
                    >
                      {uploadingStudentId === student.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleGenerateEmbeddings(student.id)}
                      disabled={!student.has_uploaded_images}
                      className="ui-icon-btn disabled:opacity-40 disabled:cursor-not-allowed hover:text-yellow-500"
                      title="Generate AI Embeddings"
                    >
                      <Zap size={16} />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      disabled={deletingStudentId === student.id}
                      className="ui-icon-btn hover:text-red-600"
                      title="Delete Student"
                    >
                      {deletingStudentId === student.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Readiness Indicators */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Photos</span>
                      <span className={`font-medium ${student.has_uploaded_images ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {student.uploaded_images_count} uploaded
                      </span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className={`confidence-bar-fill ${student.has_uploaded_images ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: student.uploaded_images_count > 0 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Embeddings</span>
                      <span className={`font-medium ${student.has_embeddings ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {student.embeddings_count} generated
                      </span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className={`confidence-bar-fill ${student.has_embeddings ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: student.embeddings_count > 0 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    student.has_uploaded_images
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {student.has_uploaded_images && <CheckCircle2 size={10} />}
                    {student.has_uploaded_images ? 'Photos Ready' : 'Needs Photos'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    student.has_embeddings
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {student.has_embeddings && <CheckCircle2 size={10} />}
                    {student.has_embeddings ? 'AI Ready' : 'Embeddings Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="ui-modal-overlay">
          <div className="ui-card w-full max-w-md space-y-4 !bg-white/90 dark:!bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold">Delete Student</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete <span className="font-semibold">{studentToDelete.name}</span> (ID: {studentToDelete.id}),
              all uploaded images, generated embeddings, and attendance records.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="ui-button-secondary"
                disabled={deletingStudentId === studentToDelete.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={deletingStudentId === studentToDelete.id}
              >
                {deletingStudentId === studentToDelete.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Student'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isModalOpen && (
        <div className="ui-modal-overlay">
          <div className="ui-card w-full max-w-md !bg-white/90 dark:!bg-slate-900/90">
            <h2 className="text-xl font-bold mb-6">Register New Student</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  className="ui-input"
                  placeholder="e.g. John Doe"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roll Number</label>
                <input
                  className="ui-input"
                  placeholder="e.g. CS2024-001"
                  value={newStudent.roll_number}
                  onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Class Name</label>
                  <input
                    className="ui-input"
                    placeholder="e.g. CS101"
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <input
                    className="ui-input"
                    placeholder="e.g. A"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="ui-button-secondary">
                  Cancel
                </button>
                <button type="submit" className="ui-button-primary">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
