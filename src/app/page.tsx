
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Added import

export default function SplashPage() {
  const router = useRouter();
  const { isLoading } = useAppContext(); // Removed isLoggedIn as it's not used for direct navigation anymore

  // Removed useEffect for automatic redirection

  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Skeleton className="h-32 w-32 rounded-lg mb-6" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-fadeIn">
      <div className="mb-8">
        <Image
          src="/betmaestro-logo.png"
          alt="BetMaestro Logo"
          width={300}
          height={300}
          className="rounded-lg shadow-2xl"
          priority // Important for LCP on a splash screen
          data-ai-hint="basketball brain"
        />
      </div>
      <p className="text-2xl font-semibold text-foreground">BetMaestro</p>
      <p className="text-lg text-muted-foreground mb-8">Your AI Betting Assistant</p>
      <Button onClick={handleContinue} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Continue
      </Button>
    </div>
  );
}
