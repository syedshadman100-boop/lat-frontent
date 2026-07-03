'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Users, Calendar, Clock, BarChart, ChevronRight, Loader2, Filter
} from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ReportsListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Grade filter (restricted to 3, 6, 9 as requested)
  const allowedGrades = [3, 6, 9];
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await apiClient.get('/exams/reports/teacher');
        setExams(response.data);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    // Only allow grades 3, 6, 9 to be shown at all
    const examGradeNum = parseInt(exam.grade?.toString().replace(/\D/g, '') || '0', 10);
    if (!allowedGrades.includes(examGradeNum)) return false;
    
    // If a specific grade is selected, filter by it
    if (selectedGrade && examGradeNum.toString() !== selectedGrade) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 min-h-screen bg-gray-50/30">
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Assessment Reports</h1>
          <p className="text-gray-500 text-sm">Select an assessment to view detailed performance metrics.</p>
        </div>
        
        {/* Grade Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
            <Filter size={18} />
          </div>
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-48 border border-gray-200 rounded-xl p-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700 transition-all cursor-pointer"
          >
            <option value="">All Permitted Grades</option>
            {allowedGrades.map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
            No assessment reports found for the selected grade(s).
          </div>
        ) : (
          filteredExams.map((exam) => (
            <Link href={`/teacher/reports/${exam.id}`} key={exam.id}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full flex flex-col group">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      {exam.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{exam.subject} • {exam.grade}</p>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400 mr-2 shrink-0" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="text-gray-400 mr-2 shrink-0" />
                      <span>{exam.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="text-gray-400 mr-2 shrink-0" />
                      <span>{exam.participants} / {exam.totalStudents} Participants</span>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-5 py-4 bg-gray-50/50 flex justify-between items-center mt-auto rounded-b-xl">
                  <div className="flex items-center">
                    <BarChart size={16} className="text-gray-400 mr-2 shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">Avg. Score:</span>
                    <span className="text-sm font-bold text-gray-900 ml-1.5">{exam.avgScore}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
