'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ExamPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { useReactToPrint } = require('react-to-print');

  const handleDownload = useReactToPrint({
    contentRef,
    documentTitle: exam ? `${exam.title.replace(/\s+/g, '-')}-LAT-${exam.id.toString().padStart(4, '0')}` : 'LAT-Exam',
    pageStyle: `
      @page {
        size: auto;
        margin: 20mm !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  useEffect(() => {
    if (params.id) {
      apiClient.get(`/papers/${params.id}`)
        .then(res => setExam(res.data))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  useEffect(() => {
    if (exam && !isLoading && searchParams.get('download') === 'true') {
      // Small timeout to ensure fonts/images are rendered before printing
      setTimeout(() => {
        handleDownload();
      }, 500);
    }
  }, [exam, isLoading, searchParams, handleDownload]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Exam not found</h2>
        <button onClick={() => router.push('/super-admin/lat-exams')} className="mt-4 text-blue-600 hover:underline">Go back to exams</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[18px] font-black">{exam.title}</h1>
              <p className="text-[12px] font-bold text-gray-500">Exam ID: LAT-{exam.id.toString().padStart(4, '0')} • Grade {exam.gradeLevel}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleDownload()} className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] rounded-xl text-[13px] font-bold text-[#475569] hover:bg-gray-50 transition-colors">
              <Download size={16} /> Download PDF
            </button>
            <button onClick={() => handleDownload()} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] rounded-xl text-[13px] font-bold text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Paper Content */}
      <div className="max-w-[850px] mx-auto mt-8 px-4 sm:px-6 print:mt-0 print:px-0">
        <div ref={contentRef} id="exam-paper" className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-10 print:shadow-none print:border-none print:p-0">
          
          {/* Exam Header */}
          <div className="text-center mb-10 pb-8 border-b-2 border-gray-900">
            <h1 className="text-2xl font-black mb-2 tracking-tight uppercase">{exam.title}</h1>
            <div className="flex items-center justify-center gap-8 text-[14px] font-bold">
              <span>Time Allowed: {exam.durationMinutes} Minutes</span>
              <span>Total Marks: {exam.totalMarks}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-10 text-[13px]">
            <h3 className="font-bold text-gray-900 mb-2 uppercase">General Instructions:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
              <li>All questions are compulsory.</li>
              <li>Read each question carefully before answering.</li>
              <li>Mark the correct option clearly.</li>
            </ul>
          </div>

          {/* Questions */}
          <div className="space-y-10">
            {exam.paperQuestions?.map((pq: any, idx: number) => {
              const q = pq.question;
              if (!q) return null;

              let parsedOptions = [];
              try {
                parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
              } catch (e) {
                parsedOptions = [];
              }

              return (
                <div key={pq.id} className="flex gap-4 break-inside-avoid">
                  <div className="font-bold text-[15px] pt-0.5 w-6 shrink-0">{idx + 1}.</div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-gray-900 leading-relaxed mb-4">{q.questionText}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      {parsedOptions.map((opt: any, oIdx: number) => (
                        <div key={oIdx} className="flex items-start gap-3">
                          <div className="w-5 h-5 shrink-0 rounded-full border border-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-500 bg-gray-50 mt-0.5">
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="text-[14px] font-medium text-gray-800 leading-snug">{opt.optionText || opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-gray-400 shrink-0">[{pq.marks} M]</div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center text-[12px] font-bold text-gray-400 uppercase tracking-wider">
            *** End of Question Paper ***
          </div>
        </div>
      </div>
    </div>
  );
}
