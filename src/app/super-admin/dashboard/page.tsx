"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  CalendarCheck, 
  Target,
  ChevronDown,
  UserPlus,
  Search,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/analytics/super-admin-dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <CalendarIcon size={16} className="text-gray-400" />
            <span>{today}</span>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { title: 'Total Students', value: stats.totalStudents?.toLocaleString() || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Total Assessments', value: stats.totalAssessments?.toLocaleString() || '0', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Tests Conducted', value: stats.testsConducted?.toLocaleString() || '0', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Average Score', value: `${stats.averageScore || 0}%`, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Grid - Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Assessment Overview (Line Chart Visual) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-bold text-gray-900">Assessment Overview</h2>
                  <span className="text-xs text-gray-400 font-medium">(Current Status)</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="w-full flex justify-between items-end h-40 border-b border-gray-200 pb-2 relative">
                  <div className="w-1/4 h-[80%] bg-blue-500 rounded-t-lg mx-2 opacity-80 hover:opacity-100 transition-opacity relative group">
                    <div className="absolute -top-8 w-full text-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{stats.testsConducted}</div>
                  </div>
                  <div className="w-1/4 h-[40%] bg-emerald-400 rounded-t-lg mx-2 opacity-80 hover:opacity-100 transition-opacity relative group">
                    <div className="absolute -top-8 w-full text-center text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">{stats.totalAssessments}</div>
                  </div>
                  <div className="w-1/4 h-[60%] bg-purple-500 rounded-t-lg mx-2 opacity-80 hover:opacity-100 transition-opacity relative group">
                    <div className="absolute -top-8 w-full text-center text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">{stats.totalStudents}</div>
                  </div>
                </div>
                <div className="w-full flex justify-between text-[10px] text-gray-500 pt-2 font-medium px-4">
                  <span>Tests Conducted</span>
                  <span>Assessments Created</span>
                  <span>Total Students</span>
                </div>
              </div>
            </div>

            {/* Recent Test Sessions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Test Sessions</h2>
              </div>
              
              <div className="overflow-x-auto flex-1">
                {stats.recentTestSessions && stats.recentTestSessions.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[40%]">Test Session</th>
                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Class/Group</th>
                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[25%]">Started On</th>
                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[15%] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.recentTestSessions.map((row: any, i: number) => {
                        let statusColor = 'bg-gray-100 text-gray-700';
                        if (row.status === 'published' || row.status === 'live') statusColor = 'bg-emerald-100 text-emerald-700';
                        if (row.status === 'completed' || row.status === 'graded') statusColor = 'bg-blue-100 text-blue-700';
                        
                        return (
                          <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pr-4">
                              <p className="text-[13px] font-bold text-gray-900 leading-snug">{row.name}</p>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="text-xs font-medium text-gray-500">{row.class}</span>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="text-xs font-medium text-gray-500">{new Date(row.date).toLocaleDateString()}</span>
                            </td>
                            <td className="py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-sm">No recent test sessions available.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Grid - Donut Charts & Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Question Review */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Pending Review</h2>
              </div>
              <div className="space-y-4">
                {stats.questionReview && stats.questionReview.length > 0 ? (
                  stats.questionReview.map((q: any, i: number) => (
                    <div key={i} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">{q.title}</p>
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase tracking-wider rounded">Pending</span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400">{q.subject}</p>
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">{new Date(q.date).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No questions pending review.</p>
                )}
              </div>
            </div>

            {/* Approved Questions Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Approved Questions</h2>
              </div>
              <div className="flex-1 flex items-center justify-center gap-8">
                 <div className="w-32 h-32 rounded-full border-[12px] border-emerald-400 border-r-blue-400 border-b-purple-400 border-l-orange-400 flex items-center justify-center relative shadow-sm">
                    <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-white m-1 rounded-full">
                      <span className="text-xl font-bold text-gray-900 leading-none">{stats.approvedQuestions?.total || 0}</span>
                      <span className="text-[9px] font-medium text-gray-400 mt-1">Total Approved</span>
                    </div>
                 </div>
                 <div className="space-y-3 flex-1">
                   {stats.approvedQuestions?.bySubject && stats.approvedQuestions.bySubject.length > 0 ? (
                     stats.approvedQuestions.bySubject.map((sub: any, i: number) => {
                       const colors = ['bg-blue-400', 'bg-emerald-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400'];
                       return (
                         <div key={i} className="flex justify-between items-center gap-2 text-xs">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                             <span className="font-medium text-gray-500 truncate max-w-[80px]">{sub.name}</span>
                           </div>
                           <span className="font-bold text-gray-900">{sub.count}</span>
                         </div>
                       );
                     })
                   ) : (
                     <p className="text-xs text-gray-400">No data</p>
                   )}
                 </div>
              </div>
            </div>

            {/* Student Performance Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Student Performance</h2>
              </div>
              <div className="flex-1 flex items-center justify-center gap-6">
                 <div className="w-32 h-32 rounded-full border-[12px] border-blue-600 border-r-emerald-500 border-b-orange-400 border-l-red-500 flex items-center justify-center relative shadow-sm">
                    <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-white m-1 rounded-full">
                      <span className="text-xl font-bold text-gray-900 leading-none">{stats.studentPerformance?.total || 0}</span>
                      <span className="text-[9px] font-medium text-gray-400 mt-1">Graded Tests</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center gap-4 text-xs">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="font-medium text-gray-500">Above 75%</span></div>
                     <span className="font-bold text-gray-900">{stats.studentPerformance?.above75 || 0}</span>
                   </div>
                   <div className="flex justify-between items-center gap-4 text-xs">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="font-medium text-gray-500">50% - 75%</span></div>
                     <span className="font-bold text-gray-900">{stats.studentPerformance?.between50and75 || 0}</span>
                   </div>
                   <div className="flex justify-between items-center gap-4 text-xs">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div><span className="font-medium text-gray-500">25% - 50%</span></div>
                     <span className="font-bold text-gray-900">{stats.studentPerformance?.between25and50 || 0}</span>
                   </div>
                   <div className="flex justify-between items-center gap-4 text-xs">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="font-medium text-gray-500">Below 25%</span></div>
                     <span className="font-bold text-gray-900">{stats.studentPerformance?.below25 || 0}</span>
                   </div>
                 </div>
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700">
                <UserPlus size={16} className="text-blue-600" /> Create User
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700">
                <Search size={16} className="text-blue-600" /> Review Questions
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-blue-600" /> View Approved Questions
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700">
                <BarChart2 size={16} className="text-blue-600" /> Student Reports
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700">
                <TrendingUp size={16} className="text-blue-600" /> Assessment Reports
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-red-500 py-10 font-medium">
          Failed to load dashboard statistics.
        </div>
      )}

    </div>
  );
}
