
"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import TopMenu from '@/components/TopMenu';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    // Show a loading skeleton or a full-page loader
    return (
      <div className="flex flex-col h-dvh overflow-y-hidden"> {/* Changed min-h-screen to h-dvh and added overflow-y-hidden */}
        <header className="sticky top-0 z-50 w-full border-b bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 overflow-y-auto"> {/* Added overflow-y-auto to main for skeleton content if it's too tall */}
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh overflow-y-hidden"> {/* Changed min-h-screen to h-dvh and added overflow-y-hidden */}
      <TopMenu />
      <main className="flex flex-col flex-1 overflow-hidden"> {/* Ensured main is a flex column */}
        {children}
      </main>
    </div>
  );
}
