'use client';

import React, { useState } from 'react';
import { Dumbbell, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiLogin } from '@/lib/api-client';

const DEMO_PRESETS = [
  { label: 'Admin', email: 'alex.admin@apexfitness.com', role: 'ADMIN' },
  { label: 'Manager', email: 'sarah.mgr@apexfitness.com', role: 'MANAGER' },
  { label: 'Trainer', email: 'marcus.trainer@apexfitness.com', role: 'TRAINER' },
  { label: 'Receptionist', email: 'elena.rec@apexfitness.com', role: 'RECEPTIONIST' },
  { label: 'Member', email: 'david.chen@gmail.com', role: 'MEMBER' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('alex.admin@apexfitness.com');
  const [password, setPassword] = useState('ApexAdmin2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePresetClick = (preset: typeof DEMO_PRESETS[0]) => {
    setEmail(preset.email);
    if (preset.role === 'ADMIN') {
      setPassword('ApexAdmin2026!');
    } else {
      setPassword('ApexStaff2026!');
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await apiLogin(email, password);

    if (result.success) {
      window.location.href = '/';
    } else {
      setErrorMessage(result.error || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-2">
            <Dumbbell className="w-6 h-6 text-zinc-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            APEX <span className="text-cyan-400 text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800">CRM</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">Fitness Facility & Member Operations Platform</p>
        </div>

        {/* Login Card */}
        <Card glow className="bg-zinc-900/90 border-zinc-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pb-5 border-b border-zinc-800 mb-5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Sign In to Operations
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Authenticate using your staff or administrator credentials.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> Staff Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@apexfitness.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              disabled={isLoading}
              className="w-full mt-2 justify-center py-2.5"
              icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Verifying Session...' : 'Authenticate & Enter'}
            </Button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Demo Fill
              </span>
              <span className="text-[10px] text-zinc-500">Auto-fills credentials</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    email === p.email
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-500">
          <p>Protected by cryptographic HMAC-SHA256 session tokens.</p>
        </div>
      </div>
    </div>
  );
}
