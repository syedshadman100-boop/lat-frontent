'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, CircleDot, 
  Search, Filter, ChevronDown, Bell, MoreVertical, Loader2, Plus, Upload
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import BulkAddModal from './BulkAddModal';
import AddStudentModal from './AddStudentModal';

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/students');
      // The API returns an array of users with `studentProfile`
      const backendStudents = Array.isArray(res.data) ? res.data : [];
      
      const mappedStudents = backendStudents.map((s, idx) => {
        const name = `${s.firstName || ''} ${s.lastName || ''}`.trim();
        const initials = `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase();
        
        // Cycle through some background colors for initials
        const bgs = ['bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];
        const bg = bgs[idx % bgs.length];

        return {
          id: s.id,
          initials: initials || 'ST',
          bg,
          name: name || 'Unknown Student',
          class: 'Grade 5 A', // Hardcoded until we have class mapping
          roll: s.studentProfile?.rollNo || s.studentProfile?.admissionNo || '-',
          assessment: 'Mathematics LAT', // Hardcoded placeholder
          status: 'Not Started', // Hardcoded placeholder
          progress: 0, // Hardcoded placeholder
          time: '-', // Hardcoded placeholder
          updated: '-', // Hardcoded placeholder
        };
      });

      setStudents(mappedStudents);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage students and their assessment progress.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsAddStudentModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload size={16} />
            <span>Add Student</span>
          </button>
          <button 
            onClick={() => setIsBulkAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border border-transparent text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload size={16} />
            <span>Add Bulk</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4 opacity-75">
          <div className="bg-green-50 text-green-500 p-3 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4 opacity-75">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-gray-50 text-gray-400 p-3 rounded-full">
            <CircleDot size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Not Started</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Students list</h2>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-sm">Loading students...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[300px] text-red-500 text-sm">
              {error}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
              {searchQuery ? 'No students found matching your search.' : 'No students found for this school.'}
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16">#</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Class</th>
                  <th className="px-6 py-4 font-semibold">Roll Number</th>
                  <th className="px-6 py-4 font-semibold">Current Assessment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Progress</th>
                  <th className="px-6 py-4 font-semibold">Time Taken</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${student.bg}`}>
                        {student.initials}
                      </div>
                      <span>{student.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.class}</td>
                    <td className="px-6 py-4">{student.roll}</td>
                    <td className="px-6 py-4">{student.assessment}</td>
                    <td className="px-6 py-4">
                      {student.status === 'Completed' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </span>
                      )}
                      {student.status === 'In Progress' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <Clock size={12} />
                          <span>In Progress</span>
                        </span>
                      )}
                      {student.status === 'Not Started' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <CircleDot size={12} />
                          <span>Not Started</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 w-40">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.status === 'Completed' ? 'bg-green-500' : 
                              student.status === 'In Progress' ? 'bg-orange-500' : 'bg-transparent'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-9 text-right text-gray-900">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{student.time}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredStudents.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">{filteredStudents.length}</span> of <span className="font-medium text-gray-900">{students.length}</span> students
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>Previous</button>
              <div className="flex space-x-1">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-md">1</button>
              </div>
              <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors" disabled>Next</button>
            </div>
          </div>
        )}

      </div>

      <BulkAddModal 
        isOpen={isBulkAddModalOpen} 
        onClose={() => setIsBulkAddModalOpen(false)} 
      />

      <AddStudentModal 
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
      />
    </div>
  );
}
