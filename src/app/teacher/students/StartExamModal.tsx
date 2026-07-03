import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, Monitor, Printer } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface StartExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mode: 'online' | 'offline', paperId: string, studentIds: string[]) => void;
  selectedStudents: any[];
}

export default function StartExamModal({ isOpen, onClose, onSuccess, selectedStudents }: StartExamModalProps) {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPapers();
    } else {
      setSelectedPaperId('');
      setMode('online');
      setError('');
    }
  }, [isOpen]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      
      // Determine grade from selected students
      let queryStr = '';
      if (selectedStudents && selectedStudents.length > 0) {
        const firstGrade = selectedStudents[0].raw?.studentProfile?.gradeId;
        // Check if all selected students share the same grade
        const allSameGrade = selectedStudents.every(s => s.raw?.studentProfile?.gradeId === firstGrade);
        if (allSameGrade && firstGrade) {
          queryStr = `?grade_level=${firstGrade}`;
        }
      }

      const res = await apiClient.get(`/papers${queryStr}`);
      setPapers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch papers', err);
      setError('Failed to load question papers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaperId) {
      setError('Please select a question paper.');
      return;
    }
    if (selectedStudents.length === 0) {
      setError('No students selected.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const studentIds = selectedStudents.map(s => s.id);
      
      await apiClient.post('/exams/assign', {
        question_paper_id: selectedPaperId,
        student_ids: studentIds,
        mode,
      });

      onSuccess(mode, selectedPaperId, studentIds);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign exam', err);
      setError(err.response?.data?.message || 'Failed to assign exam.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Start Exam</h2>
            <p className="text-sm text-gray-500 mt-1">Assign an assessment to {selectedStudents.length} selected student(s)</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Question Paper</label>
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Loading papers...</span>
                </div>
              ) : (
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="">-- Choose a paper --</option>
                    {papers.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} (Grade {p.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Exam Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode('online')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    mode === 'online' 
                      ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 text-gray-600'
                  }`}
                >
                  <Monitor size={28} className={mode === 'online' ? 'text-blue-600 mb-2' : 'text-gray-400 mb-2'} />
                  <span className="font-semibold text-sm">Online Mode</span>
                  <span className="text-[11px] text-center mt-1 opacity-70">Students take it on their dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('offline')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    mode === 'offline' 
                      ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 text-gray-600'
                  }`}
                >
                  <Printer size={28} className={mode === 'offline' ? 'text-blue-600 mb-2' : 'text-gray-400 mb-2'} />
                  <span className="font-semibold text-sm">Offline (Print)</span>
                  <span className="text-[11px] text-center mt-1 opacity-70">Print custom papers for students</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedPaperId || selectedStudents.length === 0}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Assigning...
              </>
            ) : mode === 'online' ? (
              'Assign Online Exam'
            ) : (
              'Assign & Print'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
