import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20',
    glow: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80',
    outline: 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 border border-zinc-700 hover:border-zinc-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20',
    ghost: 'bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100',
  };

  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} disabled={disabled} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
