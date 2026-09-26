'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { User } from '@/lib/types';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  currentUser: User;
  onOpenCheckIn: () => void;
  onSearchQuery?: (query: string) => void;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenCheckIn,
  onSearchQuery,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [searchVal, setSearchVal] = useState('');

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle outside click & escape key for dropdown accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowThemeMenu(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (themeMenuRef.current && !themeMenuRef.current.contains(target)) {
        setShowThemeMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  // Handle Theme switching
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      root.classList.remove('dark', 'light');
      if (mode === 'system') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemIsDark ? 'dark' : 'light');
      } else {
        root.classList.add(mode);
      }
    };

    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-cyan-400" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Area: Mobile Menu Toggle & Search Input */}
      <div className="flex items-center gap-2.5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-44 sm:w-72 md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            aria-label="Quick search members, plans, invoices"
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onSearchQuery) onSearchQuery(e.target.value);
            }}
            placeholder="Quick search members, plans, invoices..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Check-in Terminal Shortcut */}
        <button
          onClick={onOpenCheckIn}
          aria-label="Launch QR check-in pass terminal"
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>QR Check-in Pass</span>
        </button>

        {/* Theme Switcher Dropdown (Light, Dark, System) */}
        <div ref={themeMenuRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            aria-label="Toggle theme appearance menu"
            aria-haspopup="true"
            aria-expanded={showThemeMenu}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-colors flex items-center gap-1.5 border border-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            title={`Current theme: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-purple-400" />}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-40">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80 mb-1">
                Appearance Theme
              </div>
              <div className="space-y-0.5">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => {
                      setTheme(opt.mode);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      theme === opt.mode ? 'bg-zinc-800 text-cyan-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label} Mode</span>
                    </div>
                    {theme === opt.mode && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View system notifications"
            aria-haspopup="true"
            aria-expanded={showNotifications}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-40">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Notifications</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">3 New</span>
              </div>
              <div className="mt-3 space-y-3.5">
                <div className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-200">Emily Watson VIP Renewal</p>
                    <p className="text-[11px] text-zinc-400">$599.00 processed successfully via Card.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-200">Membership Expiration Alert</p>
                    <p className="text-[11px] text-zinc-400">Robert Taylor membership expires in 3 days.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Profile & Logout Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User account and profile menu"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
            className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Image
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={currentUser.name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover border border-zinc-700"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-400 font-mono leading-tight">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-40 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <Image
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={currentUser.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                  <div className="mt-1">
                    <Badge variant={currentUser.role === 'ADMIN' ? 'cyan' : currentUser.role === 'TRAINER' ? 'purple' : 'default'}>
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Staff Session
                </div>
                <div className="px-2 py-0.5 text-[11px] text-zinc-300">
                  Status: <span className="text-emerald-400 font-medium">Active Session</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
