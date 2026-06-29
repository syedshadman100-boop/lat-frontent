'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, Check, X, Search, Filter, ChevronRight, Eye, Send, ThumbsUp, ThumbsDown, FileQuestion, AlertTriangle, Target, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Question {
  id: string;
  questionText: string;
  contextText?: string;
  correctExplanation?: string;
  difficulty: string;
  bloomTaxonomy: string;
  aiValidationStatus: string;
  assessmentGrade?: number;
  qualityScore?: number;
  confidenceScore?: number;
  competencyMatchScore?: number;
  bloomMatchScore?: number;
  difficultyMatchScore?: number;
  languageQualityScore?: number;
  aiReviewerFeedback?: string;
  options?: { optionKey: string; optionText: string; isCorrect: boolean; distractorCategory?: string }[];
  subject?: { name: string };
  learningOutcome?: { code: string; description: string };
}

export default function AdminApprovalPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Question | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('submitted');
  const [stats, setStats] = useState({ submitted: 0, approved: 0, rejected: 0, published: 0 });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/questions?status=${filterStatus}&limit=100`);
      setQuestions(res.data.data || []);

      // Fetch stats
      const [submitted, approved, rejected, published] = await Promise.all([
        apiClient.get('/questions?status=submitted&limit=1'),
        apiClient.get('/questions?status=approved&limit=1'),
        apiClient.get('/questions?status=rejected&limit=1'),
        apiClient.get('/questions?status=published&limit=1'),
      ]);
      setStats({
        submitted: submitted.data.meta?.total || 0,
        approved: approved.data.meta?.total || 0,
        rejected: rejected.data.meta?.total || 0,
        published: published.data.meta?.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [filterStatus]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/questions/${id}/status`, { status: 'approved' });
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (selected?.id === id) setSelected(null);
      setStats(prev => ({ ...prev, submitted: prev.submitted - 1, approved: prev.approved + 1 }));
    } catch (err) { console.error('Approve failed', err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/questions/${id}/status`, { status: 'rejected' });
      await apiClient.post(`/questions/${id}/publish`, { action: 'reject', rejectReason });
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (selected?.id === id) setSelected(null);
      setShowRejectModal(null);
      setRejectReason('');
      setStats(prev => ({ ...prev, submitted: prev.submitted - 1, rejected: prev.rejected + 1 }));
    } catch (err) { console.error('Reject failed', err); }
    finally { setActionLoading(null); }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.post(`/questions/${id}/publish`, { action: 'publish' });
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (selected?.id === id) setSelected(null);
      setStats(prev => ({ ...prev, submitted: prev.submitted - 1, published: prev.published + 1 }));
    } catch (err) { console.error('Publish failed', err); }
    finally { setActionLoading(null); }
  };

  const scoreColor = (score: number | null | undefined) => {
    if (score == null) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      published: 'bg-purple-50 text-purple-700 border-purple-200',
      sme_approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return (
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-8 max-w-[1400px] mx-auto bg-[#f4f7fb] flex gap-6">
      {/* Left: Stats + List */}
      <div className="w-[420px] flex flex-col gap-4 shrink-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-indigo-600" /> Super Admin Approval
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Review SME-approved questions before publishing to LAT EXAM.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: stats.submitted, color: 'blue', icon: FileQuestion },
            { label: 'Approved', value: stats.approved, color: 'emerald', icon: CheckCircle },
            { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle },
            { label: 'Published', value: stats.published, color: 'purple', icon: Send },
          ].map(({ label, value, color, icon: Icon }) => (
            <button key={label} onClick={() => setFilterStatus(label === 'Pending' ? 'submitted' : label === 'Approved' ? 'approved' : label === 'Rejected' ? 'rejected' : 'published')}
              className={`p-3 rounded-xl border text-center transition-all ${filterStatus === (label === 'Pending' ? 'submitted' : label === 'Approved' ? 'approved' : label === 'Rejected' ? 'rejected' : 'published') ? `bg-${color}-50 border-${color}-300` : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <Icon size={16} className={`mx-auto mb-1 text-${color}-500`} />
              <p className={`text-lg font-bold text-${color}-600`}>{value}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search questions..." className="flex-1 text-sm font-medium focus:outline-none" />
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm font-medium">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <Check size={48} className="text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">All Clear!</h3>
              <p className="text-sm text-gray-500">No questions pending review.</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} onClick={() => setSelected(q)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selected?.id === q.id ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-gray-200 hover:border-indigo-200'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed">{q.questionText}</p>
                  {statusBadge(q.aiValidationStatus)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                  <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{q.subject?.name}</span>
                  <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Grade {q.assessmentGrade}</span>
                  {q.qualityScore != null && <span className={`px-2 py-0.5 rounded ${q.qualityScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>Q: {q.qualityScore}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900">Question Detail</h2>
                {statusBadge(selected.aiValidationStatus)}
              </div>
              <div className="flex items-center gap-2">
                {selected.aiValidationStatus === 'submitted' && (
                  <>
                    <button onClick={() => setShowRejectModal(selected.id)} disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50">
                      {actionLoading === selected.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsDown size={12} />}Reject
                    </button>
                    <button onClick={() => handleApprove(selected.id)} disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50">
                      {actionLoading === selected.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}Approve
                    </button>
                    <button onClick={() => handlePublish(selected.id)} disabled={actionLoading === selected.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                      {actionLoading === selected.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}Publish to LAT EXAM
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Question Text */}
              <div className="mb-5">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Question</h3>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{selected.questionText}</p>
              </div>

              {/* Context */}
              {selected.contextText && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Context / Scenario</h3>
                  <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-xl border border-amber-100">{selected.contextText}</p>
                </div>
              )}

              {/* Options */}
              <div className="mb-5">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Options</h3>
                <div className="space-y-2">
                  {selected.options?.map(opt => (
                    <div key={opt.optionKey} className={`flex items-start gap-3 p-3 rounded-xl text-sm border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-[11px] font-bold ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}>{opt.optionKey}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${opt.isCorrect ? 'text-emerald-900' : 'text-gray-700'}`}>{opt.optionText}</p>
                        {opt.distractorCategory && <p className="text-[11px] text-gray-500 mt-1 italic">{opt.distractorCategory}</p>}
                      </div>
                      {opt.isCorrect && <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {selected.correctExplanation && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Correct Explanation</h3>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl border border-blue-100">{selected.correctExplanation}</p>
                </div>
              )}

              {/* Scores */}
              <div className="mb-5">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><BarChart3 size={10} />Quality Scores</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Quality', key: 'qualityScore' }, { label: 'Competency', key: 'competencyMatchScore' }, { label: 'Bloom', key: 'bloomMatchScore' },
                    { label: 'Difficulty', key: 'difficultyMatchScore' }, { label: 'Language', key: 'languageQualityScore' }, { label: 'Confidence', key: 'confidenceScore' }
                  ].map(({ label, key }) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
                      <p className={`text-lg font-bold ${scoreColor((selected as any)[key])}`}>{(selected as any)[key] ?? '--'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent 2 Feedback */}
              {selected.aiReviewerFeedback && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Agent 2 Review</h3>
                  <p className="text-sm text-gray-600 italic bg-indigo-50 p-4 rounded-xl border border-indigo-100">{selected.aiReviewerFeedback}</p>
                </div>
              )}

              {/* Learning Outcome */}
              {selected.learningOutcome && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
                  <span className="font-bold">LO:</span> {selected.learningOutcome.code} — {selected.learningOutcome.description}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-gray-200 border-dashed">
            <Eye size={48} className="text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-400">Select a Question</h3>
            <p className="text-sm text-gray-400">Click a question from the list to review it.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[480px] p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Question</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejecting this question.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="Enter rejection reason..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none mb-4" />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200">Cancel</button>
              <button onClick={() => handleReject(showRejectModal)} disabled={!rejectReason.trim() || actionLoading === showRejectModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {actionLoading === showRejectModal ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
