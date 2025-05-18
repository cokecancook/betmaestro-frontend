
import type React from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const BetMaestroLogo: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useAppContext();

  // Base classes for the logo wrapper.
  // Default text size 'text-2xl' is included here.
  // `className` prop can override defaults (e.g., text size on login page).
  const wrapperClasses = "flex items-center gap-2 font-bold text-2xl";

  return (
    <div className={cn(wrapperClasses, className)}>
      <Image
        src="/ball-brain.png" // Assumes ball-brain.png is in the public folder
        alt="BetMaestro Icon"
        width={24} // A small, fixed size for the icon
        height={24}
        data-ai-hint="basketball brain icon"
      />
      <span
        className={cn(
          // Color is theme-dependent. Text size is inherited from parent div.
          theme === 'dark' ? 'text-white' : 'text-orange-500'
        )}
      >
        BetMaestro
      </span>
    </div>
  );
};

export default BetMaestroLogo;
