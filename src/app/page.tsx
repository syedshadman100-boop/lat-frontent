'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.push('/login');
  }, [router]);

  return null;
}
