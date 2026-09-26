'use client';

import React, { useState, useEffect } from 'react';
import { Dumbbell, Sparkles, Plus, Trash2, Save, Play, Search, Flame, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ExerciseItem, WorkoutPlan, WorkoutLevel } from '@/lib/types';
import { apiGetWorkouts, apiCreateWorkout, apiDeleteWorkout, apiGenerateWorkoutPlan } from '@/lib/api-client';

const DEFAULT_STARTER_PLAN: WorkoutPlan = {
  id: 'temp-starter',
  title: 'Full Body Hypertrophy Split',
  description: 'Balanced compound resistance routine for foundational muscle development.',
  level: 'INTERMEDIATE',
  goal: 'Hypertrophy',
  isTemplate: true,
  createdBy: 'Head Coach',
  exercises: [
    {
      id: 'ex-1',
      name: 'Barbell Back Squat',
      category: 'Strength',
      muscleGroup: 'Quads & Glutes',
      equipment: 'Barbell',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      instructions: 'Drive hips back, keep chest elevated, push through heels.',
    },
    {
      id: 'ex-2',
      name: 'Dumbbell Incline Bench Press',
      category: 'Hypertrophy',
      muscleGroup: 'Chest',
      equipment: 'Dumbbells',
      sets: 4,
      reps: '10-12',
      restSeconds: 75,
      instructions: '30-degree bench angle, full stretch at bottom, explosive press.',
    },
    {
      id: 'ex-3',
      name: 'Neutral Grip Lat Pulldown',
      category: 'Hypertrophy',
      muscleGroup: 'Back',
      equipment: 'Cable Machine',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      instructions: 'Engage lats first, drive elbows toward ribs.',
    },
  ],
  createdAt: new Date().toISOString().slice(0, 10),
};

