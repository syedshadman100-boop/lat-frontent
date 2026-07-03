'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  TrendingUp, BarChart2, AlertTriangle, Award, 
  Download, Calendar, ChevronDown, Bell, Eye, CheckCircle2, Loader2
} from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiClient.get(`/exams/reports/teacher/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch report details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">Failed to load report data.</div>
    );
  }

  const { exam, stats, distribution, studentsList } = data;
  const maxTrendScore = Math.max(...distribution.map((d: any) => d.count), 1);

  return (
    <div className="p-8 pb-16">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{exam.name}</h1>
          <p className="text-gray-500 text-sm">Analyze performance for {exam.subject}.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgScore}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-green-50 text-green-500 p-3 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Completed Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.assessmentsCompleted}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-500 p-3 rounded-full">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Subject</p>
            <p className="text-xl font-bold text-gray-900 truncate">{exam.subject}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Needs Attention</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.needsAttention} <span className="text-sm font-semibold text-gray-400 ml-1">Students</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Score Distribution Chart */}
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Score Distribution</h2>
          </div>
          <div className="h-48 flex items-end justify-between space-x-2 pt-4">
            {distribution.map((d: any, index: number) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full max-w-[40px] flex items-end h-full bg-gray-50 rounded-t-md overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-300 rounded-t-md"
                    style={{ height: `${(d.count / maxTrendScore) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity duration-200">
                      {d.count}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-3 font-medium">{d.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competency Breakdown */}
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Competency Breakdown</h2>
            <BarChart2 size={20} className="text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-500 py-6">
              Competency breakdown requires more answer data...
            </div>
          </div>
        </div>

      </div>

      {/* Student Performance Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Student Performance</h2>
          <span className="text-sm font-medium text-gray-500">{studentsList.length} Students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Submit Time</th>
                <th className="px-6 py-4 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentsList.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.submitTime}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{student.score}</span>
                  </td>
                </tr>
              ))}
              {studentsList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No students have completed this assessment yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
