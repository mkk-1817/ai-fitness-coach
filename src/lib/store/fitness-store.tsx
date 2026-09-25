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
  WeeklyReview
} from '@/types/fitness';
import { EXERCISE_LIBRARY_DATA } from '../data/exercise-data';
import { FOOD_DATABASE } from '../data/food-data';
import { computeAllMetrics } from '../utils/calculations';

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
  workoutSessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  mealPlan: MealPlan | null;
  mealLogs: MealLog[];
  waterLoggedMl: number;
  weightLogs: WeightLog[];
  bodyMeasurements: BodyMeasurementLog[];
  chatMessages: AIMessage[];
  badges: GamificationBadge[];
  notifications: NotificationItem[];
  weeklyReview: WeeklyReview | null;
  isLoadingAI: boolean;
  saveProfile: (newProfile: FitnessProfile) => Promise<void>;
  generateNewWorkoutPlan: () => Promise<void>;
  generateNewDietPlan: () => Promise<void>;
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
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [waterLoggedMl, setWaterLoggedMl] = useState<number>(1500);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementLog[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [badges, setBadges] = useState<GamificationBadge[]>(INITIAL_BADGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

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

      const storedPlan = localStorage.getItem(key('workout_plan'));
      if (storedPlan) {
        setWorkoutPlan(JSON.parse(storedPlan));
      } else {
        createDefaultPlan(baseProfile);
      }

      const storedDiet = localStorage.getItem(key('meal_plan'));
      if (storedDiet) {
        setMealPlan(JSON.parse(storedDiet));
      } else {
        createDefaultDiet(baseProfile);
      }

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
              ? `Hello Alex! 👋 I am your AuraFit AI Coach. I've analyzed your profile and crafted your 4-day Upper/Lower split and high-protein South Indian nutrition targets (${DEMO_PROFILE.targetCalories} kcal, ${DEMO_PROFILE.targetProteinG}g protein). What questions or adjustments do you have today?`
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

  const createDefaultPlan = (p: FitnessProfile) => {
    const newPlan: WorkoutPlan = {
      id: 'plan_default',
      userId: p.userId,
      title: 'AuraFit 4-Week Hypertrophy & Strength Split',
      description: 'Progressive overload training tailored to home dumbbells and bodyweight with rest intervals for recovery.',
      goal: p.primaryGoal,
      splitType: 'Upper / Lower Split',
      daysPerWeek: p.workoutDaysPerWeek,
      durationWeeks: 4,
      aiGenerated: true,
      aiModel: 'llama-3.3-70b-versatile',
      isActive: true,
      createdAt: new Date().toISOString(),
      days: [
        {
          id: 'day-1',
          dayName: 'Day 1 (Monday)',
          dayOrder: 1,
          focus: 'Upper Body Strength & Posture',
          isRestDay: false,
          estimatedDurationMins: p.workoutDurationMins,
          warmup: ['Arm circles 30s', 'Band pull-aparts 15 reps', 'Push-up plus 10 reps'],
          cooldown: ['Doorway chest stretch (60s)', 'Child pose breathing (1 min)'],
          exercises: [
            {
              id: 'w-ex-1',
              exerciseId: 'ex-db-bench-press',
              exerciseName: 'Dumbbell Bench Press',
              targetMuscle: 'Pectorals',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '8-10',
              restSeconds: 90,
              formNotes: 'Keep elbows tucked at 45 degrees, squeeze chest at top.',
              alternatives: ['Standard Push-Up', 'Dumbbell Floor Press'],
              videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94'
            },
            {
              id: 'w-ex-2',
              exerciseId: 'ex-db-row',
              exerciseName: 'Dumbbell Bent-Over Row',
              targetMuscle: 'Latissimus Dorsi',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '10-12',
              restSeconds: 75,
              formNotes: 'Drive elbows back towards hip pockets, squeeze shoulder blades.',
              alternatives: ['Single-Arm Dumbbell Row'],
              videoUrl: 'https://www.youtube.com/watch?v=6TSP13BylM0'
            },
            {
              id: 'w-ex-3',
              exerciseId: 'ex-overhead-press',
              exerciseName: 'Dumbbell Overhead Shoulder Press',
              targetMuscle: 'Anterior Deltoids',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '10-12',
              restSeconds: 60,
              formNotes: 'Keep core braced, avoid arching lower back.',
              alternatives: ['Lateral Dumbbell Raise'],
              videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog'
            },
            {
              id: 'w-ex-4',
              exerciseId: 'ex-bicep-curl',
              exerciseName: 'Dumbbell Bicep Curl',
              targetMuscle: 'Biceps Brachii',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '12',
              restSeconds: 45,
              formNotes: 'Pin elbows to sides, supinate wrist at peak.',
              alternatives: ['Hammer Curls'],
              videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
            }
          ]
        },
        {
          id: 'day-2',
          dayName: 'Day 2 (Tuesday)',
          dayOrder: 2,
          focus: 'Lower Body Power & Core Stability',
          isRestDay: false,
          estimatedDurationMins: p.workoutDurationMins,
          warmup: ['Leg swings (15/side)', 'Glute bridge activation (15 reps)', 'Bodyweight air squats (15 reps)'],
          cooldown: ['Couch stretch for hips (1 min/side)', 'Hamstring stretch (1 min)'],
          exercises: [
            {
              id: 'w-ex-5',
              exerciseId: 'ex-goblet-squat',
              exerciseName: 'Goblet Squat',
              targetMuscle: 'Quadriceps',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '10-12',
              restSeconds: 90,
              formNotes: 'Chest proud, knees tracking gently outward over toes.',
              alternatives: ['Bulgarian Split Squat', 'Bodyweight Squats'],
              videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4'
            },
            {
              id: 'w-ex-6',
              exerciseId: 'ex-rdl',
              exerciseName: 'Romanian Deadlift (RDL)',
              targetMuscle: 'Hamstrings',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '10-12',
              restSeconds: 75,
              formNotes: 'Push hips backward into a wall, keeping spine locked in neutral.',
              alternatives: ['Single Leg Glute Bridge'],
              videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM'
            },
            {
              id: 'w-ex-7',
              exerciseId: 'ex-plank',
              exerciseName: 'Forearm Plank',
              targetMuscle: 'Rectus Abdominis',
              equipment: 'Bodyweight',
              sets: 3,
              reps: '60s hold',
              restSeconds: 45,
              formNotes: 'Engage glutes and actively drag elbows towards toes.',
              alternatives: ['Deadbug', 'Side Plank'],
              videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
            }
          ]
        },
        {
          id: 'day-3',
          dayName: 'Day 3 (Wednesday)',
          dayOrder: 3,
          focus: 'Active Recovery & Mobility',
          isRestDay: true,
          estimatedDurationMins: 20,
          warmup: ['20-30 min brisk outdoor walking'],
          cooldown: ['Gentle spinal cat-cow and hip openers'],
          exercises: []
        },
        {
          id: 'day-4',
          dayName: 'Day 4 (Thursday)',
          dayOrder: 4,
          focus: 'Upper Body Hypertrophy & Pull Focus',
          isRestDay: false,
          estimatedDurationMins: p.workoutDurationMins,
          warmup: ['Band pull aparts (20 reps)', 'Arm rotations'],
          cooldown: ['Lats doorway stretch'],
          exercises: [
            {
              id: 'w-ex-8',
              exerciseId: 'ex-pull-up',
              exerciseName: 'Pull-Up',
              targetMuscle: 'Latissimus Dorsi',
              equipment: 'Pull-up Bar',
              sets: 3,
              reps: '6-8',
              restSeconds: 90,
              formNotes: 'Drive elbows down to waist, full extension at bottom.',
              alternatives: ['Dumbbell Bent-Over Row'],
              videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g'
            },
            {
              id: 'w-ex-9',
              exerciseId: 'ex-push-up',
              exerciseName: 'Standard Push-Up',
              targetMuscle: 'Pectorals',
              equipment: 'Bodyweight',
              sets: 3,
              reps: '12-15',
              restSeconds: 60,
              formNotes: 'Rigid body line, elbows 45 degrees.',
              alternatives: ['Incline Push-ups'],
              videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
            },
            {
              id: 'w-ex-10',
              exerciseId: 'ex-tricep-extension',
              exerciseName: 'Overhead Tricep Extension',
              targetMuscle: 'Triceps',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '12-15',
              restSeconds: 45,
              formNotes: 'Keep elbows tucked, isolate triceps.',
              alternatives: ['Bench Dips'],
              videoUrl: 'https://www.youtube.com/watch?v=-Vyt2QdsR7E'
            }
          ]
        },
        {
          id: 'day-5',
          dayName: 'Day 5 (Friday)',
          dayOrder: 5,
          focus: 'Unilateral Legs & Core Finisher',
          isRestDay: false,
          estimatedDurationMins: p.workoutDurationMins,
          warmup: ['Hip openers and glute bridges'],
          cooldown: ['Quad and hamstring stretches'],
          exercises: [
            {
              id: 'w-ex-11',
              exerciseId: 'ex-bulgarian-split-squat',
              exerciseName: 'Bulgarian Split Squat',
              targetMuscle: 'Quadriceps',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '10 per leg',
              restSeconds: 75,
              formNotes: 'Load 85% of weight on front foot, torso tall.',
              alternatives: ['Walking Lunges'],
              videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE'
            },
            {
              id: 'w-ex-12',
              exerciseId: 'ex-lateral-raise',
              exerciseName: 'Lateral Dumbbell Raise',
              targetMuscle: 'Lateral Deltoids',
              equipment: 'Dumbbells',
              sets: 3,
              reps: '12-15',
              restSeconds: 45,
              formNotes: 'Lead with elbows, strict controlled tempo.',
              alternatives: ['Resistance Band Lateral Raise'],
              videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo'
            }
          ]
        }
      ]
    };
    setWorkoutPlan(newPlan);
    persist('aurafit_workout_plan', newPlan);
  };

  const createDefaultDiet = (p: FitnessProfile) => {
    const newDiet: MealPlan = {
      id: 'diet_default',
      userId: p.userId,
      title: 'South Indian High-Protein Recomposition Plan',
      targetCalories: p.targetCalories,
      targetProteinG: p.targetProteinG,
      targetCarbsG: p.targetCarbsG,
      targetFatG: p.targetFatG,
      targetFiberG: 28,
      dietType: p.dietType,
      cuisine: 'South Indian & Tamil',
      aiGenerated: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      meals: [
        {
          id: 'meal-1',
          mealType: 'breakfast',
          title: 'Idli with Sambar & Boiled Eggs',
          portionDescription: '3 steamed idlis + 1 bowl mixed vegetable sambar + 2 whole boiled eggs',
          calories: 414,
          proteinG: 22.1,
          carbsG: 52.8,
          fatG: 12.6,
          fiberG: 5.5,
          alternatives: [
            {
              title: 'Egg Dosa with Mint Chutney',
              portion: '2 medium dosas with 2 eggs cooked on top',
              calories: 430,
              proteinG: 24.0,
              carbsG: 48.0,
              fatG: 14.0,
              notes: 'Crispy and rich in high-bioavailability protein'
            },
            {
              title: 'Vegetable Oats Upma with Paneer',
              portion: '1 bowl oats upma with 80g fresh paneer cubes',
              calories: 395,
              proteinG: 21.0,
              carbsG: 45.0,
              fatG: 13.5,
              notes: 'Slow-burning low GI carbohydrates'
            }
          ]
        },
        {
          id: 'meal-2',
          mealType: 'lunch',
          title: 'Pepper Chicken Breast with Steamed Rice & Dal',
          portionDescription: '160g chicken breast in mild Tamil pepper curry, 1 cup cooked rice, 1 bowl dal',
          calories: 540,
          proteinG: 43.5,
          carbsG: 58.0,
          fatG: 10.5,
          fiberG: 5.0,
          alternatives: [
            {
              title: 'Meen (Fish) Curry with Boiled Red Rice',
              portion: '160g sea bass or rohu fillet curry + 1 cup rice',
              calories: 490,
              proteinG: 38.0,
              carbsG: 54.0,
              fatG: 9.0,
              notes: 'Rich in EPA/DHA Omega-3 for joint health'
            },
            {
              title: 'Paneer Tikka with Curd Rice & Cucumber',
              portion: '150g grilled paneer + 1 bowl thayir sadam',
              calories: 520,
              proteinG: 26.0,
              carbsG: 48.0,
              fatG: 24.0,
              notes: 'Probiotic support for digestive gut flora'
            }
          ]
        },
        {
          id: 'meal-3',
          mealType: 'evening_snack',
          title: 'Chana Sundal & Green Tea',
          portionDescription: '1 cup boiled chickpea sundal with mustard seeds & fresh coconut (150g)',
          calories: 220,
          proteinG: 11.5,
          carbsG: 34.0,
          fatG: 4.2,
          fiberG: 8.5,
          alternatives: [
            {
              title: 'Whey Protein Shake with 15 Almonds',
              portion: '1 scoop whey in cold water + 15 raw almonds',
              calories: 235,
              proteinG: 28.0,
              carbsG: 6.0,
              fatG: 9.5,
              notes: 'Fast-digesting post-training nourishment'
            }
          ]
        },
        {
          id: 'meal-4',
          mealType: 'dinner',
          title: 'Whole Wheat Phulkas with Dal Tadka & Curd',
          portionDescription: '2 soft phulkas, 1 large bowl yellow moong dal, 1 cup probiotic curd',
          calories: 420,
          proteinG: 20.0,
          carbsG: 62.0,
          fatG: 8.5,
          fiberG: 8.0,
          alternatives: [
            {
              title: 'Grilled Herb Chicken Salad with Lemon Dressing',
              portion: '150g sliced chicken breast over greens & tomatoes',
              calories: 360,
              proteinG: 38.0,
              carbsG: 12.0,
              fatG: 8.0,
              notes: 'Light evening meal for deep uninterrupted sleep'
            }
          ]
        }
      ]
    };
    setMealPlan(newDiet);
    persist('aurafit_meal_plan', newDiet);
  };

  // Profile save — also stamp the userId so data ownership is clear
  const saveProfile = async (newProfile: FitnessProfile) => {
    const stamped = { ...newProfile, userId: uid, id: newProfile.id || uid };
    setProfile(stamped);
    persist('profile', stamped);
  };

  // AI Workout Generation
  const generateNewWorkoutPlan = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      
      const newPlan: WorkoutPlan = {
        id: `plan_${Date.now()}`,
        userId: profile.userId,
        title: data.plan.title,
        description: data.plan.description,
        goal: profile.primaryGoal,
        splitType: data.plan.splitType,
        daysPerWeek: profile.workoutDaysPerWeek,
        durationWeeks: 4,
        aiGenerated: true,
        aiModel: 'llama-3.3-70b-versatile',
        isActive: true,
        createdAt: new Date().toISOString(),
        days: data.plan.days.map((d: any, idx: number) => ({
          id: `day_${idx + 1}`,
          dayName: d.dayName,
          dayOrder: d.dayOrder || idx + 1,
          focus: d.focus,
          isRestDay: Boolean(d.isRestDay),
          estimatedDurationMins: d.estimatedDurationMins || profile.workoutDurationMins,
          warmup: d.warmup || [],
          cooldown: d.cooldown || [],
          exercises: (d.exercises || []).map((e: any, eIdx: number) => ({
            id: `w_ex_${idx}_${eIdx}`,
            exerciseName: e.exerciseName,
            targetMuscle: e.targetMuscle,
            equipment: e.equipment,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            tempo: e.tempo,
            formNotes: e.formNotes,
            alternatives: e.alternatives || [],
            videoUrl: e.videoUrl || 'https://www.youtube.com/watch?v=MeIiIdhvXT4'
          }))
        }))
      };

      setWorkoutPlan(newPlan);
      persist('workout_plan', newPlan);
    } catch (err) {
      console.warn('API route call error, falling back to instant local generation:', err);
      createDefaultPlan(profile);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI Diet Generation
  const generateNewDietPlan = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();

      const newDiet: MealPlan = {
        id: `diet_${Date.now()}`,
        userId: profile.userId,
        title: data.plan.title,
        targetCalories: data.plan.targetCalories,
        targetProteinG: data.plan.targetProteinG,
        targetCarbsG: data.plan.targetCarbsG,
        targetFatG: data.plan.targetFatG,
        targetFiberG: data.plan.targetFiberG || 30,
        dietType: profile.dietType,
        cuisine: profile.cuisinePreferences.join(', '),
        aiGenerated: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        meals: data.plan.meals.map((m: any, mIdx: number) => ({
          id: `meal_${mIdx + 1}`,
          mealType: m.mealType,
          title: m.title,
          portionDescription: m.portionDescription,
          calories: m.calories,
          proteinG: m.proteinG,
          carbsG: m.carbsG,
          fatG: m.fatG,
          fiberG: m.fiberG || 0,
          alternatives: m.alternatives || []
        }))
      };

      setMealPlan(newDiet);
      persist('meal_plan', newDiet);
    } catch (err) {
      console.warn('Diet API error, fallback:', err);
      createDefaultDiet(profile);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Start interactive workout
  const startWorkout = (dayId: string): WorkoutSession => {
    const targetDay = workoutPlan?.days.find(d => d.id === dayId) || workoutPlan?.days[0];
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
      exercises: (targetDay?.exercises || []).map(ex => ({
        exerciseName: ex.exerciseName,
        sets: Array.from({ length: ex.sets }).map((_, idx) => ({
          setNumber: idx + 1,
          targetReps: parseInt(ex.reps) || 10,
          completedReps: parseInt(ex.reps) || 10,
          weightKg: ex.equipment.toLowerCase().includes('bodyweight') ? 0 : 15,
          completed: false,
          rpe: 7
        }))
      }))
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
  const sendChatMessage = async (userText: string) => {
    const userMsg: AIMessage = { id: `msg_${Date.now()}`, role: 'user', content: userText, timestamp: new Date().toISOString() };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          recentSessions: workoutSessions.slice(0, 3),
          chatHistory: newHistory,
          userMessage: userText
        })
      });

      if (!res.ok) throw new Error('Chat API failed');
      const data = await res.json();
      const assistantMsg: AIMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      };
      const finalHistory = [...newHistory, assistantMsg];
      setChatMessages(finalHistory);
      persist('chat', finalHistory);
    } catch {
      // Deterministic fallback response if offline
      const reply = `I'm analyzing your request regarding "${userText}"! As your coach, I recommend focusing on consistent execution, matching your daily protein intake (${profile.targetProteinG}g), and taking adequate rest between your ${profile.workoutDaysPerWeek} planned workout days.`;
      const fallbackMsg: AIMessage = { id: `msg_asst_${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date().toISOString() };
      const finalHistory = [...newHistory, fallbackMsg];
      setChatMessages(finalHistory);
      persist('chat', finalHistory);
    }
  };

  // Replace a meal with one of its smart alternatives
  const replaceMealWithAlternative = (mealId: string, altIndex: number) => {
    if (!mealPlan) return;
    const targetMeal = mealPlan.meals.find(m => m.id === mealId);
    if (!targetMeal || !targetMeal.alternatives[altIndex]) return;

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

    const updatedMeals = mealPlan.meals.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          title: alt.title,
          portionDescription: alt.portion,
          calories: alt.calories,
          proteinG: alt.proteinG,
          carbsG: alt.carbsG,
          fatG: alt.fatG,
          alternatives: updatedAlternatives
        };
      }
      return m;
    });

    const updatedPlan = { ...mealPlan, meals: updatedMeals };
    setMealPlan(updatedPlan);
    persist('meal_plan', updatedPlan);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetToDemo = () => {
    // Only clear keys belonging to current user
    Object.keys(localStorage)
      .filter(k => k.startsWith(`aurafit_${uid}_`))
      .forEach(k => localStorage.removeItem(k));
    lastUidRef.current = null; // force re-init
    setProfile(uid === 'demo' ? DEMO_PROFILE : { ...DEMO_PROFILE, id: uid, userId: uid, name: '', email: '' });
    createDefaultPlan(DEMO_PROFILE);
    createDefaultDiet(DEMO_PROFILE);
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
        workoutSessions,
        activeSession,
        mealPlan,
        mealLogs,
        waterLoggedMl,
        weightLogs,
        bodyMeasurements,
        chatMessages,
        badges,
        notifications,
        weeklyReview,
        isLoadingAI,
        saveProfile,
        generateNewWorkoutPlan,
        generateNewDietPlan,
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
