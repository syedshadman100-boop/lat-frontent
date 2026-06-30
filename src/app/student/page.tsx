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
        // 1. Fetch available LAT exams for the student's grade
        const res = await apiClient.get('/exams/student/available-papers');
        
        if (res.data && res.data.length > 0) {
          // 2. We have a paper! Let's start the self-serve attempt on the fly
          const paperId = res.data[0].id;
          const startRes = await apiClient.post('/exams/student/start-paper', { paper_id: paperId });
          
          // 3. Navigate to the newly generated attempt ID
          if (startRes.data && startRes.data.id) {
            router.replace(`/student/exam/${startRes.data.id}`);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load self-serve exams:', err);
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
