import React, { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PALETTE = [
  'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
  'bg-blue-950/80 text-blue-300 border-blue-800/60',
  'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  'bg-purple-950/80 text-purple-300 border-purple-800/60',
  'bg-amber-950/80 text-amber-300 border-amber-800/60',
  'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
  'bg-zinc-800 text-zinc-300 border-zinc-700',
];

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanName = (name || 'Member').trim();
  const initials = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || cleanName.slice(0, 2).toUpperCase() || 'U';

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorScheme = PALETTE[Math.abs(hash) % PALETTE.length];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl',
    xl: 'w-16 h-16 text-base rounded-2xl',
  };

  const pxSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  // Reject fragile external unsplash URLs in favor of clean deterministic initials
  const isExternalPlaceholder = Boolean(src && (src.includes('unsplash.com') || src.includes('placeholder')));
  const canDisplayImage = Boolean(src && !hasError && !isExternalPlaceholder);

  if (canDisplayImage && src) {
    return (
      <div className={`relative overflow-hidden shrink-0 border border-zinc-800 ${sizeClasses[size]} ${className}`}>
        <Image
          src={src}
          alt={cleanName}
          width={pxSizes[size]}
          height={pxSizes[size]}
          className="object-cover w-full h-full"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={cleanName}
      className={`shrink-0 flex items-center justify-center font-bold tracking-wider border select-none ${sizeClasses[size]} ${colorScheme} ${className}`}
    >
      {initials}
    </div>
  );
};
