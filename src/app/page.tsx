
"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function SplashPage() {
  const router = useRouter();
  const { isLoading } = useAppContext(); 

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fadeIn bg-background">
      <div 
        className="mb-8 rounded-full overflow-hidden shadow-[0_0_130px_15px_rgba(251,146,60,0.5)] w-[300px] h-[300px] animate-glow-container-pulse"
      >
        <Image
          src="/betmaestro-logo.png"
          alt="BetMaestro Logo"
          width={300}
          height={300}
          className="object-cover w-full h-full animate-image-pulse"
          priority 
          data-ai-hint="basketball brain"
        />
      </div>
      <p className="text-2xl font-semibold text-foreground">BetMaestro</p>
      <p className="text-lg text-center text-muted-foreground mb-8">Your AI Betting Assistant</p>
      <Button 
        onClick={handleContinue} 
        size="lg" 
        className="bg-orange-500 hover:bg-orange-600 text-primary-foreground"
      >
        Continue
      </Button>
    </div>
  );
}
