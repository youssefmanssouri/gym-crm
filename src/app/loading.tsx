import { Dumbbell, ShieldCheck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <Dumbbell className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Apex Operations Workspace
          </h2>
          <p className="text-xs text-zinc-500">Loading module workspace data...</p>
        </div>
      </div>
    </div>
  );
}
