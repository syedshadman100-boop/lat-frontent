'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckCircle,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function SuperAdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('All School Types');
  
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/users', {
          params: {
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
            role: roleFilter,
            status: statusFilter,
            schoolType: schoolTypeFilter
          }
        });
        setUsers(res.data.data);
        setTotalCount(res.data.meta.totalCount);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, roleFilter, statusFilter, schoolTypeFilter, currentPage, pageSize]);

  const totalTeachers = users.filter(u => u.roles?.some((r: any) => r.name === 'TEACHER')).length;
  const totalSMEs = users.filter(u => u.roles?.some((r: any) => r.name === 'SME')).length;
  const totalReviewers = users.filter(u => u.roles?.some((r: any) => r.name === 'REVIEWER')).length;

  const handleExport = () => {
    if (users.length === 0) return;
    
    // Create CSV content
    const headers = ['Name', 'Role', 'Mobile', 'Email', 'School/Organization', 'UDISE', 'Status', 'Created On'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => {
        const role = u.roles?.[0]?.name || 'UNKNOWN';
        const schoolName = u.school?.schoolName || u.organization?.name || 'N/A';
        const udiseCode = u.school?.udiseCode || 'Organization';
        const date = new Date(u.createdAt).toLocaleDateString('en-GB');
        return `"${u.firstName} ${u.lastName}","${role}","${u.phone || ''}","${u.email}","${schoolName}","${udiseCode}","${u.status}","${date}"`;
      })
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'TEACHER': return 'bg-blue-100 text-blue-700';
      case 'SME': return 'bg-purple-100 text-purple-700';
      case 'REVIEWER': return 'bg-orange-100 text-orange-700';
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvatarBg = (id: string | number) => {
    const colors = ['bg-blue-50 text-blue-600', 'bg-indigo-50 text-indigo-600', 'bg-purple-50 text-purple-600', 'bg-emerald-50 text-emerald-600', 'bg-orange-50 text-orange-600'];
    const idx = typeof id === 'string' ? id.charCodeAt(0) % colors.length : (id as number) % colors.length;
    return colors[idx];
  };

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1600px] mx-auto bg-[#f4f7fb]">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">User List</h1>
          <div className="flex items-center text-xs font-semibold text-gray-500 gap-2">
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Users</span>
            <span>/</span>
            <span className="text-gray-900">User List</span>
          </div>
        </div>
        <Link href="/super-admin/users/create" className="flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(29,78,216,0.25)] hover:shadow-[0_6px_16px_rgba(29,78,216,0.35)]">
          <Plus size={16} strokeWidth={2.5} /> Add User
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, mobile, email or UDISE code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-400 placeholder:font-normal text-gray-900"
          />
        </div>
        
        <div className="flex items-center gap-4 flex-1 w-full flex-wrap md:flex-nowrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Role</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All Roles">All Roles</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="SME">SME</option>
                <option value="Reviewer">Reviewer</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">School Type</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={schoolTypeFilter}
                onChange={(e) => { setSchoolTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All School Types">All School Types</option>
                <option value="PM SHRI">PM SHRI</option>
                <option value="KV">KV</option>
                <option value="Private">Private</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-end self-end md:self-auto h-full mt-5 md:mt-0">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all">
             <Filter size={16} className="text-gray-500" /> Filters
           </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer group">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-none">{totalCount}</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Across all roles</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <GraduationCap size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Teachers / Coordinators</p>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-none">862</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:border-purple-200 transition-colors cursor-pointer group">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BookOpen size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">SMEs</p>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-none">312</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:border-orange-200 transition-colors cursor-pointer group">
          <div className="p-3.5 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <CheckCircle size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Reviewers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-none">74</h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">All Users <span className="text-gray-400 font-medium ml-1">({totalCount})</span></h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} className="text-gray-500" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Columns <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-4 pl-5 pr-2 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-900">Name <span className="inline-block ml-1 text-gray-300">↕</span></th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Mobile Number</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">School / Organization</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">UDISE Code / Org. Type</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-4 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Created On</th>
                <th className="py-4 pr-5 pl-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <Users size={32} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-sm font-bold text-gray-900">No users found</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                users.map((row) => {
                  const roleName = row.roles?.[0]?.name || 'UNKNOWN';
                  const initials = (row.firstName?.[0] || '') + (row.lastName?.[0] || '');
                  const schoolName = row.school?.schoolName || row.organization?.name || 'N/A';
                  const udiseCode = row.school?.udiseCode || 'Organization';
                  const statusColor = row.status === 'active' 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                    : 'text-red-600 bg-red-50 border-red-100';

                  return (
                    <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors group">
                      <td className="py-3 pl-5 pr-2">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarBg(row.id)}`}>
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-900 leading-snug">{row.firstName} {row.lastName}</span>
                            <span className="text-[11px] font-medium text-gray-500">{roleName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${getRoleColor(roleName)}`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-gray-700">{row.phone || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-gray-600">{row.email}</span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <span className="text-xs font-semibold text-gray-700 truncate block" title={schoolName}>{schoolName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-gray-600">{udiseCode}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${statusColor} capitalize`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3 pr-5 pl-3 text-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === row.id ? null : row.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === row.id && (
                          <div className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 text-left">
                            <button 
                              onClick={() => { setEditingUser(row); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={14} className="text-gray-400" /> Edit User
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={14} className="text-red-400" /> Deactivate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white mt-auto">
          <p className="text-[11px] font-medium text-gray-500">
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-gray-500">Rows per page</span>
              <div className="relative">
                <select 
                  className="appearance-none p-1 pr-6 border border-gray-200 rounded text-gray-600 text-xs font-semibold bg-white cursor-pointer focus:outline-none hover:bg-gray-50"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="px-3 text-[11px] font-semibold text-gray-700">
                Page {currentPage} of {Math.max(1, Math.ceil(totalCount / pageSize))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                disabled={currentPage === Math.ceil(totalCount / pageSize) || totalCount === 0 || isLoading}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-6">Editing details for <span className="font-bold text-gray-900">{editingUser.firstName} {editingUser.lastName}</span>.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
                  <input type="text" defaultValue={editingUser.firstName} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
                  <input type="text" defaultValue={editingUser.lastName} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Mobile Number</label>
                  <input type="text" defaultValue={editingUser.phone} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                  <select defaultValue={editingUser.status} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
