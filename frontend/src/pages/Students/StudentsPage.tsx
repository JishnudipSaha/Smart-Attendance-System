import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Trash2, Upload, Zap } from 'lucide-react';
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

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
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

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStatusMessage({ type: 'error', text: 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentService.create(newStudent);
      setNewStudent({ name: '', roll_number: '', class_name: '', section: '' });
      setIsModalOpen(false);
      await fetchStudents();
      setStatusMessage({ type: 'success', text: 'Student registered successfully.' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: getErrorMessage(error, 'Error creating student.') });
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
      setStatusMessage({ type: 'success', text: 'Images uploaded successfully.' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: getErrorMessage(error, 'Error uploading images.') });
    } finally {
      setUploadingStudentId(null);
      e.target.value = '';
    }
  };

  const handleGenerateEmbeddings = async (studentId: number) => {
    try {
      await studentService.generateEmbeddings(studentId);
      await fetchStudents();
      setStatusMessage({ type: 'success', text: 'Embeddings generated successfully.' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: getErrorMessage(error, 'Error generating embeddings.') });
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setDeletingStudentId(studentToDelete.id);
    try {
      await studentService.delete(studentToDelete.id);
      setStudents((prev) => prev.filter((student) => student.id !== studentToDelete.id));
      delete fileInputRefs.current[studentToDelete.id];
      setStatusMessage({ type: 'success', text: 'Student deleted with related data.' });
      setStudentToDelete(null);
    } catch (error) {
      setStatusMessage({ type: 'error', text: getErrorMessage(error, 'Error deleting student.') });
    } finally {
      setDeletingStudentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your students and their AI embeddings.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-semibold">
                      ID: {student.id}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{student.roll_number} • {student.class_name} {student.section}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Photos: {student.uploaded_images_count}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Embeddings: {student.embeddings_count}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          student.has_uploaded_images
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {student.has_uploaded_images ? 'Photos Uploaded' : 'No Photos Uploaded'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          student.has_embeddings
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {student.has_embeddings ? 'Embeddings Generated' : 'Embeddings Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[student.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUploadImages(student.id, e)}
                  />
                  <button
                    onClick={() => fileInputRefs.current[student.id]?.click()}
                    disabled={uploadingStudentId === student.id}
                    className="p-2 text-slate-500 hover:text-primary-600 transition-colors"
                    title="Upload Images"
                  >
                    {uploadingStudentId === student.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleGenerateEmbeddings(student.id)}
                    disabled={!student.has_uploaded_images}
                    className="p-2 text-slate-500 hover:text-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Generate AI Embeddings"
                  >
                    <Zap size={18} />
                  </button>
                  <button
                    onClick={() => setStudentToDelete(student)}
                    disabled={deletingStudentId === student.id}
                    className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                    title="Delete Student"
                  >
                    {deletingStudentId === student.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm dark:bg-slate-950/35">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">Delete Student</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete <span className="font-semibold">{studentToDelete.name}</span> (ID: {studentToDelete.id}),
              all uploaded images, generated embeddings, and attendance records.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                disabled={deletingStudentId === studentToDelete.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deletingStudentId === studentToDelete.id}
              >
                {deletingStudentId === studentToDelete.id ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm dark:bg-slate-950/35">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Register New Student</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roll Number</label>
                <input
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
                  value={newStudent.roll_number}
                  onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Class Name</label>
                  <input
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <input
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 ring-primary-500"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
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
