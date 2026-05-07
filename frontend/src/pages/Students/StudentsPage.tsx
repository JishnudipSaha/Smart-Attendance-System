import React, { useState, useEffect } from 'react';
import { Plus, Upload, Zap, Trash2 } from 'lucide-react';
import { studentService } from '../../api/client';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', roll_number: '', class_name: '', section: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentService.create(newStudent);
      setNewStudent({ name: '', roll_number: '', class_name: '', section: '' });
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      alert('Error creating student');
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
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{student.roll_number} • {student.class_name} {student.section}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert('Image upload coming soon!')}
                    className="p-2 text-slate-500 hover:text-primary-600 transition-colors"
                    title="Upload Images"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    onClick={() => studentService.generateEmbeddings(student.id).then(() => alert('Embeddings generated!')).catch(() => alert('Error generating embeddings'))}
                    className="p-2 text-slate-500 hover:text-yellow-500 transition-colors"
                    title="Generate AI Embeddings"
                  >
                    <Zap size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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
