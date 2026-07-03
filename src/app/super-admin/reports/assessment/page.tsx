'use client';

import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, CheckCircle2, Users, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function AssessmentReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/analytics/super-admin-dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch assessment reports data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Assessment Data...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data.</div>;
  }

  // Calculate completion rate
  // This assumes totalAssessments represents total exams assigned, and testsConducted represents submitted/graded.
  // Actually, we'll use totalAssessments for the first stat, testsConducted for "Students Evaluated"
  const completionRate = data.totalAssessments > 0 
    ? Math.round((data.testsConducted / (data.studentCount || 1)) * 100)
    : 0;
  
  // Guard against unrealistic percentages
  const safeCompletionRate = completionRate > 100 ? 100 : completionRate;

  const stats = [
    { label: 'Total Assessments', value: data.totalAssessments?.toString() || '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Average Score', value: `${Math.round(data.avgScore || 0)}%`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completion Rate', value: `${safeCompletionRate}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Students Evaluated', value: data.testsConducted?.toLocaleString() || '0', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const recentAssessments = (data.recentTestSessions || []).map((exam: any, idx: number) => {
    // Generate some mock values for display if they aren't available in the backend response
    // since recentTestSessions is just exam entities.
    return {
      id: exam.id || idx,
      name: exam.questionPaper?.name || `Exam ID: ${exam.id}`,
      date: new Date(exam.createdAt).toLocaleDateString(),
      students: data.studentCount || 0, // Fallback since exam doesn't have student count directly
      avgScore: `${Math.round(data.avgScore || 0)}%`, // Fallback 
      completion: `${safeCompletionRate}%`, // Fallback
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessment Reports</h1>
        <p className="text-gray-500 mt-2">Overview of school-wide assessment performance and metrics.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="text-blue-500" size={20} />
            Recent Assessments Performance
          </h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Assessment Name</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Students</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Score</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAssessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No recent assessments found</td>
                </tr>
              ) : (
                recentAssessments.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                    <td className="p-4 text-gray-500">{item.date}</td>
                    <td className="p-4 text-gray-500">{item.students}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        {item.avgScore}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: item.completion }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{item.completion}</span>
                      </div>
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
