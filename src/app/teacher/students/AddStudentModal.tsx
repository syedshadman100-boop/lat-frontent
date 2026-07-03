import React, { useState } from 'react';
import { X, User, GraduationCap, Phone, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { formatErrorMessage } from '@/lib/utils';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    rollNumber: '',
    grade: '',
    section: '',
    mobileNumber: '',
    fatherName: '',
    motherName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const newFieldErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newFieldErrors.fullName = 'Please fill out this field.';
    if (!formData.gender) newFieldErrors.gender = 'Please fill out this field.';
    if (!formData.rollNumber) newFieldErrors.rollNumber = 'Please fill out this field.';
    if (!formData.grade) newFieldErrors.grade = 'Please fill out this field.';
    if (!formData.fatherName.trim()) newFieldErrors.fatherName = 'Please fill out this field.';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }
    
    setFieldErrors({});
    
    try {
      const payload = {
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        phone: formData.mobileNumber || undefined,
        rollNo: formData.rollNumber,
        gender: formData.gender,
        dob: formData.dob || undefined,
        parentName: formData.fatherName,
        motherName: formData.motherName,
        gradeId: parseInt(formData.grade),
        section: formData.section || undefined
      };
      
      const res = await apiClient.post('/users/register-student', payload);
      setSuccessData({
        email: res.data.email || 'N/A',
        password: 'password123'
      });
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to add student';
      const userFriendlyMsg = formatErrorMessage(errMsg);
      setError(userFriendlyMsg);
      showToast(userFriendlyMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        
        {/* Success Modal Content */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center animate-scale-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Added Successfully!</h3>
          <p className="text-sm text-gray-500 mb-6">Here are the auto-generated credentials for the student to log in:</p>
          
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 border border-gray-100">
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium tracking-wider">Student ID (Email)</span>
              <span className="text-sm font-semibold text-gray-900 break-all select-all">{successData.email}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block uppercase font-medium tracking-wider">Password</span>
              <span className="text-sm font-semibold text-gray-900 select-all">{successData.password}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessData(null);
              // Clear form data
              setFormData({
                fullName: '',
                gender: '',
                dob: '',
                rollNumber: '',
                grade: '',
                section: '',
                mobileNumber: '',
                fatherName: '',
                motherName: '',
              });
              onSuccess?.();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-8" noValidate>
            
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.fullName && <p className="text-xs text-red-500">{fieldErrors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Gender *</label>
                  <select 
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all text-gray-900 ${fieldErrors.gender ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.gender && <p className="text-xs text-red-500">{fieldErrors.gender}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Academic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-500" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Roll Number *</label>
                  <input 
                    type="number" 
                    name="rollNumber"
                    required
                    placeholder="e.g. 101"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all ${fieldErrors.rollNumber ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.rollNumber && <p className="text-xs text-red-500">{fieldErrors.rollNumber}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Grade / Class *</label>
                  <select 
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all text-gray-900 ${fieldErrors.grade ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select Grade</option>
                    <option value="3">Grade 3</option>
                    <option value="6">Grade 6</option>
                    <option value="9">Grade 9</option>
                  </select>
                  {fieldErrors.grade && <p className="text-xs text-red-500">{fieldErrors.grade}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Section</label>
                  <select 
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all text-gray-900"
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Parent & Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                Parent & Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Father's Name *</label>
                  <input 
                    type="text" 
                    name="fatherName"
                    required
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all ${fieldErrors.fatherName ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.fatherName && <p className="text-xs text-red-500">{fieldErrors.fatherName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Mother's Name</label>
                  <input 
                    type="text" 
                    name="motherName"
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobileNumber"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="add-student-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Add Student
          </button>
        </div>

      </div>
      
      {toast && (
        <div className="fixed top-6 right-6 z-[100] flex items-center space-x-2.5 bg-red-50 text-red-800 border border-red-200 px-4 py-3.5 rounded-xl shadow-xl animate-fade-in max-w-sm text-sm font-medium">
          <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="break-words">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
