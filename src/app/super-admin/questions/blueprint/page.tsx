'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, FileQuestion, BookOpen, Layers, BarChart, Clock, Eye, AlertCircle, CheckCircle2, Search, Filter, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function AssessmentBlueprintsPage() {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // If null, show the summary table. If set, show the detailed questions for that group.
  const [selectedGroup, setSelectedGroup] = useState<{ subject: string; grade: number | string; status: string } | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiClient.get('/questions?status=approved,sme_approved,published&limit=1000');
        setAllQuestions(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Group questions by Subject, Grade, AND Status for the summary table
  const groupedQuestions = React.useMemo(() => {
    const grouped = allQuestions.reduce((acc: any, q: any) => {
      const subjectName = q.subject?.name || 'Unknown';
      const gradeLevel = q.assessmentGrade || q.gradeLevel || 'Unknown';
      const status = q.aiValidationStatus || 'approved';
      const key = `${subjectName}-${gradeLevel}-${status}`;
      
      if (!acc[key]) {
        acc[key] = {
          id: key,
          subject: { name: subjectName },
          assessmentGrade: gradeLevel,
          term: q.term || '1',
          totalQuestions: 0,
          totalMarks: 0,
          status: status,
          createdAt: q.createdAt || new Date().toISOString(),
        };
      }
      
      acc[key].totalQuestions += 1;
      acc[key].totalMarks += (q.marks || 1);
      
      if (new Date(q.createdAt) > new Date(acc[key].createdAt)) {
        acc[key].createdAt = q.createdAt;
      }
      
      return acc;
    }, {});
    
    return Object.values(grouped) as any[];
  }, [allQuestions]);

  const filteredGroups = groupedQuestions.filter(bp => {
    return bp.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewDetails = (subjectName: string, gradeLevel: number | string, status: string) => {
    setSelectedGroup({ subject: subjectName, grade: gradeLevel, status });
    setSearchTerm('');
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setSearchTerm('');
  };

  // Detailed View Component
  if (selectedGroup) {
    const detailQuestions = allQuestions.filter(
      q => (q.subject?.name || 'Unknown') === selectedGroup.subject && 
           (q.assessmentGrade || q.gradeLevel || 'Unknown').toString() === selectedGroup.grade.toString() &&
           (q.aiValidationStatus || 'approved') === selectedGroup.status
    );

    const filteredDetailQuestions = detailQuestions.filter(q => 
      q.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen p-6 md:p-10 text-slate-800 font-sans max-w-[1600px] mx-auto bg-slate-50/50">
        <button 
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Summary Table
        </button>

        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="text-white" size={24} strokeWidth={2.5} />
              </div>
              {selectedGroup.subject} - Grade {selectedGroup.grade}
              <span className={`ml-3 inline-flex items-center gap-1.5 px-3 py-1 text-sm font-extrabold rounded-full uppercase ${
                selectedGroup.status === 'published' ? 'bg-indigo-100 text-indigo-700' :
                selectedGroup.status === 'sme_approved' ? 'bg-blue-100 text-blue-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedGroup.status.replace('_', ' ')}
              </span>
              <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-sm font-extrabold bg-slate-900 text-white rounded-full shadow-sm">
                {filteredDetailQuestions.length} Questions
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">
              Detailed list of final approved questions for this specific subject, grade, and status.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in these questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredDetailQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/40 p-6 md:p-8 transition-all hover:shadow-xl hover:border-emerald-200/50">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold tracking-wide uppercase">
                      <BookOpen size={12} /> {q.subject?.name || 'Unknown Subject'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold tracking-wide uppercase">
                      <Layers size={12} /> Grade {q.assessmentGrade || q.gradeLevel || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-extrabold tracking-wide uppercase">
                      {q.difficulty || 'Normal'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                      q.aiValidationStatus === 'published' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      q.aiValidationStatus === 'sme_approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <CheckCircle2 size={12} /> {q.aiValidationStatus ? q.aiValidationStatus.replace('_', ' ') : 'Approved'}
                    </span>
                  </div>

                  <div className="text-lg font-black text-slate-900 leading-relaxed mb-6">
                    <span className="text-slate-400 mr-2">{idx + 1}.</span>
                    {q.questionText}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options && q.options.map((opt: any) => (
                      <div 
                        key={opt.id} 
                        className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                          opt.isCorrect 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {opt.optionKey || '-'}
                        </div>
                        <div className="font-semibold text-sm pt-0.5">{opt.optionText}</div>
                        {opt.isCorrect && (
                          <div className="ml-auto">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:w-64 shrink-0 bg-slate-50 rounded-2xl p-5 border border-slate-100 h-fit">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Details</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Topic / Competency</p>
                      <p className="text-sm font-bold text-slate-800">{q.topic || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bloom Level</p>
                      <p className="text-sm font-bold text-slate-800">{q.bloomLevel || 'Recall'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Approved</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Summary Table View
  return (
    <div className="min-h-screen p-6 md:p-10 text-slate-800 font-sans max-w-[1600px] mx-auto bg-slate-50/50">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileQuestion className="text-white" size={24} strokeWidth={2.5} />
            </div>
            Assessment Blueprints (Approved Summary)
            {!loading && (
              <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-sm font-extrabold bg-slate-900 text-white rounded-full shadow-sm">
                {filteredGroups.length} Groups
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">
            Summary of all approved questions grouped by Subject, Grade, and Status. Click 'View' to see the full questions.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Subject</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Grade / Term</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Questions</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Marks</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Latest Update</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">Loading summary...</p>
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <FileQuestion size={40} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-700">No Groups Found</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">No approved questions found for this search.</p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((bp) => (
                  <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{bp.subject?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">Grade {bp.assessmentGrade}</p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Term {bp.term}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Layers size={14} className="text-slate-400" /> {bp.totalQuestions}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <BarChart size={14} className="text-slate-400" /> {bp.totalMarks}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                        bp.status === 'published' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        bp.status === 'sme_approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <CheckCircle2 size={12} /> {bp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-600">
                        {new Date(bp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleViewDetails(bp.subject.name, bp.assessmentGrade, bp.status)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                      >
                        <Eye size={16} className="mr-2" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
