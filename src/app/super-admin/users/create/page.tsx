'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Save,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: '',
    udiseCode: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isFetchingSchool, setIsFetchingSchool] = useState(false);
  const [schoolError, setSchoolError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      // Only fetch if length is exactly 11 (standard UDISE code length)
      if (!formData.udiseCode || formData.udiseCode.length !== 11) {
        setSchoolName(null);
        setSchoolError(null);
        return;
      }
      
      setIsFetchingSchool(true);
      setSchoolError(null);
      setSchoolName(null);
      
      try {
        const apiClient = (await import('@/lib/api-client')).default;
        const res = await apiClient.get(`/schools/udise/${formData.udiseCode}`);
        
        const schoolData = res.data.data || res.data;
        if (schoolData && schoolData.schoolName) {
          setSchoolName(schoolData.schoolName);
        } else {
          setSchoolError('Invalid UDISE code');
          setFormData(prev => ({ ...prev, udiseCode: '' }));
        }
      } catch (err: any) {
        console.error('Failed to fetch school', err);
        setSchoolError('Invalid UDISE code');
        setFormData(prev => ({ ...prev, udiseCode: '' }));
      } finally {
        setIsFetchingSchool(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSchoolData();
    }, 600); // Debounce for 600ms

    return () => clearTimeout(timeoutId);
  }, [formData.udiseCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required.';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required.';
    if (!formData.role) newErrors.role = 'Role is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const apiClient = (await import('@/lib/api-client')).default;
      let endpoint = '/users';
      
      // Map form data to backend DTO format
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.mobile,
        udiseCode: formData.udiseCode,
        status: formData.status
      };

      if (formData.role === 'Teacher') {
        endpoint = '/users/register-teacher';
      } else if (formData.role === 'Student') {
        endpoint = '/users/register-student';
      } else {
        // Fallback for other roles if we create a generic endpoint later
        throw new Error(`Registration for role ${formData.role} is not fully implemented yet.`);
      }

      await apiClient.post(endpoint, payload);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/super-admin/users');
      }, 2000);

    } catch (err: any) {
      console.error('Submission failed', err);
      setSubmitError(err?.response?.data?.message || err.message || 'Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 text-gray-900 font-sans max-w-[1200px] mx-auto bg-[#f4f7fb]">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Create New User</h1>
          <div className="flex items-center text-xs font-semibold text-gray-500 gap-2">
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <Link href="/super-admin/users" className="hover:text-gray-900 cursor-pointer transition-colors">Users</Link>
            <span>/</span>
            <span className="text-gray-900">Create User</span>
          </div>
        </div>
        <Link href="/super-admin/users" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm">
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">User Details</h2>
            <p className="text-xs font-medium text-gray-500 mt-1">Enter the personal and professional details for the new user.</p>
          </div>
          
          {submitSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
              <CheckCircle size={16} /> User Created Successfully!
            </div>
          )}
          {submitError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
              <AlertCircle size={16} /> {submitError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Personal Information */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-4">Personal Information</h3>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">First Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 placeholder:font-normal text-gray-900 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                  </div>
                  {errors.firstName && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.firstName}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-400 placeholder:font-normal text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 placeholder:font-normal text-gray-900 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    name="mobile"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 placeholder:font-normal text-gray-900 ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                  />
                </div>
                {errors.mobile && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.mobile}</p>}
              </div>
            </div>

            {/* Role & Organization */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-4">Role & Organization</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Assign Role <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-10 py-2.5 appearance-none bg-[#f8fafc] border rounded-xl text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.role ? 'border-red-500 focus:border-red-500 text-red-900' : 'border-gray-200 focus:border-blue-500 text-gray-700'}`}
                  >
                    <option value="" disabled>Select a role...</option>
                    <option value="Teacher">Teacher</option>
                    <option value="SME">Subject Matter Expert (SME)</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                  <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${errors.role ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                {errors.role && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">UDISE Code (School)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                    <input 
                      type="text"
                      name="udiseCode"
                      placeholder="Enter UDISE Code"
                      value={formData.udiseCode}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                    {isFetchingSchool && (
                      <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
                
                {schoolName && (
                  <div className="mt-2 ml-1 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {schoolName}
                  </div>
                )}
                {schoolError && (
                  <div className="mt-2 ml-1 text-sm font-medium text-red-500 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    {schoolError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Account Status</label>
                <div className="flex gap-4 items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-semibold text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-semibold text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 mt-4">
            <Link href="/super-admin/users" className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(29,78,216,0.25)] hover:shadow-[0_6px_16px_rgba(29,78,216,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
