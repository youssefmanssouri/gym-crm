'use client';

import React, { useState, useEffect } from 'react';
import { Apple, Sparkles, Plus, PieChart, Flame, CheckCircle2, Clock, Save, Trash2, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { NutritionPlan, MemberProfile } from '@/lib/types';
import {
  apiGetNutritionPlans,
  apiCreateNutritionPlan,
  apiDeleteNutritionPlan,
  apiGenerateNutritionPlan,
  apiGetMembers,
} from '@/lib/api-client';

const DEFAULT_STARTER_NUTRITION: NutritionPlan = {
  id: 'temp-starter',
  title: 'Lean Recomposition Protocol (2,800 kcal)',
  dietType: 'High Protein Recomp',
  createdBy: 'Performance Nutritionist',
  dailyCalories: 2800,
  proteinGrams: 195,
  carbsGrams: 280,
  fatGrams: 75,
  createdAt: new Date().toISOString().slice(0, 10),
  mealCategories: [
    {
      title: 'Pre-Dawn Fuel / Breakfast',
      time: '07:30 AM',
      meals: [
        { name: 'Oatmeal & Whey Isolate Bowl', portion: '80g oats, 1 scoop whey, 150g berries', calories: 480, protein: 40, carbs: 62, fat: 8 },
        { name: 'Whole Pasture-Raised Eggs', portion: '3 large poached eggs', calories: 215, protein: 18, carbs: 1, fat: 15 },
      ],
    },
    {
      title: 'Midday Performance Lunch',
      time: '12:30 PM',
      meals: [
        { name: 'Flame Grilled Chicken Breast', portion: '220g cooked', calories: 360, protein: 68, carbs: 0, fat: 8 },
        { name: 'Jasmine Rice & Steamed Broccoli', portion: '200g cooked rice, 100g florets', calories: 310, protein: 7, carbs: 65, fat: 2 },
      ],
    },
    {
      title: 'Post-Workout Anabolic Window',
      time: '04:30 PM',
      meals: [
        { name: 'Hydration Recovery Shake', portion: '1 large banana, 35g whey, 300ml almond milk', calories: 340, protein: 32, carbs: 45, fat: 4 },
      ],
    },
    {
      title: 'Recovery Dinner',
      time: '07:45 PM',
      meals: [
        { name: 'Wild Atlantic Salmon Fillet', portion: '200g oven baked', calories: 410, protein: 42, carbs: 0, fat: 26 },
        { name: 'Roasted Sweet Potato & Asparagus', portion: '200g potato, 8 spears olive oil drizzled', calories: 240, protein: 4, carbs: 48, fat: 5 },
      ],
    },
  ],
};

export const NutritionModule: React.FC = () => {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<NutritionPlan>(DEFAULT_STARTER_NUTRITION);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [targetCalories, setTargetCalories] = useState('2800');
  const [dietType, setDietType] = useState('High Protein Recomp');
  const [customTitle, setCustomTitle] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [fetchedPlans, fetchedMembers] = await Promise.all([
        apiGetNutritionPlans().catch(() => []),
        apiGetMembers().catch(() => []),
      ]);

      setPlans(fetchedPlans);
      setMembers(fetchedMembers);

      if (fetchedPlans.length > 0) {
        setActivePlan(fetchedPlans[0]);
      } else {
        setActivePlan(DEFAULT_STARTER_NUTRITION);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load nutrition plans' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateAiDiet = async () => {
    setIsAiLoading(true);
    setFeedback(null);
    try {
      const calNum = parseInt(targetCalories, 10) || 2800;
      const data = await apiGenerateNutritionPlan('Muscle Recomposition', calNum, dietType);
      const res = data.plan;

      const generatedPlan: NutritionPlan = {
        id: `draft-ai-${Date.now()}`,
        title: res.title || `AI ${dietType} (${calNum} kcal)`,
        dietType: dietType,
        createdBy: 'Gemini AI (Draft)',
        dailyCalories: res.dailyCalories || calNum,
        proteinGrams: res.proteinGrams || 190,
        carbsGrams: res.carbsGrams || 260,
        fatGrams: res.fatGrams || 70,
        mealCategories: res.mealCategories || [],
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setActivePlan(generatedPlan);
      setCustomTitle(generatedPlan.title);
      setFeedback({
        type: 'success',
        message: 'AI diet generated successfully! Review the macros and meals below, then click "Save Diet Plan" to persist to PostgreSQL.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'AI Diet generation failed' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = await apiCreateNutritionPlan({
        title: customTitle || activePlan.title,
        dietType: activePlan.dietType || dietType,
        dailyCalories: activePlan.dailyCalories,
        proteinGrams: activePlan.proteinGrams,
        carbsGrams: activePlan.carbsGrams,
        fatGrams: activePlan.fatGrams,
        assignedToId: selectedMemberId || undefined,
        mealCategories: activePlan.mealCategories,
      });

      setPlans((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      setActivePlan(saved);
      setFeedback({
        type: 'success',
        message: `Plan "${saved.title}" saved successfully to PostgreSQL database!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save nutrition plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (id.startsWith('temp-') || id.startsWith('draft-')) {
      const remaining = plans.filter((p) => p.id !== id);
      setPlans(remaining);
      setActivePlan(remaining[0] || DEFAULT_STARTER_NUTRITION);
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this nutrition plan?')) return;

    try {
      await apiDeleteNutritionPlan(id);
      const remaining = plans.filter((p) => p.id !== id);
      setPlans(remaining);
      setActivePlan(remaining[0] || DEFAULT_STARTER_NUTRITION);
      setFeedback({ type: 'success', message: 'Nutrition plan deleted successfully' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete nutrition plan' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Nutrition & Macro Meal Planner</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage dietary macros, caloric targets, and AI bio-nutritional meal plans.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={handleSavePlan}
            disabled={isSaving || isAiLoading}
            icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving...' : 'Save Diet Plan'}
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* AI Nutrition Generator Banner */}
      <Card glow className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border-emerald-500/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Gemini AI Diet Generator</h3>
          <Badge variant="success">SMART MACROS</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Input
              label="Target Daily Kcal"
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Dietary Focus Style"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="text-xs"
              placeholder="e.g. Keto, Low Carb, High Protein, Vegan"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="glow"
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/30"
              disabled={isAiLoading}
              onClick={handleGenerateAiDiet}
              icon={isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isAiLoading ? 'AI Calculating...' : 'Generate Diet'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Plan Library & Member Assignment Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saved Plans Selector */}
        <div className="md:col-span-2 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Database Plans ({plans.length}):
          </span>
          {plans.length === 0 ? (
            <span className="text-xs text-zinc-500 italic">No saved plans in database</span>
          ) : (
            plans.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePlan(p);
                  setCustomTitle(p.title);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activePlan.id === p.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{p.title}</span>
                <span className="text-[10px] text-zinc-500">({p.dailyCalories} kcal)</span>
              </button>
            ))
          )}
        </div>

        {/* Member Assignment Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-medium shrink-0 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-zinc-400" /> Assign To:
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Unassigned / General Template</option>
            {members.map((m) => (
              <option key={m.id} value={m.userId}>
                {m.user?.name || 'Member'} ({m.membership?.plan?.name || 'Standard'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Summary Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Macro Breakdown</h3>
            <Badge variant="cyan">{activePlan.dailyCalories} KCAL</Badge>
          </div>

          {/* Caloric & Macro Gauge Bars */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-zinc-300 font-semibold mb-1">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400" /> Protein</span>
                <span className="text-white font-mono">{activePlan.proteinGrams}g</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, Math.round((activePlan.proteinGrams * 4 / activePlan.dailyCalories) * 100))}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{activePlan.proteinGrams * 4} kcal ({Math.round((activePlan.proteinGrams * 4 / activePlan.dailyCalories) * 100) || 0}%)</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-zinc-300 font-semibold mb-1">
                <span className="flex items-center gap-1.5"><Apple className="w-3.5 h-3.5 text-amber-400" /> Carbohydrates</span>
                <span className="text-white font-mono">{activePlan.carbsGrams}g</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.round((activePlan.carbsGrams * 4 / activePlan.dailyCalories) * 100))}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{activePlan.carbsGrams * 4} kcal ({Math.round((activePlan.carbsGrams * 4 / activePlan.dailyCalories) * 100) || 0}%)</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-zinc-300 font-semibold mb-1">
                <span className="flex items-center gap-1.5"><PieChart className="w-3.5 h-3.5 text-cyan-400" /> Fats</span>
                <span className="text-white font-mono">{activePlan.fatGrams}g</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, Math.round((activePlan.fatGrams * 9 / activePlan.dailyCalories) * 100))}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{activePlan.fatGrams * 9} kcal ({Math.round((activePlan.fatGrams * 9 / activePlan.dailyCalories) * 100) || 0}%)</p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Created By:</span>
              <span className="text-zinc-200">{activePlan.createdBy || 'Staff'}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Assigned Member:</span>
              <span className="text-cyan-400 font-medium">{activePlan.assignedToName || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Dietary Style:</span>
              <span className="text-emerald-400">{activePlan.dietType || dietType}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="glow"
              size="sm"
              className="w-full"
              disabled={isSaving}
              onClick={handleSavePlan}
              icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isSaving ? 'Persisting to DB...' : 'Save Plan to Database'}
            </Button>
            {!activePlan.id.startsWith('temp-') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-950/20"
                onClick={() => handleDeletePlan(activePlan.id)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Plan
              </Button>
            )}
          </div>
        </Card>

        {/* Meal Categories Timeline */}
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">{activePlan.title}</h3>
              <p className="text-xs text-zinc-400">
                Assigned Member: <span className="text-cyan-400 font-semibold">{activePlan.assignedToName || 'Unassigned'}</span>
                {activePlan.dietType && <span className="ml-2 text-zinc-500">• {activePlan.dietType}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">TARGET {activePlan.dailyCalories} KCAL</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {activePlan.mealCategories.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No meals recorded in this plan yet. Use the Gemini AI Generator or customize categories.
              </div>
            ) : (
              activePlan.mealCategories.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {cat.title} ({cat.time})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {cat.meals.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 text-xs">
                        <div>
                          <p className="font-bold text-zinc-200">{m.name}</p>
                          <p className="text-[10px] text-zinc-500">Portion: {m.portion}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white font-mono">{m.calories} kcal</span>
                          <p className="text-[10px] text-emerald-400 font-mono">P: {m.protein}g | C: {m.carbs}g | F: {m.fat}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
