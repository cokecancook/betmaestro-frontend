
import type React from 'react';
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
      <span
        className={cn(
          // Color is theme-dependent. Text size is inherited from parent div.
          theme === 'dark' ? 'text-white' : 'text-foreground'
        )}
      >
        BetMaestro
      </span>
    </div>
  );
};

export default BetMaestroLogo;
