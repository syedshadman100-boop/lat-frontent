'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, CircleDot, 
  Search, Filter, ChevronDown, Bell, MoreVertical, Loader2, Plus, Upload
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import BulkAddModal from './BulkAddModal';
import AddStudentModal from './AddStudentModal';
import StudentDetailModal from './StudentDetailModal';
import StartExamModal from './StartExamModal';
import UploadSubmissionModal from './UploadSubmissionModal';
import { Eye, ToggleLeft, FileText } from 'lucide-react';

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isStartExamModalOpen, setIsStartExamModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [targetStudentsForExam, setTargetStudentsForExam] = useState<any[]>([]);
  const [targetStudentForUpload, setTargetStudentForUpload] = useState<any>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const handleClose = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/students');
      // The API returns an array of users with `studentProfile`
      const backendStudents = Array.isArray(res.data) ? res.data : [];
      console.log("BACKEND STUDENTS:", backendStudents);
      
      const mappedStudents = backendStudents.map((s, idx) => {
        const name = `${s.firstName || ''} ${s.lastName || ''}`.trim();
        const initials = `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase();
        
        // Cycle through some background colors for initials
        const bgs = ['bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];
        const bg = bgs[idx % bgs.length];

        let statusLabel = 'Not Started';
        let progressVal = 0;
        let timeTaken = '-';
        let isOffline = false;
        let studentExamId = null;
        let score = null;

        if (s.activeExam) {
          isOffline = s.activeExam.isOffline;
          studentExamId = s.activeExam.studentExamId;
          score = s.activeExam.score;
          if (s.activeExam.status === 'started') {
            statusLabel = 'In Progress';
            progressVal = 45; // Mock progress
          } else if (s.activeExam.status === 'submitted') {
            statusLabel = 'Completed';
            progressVal = 100;
          } else if (s.activeExam.status === 'graded') {
            statusLabel = 'Completed';
            progressVal = 100;
          } else if (s.activeExam.status === 'assigned') {
            statusLabel = isOffline ? 'Pending Offline Upload' : 'Assigned (Online)';
          } else {
            statusLabel = 'Not Started';
          }
        }

        return {
          id: s.id,
          initials: initials || 'ST',
          bg,
          name: name || 'Unknown Student',
          class: s.studentProfile?.gradeId 
            ? `Grade ${s.studentProfile.gradeId}${s.studentProfile.section ? ` ${s.studentProfile.section}` : ''}`
            : '-',
          roll: s.studentProfile?.rollNo || s.studentProfile?.admissionNo || '-',
          assessment: s.activeExam ? s.activeExam.examTitle : '-',
          status: statusLabel,
          isOffline: !!isOffline,
          studentExamId,
          progress: progressVal,
          time: timeTaken,
          score: score,
          updated: '-',
          userStatus: s.status || 'active',
          raw: s,
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

  const handleToggleStatus = async (studentId: string, newStatus: 'active' | 'inactive') => {
    try {
      await apiClient.patch(`/users/${studentId}/status`, { status: newStatus });
      fetchStudents();
    } catch (err) {
      console.error('Failed to update student status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === paginatedStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(paginatedStudents.map(s => s.id)));
    }
  };

  const toggleSelectStudent = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudentIds(newSet);
  };

  const handleOpenBulkStartExam = () => {
    const targets = students.filter(s => selectedStudentIds.has(s.id));
    if (targets.length === 0) return;
    setTargetStudentsForExam(targets);
    setIsStartExamModalOpen(true);
  };

  const handleExamStarted = (mode: 'online' | 'offline', paperId: string, assignedStudentIds: string[]) => {
    fetchStudents();
    setSelectedStudentIds(new Set());
    if (mode === 'offline') {
      window.open(`/super-admin/lat-exams/${paperId}/preview?studentIds=${assignedStudentIds.join(',')}&print=true`, '_blank');
    }
  };

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
            <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'Completed').length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4 opacity-75">
          <div className="bg-orange-50 text-orange-500 p-3 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{students.filter(s => ['In Progress', 'Pending Offline Upload'].includes(s.status)).length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="bg-gray-50 text-gray-400 p-3 rounded-full">
            <CircleDot size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Not Started</p>
            <p className="text-2xl font-bold text-gray-900">{students.filter(s => !['Completed', 'In Progress', 'Pending Offline Upload'].includes(s.status)).length}</p>
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
          {selectedStudentIds.size > 0 && (
            <button
              onClick={handleOpenBulkStartExam}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              <span>Start Exam for {selectedStudentIds.size} student(s)</span>
            </button>
          )}
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
                  <th className="px-6 py-4 font-semibold w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={paginatedStudents.length > 0 && selectedStudentIds.size === paginatedStudents.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold w-16">#</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Class</th>
                  <th className="px-6 py-4 font-semibold">Roll Number</th>
                  <th className="px-6 py-4 font-semibold">Current Assessment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Time Taken</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map((student, index) => (
                  <tr key={student.id} className={`hover:bg-gray-50/50 transition-colors ${selectedStudentIds.has(student.id) ? 'bg-blue-50/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{startIndex + index + 1}</td>
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
                      {student.status === 'Pending Offline Upload' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock size={12} />
                          <span>Pending Upload</span>
                        </span>
                      )}
                      {student.status === 'Assigned (Online)' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <CircleDot size={12} />
                          <span>Assigned (Online)</span>
                        </span>
                      )}
                      {student.status === 'Not Started' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <CircleDot size={12} />
                          <span>Not Started</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {student.status === 'Completed' ? (student.score !== null ? student.score : '-') : '-'}
                    </td>
                    <td className="px-6 py-4">{student.time}</td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(prev => (prev === student.id ? null : student.id));
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdownId === student.id && (
                        <div className="absolute right-6 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 text-left">
                          <button
                            onClick={() => {
                              setSelectedStudentForDetail(student);
                              setIsDetailModalOpen(true);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye size={14} className="text-gray-400" />
                            <span>View Detail</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setTargetStudentsForExam([student]);
                              setIsStartExamModalOpen(true);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FileText size={14} className="text-blue-500" />
                            <span>Start Exam</span>
                          </button>

                          {student.isOffline && student.studentExamId && (
                            <button
                              onClick={() => {
                                setTargetStudentForUpload(student);
                                setIsUploadModalOpen(true);
                                setActiveDropdownId(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Upload size={14} className="text-green-500" />
                              <span>Upload Submission</span>
                            </button>
                          )}
                          
                          {student.userStatus === 'active' ? (
                            <button
                              onClick={() => {
                                handleToggleStatus(student.id, 'inactive');
                                setActiveDropdownId(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <ToggleLeft size={14} className="text-red-400 animate-pulse" />
                              <span>Mark Inactive</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleToggleStatus(student.id, 'active');
                                setActiveDropdownId(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <ToggleLeft size={14} className="text-green-400 rotate-180 transition-transform duration-300" />
                              <span>Mark Active</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing <span className="font-medium text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{totalItems}</span> students
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      page === activePage
                        ? 'bg-blue-50 text-blue-600'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      <BulkAddModal 
        isOpen={isBulkAddModalOpen} 
        onClose={() => setIsBulkAddModalOpen(false)} 
        onSuccess={fetchStudents}
      />

      <AddStudentModal 
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSuccess={fetchStudents}
      />

      <StudentDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudentForDetail(null);
        }}
        student={selectedStudentForDetail}
      />

      <StartExamModal
        isOpen={isStartExamModalOpen}
        onClose={() => setIsStartExamModalOpen(false)}
        selectedStudents={targetStudentsForExam}
        onSuccess={handleExamStarted}
      />

      {targetStudentForUpload && (
        <UploadSubmissionModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setTargetStudentForUpload(null);
          }}
          onSuccess={() => {
            fetchStudents();
            setTargetStudentForUpload(null);
          }}
          studentName={targetStudentForUpload.name}
          studentExamId={targetStudentForUpload.studentExamId}
        />
      )}
    </div>
  );
}
