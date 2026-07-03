'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function StudentRedirect() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchExamAndRedirect = async () => {
      try {
        // 1. First, check if the teacher has directly assigned an exam to this student
        const upcomingRes = await apiClient.get('/exams/student/upcoming');
        if (upcomingRes.data && upcomingRes.data.length > 0) {
          // Found an assigned exam! Route directly to it using the student_exam ID
          const studentExamId = upcomingRes.data[0].id;
          router.replace(`/student/exam/${studentExamId}`);
          return;
        }

        // 2. If no direct assignment, check for available self-serve papers for their grade
        const res = await apiClient.get('/exams/student/available-papers');
        
        if (res.data && res.data.length > 0) {
          const paperId = res.data[0].id;
          const startRes = await apiClient.post('/exams/student/start-paper', { paper_id: paperId });
          
          const attemptId = startRes.data?.attempt_id || startRes.data?.id;
          if (attemptId) {
            router.replace(`/student/exam/${attemptId}`);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load exams:', err);
        setLoading(false);
        setError(true);
      }
    };

    fetchExamAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f7fb]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#f4f7fb] p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">You're all caught up!</h2>
        <p className="text-gray-500 mb-6">
          {error 
            ? "We couldn't connect to the server to check your exams. Please try again later."
            : "You don't have any upcoming exams scheduled at the moment."}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.replace('/login');
            }}
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
