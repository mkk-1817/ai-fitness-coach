'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { 
  FitnessProfile, 
  WorkoutPlan, 
  WorkoutSession, 
  MealPlan, 
  MealLog, 
  WeightLog, 
  BodyMeasurementLog, 
  AIMessage, 
  GamificationBadge, 
  NotificationItem,
  WeeklyReview,
  WorkoutGenerationOptions,
  DietGenerationOptions,
  MealPlanDayTotals,
  MealItem,
} from '@/types/fitness';
import type { AIMealPlanResponse, AIWorkoutPlanResponse } from '@/types/ai';
import { computeAllMetrics } from '../utils/calculations';
import { postAI, describeError } from '../ai/request';
import { computeMealDayTotals } from '../groq/plan-review';
import { defaultDietOptions, defaultWorkoutOptions, isTimedCategory } from '../fitness/workout-options';
import {
  PlanKind,
  activatePlan,
  clearLocalPlanHistory,
  deletePlan,
  listPlans,
  saveNewPlan,
  updatePlan,
} from '../plans/plan-repository';

export interface GenerationState {
  status: 'idle' | 'loading' | 'error' | 'success';
  error?: string;
  details?: string[];
  retryable?: boolean;
  /** Non-blocking notes from response validation (e.g. a day slightly off the calorie target). */
  warnings?: string[];
  /** Set when the plan could not be saved to Supabase and was kept on this device instead. */
  storageNote?: string;
}

const IDLE: GenerationState = { status: 'idle' };

interface WorkoutApiResponse {
  plan: Omit<AIWorkoutPlanResponse, 'days'> & {
    days: (Omit<AIWorkoutPlanResponse['days'][number], 'exercises'> & {
      exercises: (AIWorkoutPlanResponse['days'][number]['exercises'][number] & { exerciseId?: string; videoUrl: string })[];
    })[];
  };
  options: WorkoutGenerationOptions;
  meta: { model: string; attempts: number; warnings: string[] };
}

interface DietApiResponse {
  plan: Omit<AIMealPlanResponse, 'days'> & {
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    days: (AIMealPlanResponse['days'][number] & { totals: MealPlanDayTotals })[];
  };
  options: DietGenerationOptions;
  meta: { model: string; attempts: number; warnings: string[] };
}

/** Plans created by the pre-AI seed engine are never shown as if they were AI output. */
const LEGACY_SEED_PLAN_IDS = new Set(['plan_default', 'diet_default']);

const round1 = (n: number) => Math.round(n * 10) / 10;


// ==============================================================================
// INITIAL DEMO PROFILE (Realistic starting state for instant exploration)
// ==============================================================================
const initialMetrics = computeAllMetrics(27, 'male', 178, 82.5, 'moderately_active', 'muscle_gain', 78);

