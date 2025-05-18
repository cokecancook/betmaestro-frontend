
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Added import
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
      }, 3000); // Show splash for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-32 w-32 rounded-full mb-6" /> 
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fadeIn">
      <div className="mb-8">
        <Image 
          src="https://placehold.co/200x200.png" 
          alt="BetMaestro Logo" 
          width={200} 
          height={200} 
          className="rounded-lg shadow-2xl"
          priority // Important for LCP on a splash screen
          data-ai-hint="basketball brain" 
        />
      </div>
      <p className="text-2xl font-semibold text-foreground">BetMaestro</p>
      <p className="text-lg text-muted-foreground">Your AI Betting Assistant</p>
    </div>
  );
}
