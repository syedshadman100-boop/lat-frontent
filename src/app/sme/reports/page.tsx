'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileQuestion, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { formatDistanceToNow, format } from 'date-fns';

export default function SMEReportsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get('/jobs/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalGenerated = history.reduce((sum, item) => sum + (item.generatedCount || 0), 0);
  const totalRequested = history.reduce((sum, item) => sum + (item.requestedCount || 0), 0);

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1200px] mx-auto bg-[#f4f7fb]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Generation Reports</h1>
        <p className="text-gray-500 mt-2">
          Track the performance and time taken for your AI question generation requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Jobs</p>
            <p className="text-2xl font-black text-gray-900">{history.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <FileQuestion size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Questions Generated</p>
            <p className="text-2xl font-black text-gray-900">{totalGenerated} <span className="text-sm text-gray-400">/ {totalRequested}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Avg Time / Q</p>
            <p className="text-2xl font-black text-gray-900">~ 5s</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-[#fafcff]">
          <h3 className="text-lg font-extrabold text-gray-800">Recent Generation Requests</h3>
        </div>
        
        {loading && history.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Activity size={48} className="mb-4 text-gray-200" />
            <p className="font-bold">No generation history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Count</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((job) => {
                  let timeTaken = 'Calculating...';
                  if (job.startTime && job.endTime) {
                    const start = new Date(job.startTime).getTime();
                    const end = new Date(job.endTime).getTime();
                    const seconds = Math.round(Math.abs(end - start) / 1000);
                    
                    if (job.status === 'failed') {
                      timeTaken = 'N/A';
                    } else {
                      timeTaken = seconds < 60 ? `${seconds} seconds` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
                    }
                  } else if (job.status === 'processing' && job.startTime) {
                    const start = new Date(job.startTime).getTime();
                    const now = new Date().getTime();
                    const seconds = Math.round((now - start) / 1000);
                    timeTaken = `In Progress (${seconds}s)`;
                  }

                  return (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{format(new Date(job.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-gray-500 font-medium">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                          job.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          job.status === 'processing' ? 'bg-indigo-50 text-indigo-700' :
                          job.status === 'failed' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status === 'completed' && <CheckCircle2 size={14} />}
                          {job.status === 'processing' && <Loader2 size={14} className="animate-spin" />}
                          {job.status === 'failed' && <XCircle size={14} />}
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{job.generatedCount} <span className="text-gray-400 font-medium">/ {job.requestedCount}</span></p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-700 font-mono bg-gray-50 px-2 py-1 inline-block rounded-md border border-gray-100">
                          {timeTaken}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
