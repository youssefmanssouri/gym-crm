'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { apiLogin } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiLogin(email.trim(), password);

      if (result.success) {
        window.location.href = '/';
      } else {
        setErrorMessage(result.error || 'Invalid email or password');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size={48} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            APEX <span className="text-cyan-600 dark:text-cyan-400 text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800">CRM</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Fitness Facility & Member Operations Platform</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="pb-5 border-b border-slate-200 dark:border-zinc-800 mb-5 text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Sign in to Gym CRM
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Welcome back to your workspace</p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                autoComplete="email"
                placeholder="name@apexfitness.com"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all ${
                  fieldErrors.email
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-cyan-500/50'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all ${
                  fieldErrors.password
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-cyan-500/50'
                }`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full mt-2 justify-center py-2.5"
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In'}
            </Button>
          </form>

          {/* Registration Navigation Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/80 text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 dark:text-zinc-500">
          <p>Apex Fitness Management System • Role-Based Access Control & Session Security</p>
        </div>
      </div>
    </div>
  );
}
