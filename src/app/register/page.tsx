'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, User, Mail, Lock, ArrowRight, AlertCircle, Loader2, Shield, Dumbbell, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { apiRegister } from '@/lib/api-client';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('ADMIN');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const result = await apiRegister(name.trim(), email.trim(), password, confirmPassword, role);

      if (result.success) {
        window.location.href = '/';
      } else {
        setErrorMessage(result.error || 'Registration failed');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
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

      <div className="w-full max-w-lg relative z-10 space-y-6 my-6">
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

        {/* Registration Card */}
        <Card className="bg-white/95 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="pb-5 border-b border-slate-200 dark:border-zinc-800 mb-5 text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Create your account
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Select your account type and get started</p>
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
            {/* Account Type Selector (BusinessOS Alignment) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Account Type</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">Choose your access role</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Account Type">
                {/* Admin Option */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'ADMIN'}
                  onClick={() => setRole('ADMIN')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    role === 'ADMIN'
                      ? 'border-cyan-500 bg-cyan-50/70 text-slate-900 shadow-sm ring-1 ring-cyan-500/30 dark:border-cyan-500 dark:bg-cyan-950/25 dark:text-white'
                      : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        role === 'ADMIN'
                          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400'
                          : 'bg-slate-200/60 text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold ${
                        role === 'ADMIN' ? 'text-cyan-950 dark:text-zinc-100' : 'text-slate-800 dark:text-zinc-200'
                      }`}>Administrator</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'ADMIN'
                        ? 'border-cyan-500 bg-cyan-500 text-white dark:text-zinc-950'
                        : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                    }`}>
                      {role === 'ADMIN' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    role === 'ADMIN' ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'
                  }`}>
                    Gym staff, managers & owners. Full CRM, payments, attendance & member controls.
                  </p>
                </button>

                {/* Member Option */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'MEMBER'}
                  onClick={() => setRole('MEMBER')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    role === 'MEMBER'
                      ? 'border-cyan-500 bg-cyan-50/70 text-slate-900 shadow-sm ring-1 ring-cyan-500/30 dark:border-cyan-500 dark:bg-cyan-950/25 dark:text-white'
                      : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        role === 'MEMBER'
                          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400'
                          : 'bg-slate-200/60 text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400'
                      }`}>
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold ${
                        role === 'MEMBER' ? 'text-cyan-950 dark:text-zinc-100' : 'text-slate-800 dark:text-zinc-200'
                      }`}>Gym Member</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'MEMBER'
                        ? 'border-cyan-500 bg-cyan-500 text-white dark:text-zinc-950'
                        : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                    }`}>
                      {role === 'MEMBER' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    role === 'MEMBER' ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'
                  }`}>
                    Personal workouts, nutrition guidance, QR check-in pass & membership details.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Full name
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                autoComplete="name"
                placeholder="Alex Vance"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all ${
                  fieldErrors.name
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-cyan-500/50'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Email address
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Password
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                autoComplete="new-password"
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

            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> Confirm password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                autoComplete="new-password"
                placeholder="••••••••••••"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all ${
                  fieldErrors.confirmPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-cyan-500/50'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full mt-2 justify-center py-2.5"
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Navigation Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/80 text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Sign in
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