export const WorkoutBuilderModule: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan>(DEFAULT_STARTER_PLAN);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('Create a 4-day muscle hypertrophy workout routine focusing on chest and back');
  const [aiLevel, setAiLevel] = useState<WorkoutLevel>('INTERMEDIATE');

  // Exercise Form State
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExSets, setNewExSets] = useState('4');
  const [newExReps, setNewExReps] = useState('8-12');
  const [newExRest, setNewExRest] = useState('60');

  const loadWorkouts = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await apiGetWorkouts();
      setWorkouts(data);
      if (data.length > 0) {
        setActivePlan(data[0]);
      } else {
        setActivePlan(DEFAULT_STARTER_PLAN);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load workout plans' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleAddExercise = () => {
    if (!newExName) return;
    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: newExName,
      category: 'Hypertrophy',
      muscleGroup: newExMuscle,
      equipment: 'Free Weights',
      sets: parseInt(newExSets, 10) || 4,
      reps: newExReps || '10',
      restSeconds: parseInt(newExRest, 10) || 60,
    };

    setActivePlan({
      ...activePlan,
      exercises: [...activePlan.exercises, newEx],
    });

    setNewExName('');
  };

  const handleDeleteExercise = (id: string) => {
    setActivePlan({
      ...activePlan,
      exercises: activePlan.exercises.filter((ex) => ex.id !== id),
    });
  };

  const handleGenerateAiWorkout = async () => {
    setIsAiLoading(true);
    setFeedback(null);
    try {
      const data = await apiGenerateWorkoutPlan(aiPrompt, aiLevel, 'Muscle Growth & Hypertrophy');
      const generated = data.plan;
      const newPlan: WorkoutPlan = {
        id: `ai-preview-${Date.now()}`,
        title: generated.title || 'AI Hypertrophy Split',
        description: generated.description || 'AI Generated plan',
        level: aiLevel,
        goal: 'Hypertrophy',
        isTemplate: true,
        createdBy: 'APEX Gemini AI',
        exercises: (generated.exercises || []).map((ex, idx) => ({
          id: ex.id || `ai-ex-${Date.now()}-${idx}`,
          name: ex.name,
          category: ex.category || 'Hypertrophy',
          muscleGroup: ex.muscleGroup || 'All',
          equipment: ex.equipment || 'Free Weights',
          sets: Number(ex.sets) || 4,
          reps: String(ex.reps || '10'),
          restSeconds: Number(ex.restSeconds) || 60,
          instructions: ex.instructions || '',
        })),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setActivePlan(newPlan);
      setFeedback({
        type: 'success',
        message: 'AI split generated! Review exercises below and click "Save Plan" to save to your workout library.',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI Workout error';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!activePlan.title.trim()) {
      setFeedback({ type: 'error', message: 'Workout title is required' });
      return;
    }
    if (!activePlan.exercises.length) {
      setFeedback({ type: 'error', message: 'Plan must include at least one exercise' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = await apiCreateWorkout({
        title: activePlan.title,
        description: activePlan.description,
        level: activePlan.level,
        goal: activePlan.goal,
        isTemplate: activePlan.isTemplate,
        exercises: activePlan.exercises,
      });

      setWorkouts((prev) => [saved, ...prev.filter((w) => w.id !== saved.id)]);
      setActivePlan(saved);
      setFeedback({ type: 'success', message: `Workout plan "${saved.title}" saved to library!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save workout plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await apiDeleteWorkout(id);
      const remaining = workouts.filter((w) => w.id !== id);
      setWorkouts(remaining);
      setActivePlan(remaining[0] || DEFAULT_STARTER_PLAN);
      setFeedback({ type: 'success', message: 'Workout plan deleted' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete workout plan' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Interactive Workout Builder & AI Generator</h2>
          <p className="text-xs text-zinc-400 mt-1">Design set/rep schemes, manage exercise templates, or let Gemini AI build custom splits.</p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />} onClick={loadWorkouts}>
          Refresh Library
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Gemini AI Generator Banner */}
      <Card glow className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/40 border-cyan-500/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Gemini AI Workout Generator</h3>
          <Badge variant="cyan">INSTANT AI</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Describe fitness goal, focus area, equipment..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <select
              value={aiLevel}
              onChange={(e) => setAiLevel(e.target.value as WorkoutLevel)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 h-9"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>
          <Button
            variant="glow"
            size="sm"
            disabled={isAiLoading}
            onClick={handleGenerateAiWorkout}
            icon={isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isAiLoading ? 'AI Generating...' : 'Generate Split'}
          </Button>
        </div>
      </Card>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Plan Selector Sidebar */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workout Library ({workouts.length})</h3>
            <span className="text-[10px] text-zinc-500">Library</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-zinc-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
              <span>Loading workouts...</span>
            </div>
          ) : workouts.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              No saved workouts yet. Click &quot;Generate Split&quot; or add exercises and click &quot;Save Plan&quot;.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {workouts.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setActivePlan(w)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    activePlan.id === w.id
                      ? 'bg-zinc-800 border-cyan-500/50 text-white shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white truncate max-w-[150px]">{w.title}</p>
                    <Badge variant="purple">{w.level}</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{w.description}</p>
                  <p className="text-[10px] text-cyan-400 font-semibold mt-2">{w.exercises.length} Exercises Listed</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Active Workout Editor Workspace */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{activePlan.title}</h3>
                <Badge variant="cyan">{activePlan.level}</Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{activePlan.description || 'Custom workout split'}</p>
            </div>
            <div className="flex items-center gap-2">
              {!activePlan.id.startsWith('temp-') && !activePlan.id.startsWith('ai-preview-') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDeletePlan(activePlan.id)}
                >
                  Delete
                </Button>
              )}
              <Button
                variant="glow"
                size="sm"
                icon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                onClick={handleSavePlan}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </div>

          {/* Exercises Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Plan Exercises ({activePlan.exercises.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-2 px-2">Exercise</th>
                    <th className="pb-2 px-2">Muscle Group</th>
                    <th className="pb-2 px-2">Sets</th>
                    <th className="pb-2 px-2">Reps</th>
                    <th className="pb-2 px-2">Rest</th>
                    <th className="pb-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {activePlan.exercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-white">{ex.name}</td>
                      <td className="py-2.5 px-2"><Badge variant="purple">{ex.muscleGroup}</Badge></td>
                      <td className="py-2.5 px-2 font-mono text-zinc-300">{ex.sets}</td>
                      <td className="py-2.5 px-2 font-mono text-zinc-300">{ex.reps}</td>
                      <td className="py-2.5 px-2 text-zinc-400">{ex.restSeconds}s</td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Exercise Row Form */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">+ Add Exercise to Plan</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <Input placeholder="Exercise name..." value={newExName} onChange={(e) => setNewExName(e.target.value)} className="col-span-2 text-xs" />
              <Input placeholder="Muscle group..." value={newExMuscle} onChange={(e) => setNewExMuscle(e.target.value)} className="text-xs" />
              <Input placeholder="Sets (e.g. 4)" value={newExSets} onChange={(e) => setNewExSets(e.target.value)} className="text-xs" />
              <Input placeholder="Reps (e.g. 8-12)" value={newExReps} onChange={(e) => setNewExReps(e.target.value)} className="text-xs" />
              <div className="flex gap-2">
                <Input placeholder="Rest (s)" value={newExRest} onChange={(e) => setNewExRest(e.target.value)} className="text-xs w-full" />
                <Button variant="secondary" size="sm" onClick={handleAddExercise}>Add</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
