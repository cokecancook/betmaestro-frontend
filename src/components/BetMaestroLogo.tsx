
import type React from 'react';

const BetMaestroLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`font-bold text-2xl text-orange-500 ${className}`}>
      BetMaestro
    </div>
  );
};

export default BetMaestroLogo;
