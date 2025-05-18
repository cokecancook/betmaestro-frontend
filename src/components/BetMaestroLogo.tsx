
"use client";

import type React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const BetMaestroLogo: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useAppContext();

  const logoSrc = theme === 'dark' ? '/icon-logo-white.svg' : '/icon-logo-black.svg';
  // const textColorClass = theme === 'dark' ? 'text-white' : 'text-orange-500';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/ball-brain.png"
        alt="BetMaestro icon"
        width={28}
        height={28}
        priority
        data-ai-hint="basketball brain icon"
      />
      <Image
        src={logoSrc}
        alt="BetMaestro"
        width={160} 
        height={32} 
        priority 
        data-ai-hint={theme === 'dark' ? "icon logo white" : "icon logo black"}
      />
    </div>
  );
};

export default BetMaestroLogo;
