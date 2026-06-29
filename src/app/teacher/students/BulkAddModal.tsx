import React, { useState, useRef } from 'react';
import { X, Download, CloudUpload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import apiClient from '@/lib/api-client';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkAddModal({ isOpen, onClose }: BulkAddModalProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!file) {
      setError('Please upload a CSV file first.');
      return;
    }
    if (!selectedClass || !selectedSection) {
      setError('Please select a Class and Section.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gradeId', selectedClass);
      formData.append('section', selectedSection);

      const response = await apiClient.post('/users/upload-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.failedCount > 0) {
        setError(`Uploaded ${response.data.successCount}. Failed ${response.data.failedCount}. Example error: ${response.data.failures[0].error}`);
        if (response.data.successCount > 0) {
          setTimeout(() => {
            setFile(null);
            onClose();
          }, 4000);
        }
      } else {
        setSuccess(`Successfully uploaded ${response.data.successCount} students.`);
        setTimeout(() => {
          setFile(null);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Add Student</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          <div className="space-y-6">
            
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">{success}</div>}
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg border border-blue-100">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Download Template</h3>
                  <p className="text-sm text-gray-500 mb-4">Download our template to bulk upload students.</p>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Student_Template.xlsx</p>
                        <p className="text-xs text-gray-500">12 KB</p>
                      </div>
                    </div>
                    <a href="/Student_Template.xlsx" download="Student_Template.xlsx" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg border border-blue-100">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Select Details</h3>
                  <p className="text-sm text-gray-500 mb-4">Select the class and section for the bulk upload.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Class/Grade</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                      >
                        <option value="">Select Class</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Section</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                      >
                        <option value="">Select Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg border border-blue-100">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Fill and Upload details</h3>
                  <p className="text-sm text-gray-500 mb-4">Fill the details in downloaded template and upload it here.</p>
                  
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100">
                        <CloudUpload size={28} className={file ? "text-green-500" : "text-blue-500"} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {file ? file.name : 'Click to choose file or drag & drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported: .csv, .xlsx | Max size: 5 MB
                    </p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv, .xlsx, .xls"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