const DEMO_PROFILE: FitnessProfile = {
  id: 'usr_demo_101',
  userId: 'usr_demo_101',
  name: 'Alex Chen',
  email: 'alex.fitness@example.com',
  age: 27,
  gender: 'male',
  heightCm: 178,
  weightKg: 82.5,
  targetWeightKg: 78.0,
  country: 'India',
  activityLevel: 'moderately_active',
  primaryGoal: 'muscle_gain',
  secondaryGoal: 'strength',
  experienceLevel: 'intermediate',
  trainingYears: 2,
  workoutDaysPerWeek: 4,
  workoutDurationMins: 45,
  preferredWorkoutTime: 'morning',
  trainingLocation: 'home',
  availableEquipment: ['Dumbbells', 'Bodyweight', 'Resistance Bands', 'Yoga Mat', 'Pull-up Bar'],
  preferredWorkoutType: 'mixed',
  preferredActivities: ['Walking', 'Badminton'],
  healthConditions: [],
  injuries: ['Mild lower back tightness'],
  avoidExercises: ['Heavy Barbell Deadlift'],
  dietType: 'non_vegetarian',
  cuisinePreferences: ['South Indian', 'Tamil', 'Western'],
  foodsLiked: ['Idli', 'Chicken breast', 'Eggs', 'Sambar', 'Sundal', 'Greek yogurt'],
  foodsAvoided: ['Excessive oily fast food'],
  allergies: [],
  mealsPerDay: 4,
  waterTargetMl: 3200,
  bmi: initialMetrics.bmi,
  bmr: initialMetrics.bmr,
  tdee: initialMetrics.tdee,
  targetCalories: initialMetrics.targetCalories,
  targetProteinG: initialMetrics.targetProteinG,
  targetCarbsG: initialMetrics.targetCarbsG,
  targetFatG: initialMetrics.targetFatG,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const INITIAL_BADGES: GamificationBadge[] = [
  { key: 'first_workout', name: 'First Blood', description: 'Completed your very first logged workout session', icon: '🔥', isUnlocked: true, unlockedAt: '2026-09-20T10:00:00Z' },
  { key: 'streak_3', name: 'On Fire', description: 'Maintained a 3-day workout consistency streak', icon: '⚡', isUnlocked: true, unlockedAt: '2026-09-23T10:00:00Z' },
  { key: 'protein_master', name: 'Macro Virtuoso', description: 'Hit your exact daily protein target 5 days in a row', icon: '🥩', isUnlocked: true, unlockedAt: '2026-09-24T18:00:00Z' },
  { key: 'century_club', name: 'Century Club', description: 'Accumulated over 10,000 kg in total training volume', icon: '🏆', isUnlocked: false },
  { key: 'heavy_hitter', name: 'Strength Pioneer', description: 'Achieved a progressive overload weight increase', icon: '💪', isUnlocked: true, unlockedAt: '2026-09-22T09:30:00Z' },
  { key: 'hydration_hero', name: 'Hydro Master', description: 'Drank 3+ liters of water for 7 consecutive days', icon: '💧', isUnlocked: false }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif-1', title: 'Daily Workout Ready', message: 'Day 1: Upper Body Strength is scheduled for this morning.', type: 'workout', createdAt: '2026-09-25T07:00:00Z', read: false },
  { id: 'notif-2', title: 'Hydration Check', message: 'You have logged 1,250 ml so far. Target: 3,200 ml.', type: 'water', createdAt: '2026-09-25T11:00:00Z', read: false },
  { id: 'notif-3', title: 'Coach Insight', message: 'Your bench press progression is tracking +2.5kg over last week!', type: 'milestone', createdAt: '2026-09-24T18:30:00Z', read: true }
];


interface FitnessStoreContextType {
  profile: FitnessProfile;
  workoutPlan: WorkoutPlan | null;
  workoutPlanHistory: WorkoutPlan[];
  workoutSessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  mealPlan: MealPlan | null;
  mealPlanHistory: MealPlan[];
  mealLogs: MealLog[];
  waterLoggedMl: number;
  weightLogs: WeightLog[];
  bodyMeasurements: BodyMeasurementLog[];
  chatMessages: AIMessage[];
  chatError: string | null;
  badges: GamificationBadge[];
  notifications: NotificationItem[];
  weeklyReview: WeeklyReview | null;
  isLoadingAI: boolean;
  isHistoryLoading: boolean;
  historyError: string | null;
  workoutGeneration: GenerationState;
  dietGeneration: GenerationState;
  saveProfile: (newProfile: FitnessProfile) => Promise<void>;
  /** Generates a new AI workout plan. Options default to the profile's saved preferences. */
  generateNewWorkoutPlan: (options?: Partial<WorkoutGenerationOptions>, profileOverride?: FitnessProfile) => Promise<boolean>;
  /** Generates a new AI 7-day meal plan. Options default to the profile's cuisines. */
  generateNewDietPlan: (options?: Partial<DietGenerationOptions>, profileOverride?: FitnessProfile) => Promise<boolean>;
  retryWorkoutGeneration: () => Promise<boolean>;
  retryDietGeneration: () => Promise<boolean>;
  dismissGenerationState: (kind: PlanKind) => void;
  activateHistoricalPlan: (kind: PlanKind, planId: string) => Promise<void>;
  deleteHistoricalPlan: (kind: PlanKind, planId: string) => Promise<void>;
  startWorkout: (dayId: string) => WorkoutSession;
  updateActiveSession: (updater: (prev: WorkoutSession) => WorkoutSession) => void;
  finishActiveWorkout: (feedback: { rpe: number; energy: number; soreness: number; painReported: boolean; painNotes?: string; notes?: string }) => Promise<void>;
  cancelActiveWorkout: () => void;
  logMeal: (meal: Omit<MealLog, 'id' | 'userId' | 'loggedAt'>) => void;
  deleteMealLog: (id: string) => void;
  logWater: (amountMl: number) => void;
  logWeight: (weightKg: number, notes?: string) => void;
  logBodyMeasurement: (measurements: Omit<BodyMeasurementLog, 'id' | 'userId' | 'date'>) => void;
  sendChatMessage: (userText: string) => Promise<void>;
  retryLastChatMessage: () => Promise<void>;
  replaceMealWithAlternative: (mealId: string, altIndex: number) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToDemo: () => void;
}

const FitnessStoreContext = createContext<FitnessStoreContextType | null>(null);

export function FitnessStoreProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  // Namespace all localStorage keys by userId so each user gets isolated data
  const uid = userId || 'demo';
  const key = useCallback((name: string) => `aurafit_${uid}_${name}`, [uid]);

  // Track which userId we last loaded data for so we can re-init on user switch
  const lastUidRef = useRef<string | null>(null);

  const [profile, setProfile] = useState<FitnessProfile>(DEMO_PROFILE);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [workoutPlanHistory, setWorkoutPlanHistory] = useState<WorkoutPlan[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealPlanHistory, setMealPlanHistory] = useState<MealPlan[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [waterLoggedMl, setWaterLoggedMl] = useState<number>(1500);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementLog[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [badges, setBadges] = useState<GamificationBadge[]>(INITIAL_BADGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [weeklyReview] = useState<WeeklyReview | null>(null);
  const [workoutGeneration, setWorkoutGeneration] = useState<GenerationState>(IDLE);
  const [dietGeneration, setDietGeneration] = useState<GenerationState>(IDLE);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Last request per plan kind, so "Retry" re-sends exactly what failed.
  const lastWorkoutRequestRef = useRef<{ options?: Partial<WorkoutGenerationOptions>; profile?: FitnessProfile } | null>(null);
  const lastDietRequestRef = useRef<{ options?: Partial<DietGenerationOptions>; profile?: FitnessProfile } | null>(null);

  const isLoadingAI = workoutGeneration.status === 'loading' || dietGeneration.status === 'loading';

  // Initialize (or re-initialize) from user-scoped localStorage whenever uid changes
  useEffect(() => {
    if (lastUidRef.current === uid) return; // already loaded for this user
    lastUidRef.current = uid;

    try {
      const storedProfile = localStorage.getItem(key('profile'));
      const parsedProfile = storedProfile ? JSON.parse(storedProfile) : null;

      // For real (non-demo) users, start with a clean profile so they fill in onboarding
      const baseProfile = parsedProfile ?? (uid !== 'demo'
        ? { ...DEMO_PROFILE, id: uid, userId: uid, name: '', email: '' }
        : DEMO_PROFILE);

      setProfile(baseProfile);

      // Cached active plans (the authoritative history is loaded below).
      const storedPlan = localStorage.getItem(key('workout_plan'));
      const parsedPlan: WorkoutPlan | null = storedPlan ? JSON.parse(storedPlan) : null;
      setWorkoutPlan(parsedPlan && !LEGACY_SEED_PLAN_IDS.has(parsedPlan.id) ? parsedPlan : null);

      const storedDiet = localStorage.getItem(key('meal_plan'));
      const parsedDiet: MealPlan | null = storedDiet ? JSON.parse(storedDiet) : null;
      setMealPlan(parsedDiet && !LEGACY_SEED_PLAN_IDS.has(parsedDiet.id) ? parsedDiet : null);

      setWorkoutGeneration(IDLE);
      setDietGeneration(IDLE);
      setChatError(null);

      const storedSessions = localStorage.getItem(key('sessions'));
      if (storedSessions) {
        setWorkoutSessions(JSON.parse(storedSessions));
      } else if (uid === 'demo') {
        seedSampleSessions();
      } else {
        setWorkoutSessions([]);
      }

      const storedMeals = localStorage.getItem(key('meal_logs'));
      if (storedMeals) {
        setMealLogs(JSON.parse(storedMeals));
      } else if (uid === 'demo') {
        seedSampleMeals();
      } else {
        setMealLogs([]);
      }

      const storedWeights = localStorage.getItem(key('weights'));
      if (storedWeights) {
        setWeightLogs(JSON.parse(storedWeights));
      } else if (uid === 'demo') {
        seedSampleWeights();
      } else {
        setWeightLogs([]);
      }

      const storedMeasurements = localStorage.getItem(key('measurements'));
      if (storedMeasurements) {
        setBodyMeasurements(JSON.parse(storedMeasurements));
      } else if (uid === 'demo') {
        seedSampleMeasurements();
      } else {
        setBodyMeasurements([]);
      }

      const storedWater = localStorage.getItem(key('water'));
      if (storedWater) {
        setWaterLoggedMl(JSON.parse(storedWater));
      } else {
        setWaterLoggedMl(uid === 'demo' ? 1500 : 0);
      }

      const storedChat = localStorage.getItem(key('chat'));
      if (storedChat) {
        setChatMessages(JSON.parse(storedChat));
      } else {
        setChatMessages([
          {
            id: 'msg-1',
            role: 'assistant',
            content: uid === 'demo'
              ? `Hello Alex! 👋 I am your AuraFit AI Coach. Your daily targets are ${DEMO_PROFILE.targetCalories} kcal and ${DEMO_PROFILE.targetProteinG}g protein. Generate your AI workout and 7-day meal plans any time, then ask me for tweaks!`
              : `Welcome to AuraFit! 👋 I'm your AI Coach. Please complete your fitness assessment so I can build your personalised plan!`,
            timestamp: new Date().toISOString()
          }
        ]);
      }

      const storedBadges = localStorage.getItem(key('badges'));
      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        setBadges(uid === 'demo' ? INITIAL_BADGES : INITIAL_BADGES.map(b => ({ ...b, isUnlocked: false, unlockedAt: undefined })));
      }
    } catch (e) {
      console.error('Error initializing fitness store:', e);
    }

    // Plan history (Supabase for signed-in users, local history in demo mode)
    // Guard by uid (not effect cleanup) so a StrictMode re-run doesn't drop the result.
    const loadingUid = uid;
    const cancelled = () => lastUidRef.current !== loadingUid;
    setIsHistoryLoading(true);
    setHistoryError(null);
    Promise.all([listPlans(uid, 'workout'), listPlans(uid, 'meal')])
      .then(([workouts, meals]) => {
        if (cancelled()) return;
        setWorkoutPlanHistory(workouts.plans);
        setMealPlanHistory(meals.plans);
        const activeWorkout = workouts.plans.find(p => p.isActive);
        const activeMeal = meals.plans.find(p => p.isActive);
        if (activeWorkout) {
          setWorkoutPlan(activeWorkout);
          persist('workout_plan', activeWorkout);
        }
        if (activeMeal) {
          setMealPlan(activeMeal);
          persist('meal_plan', activeMeal);
        }
        const err = workouts.error || meals.error;
        if (err) setHistoryError(`Could not load saved plans from Supabase: ${err}`);
      })
      .catch(err => {
        if (!cancelled()) setHistoryError(describeError(err).message);
      })
      .finally(() => {
        if (!cancelled()) setIsHistoryLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Helpers to persist state (always user-scoped)
  const persist = (name: string, data: unknown) => {
    try {
      localStorage.setItem(key(name), JSON.stringify(data));
    } catch {
      // Storage quota catch
    }
  };

  const seedSampleSessions = () => {
    const today = new Date();
    const sample: WorkoutSession[] = [
      {
        id: 'sess-1',
        userId: DEMO_PROFILE.userId,
        title: 'Upper Body Hypertrophy',
        startedAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
        completedAt: new Date(today.getTime() - 4 * 86400000 + 45 * 60000).toISOString(),
        durationSeconds: 2700,
        totalVolumeKg: 3450,
        caloriesBurned: 320,
        completionPercentage: 100,
        rpeScore: 7,
        energyLevel: 4,
        muscleSoreness: 2,
        painReported: false,
        notes: 'Great pump on bench press and rows. Moved 17.5kg dumbbells smoothly.',
        exercises: [
          {
            exerciseName: 'Dumbbell Bench Press',
            sets: [
              { setNumber: 1, targetReps: 10, completedReps: 10, weightKg: 17.5, completed: true, rpe: 7 },
              { setNumber: 2, targetReps: 10, completedReps: 10, weightKg: 17.5, completed: true, rpe: 7 },
              { setNumber: 3, targetReps: 10, completedReps: 10, weightKg: 17.5, completed: true, rpe: 8 }
            ]
          },
          {
            exerciseName: 'Dumbbell Bent-Over Row',
            sets: [
              { setNumber: 1, targetReps: 10, completedReps: 10, weightKg: 15, completed: true, rpe: 6 },
              { setNumber: 2, targetReps: 10, completedReps: 10, weightKg: 15, completed: true, rpe: 7 },
              { setNumber: 3, targetReps: 10, completedReps: 10, weightKg: 15, completed: true, rpe: 7 }
            ]
          }
        ]
      },
      {
        id: 'sess-2',
        userId: DEMO_PROFILE.userId,
        title: 'Lower Body Strength & Core',
        startedAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
        completedAt: new Date(today.getTime() - 2 * 86400000 + 40 * 60000).toISOString(),
        durationSeconds: 2400,
        totalVolumeKg: 3820,
        caloriesBurned: 360,
        completionPercentage: 100,
        rpeScore: 8,
        energyLevel: 4,
        muscleSoreness: 3,
        painReported: false,
        notes: 'Goblet squats felt very stable with 22.5kg dumbbell.',
        exercises: [
          {
            exerciseName: 'Goblet Squat',
            sets: [
              { setNumber: 1, targetReps: 10, completedReps: 10, weightKg: 22.5, completed: true, rpe: 7 },
              { setNumber: 2, targetReps: 10, completedReps: 10, weightKg: 22.5, completed: true, rpe: 8 },
              { setNumber: 3, targetReps: 10, completedReps: 10, weightKg: 22.5, completed: true, rpe: 8 }
            ]
          }
        ]
      }
    ];
    setWorkoutSessions(sample);
    persist('sessions', sample);
  };

  const seedSampleMeals = () => {
    const today = new Date().toISOString().split('T')[0];
    const meals: MealLog[] = [
      {
        id: 'mlog-1',
        userId: DEMO_PROFILE.userId,
        date: today,
        mealType: 'breakfast',
        foodName: 'Idli with Sambar & 2 Boiled Eggs',
        portion: '3 idlis + sambar + 2 eggs',
        calories: 414,
        proteinG: 22.1,
        carbsG: 52.8,
        fatG: 12.6,
        fiberG: 5.5,
        loggedAt: `${today}T08:30:00Z`
      },
      {
        id: 'mlog-2',
        userId: DEMO_PROFILE.userId,
        date: today,
        mealType: 'lunch',
        foodName: 'Pepper Chicken Breast with Rice & Rasam',
        portion: '160g chicken + 1 cup rice',
        calories: 520,
        proteinG: 41.5,
        carbsG: 58.0,
        fatG: 9.5,
        fiberG: 4.0,
        loggedAt: `${today}T13:15:00Z`
      }
    ];
    setMealLogs(meals);
    persist('meal_logs', meals);
  };

  const seedSampleWeights = () => {
    const today = new Date();
    const weights: WeightLog[] = [
      { id: 'w-1', userId: DEMO_PROFILE.userId, date: new Date(today.getTime() - 28 * 86400000).toISOString().split('T')[0], weightKg: 84.8, notes: 'Initial weigh-in' },
      { id: 'w-2', userId: DEMO_PROFILE.userId, date: new Date(today.getTime() - 21 * 86400000).toISOString().split('T')[0], weightKg: 84.1 },
      { id: 'w-3', userId: DEMO_PROFILE.userId, date: new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0], weightKg: 83.5 },
      { id: 'w-4', userId: DEMO_PROFILE.userId, date: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0], weightKg: 83.0 },
      { id: 'w-5', userId: DEMO_PROFILE.userId, date: today.toISOString().split('T')[0], weightKg: 82.5, notes: 'Progressing nicely toward 78kg' }
    ];
    setWeightLogs(weights);
    persist('weights', weights);
  };

  const seedSampleMeasurements = () => {
    const today = new Date();
    const data: BodyMeasurementLog[] = [
      { id: 'm-1', userId: DEMO_PROFILE.userId, date: new Date(today.getTime() - 28 * 86400000).toISOString().split('T')[0], waistCm: 89.5, chestCm: 102.0, armsCm: 35.0, thighsCm: 58.0, hipsCm: 99.0, bodyFatPct: 19.5 },
      { id: 'm-2', userId: DEMO_PROFILE.userId, date: today.toISOString().split('T')[0], waistCm: 86.8, chestCm: 103.5, armsCm: 36.2, thighsCm: 58.5, hipsCm: 97.5, bodyFatPct: 18.2 }
    ];
    setBodyMeasurements(data);
    persist('measurements', data);
  };

  // Profile save — also stamp the userId so data ownership is clear
  const saveProfile = async (newProfile: FitnessProfile) => {
    const stamped = { ...newProfile, userId: uid, id: newProfile.id || uid };
    setProfile(stamped);
    persist('profile', stamped);
  };

  // ------------------------------------------------------------------------------
  // AI PLAN GENERATION (Groq via /api/ai/*; no local or template fallbacks)
  // ------------------------------------------------------------------------------

  const generateNewWorkoutPlan = async (
    options?: Partial<WorkoutGenerationOptions>,
    profileOverride?: FitnessProfile
  ): Promise<boolean> => {
    const sourceProfile = profileOverride ?? profile;
    const resolvedOptions: WorkoutGenerationOptions = { ...defaultWorkoutOptions(sourceProfile), ...options };
    lastWorkoutRequestRef.current = { options, profile: profileOverride };
    setWorkoutGeneration({ status: 'loading' });

    try {
      const data = await postAI<WorkoutApiResponse>('/api/ai/generate-workout', {
        profile: sourceProfile,
        options: resolvedOptions,
      });
      const usedOptions = data.options ?? resolvedOptions;

      const newPlan: WorkoutPlan = {
        id: `plan_${Date.now()}`,
        userId: uid,
        title: data.plan.title,
        description: data.plan.description,
        goal: sourceProfile.primaryGoal,
        splitType: data.plan.splitType,
        workoutType: usedOptions.workoutType,
        preferredActivities: usedOptions.preferredActivities,
        goalSummary: data.plan.goalSummary,
        coachAdvice: data.plan.coachAdvice,
        daysPerWeek: data.plan.days.filter(d => !d.isRestDay).length,
        durationWeeks: 4,
        aiGenerated: true,
        aiModel: data.meta.model,
        isActive: true,
        generationOptions: usedOptions,
        warnings: data.meta.warnings,
        createdAt: new Date().toISOString(),
        days: data.plan.days.map(d => ({
          id: `day_${d.dayOrder}`,
          dayName: d.dayName,
          dayOrder: d.dayOrder,
          focus: d.focus,
          sessionType: d.sessionType,
          isRestDay: d.isRestDay,
          estimatedDurationMins: d.estimatedDurationMins,
          warmup: d.warmup,
          cooldown: d.cooldown,
          exercises: d.exercises.map((e, eIdx) => ({
            id: `w_ex_${d.dayOrder}_${eIdx}`,
            exerciseId: e.exerciseId,
            exerciseName: e.exerciseName,
            category: e.category,
            targetMuscle: e.targetMuscle,
            equipment: e.equipment,
            sets: e.sets,
            reps: e.reps,
            durationMins: e.durationMins ?? undefined,
            intensity: e.intensity ?? undefined,
            restSeconds: e.restSeconds,
            tempo: e.tempo ?? undefined,
            formNotes: e.formNotes ?? undefined,
            instructions: e.instructions,
            alternatives: e.alternatives,
            videoUrl: e.videoUrl,
          })),
        })),
      };

      const saved = await saveNewPlan(uid, 'workout', newPlan);
      setWorkoutPlan(saved.plan);
      persist('workout_plan', saved.plan);
      setWorkoutPlanHistory(prev => [saved.plan, ...prev.map(p => ({ ...p, isActive: false }))].slice(0, 20));
      setWorkoutGeneration({
        status: 'success',
        warnings: data.meta.warnings,
        storageNote: saved.error ? `Saved on this device only — Supabase error: ${saved.error}` : undefined,
      });
      return true;
    } catch (err) {
      const { message, retryable, details } = describeError(err);
      setWorkoutGeneration({ status: 'error', error: message, retryable, details });
      return false;
    }
  };

  const generateNewDietPlan = async (
    options?: Partial<DietGenerationOptions>,
    profileOverride?: FitnessProfile
  ): Promise<boolean> => {
    const sourceProfile = profileOverride ?? profile;
    const resolvedOptions: DietGenerationOptions = { ...defaultDietOptions(sourceProfile), ...options };
    lastDietRequestRef.current = { options, profile: profileOverride };
    setDietGeneration({ status: 'loading' });

    try {
      const data = await postAI<DietApiResponse>('/api/ai/generate-diet', {
        profile: sourceProfile,
        options: resolvedOptions,
      });
      const usedOptions = data.options ?? resolvedOptions;

      const newDiet: MealPlan = {
        id: `diet_${Date.now()}`,
        userId: uid,
        title: data.plan.title,
        targetCalories: data.plan.targetCalories,
        targetProteinG: data.plan.targetProteinG,
        targetCarbsG: data.plan.targetCarbsG,
        targetFatG: data.plan.targetFatG,
        targetFiberG: 30,
        dietType: sourceProfile.dietType,
        cuisine: usedOptions.cuisines.join(', '),
        cuisineNotes: data.plan.cuisineNotes,
        hydrationAdvice: data.plan.hydrationAdvice,
        aiGenerated: true,
        aiModel: data.meta.model,
        isActive: true,
        generationOptions: usedOptions,
        warnings: data.meta.warnings,
        createdAt: new Date().toISOString(),
        days: data.plan.days.map(d => ({
          id: `mday_${d.dayOrder}`,
          dayName: d.dayName,
          dayOrder: d.dayOrder,
          theme: d.theme ?? undefined,
          totals: d.totals,
          meals: d.meals.map((m, mIdx) => ({
            id: `meal_${d.dayOrder}_${mIdx + 1}`,
            mealType: m.mealType,
            title: m.title,
            portionDescription: m.portionDescription,
            calories: Math.round(m.calories),
            proteinG: round1(m.proteinG),
            carbsG: round1(m.carbsG),
            fatG: round1(m.fatG),
            fiberG: round1(m.fiberG),
            ingredients: m.ingredients,
            prepNotes: m.prepNotes ?? undefined,
            alternatives: m.alternatives.map(a => ({
              title: a.title,
              portion: a.portion,
              calories: Math.round(a.calories),
              proteinG: round1(a.proteinG),
              carbsG: round1(a.carbsG),
              fatG: round1(a.fatG),
              notes: a.notes ?? undefined,
            })),
          })),
        })),
      };

      const saved = await saveNewPlan(uid, 'meal', newDiet);
      setMealPlan(saved.plan);
      persist('meal_plan', saved.plan);
      setMealPlanHistory(prev => [saved.plan, ...prev.map(p => ({ ...p, isActive: false }))].slice(0, 20));
      setDietGeneration({
        status: 'success',
        warnings: data.meta.warnings,
        storageNote: saved.error ? `Saved on this device only — Supabase error: ${saved.error}` : undefined,
      });
      return true;
    } catch (err) {
      const { message, retryable, details } = describeError(err);
      setDietGeneration({ status: 'error', error: message, retryable, details });
      return false;
    }
  };

  const retryWorkoutGeneration = () => {
    const last = lastWorkoutRequestRef.current;
    return generateNewWorkoutPlan(last?.options, last?.profile);
  };

  const retryDietGeneration = () => {
    const last = lastDietRequestRef.current;
    return generateNewDietPlan(last?.options, last?.profile);
  };

  const dismissGenerationState = (kind: PlanKind) => {
    if (kind === 'workout') setWorkoutGeneration(IDLE);
    else setDietGeneration(IDLE);
  };

  const activateHistoricalPlan = async (kind: PlanKind, planId: string) => {
    if (kind === 'workout') {
      const target = workoutPlanHistory.find(p => p.id === planId);
      if (!target) return;
      const active = { ...target, isActive: true };
      setWorkoutPlan(active);
      persist('workout_plan', active);
      setWorkoutPlanHistory(prev => prev.map(p => ({ ...p, isActive: p.id === planId })));
    } else {
      const target = mealPlanHistory.find(p => p.id === planId);
      if (!target) return;
      const active = { ...target, isActive: true };
      setMealPlan(active);
      persist('meal_plan', active);
      setMealPlanHistory(prev => prev.map(p => ({ ...p, isActive: p.id === planId })));
    }
    const { error } = await activatePlan(uid, kind, planId);
    if (error) setHistoryError(`Could not update the active plan in Supabase: ${error}`);
  };

  const deleteHistoricalPlan = async (kind: PlanKind, planId: string) => {
    if (kind === 'workout') {
      setWorkoutPlanHistory(prev => prev.filter(p => p.id !== planId));
      if (workoutPlan?.id === planId) {
        setWorkoutPlan(null);
        localStorage.removeItem(key('workout_plan'));
      }
    } else {
      setMealPlanHistory(prev => prev.filter(p => p.id !== planId));
      if (mealPlan?.id === planId) {
        setMealPlan(null);
        localStorage.removeItem(key('meal_plan'));
      }
    }
    const { error } = await deletePlan(uid, kind, planId);
    if (error) setHistoryError(`Could not delete the plan from Supabase: ${error}`);
  };

  // Start interactive workout
  const startWorkout = (dayId: string): WorkoutSession => {
    const targetDay = workoutPlan?.days.find(d => d.id === dayId) || workoutPlan?.days.find(d => !d.isRestDay);
    const newSession: WorkoutSession = {
      id: `sess_${Date.now()}`,
      userId: profile.userId,
      workoutPlanId: workoutPlan?.id,
      workoutDayId: targetDay?.id,
      title: targetDay?.focus || 'Workout Session',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      caloriesBurned: 0,
      completionPercentage: 0,
      exercises: (targetDay?.exercises || []).map(ex => {
        const timed = isTimedCategory(ex.category, ex.durationMins);
        // Timed blocks (runs, sport sessions) track minutes per set instead of reps × load.
        const target = timed
          ? Math.max(1, Math.round((ex.durationMins || parseInt(ex.reps) || 10) / Math.max(1, ex.sets)))
          : parseInt(ex.reps) || 10;
        const loaded = !timed && ex.category !== 'mobility' && !ex.equipment.toLowerCase().includes('bodyweight');
        return {
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          category: ex.category,
          targetMuscle: ex.targetMuscle,
          equipment: ex.equipment,
          durationMins: ex.durationMins,
          restSeconds: ex.restSeconds,
          formNotes: ex.formNotes,
          instructions: ex.instructions,
          alternatives: ex.alternatives,
          videoUrl: ex.videoUrl,
          sets: Array.from({ length: ex.sets }).map((_, idx) => ({
            setNumber: idx + 1,
            targetReps: target,
            completedReps: target,
            weightKg: loaded ? 15 : 0,
            completed: false,
            rpe: 7
          }))
        };
      })
    };

    setActiveSession(newSession);
    return newSession;
  };

  const updateActiveSession = (updater: (prev: WorkoutSession) => WorkoutSession) => {
    setActiveSession(prev => {
      if (!prev) return null;
      return updater(prev);
    });
  };

  const finishActiveWorkout = async (feedback: {
    rpe: number;
    energy: number;
    soreness: number;
    painReported: boolean;
    painNotes?: string;
    notes?: string;
  }) => {
    if (!activeSession) return;

    const completedSession: WorkoutSession = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      rpeScore: feedback.rpe,
      energyLevel: feedback.energy,
      muscleSoreness: feedback.soreness,
      painReported: feedback.painReported,
      painNotes: feedback.painNotes,
      notes: feedback.notes,
      completionPercentage: 100,
    };

    // Calculate volume & calories
    let vol = 0;
    completedSession.exercises.forEach(ex => {
      ex.sets.forEach(st => {
        if (st.completed) {
          vol += (st.weightKg || 0) * st.completedReps;
        }
      });
    });
    completedSession.totalVolumeKg = Math.round(vol);
    completedSession.caloriesBurned = Math.max(120, Math.round((completedSession.durationSeconds / 60) * 8.5));

    const updated = [completedSession, ...workoutSessions];
    setWorkoutSessions(updated);
    persist('sessions', updated);
    setActiveSession(null);

    // Gamification check
    const updatedBadges = [...badges];
    if (updated.length >= 1) {
      const b0 = updatedBadges.find(b => b.key === 'first_workout');
      if (b0 && !b0.isUnlocked) {
        b0.isUnlocked = true;
        b0.unlockedAt = new Date().toISOString();
      }
    }
    setBadges(updatedBadges);
  };

  const cancelActiveWorkout = () => {
    setActiveSession(null);
  };

  // Nutrition logging
  const logMeal = (mealData: Omit<MealLog, 'id' | 'userId' | 'loggedAt'>) => {
    const newEntry: MealLog = {
      id: `mlog_${Date.now()}`,
      userId: profile.userId,
      loggedAt: new Date().toISOString(),
      ...mealData
    };
    const updated = [newEntry, ...mealLogs];
    setMealLogs(updated);
    persist('meal_logs', updated);
  };

  const deleteMealLog = (id: string) => {
    const updated = mealLogs.filter(m => m.id !== id);
    setMealLogs(updated);
    persist('meal_logs', updated);
  };

  const logWater = (amountMl: number) => {
    const nextVal = Math.max(0, waterLoggedMl + amountMl);
    setWaterLoggedMl(nextVal);
    persist('water', nextVal);
  };

  const logWeight = (weightKg: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const filtered = weightLogs.filter(w => w.date !== today);
    const newEntry: WeightLog = { id: `w_${Date.now()}`, userId: uid, date: today, weightKg, notes };
    const updated = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    setWeightLogs(updated);
    persist('weights', updated);

    // Update profile current weight
    const updatedProf = { ...profile, weightKg };
    setProfile(updatedProf);
    persist('profile', updatedProf);
  };

  const logBodyMeasurement = (data: Omit<BodyMeasurementLog, 'id' | 'userId' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: BodyMeasurementLog = { id: `m_${Date.now()}`, userId: uid, date: today, ...data };
    const updated = [...bodyMeasurements, newEntry];
    setBodyMeasurements(updated);
    persist('measurements', updated);
  };

  // Chat with AI Coach
  const requestCoachReply = async (history: AIMessage[], userText: string) => {
    setChatError(null);
    try {
      const data = await postAI<{ reply: string }>('/api/ai/chat', {
        profile,
        recentSessions: workoutSessions.slice(0, 3),
        // The server appends userMessage itself, so send the history before it.
        chatHistory: history.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        userMessage: userText
      });
      const assistantMsg: AIMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      };
      const finalHistory = [...history, assistantMsg];
      setChatMessages(finalHistory);
      persist('chat', finalHistory);
    } catch (err) {
      setChatError(describeError(err).message);
      persist('chat', history);
    }
  };

  const sendChatMessage = async (userText: string) => {
    const userMsg: AIMessage = { id: `msg_${Date.now()}`, role: 'user', content: userText, timestamp: new Date().toISOString() };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    await requestCoachReply(newHistory, userText);
  };

  const retryLastChatMessage = async () => {
    const last = chatMessages[chatMessages.length - 1];
    if (!last || last.role !== 'user') return;
    await requestCoachReply(chatMessages, last.content);
  };

  // Replace a meal with one of its AI-suggested alternatives
  const replaceMealWithAlternative = (mealId: string, altIndex: number) => {
    if (!mealPlan) return;

    const swapIn = (meals: MealItem[]): MealItem[] | null => {
      const targetMeal = meals.find(m => m.id === mealId);
      if (!targetMeal || !targetMeal.alternatives[altIndex]) return null;

      const alt = targetMeal.alternatives[altIndex];
      const previousMealAsAlt = {
        title: targetMeal.title,
        portion: targetMeal.portionDescription,
        calories: targetMeal.calories,
        proteinG: targetMeal.proteinG,
        carbsG: targetMeal.carbsG,
        fatG: targetMeal.fatG,
        notes: 'Previous selection'
      };

      const updatedAlternatives = [...targetMeal.alternatives];
      updatedAlternatives.splice(altIndex, 1, previousMealAsAlt);

      return meals.map(m => m.id === mealId
        ? {
            ...m,
            title: alt.title,
            portionDescription: alt.portion,
            calories: alt.calories,
            proteinG: alt.proteinG,
            carbsG: alt.carbsG,
            fatG: alt.fatG,
            // Alternatives don't carry fibre / ingredients; avoid showing stale values.
            fiberG: 0,
            ingredients: [],
            prepNotes: alt.notes,
            alternatives: updatedAlternatives
          }
        : m);
    };

    let updatedPlan: MealPlan | null = null;
    if (mealPlan.days?.length) {
      let changed = false;
      const days = mealPlan.days.map(day => {
        const meals = swapIn(day.meals);
        if (!meals) return day;
        changed = true;
        return { ...day, meals, totals: computeMealDayTotals(meals) };
      });
      if (changed) updatedPlan = { ...mealPlan, days };
    } else if (mealPlan.meals) {
      const meals = swapIn(mealPlan.meals);
      if (meals) updatedPlan = { ...mealPlan, meals };
    }
    if (!updatedPlan) return;

    const finalPlan = updatedPlan;
    setMealPlan(finalPlan);
    persist('meal_plan', finalPlan);
    setMealPlanHistory(prev => prev.map(p => (p.id === finalPlan.id ? finalPlan : p)));
    updatePlan(uid, 'meal', finalPlan).then(({ error }) => {
      if (error) setHistoryError(`Could not save the meal swap to Supabase: ${error}`);
    });
  };
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetToDemo = () => {
    // Only clear keys belonging to current user (plans saved in Supabase are kept)
    Object.keys(localStorage)
      .filter(k => k.startsWith(`aurafit_${uid}_`))
      .forEach(k => localStorage.removeItem(k));
    clearLocalPlanHistory(uid);
    setProfile(uid === 'demo' ? DEMO_PROFILE : { ...DEMO_PROFILE, id: uid, userId: uid, name: '', email: '' });
    setWorkoutPlan(null);
    setMealPlan(null);
    if (uid === 'demo') {
      setWorkoutPlanHistory([]);
      setMealPlanHistory([]);
    }
    setWorkoutGeneration(IDLE);
    setDietGeneration(IDLE);
    setChatError(null);
    if (uid === 'demo') {
      seedSampleSessions();
      seedSampleMeals();
      seedSampleWeights();
      seedSampleMeasurements();
    } else {
      setWorkoutSessions([]);
      setMealLogs([]);
      setWeightLogs([]);
      setBodyMeasurements([]);
    }
    setBadges(uid === 'demo' ? INITIAL_BADGES : INITIAL_BADGES.map(b => ({ ...b, isUnlocked: false, unlockedAt: undefined })));
    setNotifications(INITIAL_NOTIFICATIONS);
    setWaterLoggedMl(uid === 'demo' ? 1500 : 0);
  };

  return (
    <FitnessStoreContext.Provider
      value={{
        profile,
        workoutPlan,
        workoutPlanHistory,
        workoutSessions,
        activeSession,
        mealPlan,
        mealPlanHistory,
        mealLogs,
        waterLoggedMl,
        weightLogs,
        bodyMeasurements,
        chatMessages,
        chatError,
        badges,
        notifications,
        weeklyReview,
        isLoadingAI,
        isHistoryLoading,
        historyError,
        workoutGeneration,
        dietGeneration,
        saveProfile,
        generateNewWorkoutPlan,
        generateNewDietPlan,
        retryWorkoutGeneration,
        retryDietGeneration,
        dismissGenerationState,
        activateHistoricalPlan,
        deleteHistoricalPlan,
        startWorkout,
        updateActiveSession,
        finishActiveWorkout,
        cancelActiveWorkout,
        logMeal,
        deleteMealLog,
        logWater,
        logWeight,
        logBodyMeasurement,
        sendChatMessage,
        retryLastChatMessage,
        replaceMealWithAlternative,
        markNotificationRead,
        clearAllNotifications,
        resetToDemo,
      }}
    >
      {children}
    </FitnessStoreContext.Provider>
  );
}

export function useFitnessStore() {
  const context = useContext(FitnessStoreContext);
  if (!context) {
    throw new Error('useFitnessStore must be used within a FitnessStoreProvider');
  }
  return context;
}
