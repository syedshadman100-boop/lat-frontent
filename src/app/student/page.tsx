'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function StudentRedirect() {
  const router = useRouter();

  useEffect(() => {
    const fetchExamAndRedirect = async () => {
      try {
        const res = await apiClient.get('/exams/student/upcoming');
        if (res.data && res.data.length > 0) {
          router.replace(`/student/exam/${res.data[0].id}`);
        } else {
          router.replace('/student/exam/123'); // Fallback
        }
      } catch (err) {
        console.error('Failed to load upcoming exams:', err);
        router.replace('/student/exam/123'); // Fallback
      }
    };

    fetchExamAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f4f7fb]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
