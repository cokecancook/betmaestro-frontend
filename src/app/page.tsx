
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BetMaestroLogo from '@/components/BetMaestroLogo';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function SplashPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          router.replace('/landing');
        } else {
          router.replace('/login');
        }
      }, 1500); // Show splash for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-48 mb-8" />
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fadeIn">
      <BetMaestroLogo className="text-6xl mb-8 drop-shadow-lg" />
      <p className="text-xl text-foreground">Your AI Betting Assistant</p>
    </div>
  );
}
