import Link from 'next/link';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-cyan-400 shadow-xl shadow-cyan-500/10">
          <Dumbbell className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            ERROR 404
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Route Not Found</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            The operational facility or navigation path you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
