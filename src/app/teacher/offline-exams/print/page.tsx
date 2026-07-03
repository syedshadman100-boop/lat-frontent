'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function OfflineExamPrintPage() {
  const searchParams = useSearchParams();
  const studentsParam = searchParams?.get('students');
  const paperParam = searchParams?.get('paper');

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!studentsParam || !paperParam) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const studentIds = studentsParam.split(',');
        const [studentsRes, paperRes] = await Promise.all([
          apiClient.get('/users/students'),
          apiClient.get(`/papers/${paperParam}`)
        ]);

        const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const matchingStudents = allStudents.filter(s => studentIds.includes(s.id.toString()));
        setSelectedStudents(matchingStudents);

        // API might wrap paper in 'response' or 'data' or return directly
        const paperData = paperRes.data?.response || paperRes.data?.data || paperRes.data;
        setExam(paperData);
      } catch (err) {
        console.error('Failed to fetch data for printing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentsParam, paperParam]);

  useEffect(() => {
    // When finished loading and we have data, trigger print
    if (!loading && exam && selectedStudents.length > 0) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading, exam, selectedStudents]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-medium text-gray-500 animate-pulse">Preparing exams for printing...</p>
      </div>
    );
  }

  if (!exam || selectedStudents.length === 0) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Invalid parameters or no students found.
      </div>
    );
  }

  return (
    <div className="print-container bg-gray-50 min-h-screen font-serif">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; background-color: white !important; }
          .page-break-after { page-break-after: always; }
          .no-print { display: none !important; }
          .print-container { background-color: white !important; }
        }
      `}} />
      
      <div className="no-print p-4 bg-blue-50 text-blue-800 text-center font-sans font-bold border-b border-blue-200">
        Press Ctrl+P (or Cmd+P) to print these exams. Make sure "Background graphics" is enabled in print settings for best results.
      </div>

      {selectedStudents.map((student, index) => (
        <div key={student.id} className={`bg-white text-black p-8 sm:p-12 max-w-4xl mx-auto ${index < selectedStudents.length - 1 ? 'page-break-after border-b-8 border-gray-100 print:border-none' : ''}`}>
          
          {/* Header Section */}
          <div className="border-2 border-black p-6 mb-8 flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center uppercase tracking-widest border-b-2 border-black pb-4 mb-2">
              {exam.title || exam.name || 'End of Term Assessment'}
            </h1>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg font-medium">
              <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                <span className="font-bold shrink-0">Student Name:</span>
                <span className="flex-1 font-mono text-xl">{student.firstName} {student.lastName}</span>
              </div>
              <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                <span className="font-bold shrink-0">Roll Number:</span>
                <span className="flex-1 font-mono text-xl">{student.studentProfile?.rollNo || ''}</span>
              </div>
              <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                <span className="font-bold shrink-0">Class:</span>
                <span className="flex-1">{student.studentProfile?.grade?.name || `Grade ${student.studentProfile?.gradeId || student.studentProfile?.grade_id || ''}`} {student.studentProfile?.section ? `- ${student.studentProfile?.section}` : ''}</span>
              </div>
              <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                <span className="font-bold shrink-0">Date:</span>
                <span className="flex-1"></span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-sm font-bold uppercase tracking-wider">
              <span>Time Allowed: {exam.durationMinutes || exam.duration || 60} Minutes</span>
              <span>Total Marks: {exam.totalMarks || exam.total_marks || (exam.paperQuestions?.length * 2) || 100}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="font-bold underline mb-2">Instructions:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Read all questions carefully before answering.</li>
              <li>Write or mark your answers clearly in the spaces provided.</li>
              <li>Do not use outside materials unless explicitly permitted.</li>
            </ul>
          </div>

          {/* Questions Section */}
          <div className="space-y-10">
            {exam.paperQuestions && exam.paperQuestions.length > 0 ? (
              exam.paperQuestions.map((pq: any, qIdx: number) => {
                const q = pq.question;
                if (!q) return null;
                return (
                <div key={q.id} className="break-inside-avoid">
                  <div className="flex gap-3">
                    <span className="font-bold text-lg">{qIdx + 1}.</span>
                    <div className="flex-1">
                      <p className="text-lg font-medium mb-4">{q.questionText || q.question_text}</p>
                      
                      {q.mediaUrl && (
                        <div className="mb-4 grid gap-4 max-w-sm">
                          <img src={q.mediaUrl} alt="Question reference" className="max-w-full h-auto border border-gray-300" />
                        </div>
                      )}
                      
                      {q.options && q.options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pl-2">
                          {q.options.map((opt: any) => (
                            <div key={opt.id || opt.optionKey || opt.option_key} className="flex items-start gap-3">
                              <div className="w-6 h-6 shrink-0 border-2 border-black rounded-full flex items-center justify-center font-bold text-sm">
                                {opt.optionKey || opt.option_key}
                              </div>
                              <div className="flex-1">
                                <span className="text-base">{opt.optionText || opt.option_text}</span>
                                {opt.mediaUrl && (
                                  <img src={opt.mediaUrl} alt="Option image" className="mt-2 max-w-[150px] border border-gray-200" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 border-b-2 border-dashed border-gray-400 h-32 w-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              )})
            ) : (
              <p className="text-gray-500 italic">No questions found for this assessment.</p>
            )}
          </div>
          
          <div className="mt-16 text-center text-gray-400 text-xs uppercase font-bold tracking-widest border-t border-gray-200 pt-4">
            -- End of Paper --
          </div>

        </div>
      ))}
    </div>
  );
}
