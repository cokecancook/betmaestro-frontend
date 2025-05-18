
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
        className="mb-8 rounded-full shadow-[0_0_130px_15px_rgba(251,146,60,0.5)] w-[200px] h-[200px] animate-glow-container-pulse overflow-hidden"
      >
        <Image
          src="/ball-brain.png"
          alt="BetMaestro Ball Brain Logo"
          width={300}
          height={300}
          className="object-cover w-full h-full animate-image-pulse"
          priority 
          data-ai-hint="basketball brain"
        />
      </div>
      <div className="mb-2">
        <Image
          src="/logo-white.png"
          alt="BetMaestro"
          width={220} 
          height={40} 
          priority
          data-ai-hint="logo white text"
        />
      </div>
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

