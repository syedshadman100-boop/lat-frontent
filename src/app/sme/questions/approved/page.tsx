'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Loader2, ChevronRight, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ApprovedQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/questions?status=approved&limit=50');
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch approved questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedQuestions();
  }, []);

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1200px] mx-auto bg-[#f4f7fb]">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckSquare size={24} strokeWidth={2.5} />
            </div>
            Approved Questions
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Manage all live, approved questions available in the question bank.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search through approved questions..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors w-full md:w-auto shrink-0">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
            <p className="text-sm font-bold">Loading approved questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <CheckSquare size={56} className="text-gray-200 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-gray-800">No Approved Questions Yet</h3>
            <p className="text-sm font-medium text-gray-500 mt-2 max-w-md">There are currently no approved questions in the bank. Head over to the Review page to approve some!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {questions.map((q) => (
              <div key={q.id} className="p-6 hover:bg-[#fafcff] transition-colors group">
                <div className="flex items-start justify-between gap-6">
                  
                  {/* Left Side: Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        Approved
                      </span>
                      {q.isAiGenerated && (
                        <span className="px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                          AI Generated
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-400">ID: {q.id}</span>
                    </div>
                    
                    <h4 className="text-base font-bold text-gray-800 leading-relaxed mb-3">
                      {q.questionText}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500">
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                        <ChevronRight size={12} className="text-emerald-500"/> {q.subject?.name || 'Subject'}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                        Grade {q.gradeLevel}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 capitalize">
                        {q.difficulty}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 capitalize text-indigo-600">
                        {q.bloomTaxonomy}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit Question">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete Question">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
