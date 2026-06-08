'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchMe();
        router.replace('/dashboard');
      } catch {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  return null;
}
