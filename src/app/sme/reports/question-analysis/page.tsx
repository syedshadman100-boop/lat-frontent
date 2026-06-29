'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Filter, Loader2, CheckCircle2, Bot, BrainCircuit } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function SMEQuestionAnalysisReport() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Fetching up to 100 recent questions across all statuses for the report
      const res = await apiClient.get('/questions?limit=100');
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch questions for report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1400px] mx-auto bg-[#f4f7fb]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2 mb-2 tracking-tight">
          <BarChart3 size={28} className="text-indigo-600" /> SME Question Analysis Report
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Detailed analytics on AI-generated questions, correct answers, AI model metrics, and final approval status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#fafcff]">
          <div className="relative w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by question text or AI..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest font-extrabold text-gray-400">
                <th className="p-5">Question & Correct Answer</th>
                <th className="p-5">AI Infrastructure</th>
                <th className="p-5">AI SME Analysis Scores</th>
                <th className="p-5">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4 text-indigo-500" />
                    <p className="font-bold">Aggregating Analysis Data...</p>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-400 font-bold">
                    No questions found for this report.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const correctOption = q.options?.find((opt: any) => opt.isCorrect);
                  
                  return (
                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Question & Answer Column */}
                      <td className="p-5 align-top w-2/5">
                        <p className="font-semibold text-gray-900 mb-3 leading-relaxed">
                          {q.questionText}
                        </p>
                        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 mb-1.5 uppercase tracking-widest">
                            <CheckCircle2 size={14} /> Correct Option Highlight
                          </p>
                          <p className="text-sm font-bold text-emerald-900">
                            <span className="mr-1.5 px-1.5 py-0.5 bg-emerald-100 rounded-md text-xs">{correctOption?.optionKey}</span> 
                            {correctOption?.optionText || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* AI Generation Column */}
                      <td className="p-5 align-top">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><Bot size={16} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Generated By</p>
                              <p className="text-sm font-bold text-gray-800">{q.aiProvider || 'Unknown'}</p>
                              <p className="text-[11px] font-medium text-gray-500 font-mono mt-0.5">{q.aiModel || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><BrainCircuit size={16} /></div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Reviewed By</p>
                              <p className="text-sm font-bold text-gray-800">{q.aiProvider || 'System AI'}</p>
                              <p className="text-[11px] font-medium text-gray-500 font-mono mt-0.5">{q.aiModel || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* AI Analysis Scores Column */}
                      <td className="p-5 align-top">
                        {q.qualityScore !== null && q.qualityScore !== undefined ? (
                          <div className="grid grid-cols-2 gap-2 w-52">
                            <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm text-center">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quality</p>
                              <p className={`text-lg font-black ${q.qualityScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{q.qualityScore}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm text-center">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confidence</p>
                              <p className={`text-lg font-black ${q.confidenceScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{q.confidenceScore}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm text-center">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Competency</p>
                              <p className={`text-lg font-black ${q.competencyMatchScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{q.competencyMatchScore}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm text-center">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bloom</p>
                              <p className={`text-lg font-black ${q.bloomMatchScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{q.bloomMatchScore}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 border-dashed">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Awaiting Analysis...</span>
                          </div>
                        )}
                      </td>

                      {/* Validation Status Column */}
                      <td className="p-5 align-top">
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Overall Status</p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                              q.aiValidationStatus === 'sme_approved' || q.aiValidationStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : q.aiValidationStatus === 'rejected' || q.aiValidationStatus === 'sme_rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {q.aiValidationStatus.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {q.aiReviewerFeedback && (
                            <div className="mt-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">AI Feedback Snippet</p>
                              <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3" title={q.aiReviewerFeedback}>
                                {q.aiReviewerFeedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
