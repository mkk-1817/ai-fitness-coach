import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MealPlan, WorkoutPlan } from '@/types/fitness';

// ==============================================================================
// AI PLAN PERSISTENCE
// Signed-in users: Supabase `workout_plans` / `meal_plans` (full plan in the
// `plan_data` JSONB column, protected by the existing per-user RLS policies).
// Demo mode (no Supabase or no session): user-scoped localStorage history.
// ==============================================================================

const HISTORY_LIMIT = 20;

export type PlanKind = 'workout' | 'meal';
type PlanFor<K extends PlanKind> = K extends 'workout' ? WorkoutPlan : MealPlan;

export interface SaveResult<T> {
  plan: T;
  storage: 'supabase' | 'local';
  /** Set when Supabase persistence failed and the plan was kept locally instead. */
  error?: string;
}

const TABLE: Record<PlanKind, string> = { workout: 'workout_plans', meal: 'meal_plans' };

const useRemote = (uid: string) => Boolean(isSupabaseConfigured && supabase && uid && uid !== 'demo');
const localKey = (uid: string, kind: PlanKind) => `aurafit_${uid}_${kind}_plan_history`;

function readLocal<K extends PlanKind>(uid: string, kind: K): PlanFor<K>[] {
  try {
    const raw = localStorage.getItem(localKey(uid, kind));
    return raw ? (JSON.parse(raw) as PlanFor<K>[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<K extends PlanKind>(uid: string, kind: K, plans: PlanFor<K>[]) {
  try {
    localStorage.setItem(localKey(uid, kind), JSON.stringify(plans.slice(0, HISTORY_LIMIT)));
  } catch {
    // Storage quota — history is best-effort in demo mode.
  }
}

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}

function toRow(uid: string, kind: PlanKind, plan: WorkoutPlan | MealPlan): Record<string, unknown> {
  if (kind === 'workout') {
    const p = plan as WorkoutPlan;
    return {
      user_id: uid,
      title: p.title,
      description: p.description,
      goal: p.goal,
      split_type: p.splitType,
      days_per_week: p.daysPerWeek,
      duration_weeks: p.durationWeeks,
      ai_generated: true,
      ai_model: p.aiModel,
      workout_type: p.workoutType ?? 'mixed',
      preferred_activities: p.preferredActivities ?? [],
      generation_options: p.generationOptions ?? {},
      plan_data: p,
      is_active: p.isActive,
    };
  }
  const p = plan as MealPlan;
  return {
    user_id: uid,
    title: p.title,
    target_calories: Math.round(p.targetCalories),
    target_protein_g: Math.round(p.targetProteinG),
    target_carbs_g: Math.round(p.targetCarbsG),
    target_fat_g: Math.round(p.targetFatG),
    target_fiber_g: Math.round(p.targetFiberG),
    diet_type: p.dietType,
    cuisine: p.cuisine,
    duration_days: p.days?.length ?? 1,
    ai_generated: true,
    ai_model: p.aiModel,
    generation_options: p.generationOptions ?? {},
    plan_data: p,
    is_active: p.isActive,
  };
}

interface PlanRow {
  id: string;
  is_active: boolean | null;
  created_at: string;
  plan_data: (WorkoutPlan & MealPlan) | null;
}

function fromRow<K extends PlanKind>(row: PlanRow): PlanFor<K> | null {
  if (!row.plan_data) return null; // legacy rows created before AI plan persistence
  return { ...row.plan_data, id: row.id, isActive: Boolean(row.is_active), createdAt: row.created_at } as PlanFor<K>;
}

export async function listPlans<K extends PlanKind>(uid: string, kind: K): Promise<{ plans: PlanFor<K>[]; error?: string }> {
  if (!useRemote(uid)) return { plans: readLocal(uid, kind) };

  const { data, error } = await supabase
    .from(TABLE[kind])
    .select('id, is_active, created_at, plan_data')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) return { plans: readLocal(uid, kind), error: errorMessage(error) };
  const plans = ((data ?? []) as PlanRow[]).map(r => fromRow<K>(r)).filter((p): p is PlanFor<K> => p !== null);
  return { plans };
}

/** Saves a newly generated plan as the user's active plan. */
export async function saveNewPlan<K extends PlanKind>(uid: string, kind: K, plan: PlanFor<K>): Promise<SaveResult<PlanFor<K>>> {
  const activePlan = { ...plan, isActive: true };

  if (useRemote(uid)) {
    const { data, error } = await supabase
      .from(TABLE[kind])
      .insert(toRow(uid, kind, activePlan))
      .select('id, created_at')
      .single();

    if (!error && data) {
      const row = data as { id: string; created_at: string };
      const saved = { ...activePlan, id: row.id, createdAt: row.created_at } as PlanFor<K>;
      // Keep the stored JSON's id in sync with the row id, and deactivate older plans.
      await Promise.all([
        supabase.from(TABLE[kind]).update({ plan_data: saved }).eq('id', row.id),
        supabase.from(TABLE[kind]).update({ is_active: false }).eq('user_id', uid).neq('id', row.id),
      ]);
      return { plan: saved, storage: 'supabase' };
    }

    const history = readLocal(uid, kind).map(p => ({ ...p, isActive: false }));
    writeLocal(uid, kind, [activePlan, ...history]);
    return { plan: activePlan, storage: 'local', error: errorMessage(error) };
  }

  const history = readLocal(uid, kind).map(p => ({ ...p, isActive: false }));
  writeLocal(uid, kind, [activePlan, ...history]);
  return { plan: activePlan, storage: 'local' };
}

/** Persists edits to an existing plan (e.g. a meal swapped for one of its alternatives). */
export async function updatePlan<K extends PlanKind>(uid: string, kind: K, plan: PlanFor<K>): Promise<{ error?: string }> {
  const local = readLocal(uid, kind);
  if (local.some(p => p.id === plan.id)) {
    writeLocal(uid, kind, local.map(p => (p.id === plan.id ? plan : p)));
  }
  if (!useRemote(uid)) return {};

  const { error } = await supabase
    .from(TABLE[kind])
    .update({ plan_data: plan, title: plan.title })
    .eq('id', plan.id)
    .eq('user_id', uid);
  return error ? { error: errorMessage(error) } : {};
}

/** Marks a plan from history as the active plan. */
export async function activatePlan(uid: string, kind: PlanKind, planId: string): Promise<{ error?: string }> {
  const local = readLocal(uid, kind);
  if (local.length > 0) {
    writeLocal(uid, kind, local.map(p => ({ ...p, isActive: p.id === planId })));
  }
  if (!useRemote(uid)) return {};

  const { error } = await supabase.from(TABLE[kind]).update({ is_active: true }).eq('id', planId).eq('user_id', uid);
  if (error) return { error: errorMessage(error) };
  const { error: deactivateError } = await supabase
    .from(TABLE[kind])
    .update({ is_active: false })
    .eq('user_id', uid)
    .neq('id', planId);
  return deactivateError ? { error: errorMessage(deactivateError) } : {};
}

export async function deletePlan(uid: string, kind: PlanKind, planId: string): Promise<{ error?: string }> {
  writeLocal(uid, kind, readLocal(uid, kind).filter(p => p.id !== planId));
  if (!useRemote(uid)) return {};
  const { error } = await supabase.from(TABLE[kind]).delete().eq('id', planId).eq('user_id', uid);
  return error ? { error: errorMessage(error) } : {};
}

export function clearLocalPlanHistory(uid: string) {
  try {
    localStorage.removeItem(localKey(uid, 'workout'));
    localStorage.removeItem(localKey(uid, 'meal'));
  } catch {
    // ignore
  }
}
