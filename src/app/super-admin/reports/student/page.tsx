'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Search, 
  Filter, 
  Download,
  ChevronDown,
  BarChart2,
  Calendar,
  MoreVertical
} from 'lucide-react';

export default function StudentReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Placeholder data for the table
  const students = [
    { id: 1, name: 'Aarav Sharma', school: 'KV No. 1 Delhi', grade: 'Grade 5', score: 92, status: 'Excellent', trend: '+5%' },
    { id: 2, name: 'Diya Patel', school: 'KV Barwani', grade: 'Grade 8', score: 85, status: 'Good', trend: '+2%' },
    { id: 3, name: 'Vihaan Singh', school: 'KV No. 2 Delhi', grade: 'Grade 3', score: 64, status: 'Needs Improvement', trend: '-3%' },
    { id: 4, name: 'Ananya Gupta', school: 'KV Barwani', grade: 'Grade 5', score: 78, status: 'Average', trend: '+1%' },
    { id: 5, name: 'Arjun Verma', school: 'KV No. 1 Delhi', grade: 'Grade 8', score: 45, status: 'At Risk', trend: '-8%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Average': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Needs Improvement': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'At Risk': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500';
  };

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1400px] mx-auto bg-[#f8fafc]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Student Reports</h1>
          <p className="text-sm font-medium text-gray-500">Analyze performance metrics and learning outcomes across all schools.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(29,78,216,0.25)] hover:shadow-[0_6px_16px_rgba(29,78,216,0.35)]">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Organization</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none">
            <option>All Organizations</option>
            <option>Sri Aurobindo Society</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">School</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none">
            <option>All Schools</option>
            <option>KV Barwani</option>
            <option>KV No.1 Delhi</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Grade</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none">
            <option>All Grades</option>
            <option>Grade 3</option>
            <option>Grade 5</option>
            <option>Grade 8</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Date Range</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> 12%
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">24,592</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students Assessed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Target size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> 4.2%
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">68%</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average LAT Score</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <BarChart2 size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">142,805</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Assessments Completed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> 2.1%
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">14%</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Students Below Baseline</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Chart Area placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Performance Trends</h2>
            <select className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-64 pt-8">
            {/* Mock Chart Bars */}
            {[45, 52, 58, 65, 62, 68].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group relative">
                <div className="w-full bg-blue-100 rounded-t-xl overflow-hidden" style={{ height: '100%' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-500 group-hover:opacity-80" 
                    style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-400">Month {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competency Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Competency Breakdown</h2>
          <div className="space-y-6">
            {[
              { name: 'Reading Comprehension', score: 72, color: 'bg-emerald-500' },
              { name: 'Basic Arithmetic', score: 65, color: 'bg-blue-500' },
              { name: 'Logical Reasoning', score: 48, color: 'bg-orange-500' },
              { name: 'Scientific Knowledge', score: 81, color: 'bg-purple-500' }
            ].map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">{skill.name}</span>
                  <span className="text-sm font-bold text-gray-900">{skill.score}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Student Assessments</h2>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by student name or ID..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">School</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">LAT Score</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.school}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.grade}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900">{student.score}%</span>
                      <span className={`text-xs font-bold ${getTrendColor(student.trend)}`}>{student.trend}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
          <div>Showing 1 to 5 of 24,592 entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-lg border border-transparent">1</button>
            <button className="px-3 py-1.5 hover:bg-gray-50 rounded-lg text-gray-700">2</button>
            <button className="px-3 py-1.5 hover:bg-gray-50 rounded-lg text-gray-700">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>

      </div>

    </div>
  );
}
