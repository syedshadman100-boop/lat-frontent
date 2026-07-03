'use client';

import React, { useState, useEffect } from 'react';
import { FileQuestion, Check, X, Search, Loader2, ChevronDown, ChevronRight, Filter, AlertTriangle, Target, Brain, BookOpen, BarChart3, ThumbsUp, ThumbsDown, Lightbulb, Send, Layers, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function FinalReviewPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [showReport, setShowReport] = useState(true);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/questions?status=sme_approved,sme_rejected&limit=50');
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handlePublish = async (id: string) => {
    setIsUpdating(true);
    try {
      await apiClient.post(`/questions/${id}/publish`, { action: 'publish' });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuestion?.id === id) setSelectedQuestion(null);
    } catch (err) {
      console.error('Failed to publish question', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason && showRejectInput) return;
    setIsUpdating(true);
    try {
      await apiClient.post(`/questions/${id}/publish`, {
        action: 'reject',
        rejectReason: rejectReason || 'admin_override',
      });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
        setShowRejectInput(false);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Failed to reject question', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const scoreColor = (score: number | null | undefined) => {
    if (score == null) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredQuestions = questions.filter(q => 
    q.questionText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <div className="max-w-[1500px] mx-auto p-6 flex gap-6 h-screen overflow-hidden">

        {/* Left Column: Master List */}
        <div className="w-[45%] flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header & Search */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 shrink-0">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 mb-1">Final Review Queue</h1>
            <p className="text-xs text-gray-500 mb-4">Review SME decisions before publishing to the live bank.</p>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-shadow"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Loader2 size={24} className="animate-spin mb-3" />
                <p className="text-xs">Loading queue...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <CheckCircle2 size={32} className="text-gray-300 mb-3" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-gray-900 mb-1">Queue is empty</h3>
                <p className="text-xs text-gray-500">No questions currently require final review.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => { setSelectedQuestion(q); setShowRejectInput(false); setRejectReason(''); }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedQuestion?.id === q.id 
                        ? 'bg-blue-50/50 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className={`text-sm line-clamp-2 leading-relaxed ${selectedQuestion?.id === q.id ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                        {q.questionText}
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wider border ${
                        q.aiValidationStatus === 'sme_approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                        q.aiValidationStatus === 'sme_rejected' ? 'bg-red-50 text-red-700 border-red-200/50' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {q.aiValidationStatus === 'sme_approved' ? 'Approved' :
                         q.aiValidationStatus === 'sme_rejected' ? 'Rejected' :
                         'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><BookOpen size={12}/> {q.subject?.name || 'Subject'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1"><Layers size={12} /> G{q.assessmentGrade || q.gradeLevel}</span>
                      <span className="text-gray-300">•</span>
                      <span className="capitalize">{q.difficulty}</span>
                      <span className="text-gray-300">•</span>
                      <span className="capitalize">{q.bloomTaxonomy}</span>
                      {q.qualityScore != null && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className={`font-semibold ${scoreColor(q.qualityScore)}`}>
                            {q.qualityScore}/100
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="w-[55%] flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {selectedQuestion ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-gray-200 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-sm uppercase tracking-wider border border-gray-200">
                      {selectedQuestion.questionType?.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">ID: {selectedQuestion.id.substring(0,8)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedQuestion.aiValidationStatus === 'sme_rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-md border border-red-200/60">
                        <ThumbsDown size={14} /> SME Rejected
                      </span>
                    )}
                    {selectedQuestion.aiValidationStatus === 'sme_approved' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200/60">
                        <ThumbsUp size={14} /> SME Approved
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-medium text-gray-900 leading-relaxed mb-6">
                  {selectedQuestion.questionText}
                </h2>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Difficulty</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedQuestion.difficulty}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Bloom's Level</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedQuestion.bloomTaxonomy}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Learning Outcome</span>
                    <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={selectedQuestion.learningOutcome?.description}>
                      {selectedQuestion.learningOutcome?.description || `LO ID: ${selectedQuestion.learningOutcomeId}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Detail Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                
                {/* Options Section */}
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Options & Evaluation</h3>
                <div className="space-y-3 mb-8">
                  {selectedQuestion.options?.map((opt: any, index: number) => (
                    <div key={opt.id || index} className={`relative p-3 rounded-lg border flex gap-3 text-sm ${opt.isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-gray-200'}`}>
                      <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-medium ${opt.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {opt.optionKey}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`font-medium ${opt.isCorrect ? 'text-emerald-900' : 'text-gray-700'}`}>{opt.optionText}</p>
                        
                        {opt.distractorCategory && !opt.isCorrect && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                            <AlertTriangle size={10} /> {opt.distractorCategory}
                          </div>
                        )}
                        
                        {opt.isCorrect && selectedQuestion.correctExplanation && (
                          <div className="mt-3 p-3 bg-white border border-emerald-100 rounded-md shadow-sm">
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Explanation</span>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {selectedQuestion.correctExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Review Report */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setShowReport(!showReport)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                      <Brain size={14} className="text-blue-500" /> AI Agent Report
                    </div>
                    {showReport ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  </button>
                  
                  {showReport && (
                    <div className="p-4 border-t border-gray-200">
                      {selectedQuestion.overallReviewResult && (
                        <div className="mb-4 text-sm flex gap-3">
                          <div className={`mt-0.5 ${selectedQuestion.overallReviewResult === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {selectedQuestion.overallReviewResult === 'approved' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 capitalize">Overall: {selectedQuestion.overallReviewResult}</span>
                            {selectedQuestion.aiReviewerFeedback && (
                              <p className="text-gray-600 mt-1 text-xs leading-relaxed">{selectedQuestion.aiReviewerFeedback}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 pt-4 border-t border-gray-100">
                        {[
                          { label: 'Quality', key: 'qualityScore' },
                          { label: 'Confidence', key: 'confidenceScore' },
                          { label: 'Competency', key: 'competencyMatchScore' },
                          { label: 'Bloom', key: 'bloomMatchScore' },
                          { label: 'Difficulty', key: 'difficultyMatchScore' },
                          { label: 'Language', key: 'languageQualityScore' },
                        ].map(({ label, key }) => (
                          <div key={key} className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">{label}</span>
                            <span className={`font-medium ${scoreColor(selectedQuestion[key])}`}>
                              {selectedQuestion[key] ?? '--'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {selectedQuestion.duplicateSimilarityScore > 70 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md flex gap-2 text-xs text-red-800">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                          <div>
                            <span className="font-semibold block">Potential Duplicate</span>
                            <span>Similarity score: {selectedQuestion.duplicateSimilarityScore}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-gray-200 shrink-0 bg-white">
                {showRejectInput ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      autoFocus
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(selectedQuestion.id)}
                        disabled={isUpdating || !rejectReason.trim()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isUpdating && <Loader2 size={14} className="animate-spin" />}
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowRejectInput(true)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <X size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handlePublish(selectedQuestion.id)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                      Publish to Bank
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileQuestion size={32} className="mb-4 text-gray-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-900">No question selected</p>
              <p className="text-xs mt-1">Select a question from the queue to review details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
