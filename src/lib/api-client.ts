import { User } from './types';
import { GeneratedWorkoutPlan, GeneratedNutritionPlan } from './gemini';

/**
 * Client-side secure API helper communicating strictly with server route handlers.
 * Never imports Gemini SDK or credentials into the browser bundle.
 */

export async function apiGetSession(): Promise<{ authenticated: boolean; user: User | null }> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { authenticated: false, user: null };
    }
    const data = await res.json();
    return {
      authenticated: Boolean(data.authenticated),
      user: data.user || null,
    };
  } catch {
    return { authenticated: false, user: null };
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Authentication failed' };
    }
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network connection error during sign in' };
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Ignore network error on logout
  }
}

export async function apiChatWithAI(
  message: string
): Promise<{ success: boolean; response: string; isLiveAI?: boolean }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'AI chat request failed');
  }
  return data;
}

export async function apiGenerateWorkoutPlan(
  prompt: string,
  level: string,
  goal: string
): Promise<{ success: boolean; plan: GeneratedWorkoutPlan; isLiveAI?: boolean }> {
  const res = await fetch('/api/ai/workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, level, goal }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Workout plan generation failed');
  }
  return data;
}

export async function apiGenerateNutritionPlan(
  goal: string,
  calories: number,
  dietType: string
): Promise<{ success: boolean; plan: GeneratedNutritionPlan; isLiveAI?: boolean }> {
  const res = await fetch('/api/ai/nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, calories, dietType }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Nutrition plan generation failed');
  }
  return data;
}

export async function apiGenerateBusinessInsights(
  kpis?: Record<string, unknown>
): Promise<{ success: boolean; report: string; isLiveAI?: boolean }> {
  const res = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kpis || {}),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Business insights generation failed');
  }
  return data;
}

// -------------------------------------------------------------
// CORE CRM PERSISTENT API HELPERS
// -------------------------------------------------------------

import { MemberProfile, PaymentRecord, AttendanceRecord, ProductItem, MembershipPlan, WorkoutPlan, NutritionPlan, DashboardKPIs } from './types';

export async function apiGetMembers(): Promise<MemberProfile[]> {
  const res = await fetch('/api/members', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
  return data.members || [];
}

export async function apiCreateMember(payload: {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  fitnessGoal?: string;
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  planId: string;
}): Promise<MemberProfile> {
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create member');
  return data.member;
}

export async function apiDeleteMember(id: string): Promise<void> {
  const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete member');
}

export async function apiGetPayments(): Promise<{
  payments: PaymentRecord[];
  aggregates: { totalRevenue: number; pendingAmount: number; refundRate: string };
}> {
  const res = await fetch('/api/payments', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch payments');
  return {
    payments: data.payments || [],
    aggregates: data.aggregates || { totalRevenue: 0, pendingAmount: 0, refundRate: '0.0%' },
  };
}

export async function apiCreatePayment(payload: {
  amount: number;
  paymentMethod: 'CARD' | 'CASH' | 'RECURRING' | 'ONLINE';
  memberName?: string;
  memberEmail?: string;
  description?: string;
}): Promise<PaymentRecord> {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to record payment');
  return data.payment;
}

export async function apiGetAttendance(): Promise<AttendanceRecord[]> {
  const res = await fetch('/api/attendance', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch attendance');
  return data.attendance || [];
}

export async function apiCheckInMember(qrCode: string): Promise<{
  success: boolean;
  message: string;
  attendance: AttendanceRecord;
  member: MemberProfile;
}> {
  const res = await fetch('/api/attendance/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Check-in failed');
  return data;
}

export async function apiGetInventory(): Promise<ProductItem[]> {
  const res = await fetch('/api/inventory', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch inventory');
  return data.products || [];
}

export async function apiCreateProduct(payload: {
  name: string;
  category: string;
  sku: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  supplier?: string;
}): Promise<ProductItem> {
  const res = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data.product;
}

export async function apiCheckoutPOS(
  productId: string,
  quantity = 1,
  paymentMethod: 'CARD' | 'CASH' | 'RECURRING' | 'ONLINE' = 'CARD'
): Promise<{ success: boolean; message: string; product: ProductItem; invoiceNumber: string }> {
  const res = await fetch('/api/inventory/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity, paymentMethod }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'POS checkout failed');
  return data;
}

export async function apiGetPlans(): Promise<MembershipPlan[]> {
  const res = await fetch('/api/memberships', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch plans');
  return data.plans || [];
}

// -------------------------------------------------------------
// WORKOUT PERSISTENT API HELPERS
// -------------------------------------------------------------

export async function apiGetWorkouts(): Promise<WorkoutPlan[]> {
  const res = await fetch('/api/workouts', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch workouts');
  return data.workouts || [];
}

export async function apiCreateWorkout(payload: {
  title: string;
  description?: string;
  level?: string;
  goal?: string;
  isTemplate?: boolean;
  assignedToId?: string | null;
  exercises: any[];
}): Promise<WorkoutPlan> {
  const res = await fetch('/api/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create workout plan');
  return data.workout;
}

export async function apiUpdateWorkout(
  id: string,
  payload: Partial<WorkoutPlan>
): Promise<WorkoutPlan> {
  const res = await fetch(`/api/workouts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update workout plan');
  return data.workout;
}

export async function apiDeleteWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete workout plan');
}

// -------------------------------------------------------------
// NUTRITION PERSISTENT API HELPERS
// -------------------------------------------------------------

export async function apiGetNutritionPlans(): Promise<NutritionPlan[]> {
  const res = await fetch('/api/nutrition', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch nutrition plans');
  return data.plans || [];
}

export async function apiCreateNutritionPlan(payload: {
  title: string;
  dietType?: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  assignedToId?: string | null;
  mealCategories: any[];
}): Promise<NutritionPlan> {
  const res = await fetch('/api/nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create nutrition plan');
  return data.plan;
}

export async function apiUpdateNutritionPlan(
  id: string,
  payload: Partial<NutritionPlan>
): Promise<NutritionPlan> {
  const res = await fetch(`/api/nutrition/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update nutrition plan');
  return data.plan;
}

export async function apiDeleteNutritionPlan(id: string): Promise<void> {
  const res = await fetch(`/api/nutrition/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete nutrition plan');
}

// -------------------------------------------------------------
// ANALYTICS PERSISTENT API HELPERS
// -------------------------------------------------------------

export interface AnalyticsResponse {
  kpis: DashboardKPIs;
  charts: {
    revenue: Array<{ month: string; recurring: number; pos: number }>;
    attendance: Array<{ hour: string; members: number }>;
  };
  activity: {
    recentAttendance: AttendanceRecord[];
    expiringMembers: Array<{
      id: string;
      name: string;
      email: string;
      plan: string;
      expiresIn: number;
      endDate: string;
    }>;
  };
}

export async function apiGetAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch('/api/analytics', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
  return data;
}

