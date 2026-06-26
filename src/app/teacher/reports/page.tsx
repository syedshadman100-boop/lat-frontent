'use client';

import React from 'react';
import { 
  TrendingUp, BarChart2, AlertTriangle, Award, 
  Download, Calendar, ChevronDown, Bell, Eye
} from 'lucide-react';

export default function ReportsPage() {
  
  // Mock Data
  const recentAssessments = [
    { id: 1, name: 'Grade 5 Mathematics LAT', subject: 'Mathematics', date: '15 Jul 2026', participants: '120/120', avgScore: '82%', passRate: '95%' },
    { id: 2, name: 'Grade 5 Science LAT', subject: 'Science', date: '10 Jul 2026', participants: '118/120', avgScore: '76%', passRate: '88%' },
    { id: 3, name: 'Grade 5 English LAT', subject: 'English', date: '05 Jul 2026', participants: '119/120', avgScore: '85%', passRate: '98%' },
    { id: 4, name: 'Grade 5 EVS LAT', subject: 'Environmental Studies', date: '28 Jun 2026', participants: '120/120', avgScore: '72%', passRate: '85%' },
  ];

  const trendData = [
    { week: 'Week 1', score: 72 },
    { week: 'Week 2', score: 76 },
    { week: 'Week 3', score: 75 },
    { week: 'Week 4', score: 82 },
  ];
  const maxTrendScore = 100;

  const competencies = [
    { name: 'Problem Solving', progress: 85, color: 'bg-blue-500' },
    { name: 'Critical Thinking', progress: 72, color: 'bg-purple-500' },
    { name: 'Reading Comprehension', progress: 88, color: 'bg-green-500' },
    { name: 'Scientific Inquiry', progress: 65, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8 pb-16">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Performance Reports</h1>
          <p className="text-gray-500 text-sm">Analyze class performance and assessment metrics.</p>
        </div>
        <div className="flex items-center space-x-4">
          
          <div className="hidden md:flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <Calendar size={14} className="text-gray-400" />
            <span>Last 30 Days</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block"></div>

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center space-x-2 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-xs">
              RS
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
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
              78% <span className="text-sm font-semibold text-green-500 ml-1">↑ 4%</span>
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-green-50 text-green-500 p-3 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Assessments Completed</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-500 p-3 rounded-full">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Top Subject</p>
            <p className="text-xl font-bold text-gray-900 truncate">Mathematics</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Needs Attention</p>
            <p className="text-2xl font-bold text-gray-900">
              8 <span className="text-sm font-semibold text-gray-400 ml-1">Students</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Performance Trend Bar Chart (CSS) */}
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Performance Trend</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View details</button>
          </div>
          <div className="h-48 flex items-end justify-between space-x-2 pt-4">
            {trendData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full max-w-[40px] flex items-end h-full bg-gray-50 rounded-t-md overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-300 rounded-t-md"
                    style={{ height: `${(data.score / maxTrendScore) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity duration-200">
                      {data.score}%
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-3 font-medium">{data.week}</span>
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
            {competencies.map((comp, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">{comp.name}</span>
                  <span className="text-sm font-bold text-gray-900">{comp.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${comp.color}`}
                    style={{ width: `${comp.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Assessments</h2>
          <button className="text-sm font-medium text-blue-600 hover:underline">View all assessments</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Assessment Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Participants</th>
                <th className="px-6 py-4 font-semibold">Avg Score</th>
                <th className="px-6 py-4 font-semibold">Pass Rate</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAssessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{assessment.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{assessment.subject}</td>
                  <td className="px-6 py-4">{assessment.date}</td>
                  <td className="px-6 py-4">{assessment.participants}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{assessment.avgScore}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                      {assessment.passRate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="flex items-center justify-center w-full space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Needed to import CheckCircle2 because it was missed in the initial import block
function CheckCircle2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
