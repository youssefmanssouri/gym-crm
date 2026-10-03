'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('apex_theme') as 'dark' | 'light';
      if (saved && (saved === 'light' || saved === 'dark')) {
        setTheme(saved);
      } else {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(nextTheme);
    try {
      localStorage.setItem('apex_theme', nextTheme);
    } catch {}
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/60 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-zinc-800 transition-all flex items-center justify-center ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-600" />
      )}
    </button>
  );
}
