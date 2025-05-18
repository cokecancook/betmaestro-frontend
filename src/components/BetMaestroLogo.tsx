
"use client";

import type React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const BetMaestroLogo: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useAppContext();

  const logoSrc = theme === 'dark' ? '/icon-logo-white.png' : '/icon-logo-black.png';

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="BetMaestro Logo"
        width={160} // Adjust width as needed
        height={32} // Adjust height as needed
        priority // Ensures logo loads quickly, good for LCP in header
        data-ai-hint={theme === 'dark' ? "icon logo white" : "icon logo black"}
      />
    </div>
  );
};

export default BetMaestroLogo;

