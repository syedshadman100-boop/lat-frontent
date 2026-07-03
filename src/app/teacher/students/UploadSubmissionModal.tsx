import React, { useState } from 'react';
import { X, Loader2, UploadCloud, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface UploadSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName: string;
  studentExamId: string;
}

export default function UploadSubmissionModal({ isOpen, onClose, onSuccess, studentName, studentExamId }: UploadSubmissionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      if (file.type === 'application/pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 }); // Set to 1.0 to prevent AI out of memory
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context!, viewport: viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          const [mimeInfo, base64Data] = dataUrl.split(',');
          const mimeType = mimeInfo.split(':')[1].split(';')[0];
          
          await apiClient.post('/exams/offline-submission', {
            student_exam_id: studentExamId,
            fileData: base64Data,
            mimeType: mimeType,
          });
        }
      } else {
        const base64String = await fileToBase64(file);
        const [mimeInfo, base64Data] = base64String.split(',');
        const mimeType = mimeInfo.split(':')[1].split(';')[0];
        
        await apiClient.post('/exams/offline-submission', {
          student_exam_id: studentExamId,
          fileData: base64Data,
          mimeType: mimeType,
        });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to process file', err);
      setError(err.response?.data?.message || 'Failed to process file.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Submission</h2>
            <p className="text-sm text-gray-500 mt-1">For {studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Scanned Answer Sheet (PDF/Image)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,image/*"
                onChange={handleFileChange}
              />
              <UploadCloud size={32} className="text-blue-500 mb-3" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Click or drag file to this area to upload</p>
                  <p className="text-xs text-gray-400 mt-1">Support for a single PDF or Image file</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !file}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Analyzing Submission...
              </>
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
