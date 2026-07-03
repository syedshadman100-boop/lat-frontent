'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function OfflineExamsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [search, setSearch] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, papersRes] = await Promise.all([
          apiClient.get('/users/students'),
          apiClient.get('/papers')
        ]);
        
        const backendStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        setStudents(backendStudents);

        const backendPapers = Array.isArray(papersRes.data?.data) 
          ? papersRes.data.data 
          : (Array.isArray(papersRes.data) ? papersRes.data : []);
        setPapers(backendPapers);
        
        // Hardcode grades to 3, 6, and 9 as requested
        setGrades([3, 6, 9]);
        
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPapers = selectedGrade 
    ? papers.filter(p => p.gradeLevel?.toString() === selectedGrade)
    : papers;

  const filteredStudents = students.filter(s => {
    const sGrade = s.studentProfile?.gradeId || s.studentProfile?.grade_id;
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                          s.studentProfile?.rollNo?.includes(search);
    const matchesGrade = selectedGrade ? sGrade?.toString() === selectedGrade : true;
    
    return matchesSearch && matchesGrade;
  });

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudents(next);
  };

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleGenerate = () => {
    if (selectedStudents.size === 0 || !selectedPaper) return;
    const studentIds = Array.from(selectedStudents).join(',');
    
    // Open in a new tab to avoid pop-up blocking issues with multiple tabs
    window.open(`/teacher/offline-exams/print?students=${studentIds}&paper=${selectedPaper}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          Bulk Offline Exams
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Select students and a question paper to generate printable offline exams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Paper Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select Assessment</h2>
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Class / Grade</label>
              <select 
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedPaper('');
                  setSelectedStudents(new Set()); // Reset selected students when grade changes
                }}
                className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="">-- Choose a grade --</option>
                {grades.map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 mt-4">
              <label className="block text-sm font-semibold text-gray-700">Question Paper</label>
              <select 
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
                disabled={!selectedGrade}
                className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">-- Choose a paper --</option>
                {filteredPapers.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleGenerate}
                disabled={selectedStudents.size === 0 || !selectedPaper}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <Printer size={20} />
                Generate {selectedStudents.size > 0 ? selectedStudents.size : ''} Papers
              </button>
              
              {selectedStudents.size === 0 && (
                <p className="text-xs text-center text-gray-400 font-medium mt-3">Select at least 1 student to generate.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Student Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">2. Select Students</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    <th className="p-4 w-12">
                      <div 
                        onClick={toggleAll}
                        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer border transition-colors ${
                          selectedStudents.size > 0 && selectedStudents.size === filteredStudents.length 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {selectedStudents.size > 0 && selectedStudents.size === filteredStudents.length && <CheckCircle2 size={14} />}
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student Info</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Class</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Roll No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                        {selectedGrade ? 'No students found in this grade.' : 'Please select a grade first, or no students found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${selectedStudents.has(student.id) ? 'bg-blue-50/30' : ''}`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <td className="p-4">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            selectedStudents.has(student.id) 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-gray-300'
                          }`}>
                            {selectedStudents.has(student.id) && <CheckCircle2 size={14} />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-700">
                          {student.studentProfile?.grade?.name || `Grade ${student.studentProfile?.gradeId || student.studentProfile?.grade_id || '?'}`} {student.studentProfile?.section ? `- ${student.studentProfile.section}` : ''}
                        </td>
                        <td className="p-4 text-sm font-mono text-gray-600 bg-gray-50/50 rounded-lg inline-block mt-2 border border-gray-100">
                          {student.studentProfile?.rollNo || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
