'use client';

import { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, BarChart3, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function QualityReportPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const fetchQuestions = async (status: string) => {
    setLoadingQuestions(true);
    try {
      // The backend accepts comma separated statuses or single status
      const response = await apiClient.get(`/questions?status=${status}&limit=50`);
      setQuestions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCardClick = (status: string | null) => {
    if (status === selectedStatus) {
      setSelectedStatus(null);
      setQuestions([]);
    } else {
      setSelectedStatus(status);
      if (status) {
        fetchQuestions(status);
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/sme-quality-report');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch SME quality report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
        Failed to load statistics. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Question Quality Report</h1>
        <p className="mt-2 text-gray-500 font-medium">Track your AI generation output and SME review accuracy rates.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => handleCardClick(null)}
          className={`bg-white rounded-2xl p-6 border ${selectedStatus === null ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-100'} shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target size={64} className="text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Generated</p>
          <p className="text-4xl font-black text-gray-900">{stats.totalGenerated}</p>
        </div>

        <div 
          onClick={() => handleCardClick('pending')}
          className={`bg-white rounded-2xl p-6 border ${selectedStatus === 'pending' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100'} shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BarChart3 size={64} className="text-amber-500" />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Pending Review</p>
          <p className="text-4xl font-black text-amber-600">{stats.pendingReview}</p>
        </div>

        <div 
          onClick={() => handleCardClick('sme_approved,approved')}
          className={`bg-white rounded-2xl p-6 border ${selectedStatus === 'sme_approved,approved' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-100'} shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">SME Approved</p>
          <p className="text-4xl font-black text-emerald-600">{stats.smeApproved}</p>
        </div>

        <div 
          onClick={() => handleCardClick('sme_rejected,rejected')}
          className={`bg-white rounded-2xl p-6 border ${selectedStatus === 'sme_rejected,rejected' ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-100'} shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <XCircle size={64} className="text-rose-500" />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">SME Rejected</p>
          <p className="text-4xl font-black text-rose-600">{stats.smeRejected}</p>
        </div>
      </div>

      {/* Acceptance Rate Dashboard */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SME Acceptance Rate</h2>
            <p className="text-gray-500 mb-6">Percentage of generated questions that met the quality standards and were approved during review.</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">Approval Progress</span>
                <span className="text-emerald-600">{stats.approvalRate}% Approved</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-1000 ease-out"
                  style={{ width: `${stats.approvalRate}%` }}
                />
                <div 
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-1000 ease-out"
                  style={{ width: `${100 - stats.approvalRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>{stats.smeApproved} Questions</span>
                <span>{stats.smeRejected} Rejected</span>
              </div>
            </div>
          </div>
          
          <div className="w-48 h-48 rounded-full border-8 border-gray-50 flex items-center justify-center relative shadow-inner">
             <div className="absolute inset-0 border-8 border-emerald-500 rounded-full opacity-20"></div>
             <div className="text-center">
               <span className="block text-5xl font-black text-gray-900">{stats.approvalRate}%</span>
               <span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Accuracy</span>
             </div>
          </div>
        </div>
      </div>

      {/* Drill-down Questions List */}
      {selectedStatus && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-8 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedStatus === 'pending' ? 'Pending Questions' : 
               selectedStatus.includes('approved') ? 'Approved Questions' : 'Rejected Questions'}
            </h2>
            <button 
              onClick={() => handleCardClick(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Close view
            </button>
          </div>
          
          {loadingQuestions ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions found for this status.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{q.questionText}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          {q.subject?.name} • Grade {q.assessmentGrade}
                        </span>
                        <span className="font-medium text-indigo-600 capitalize bg-indigo-50 px-2 py-0.5 rounded">
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <div>
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                         ${q.aiValidationStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                           q.aiValidationStatus.includes('approved') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                         }`}>
                         {q.aiValidationStatus.replace('_', ' ')}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
