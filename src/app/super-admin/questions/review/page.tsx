'use client';

import React, { useState, useEffect } from 'react';
import { FileQuestion, Check, X, Search, Loader2, ChevronDown, ChevronRight, Filter, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ReviewQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const fetchPendingQuestions = async () => {
    setLoading(true);
    try {
      let targetStatus = 'pending';
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const roleNames = user.roles || [];
        if (roleNames.includes('SUPER_ADMIN')) {
          targetStatus = 'sme_approved';
        }
      }
      const res = await apiClient.get(`/questions?status=${targetStatus}&limit=50`);
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.patch(`/questions/${id}/status`, { status });
      // Remove from list
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error(`Failed to update status to ${status}`, err);
    }
  };

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1400px] mx-auto bg-[#f4f7fb] flex gap-6">
      
      {/* Left Column: List */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Final Question Review</h1>
          <p className="text-sm text-gray-500 mt-1">
            Super Admin: Review SME-approved AI questions before publishing them to the live question bank.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
              <p className="text-sm font-medium">Loading pending questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Check size={48} className="text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
              <p className="text-sm font-medium text-gray-500">There are no pending questions to review.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div 
                key={q.id} 
                onClick={() => setSelectedQuestion(q)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedQuestion?.id === q.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                    {q.questionText}
                  </p>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    q.aiValidationStatus === 'sme_approved' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {q.aiValidationStatus === 'sme_approved' ? 'Super Admin Review' : 'SME Pending'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><ChevronRight size={12} className="text-indigo-400"/> {q.subject?.name || 'Subject'}</span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">Grade {q.gradeLevel}</span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 capitalize text-indigo-600">{q.bloomTaxonomy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Detail View */}
      <div className="w-1/2 flex flex-col h-[calc(100vh-6rem)] sticky top-8">
        {selectedQuestion ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-[#fafcff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Question Details</h3>
                <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {selectedQuestion.questionType.replace('_', ' ')}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900 leading-relaxed mb-6">
                {selectedQuestion.questionText}
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Difficulty</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{selectedQuestion.difficulty}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bloom's Level</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{selectedQuestion.bloomTaxonomy}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Learning Outcome</p>
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2" title={selectedQuestion.learningOutcome?.description}>
                    {selectedQuestion.learningOutcome?.description || `LO ID: ${selectedQuestion.learningOutcomeId}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {selectedQuestion.aiReviewerFeedback && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Check size={14} /> AI Reviewer Feedback
                  </h4>
                  <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                    {selectedQuestion.aiReviewerFeedback}
                  </p>
                </div>
              )}

              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Options & Distractors</h4>
              <div className="space-y-3">
                {selectedQuestion.options?.map((opt: any, index: number) => (
                  <div key={opt.id || index} className={`p-4 rounded-xl border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {opt.optionKey}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${opt.isCorrect ? 'text-emerald-900' : 'text-gray-700'}`}>{opt.optionText}</p>
                        {opt.distractorCategory && !opt.isCorrect && (
                          <p className="text-[11px] font-medium text-gray-500 mt-1.5 flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-orange-400" />
                            {opt.distractorCategory}
                          </p>
                        )}
                        {opt.isCorrect && selectedQuestion.correctExplanation && (
                          <p className="text-xs font-medium text-emerald-700 mt-2 p-2 bg-emerald-100/50 rounded-lg">
                            <span className="font-bold block mb-1">Explanation:</span>
                            {selectedQuestion.correctExplanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex items-center gap-3">
              <button 
                onClick={() => handleUpdateStatus(selectedQuestion.id, 'rejected')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors"
              >
                <X size={18} strokeWidth={2.5} /> Reject Question
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedQuestion.id, 'approved')}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1e40af] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(30,64,175,0.25)] hover:bg-[#1e3a8a] hover:shadow-[0_6px_16px_rgba(30,64,175,0.3)] transition-all disabled:opacity-50"
              >
                <Check size={18} strokeWidth={2.5} /> {isUpdating ? 'Publishing...' : 'Publish Question'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-3xl border border-gray-100 border-dashed flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <FileQuestion size={48} className="mb-4 text-gray-200" strokeWidth={1} />
            <p className="text-sm font-bold text-gray-500 mb-1">Select a question to review</p>
            <p className="text-xs font-medium text-gray-400">Click any question from the list on the left to see its full details, options, and distractors.</p>
          </div>
        )}
      </div>

    </div>
  );
}
