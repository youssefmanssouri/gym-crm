'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error in client boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-rose-400 shadow-xl shadow-rose-500/10">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-rose-950 text-rose-400 border border-rose-800">
            SYSTEM EXCEPTION
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Something Went Wrong</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred during rendering. You can retry the operation or return to the operations center.
          </p>
          {error.message && (
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-left font-mono text-[11px] text-zinc-400 overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold px-4 py-2.5 rounded-xl text-xs border border-zinc-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
