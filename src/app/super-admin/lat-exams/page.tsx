'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, RefreshCw, Download, Eye, Edit2, MoreVertical, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Pagination } from '@/components/Pagination';

export default function LatExamsDashboard() {


  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLatType, setFilterLatType] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLatType, filterGrade, filterStatus]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await apiClient.get('/papers');
        if (response.data) {
          const data = response.data;
          // Transform backend data to match frontend UI expectations
          const formatted = data.map((paper: any) => {
            const dateObj = new Date(paper.createdAt || paper.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            // Extract info from title if possible (e.g. "Grade 5 LAT-I (2026)")
            const isLatI = paper.title?.includes('LAT-I');
            const isLatII = paper.title?.includes('LAT-II');
            let latType = isLatII ? 'LAT-II' : 'LAT-I';
            if (!isLatI && !isLatII) latType = 'LAT'; // fallback

            const gradeLvl = paper.gradeLevel || paper.grade_level;
            let grade = `Grade ${gradeLvl}`;
            let assessmentGroup = gradeLvl <= 5 ? 'Preparatory' : 'Middle';
            let groupGrades = gradeLvl <= 5 ? '(Grades 3-5)' : '(Grades 6-8)';

            return {
              id: paper.id,
              name: paper.title,
              code: `LAT-${paper.id.toString().padStart(4, '0')}`,
              latType: latType,
              grade: grade,
              assessmentGroup: assessmentGroup,
              assessmentGroupGrades: groupGrades,
              date: formattedDate,
              duration: `${paper.durationMinutes || paper.duration_minutes} Min`,
              totalQuestions: paper.totalMarks || paper.total_marks || 60,
              status: (paper.isLocked || paper.is_locked) ? 'Completed' : 'Upcoming' // Mock status logic
            };
          });
          setExams(formatted);
        } else {
          console.error('Failed to fetch exams');
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.grade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLatType = filterLatType === 'All' || exam.latType === filterLatType;
    const matchesGrade = filterGrade === 'All' || exam.grade === filterGrade;
    const matchesStatus = filterStatus === 'All' || exam.status === filterStatus;

    return matchesSearch && matchesLatType && matchesGrade && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterLatType('All');
    setFilterGrade('All');
    setFilterStatus('All');
  };

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Upcoming':
      case 'Ongoing':
        return <span className="inline-flex items-center px-3 py-1.5 bg-[#eff4ff] text-[#2563eb] text-[11px] font-extrabold tracking-wide uppercase rounded-full shadow-sm">{status}</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-3 py-1.5 bg-[#ecfdf5] text-[#10b981] text-[11px] font-extrabold tracking-wide uppercase rounded-full shadow-sm">{status}</span>;
      case 'Draft':
        return <span className="inline-flex items-center px-3 py-1.5 bg-[#f8fafc] text-[#64748b] text-[11px] font-extrabold tracking-wide uppercase rounded-full shadow-sm border border-[#e2e8f0]">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-[11px] font-extrabold tracking-wide uppercase rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto text-gray-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">LAT Exams</h1>
          <p className="text-[#64748b] text-sm font-medium mt-0.5">View, manage and track all LAT exams.</p>
        </div>
        <Link href="/super-admin/lat-exams/create">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
            <Plus size={18} strokeWidth={2.5} /> Create LAT Exam
          </button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam name, grade, or type..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-[#94a3b8]"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 w-full md:w-[160px]">
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">LAT TYPE</label>
            <div className="relative">
              <select value={filterLatType} onChange={(e) => setFilterLatType(e.target.value)} className="w-full appearance-none bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All</option>
                <option value="LAT-I">LAT-I</option>
                <option value="LAT-II">LAT-II</option>
                <option value="LAT">LAT</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-[160px]">
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">GRADE</label>
            <div className="relative">
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="w-full appearance-none bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                  <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-[160px]">
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">STATUS</label>
            <div className="relative">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>

          <button onClick={clearFilters} className="flex flex-col gap-1.5 items-center justify-end h-full pt-5">
            <span className="flex items-center gap-2 text-[#2563eb] text-[13px] font-bold hover:text-blue-700 px-2 py-2.5">
              <RefreshCw size={14} strokeWidth={2.5} /> Clear Filters
            </span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">

        {/* Table Header Row */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="text-[15px] font-black text-gray-900">All LAT Exams ({filteredExams.length})</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] rounded-xl text-[13px] font-bold text-[#64748b] hover:bg-gray-50 transition-colors">
            <Download size={14} strokeWidth={2.5} /> Download
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">LAT Type</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Grade</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Assessment Group</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Exam Date & Duration</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Total Questions</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {paginatedExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-bold text-gray-900">{exam.name}</p>
                    <p className="text-[11px] font-semibold text-[#94a3b8] mt-0.5">{exam.code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-bold text-[#2563eb]">{exam.latType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-medium text-gray-700">{exam.grade}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-[13px] font-bold ${exam.assessmentGroup === 'Preparatory' ? 'text-[#2563eb]' : 'text-[#f59e0b]'}`}>{exam.assessmentGroup}</p>
                    <p className="text-[11px] font-semibold text-[#60a5fa] mt-0.5">{exam.assessmentGroupGrades}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-700 mb-1">
                      <Calendar size={14} className="text-[#94a3b8]" /> {exam.date}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                      <Clock size={14} className="text-[#94a3b8]" /> {exam.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-medium text-gray-700">{exam.totalQuestions}</span>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(exam.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#94a3b8] hover:text-[#2563eb] transition-colors"><Eye size={18} strokeWidth={2} /></button>
                      <button className="text-[#94a3b8] hover:text-[#2563eb] transition-colors"><Edit2 size={18} strokeWidth={2} /></button>
                      <button className="text-[#94a3b8] hover:text-gray-900 transition-colors"><MoreVertical size={18} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredExams.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={setItemsPerPage}
        />

      </div>
    </div>
  );
}
