import React from 'react';
import { X, User, GraduationCap, Phone, Shield } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export default function StudentDetailModal({ isOpen, onClose, student }: StudentDetailModalProps) {
  if (!isOpen || !student) return null;

  const raw = student.raw || {};
  const profile = raw.studentProfile || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">Student Profile Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-gray-50/30">
          
          {/* Header Profile Info */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold ${student.bg || 'bg-blue-100 text-blue-700'}`}>
              {student.initials || 'ST'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{student.name || 'Unknown Student'}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Username/Email: <span className="font-medium text-gray-800 select-all">{raw.email || '-'}</span></p>
              <p className="text-sm text-gray-500 mt-0.5">Password: <span className="font-medium text-gray-800 select-all">password123</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <User size={16} className="text-blue-500" />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Gender</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.gender || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Date of Birth</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.dob || '-'}</span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <GraduationCap size={16} className="text-blue-500" />
                Academic Details
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Grade / Class</span>
                  <span className="text-sm font-semibold text-gray-800">{student.class || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Roll Number</span>
                  <span className="text-sm font-semibold text-gray-800">{student.roll || '-'}</span>
                </div>
              </div>
            </div>

            {/* Parent & Contact Information */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <Phone size={16} className="text-blue-500" />
                Parent & Contact Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Father's Name</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.parentName || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Mother's Name</span>
                  <span className="text-sm font-semibold text-gray-800">{profile.motherName || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Mobile Number</span>
                  <span className="text-sm font-semibold text-gray-800">{raw.phone || '-'}</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
                <Shield size={16} className="text-blue-500" />
                Account Status
              </h4>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  student.userStatus === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {student.userStatus || 'active'}
                </span>
                <span className="text-xs text-gray-400">
                  This user profile is currently {student.userStatus === 'active' ? 'enabled' : 'disabled'} for accessing assessments.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0 z-10">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
