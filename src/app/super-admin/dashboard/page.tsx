import React from 'react';
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
  TrendingUp
} from 'lucide-react';

export default function SuperAdminDashboard() {
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
            <span>May 20, 2025</span>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { title: 'Total Students', value: '12,568', change: '+ 8.4%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Assessments', value: '342', change: '+ 12.6%', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Tests Conducted', value: '128', change: '+ 15.3%', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Average Score', value: '72.6%', change: '+ 5.7%', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {stat.change} <span className="text-gray-400 font-normal">from last month</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid - Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Assessment Overview (Line Chart Placeholder) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-900">Assessment Overview</h2>
              <span className="text-xs text-gray-400 font-medium">(Last 7 Days)</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer">
              Last 7 Days <ChevronDown size={14} className="text-gray-400 ml-1" />
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-8 px-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="w-4 h-0.5 bg-[#435eea]"></div> Tests Conducted
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="w-4 h-0.5 bg-emerald-400"></div> Tests Completed
            </div>
          </div>

          <div className="flex-1 relative min-h-[250px] w-full border-l border-b border-gray-100 mt-auto">
            {/* Extremely simple visual scaffold for line chart */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
              <div className="w-full h-full relative">
                 <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,80 Q25,90 50,70 T100,50" fill="none" stroke="#435eea" strokeWidth="1.5" />
                    <path d="M0,90 Q25,95 50,85 T100,75" fill="none" stroke="#34d399" strokeWidth="1.5" />
                 </svg>
              </div>
            </div>
            <div className="absolute -left-6 inset-y-0 flex flex-col justify-between text-[10px] text-gray-400 py-2">
              <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
            </div>
            <div className="absolute -bottom-6 inset-x-0 flex justify-between text-[10px] text-gray-400 px-4">
              <span>May 14</span><span>May 15</span><span>May 16</span><span>May 17</span><span>May 18</span><span>May 19</span><span>May 20</span>
            </div>
          </div>
        </div>

        {/* Recent Test Sessions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Test Sessions</h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          
          <div className="overflow-x-auto">
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
                {[
                  { name: 'Math LAT - Grade 5', class: 'Grade 5A', date: 'May 20, 2025 09:00 AM', status: 'Live', statusColor: 'bg-emerald-100 text-emerald-700' },
                  { name: 'Science LAT - Grade 6', class: 'Grade 6B', date: 'May 20, 2025 10:30 AM', status: 'Live', statusColor: 'bg-emerald-100 text-emerald-700' },
                  { name: 'Math LAT - Grade 4', class: 'Grade 4A', date: 'May 19, 2025 02:00 PM', status: 'Completed', statusColor: 'bg-blue-100 text-blue-700' },
                  { name: 'English LAT - Grade 5', class: 'Grade 5B', date: 'May 19, 2025 11:00 AM', status: 'Completed', statusColor: 'bg-blue-100 text-blue-700' },
                  { name: 'Math LAT - Grade 3', class: 'Grade 3A', date: 'May 18, 2025 09:30 AM', status: 'Scheduled', statusColor: 'bg-gray-100 text-gray-700' },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-[13px] font-bold text-gray-900 leading-snug">{row.name}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-medium text-gray-500">{row.class}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-medium text-gray-500">{row.date}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bottom Grid - Donut Charts & Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Question Review */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Question Review</h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Number Sense - Q1234', subject: 'Grade 5 • Mathematics', date: 'May 20, 2025' },
              { title: 'Fractions - Q1235', subject: 'Grade 6 • Mathematics', date: 'May 20, 2025' },
              { title: 'Algebra Basics - Q1236', subject: 'Grade 7 • Mathematics', date: 'May 20, 2025' },
              { title: 'Plants and Animals - Q1237', subject: 'Grade 5 • Science', date: 'May 20, 2025' },
            ].map((q, i) => (
              <div key={i} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{q.title}</p>
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase tracking-wider rounded">Pending</span>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400">{q.subject}</p>
                </div>
                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">{q.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approved Questions (Donut Placeholder) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Approved Questions</h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="flex-1 flex items-center justify-center gap-8">
             <div className="w-32 h-32 rounded-full border-[12px] border-purple-500 border-r-emerald-400 border-b-orange-400 border-l-blue-400 flex items-center justify-center relative">
                <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-white m-1 rounded-full">
                  <span className="text-xl font-bold text-gray-900 leading-none">8,452</span>
                  <span className="text-[9px] font-medium text-gray-400 mt-1">Total Approved</span>
                </div>
             </div>
             <div className="space-y-3">
               <div className="flex justify-between items-center gap-6 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div><span className="font-medium text-gray-500">Mathematics</span></div>
                 <span className="font-bold text-gray-900">4,250</span>
               </div>
               <div className="flex justify-between items-center gap-6 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="font-medium text-gray-500">Science</span></div>
                 <span className="font-bold text-gray-900">2,150</span>
               </div>
               <div className="flex justify-between items-center gap-6 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div><span className="font-medium text-gray-500">English</span></div>
                 <span className="font-bold text-gray-900">1,450</span>
               </div>
               <div className="flex justify-between items-center gap-6 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="font-medium text-gray-500">EVS</span></div>
                 <span className="font-bold text-gray-900">602</span>
               </div>
             </div>
          </div>
        </div>

        {/* Student Performance Summary (Donut Placeholder) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Student Performance Summary</h2>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">View Report</a>
          </div>
          <div className="flex-1 flex items-center justify-center gap-6">
             <div className="w-32 h-32 rounded-full border-[12px] border-blue-600 border-r-orange-400 border-b-emerald-500 border-l-red-500 flex items-center justify-center relative">
                <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-white m-1 rounded-full">
                  <span className="text-xl font-bold text-gray-900 leading-none">2,456</span>
                  <span className="text-[9px] font-medium text-gray-400 mt-1">Total Students</span>
                </div>
             </div>
             <div className="space-y-3">
               <div className="flex justify-between items-center gap-4 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="font-medium text-gray-500">Above 75%</span></div>
                 <div><span className="font-bold text-gray-900">1,024</span> <span className="text-[10px] text-gray-400">(41.7%)</span></div>
               </div>
               <div className="flex justify-between items-center gap-4 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="font-medium text-gray-500">50% - 75%</span></div>
                 <div><span className="font-bold text-gray-900">865</span> <span className="text-[10px] text-gray-400">(35.2%)</span></div>
               </div>
               <div className="flex justify-between items-center gap-4 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div><span className="font-medium text-gray-500">25% - 50%</span></div>
                 <div><span className="font-bold text-gray-900">402</span> <span className="text-[10px] text-gray-400">(16.4%)</span></div>
               </div>
               <div className="flex justify-between items-center gap-4 text-xs">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="font-medium text-gray-500">Below 25%</span></div>
                 <div><span className="font-bold text-gray-900">165</span> <span className="text-[10px] text-gray-400">(6.7%)</span></div>
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

    </div>
  );
}
