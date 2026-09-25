'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Dumbbell, 
  Utensils, 
  ShieldCheck, 
  Heart, 
  Target, 
  Calendar,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  FitnessProfile, 
  Gender, 
  ActivityLevel, 
  FitnessGoalType, 
  ExperienceLevel, 
  DietType,
  WorkoutDuration,
  PreferredTime,
  TrainingLocation 
} from '@/types/fitness';
import { computeAllMetrics, getBMICategory } from '@/lib/utils/calculations';

export function OnboardingWizard() {
  const router = useRouter();
  const { profile, saveProfile, generateNewWorkoutPlan, generateNewDietPlan, isLoadingAI } = useFitnessStore();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // Determine if this is a new user (no saved name means first-time setup)
  const isNewUser = !profile.name || profile.name === '';

  // Default name: saved profile → auth metadata → email prefix → empty
  const defaultName = profile.name
    || (user?.user_metadata?.full_name as string)
    || user?.email?.split('@')[0]
    || '';

  // Form State initialized from current profile
  const [name, setName] = useState(isNewUser ? defaultName : profile.name);
  const [age, setAge] = useState(isNewUser ? 25 : profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [heightCm, setHeightCm] = useState(isNewUser ? 170 : profile.heightCm);
  const [weightKg, setWeightKg] = useState(isNewUser ? 70 : profile.weightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(isNewUser ? 65 : profile.targetWeightKg);
  const [country, setCountry] = useState(profile.country || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderately_active');

  // Goals
  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoalType>(profile.primaryGoal || 'muscle_gain');
  const [secondaryGoal, setSecondaryGoal] = useState<FitnessGoalType>(profile.secondaryGoal || 'strength');

  // Experience
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel || 'intermediate');
  const [trainingYears, setTrainingYears] = useState(profile.trainingYears || 2);

  // Equipment
  const [equipmentList, setEquipmentList] = useState<string[]>(
    isNewUser ? ['Bodyweight'] : (profile.availableEquipment || ['Bodyweight'])
  );
  const [otherEquipment, setOtherEquipment] = useState('');

  // Schedule
  const [daysPerWeek, setDaysPerWeek] = useState(profile.workoutDaysPerWeek || 4);
  const [durationMins, setDurationMins] = useState<WorkoutDuration>(profile.workoutDurationMins || 45);
  const [preferredTime, setPreferredTime] = useState<PreferredTime>(profile.preferredWorkoutTime || 'morning');
  const [trainingLocation, setTrainingLocation] = useState<TrainingLocation>(profile.trainingLocation || 'home');

  // Health Safety
  const [injuries, setInjuries] = useState<string[]>(profile.injuries || []);
  const [avoidExercises, setAvoidExercises] = useState<string[]>(profile.avoidExercises || []);
  const [injuryInput, setInjuryInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');

  // Nutrition & Culture
  const [dietType, setDietType] = useState<DietType>(profile.dietType || 'non_vegetarian');
  const [cuisines, setCuisines] = useState<string[]>(profile.cuisinePreferences || ['South Indian', 'Tamil']);
  const [foodsLiked, setFoodsLiked] = useState<string[]>(profile.foodsLiked || ['Idli', 'Chicken', 'Eggs', 'Sambar']);
  const [foodsAvoided, setFoodsAvoided] = useState<string[]>(profile.foodsAvoided || []);
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [mealsPerDay, setMealsPerDay] = useState(profile.mealsPerDay || 4);

  // Live computed metrics
  const liveMetrics = computeAllMetrics(
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    primaryGoal,
    targetWeightKg
  );
  const bmiInfo = getBMICategory(liveMetrics.bmi);

  const toggleEquipment = (eq: string) => {
    setEquipmentList(prev => 
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const toggleCuisine = (c: string) => {
    setCuisines(prev => 
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const handleFinalSubmit = async () => {
    const finalProfile: FitnessProfile = {
      ...profile,
      name,
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      country,
      activityLevel,
      primaryGoal,
      secondaryGoal,
      experienceLevel,
      trainingYears,
      workoutDaysPerWeek: daysPerWeek,
      workoutDurationMins: durationMins,
      preferredWorkoutTime: preferredTime,
      trainingLocation,
      availableEquipment: otherEquipment.trim() ? [...equipmentList, otherEquipment.trim()] : equipmentList,
      injuries,
      avoidExercises,
      dietType,
      cuisinePreferences: cuisines,
      foodsLiked,
      foodsAvoided,
      allergies,
      mealsPerDay,
      waterTargetMl: Math.round(weightKg * 38),
      bmi: liveMetrics.bmi,
      bmr: liveMetrics.bmr,
      tdee: liveMetrics.tdee,
      targetCalories: liveMetrics.targetCalories,
      targetProteinG: liveMetrics.targetProteinG,
      targetCarbsG: liveMetrics.targetCarbsG,
      targetFatG: liveMetrics.targetFatG,
      updatedAt: new Date().toISOString(),
    };

    await saveProfile(finalProfile);
    await Promise.all([
      generateNewWorkoutPlan(),
      generateNewDietPlan(),
    ]);

    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* PROGRESS TRACKER */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Step {step} of 8</span>
          <span className="text-emerald-400 font-extrabold">{Math.round((step / 8) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-9 shadow-2xl backdrop-blur-md">
        {/* ========================================================================= */}
        {/* STEP 1: BASIC INFORMATION & BIOMETRICS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 — Biometric Foundation</span>
              <h2 className="text-2xl font-black text-white mt-1">Tell us about your body metrics</h2>
              <p className="text-xs text-slate-400 mt-1">These numbers calculate your baseline BMR, TDEE, and optimal energy expenditure.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Country / Region</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                  placeholder="e.g. India, USA"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 75)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 70)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                >
                  <option value="sedentary">Sedentary (Desk job, little movement)</option>
                  <option value="lightly_active">Lightly Active (1-3 days light exercise)</option>
                  <option value="moderately_active">Moderately Active (3-5 days moderate exercise)</option>
                  <option value="very_active">Very Active (6-7 days hard training)</option>
                  <option value="extremely_active">Extremely Active (Athletic physical labor)</option>
                </select>
              </div>
            </div>

            {/* LIVE ESTIMATES BANNER */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">BMI</span>
                <p className="text-lg font-black text-white">{liveMetrics.bmi}</p>
                <span className={`text-[10px] font-bold ${bmiInfo.color}`}>{bmiInfo.label}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">BMR</span>
                <p className="text-lg font-black text-white">{liveMetrics.bmr} <span className="text-[10px] text-slate-500">kcal</span></p>
                <span className="text-[10px] text-slate-500">Basal metabolic rate</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Est. TDEE</span>
                <p className="text-lg font-black text-white">{liveMetrics.tdee} <span className="text-[10px] text-slate-500">kcal</span></p>
                <span className="text-[10px] text-slate-500">Maintenance energy</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold">Target Range</span>
                <p className="text-lg font-black text-emerald-400">{liveMetrics.targetCalories} <span className="text-[10px] text-emerald-600">kcal</span></p>
                <span className="text-[10px] text-slate-500">Estimated calorie goal</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic text-center">
              Note: Biometric calculations are scientific estimates derived from the Mifflin-St Jeor equation.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FITNESS GOALS */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 — Fitness Objectives</span>
              <h2 className="text-2xl font-black text-white mt-1">What is your primary fitness goal?</h2>
              <p className="text-xs text-slate-400 mt-1">The AI adapts training splits, intensity, and macro distribution accordingly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'fat_loss', label: 'Fat Loss & Leanness', desc: 'Caloric deficit, high protein retention, conditioning' },
                { id: 'muscle_gain', label: 'Muscle Gain (Hypertrophy)', desc: 'Controlled surplus, volume-focused overload' },
                { id: 'strength', label: 'Pure Strength & Power', desc: 'Heavy compound movements with adequate rest' },
                { id: 'general_fitness', label: 'General Health & Longevity', desc: 'Cardiovascular health, joint mobility, functional vigor' },
                { id: 'endurance', label: 'Endurance & Stamina', desc: 'Lactate threshold, aerobic capacity, muscular endurance' },
                { id: 'body_recomp', label: 'Body Recomposition', desc: 'Simultaneous fat loss and muscle building at maintenance' },
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPrimaryGoal(g.id as FitnessGoalType)}
                  className={`p-4 rounded-2xl text-left border transition ${
                    primaryGoal === g.id
                      ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{g.label}</span>
                    {primaryGoal === g.id && <Check className="h-4 w-4 text-emerald-400" />}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{g.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Secondary Goal (Optional)</label>
              <select
                value={secondaryGoal}
                onChange={(e) => setSecondaryGoal(e.target.value as FitnessGoalType)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
              >
                <option value="strength">Strength</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="general_fitness">General Fitness</option>
                <option value="flexibility">Flexibility & Mobility</option>
              </select>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: EXPERIENCE LEVEL */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3 — Training Background</span>
              <h2 className="text-2xl font-black text-white mt-1">What is your training experience?</h2>
              <p className="text-xs text-slate-400 mt-1">Beginners receive form-first cues and recovery time; advanced users receive progressive overload volume.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'beginner', title: 'Beginner', desc: '0 - 1 year of consistent lifting. Focus on foundational form and neural adaptation.' },
                { id: 'intermediate', title: 'Intermediate', desc: '1 - 3 years of structured lifting. Familiar with main compounds and progressive overload.' },
                { id: 'advanced', title: 'Advanced', desc: '3+ years of rigorous training. High work capacity and specialized periodization.' },
              ].map(exp => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setExperienceLevel(exp.id as ExperienceLevel)}
                  className={`p-4 rounded-2xl text-left border transition ${
                    experienceLevel === exp.id
                      ? 'bg-emerald-500/15 border-emerald-400 text-white'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                    <span>{exp.title}</span>
                    {experienceLevel === exp.id && <Check className="h-4 w-4 text-emerald-400" />}
                  </h3>
                  <p className="text-xs text-slate-400">{exp.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">How many years have you been training?</label>
              <input
                type="number"
                step="0.5"
                value={trainingYears}
                onChange={(e) => setTrainingYears(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: AVAILABLE EQUIPMENT */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 — Equipment Restrictions</span>
              <h2 className="text-2xl font-black text-white mt-1">What equipment do you have access to?</h2>
              <p className="text-xs text-slate-400 mt-1">CRITICAL: The AI will ONLY prescribe movements possible with your selected gear.</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">No Equipment / Calisthenics</h3>
                <div className="flex flex-wrap gap-2">
                  {['Bodyweight', 'Yoga Mat'].map(eq => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        equipmentList.includes(eq)
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Home Workout Gear</h3>
                <div className="flex flex-wrap gap-2">
                  {['Dumbbells', 'Resistance Bands', 'Kettlebell', 'Pull-up Bar', 'Adjustable Bench', 'Treadmill', 'Stationary Bike'].map(eq => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        equipmentList.includes(eq)
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Full Gym Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {['Barbell & Plates', 'Squat Rack / Power Cage', 'Cable Machine', 'Leg Press Machine', 'Lat Pulldown Machine'].map(eq => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        equipmentList.includes(eq)
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Other Equipment (Optional text)</label>
                <input
                  type="text"
                  placeholder="e.g. 20kg weight vest, gymnastics rings"
                  value={otherEquipment}
                  onChange={(e) => setOtherEquipment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: WORKOUT SCHEDULE */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 5 — Availability & Routine</span>
              <h2 className="text-2xl font-black text-white mt-1">When and where will you train?</h2>
              <p className="text-xs text-slate-400 mt-1">We build a realistic split designed to avoid burnout.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Days Per Week: <span className="text-emerald-400 font-extrabold">{daysPerWeek} Days</span></label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysPerWeek(d)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border transition ${
                        daysPerWeek === d
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Session Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationMins(dur as WorkoutDuration)}
                      className={`py-3 text-xs font-bold rounded-xl border transition ${
                        durationMins === dur
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {dur} Mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Preferred Workout Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value as PreferredTime)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                  >
                    <option value="morning">Morning (energizing start)</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening (post-work)</option>
                    <option value="flexible">Flexible / Any</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Primary Location</label>
                  <select
                    value={trainingLocation}
                    onChange={(e) => setTrainingLocation(e.target.value as TrainingLocation)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                  >
                    <option value="home">Home</option>
                    <option value="gym">Commercial Gym</option>
                    <option value="outdoor">Outdoor / Park</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: HEALTH & EXERCISE SAFETY */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 6 — Health & Safety Screener</span>
              <h2 className="text-2xl font-black text-white mt-1">Injuries, Pain & Restrictions</h2>
              <p className="text-xs text-slate-400 mt-1">Our AI will protect your joints by substituting dangerous movements.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed">
                <strong>Medical Notice:</strong> AuraFit is an athletic training companion, not a medical clinic. If you experience chronic chest pain, dizziness, or severe structural injuries, please consult a medical physician before physical exertion.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Existing Injuries or Joint Sensitivities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Mild lower back tightness, right knee sensitivity"
                  value={injuryInput}
                  onChange={(e) => setInjuryInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (injuryInput.trim()) {
                      setInjuries(prev => [...prev, injuryInput.trim()]);
                      setInjuryInput('');
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 text-xs font-bold text-white rounded-xl hover:bg-slate-700"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {injuries.map((inj, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30">
                    {inj}
                    <button type="button" onClick={() => setInjuries(prev => prev.filter((_, i) => i !== idx))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Exercises You Wish to Avoid
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Barbell Deadlift, Overhead Press"
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (avoidInput.trim()) {
                      setAvoidExercises(prev => [...prev, avoidInput.trim()]);
                      setAvoidInput('');
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 text-xs font-bold text-white rounded-xl hover:bg-slate-700"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {avoidExercises.map((ex, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-white/10">
                    {ex}
                    <button type="button" onClick={() => setAvoidExercises(prev => prev.filter((_, i) => i !== idx))}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: DIETARY PROFILE & CUISINE PREFERENCES */}
        {/* ========================================================================= */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 7 — Nutrition & Cultural Diet</span>
              <h2 className="text-2xl font-black text-white mt-1">What are your dietary preferences?</h2>
              <p className="text-xs text-slate-400 mt-1">We specialize in authentic cultural cuisines (Tamil, South Indian, North Indian, Western, Mediterranean).</p>
            </div>

            {/* DIET TYPE */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Dietary Pattern</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                  { id: 'eggetarian', label: 'Eggetarian' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'pescatarian', label: 'Pescatarian' },
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietType(d.id as DietType)}
                    className={`py-3 px-3 text-xs font-bold rounded-xl border transition ${
                      dietType === d.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUISINE PREFERENCES */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Cuisine Preferences</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'South Indian', 
                  'Tamil', 
                  'Kerala', 
                  'Andhra', 
                  'North Indian', 
                  'Western', 
                  'Mediterranean', 
                  'Global Clean'
                ].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      cuisines.includes(c)
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Daily Meals</label>
              <div className="flex gap-2">
                {[3, 4, 5].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setMealsPerDay(cnt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                      mealsPerDay === cnt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-white/10'
                    }`}
                  >
                    {cnt} Meals / Day
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: REVIEW & GENERATE AI PLAN */}
        {/* ========================================================================= */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 mb-3 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Assessment Complete!</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Review your customized profile summary. Click below to generate your tailored AI workout & diet cycles with Groq.
              </p>
            </div>

            {/* SUMMARY TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">User & Goals</span>
                <p className="font-bold text-white mt-1">{name}, {age} yrs</p>
                <p className="text-emerald-400 font-semibold">{primaryGoal.replace('_', ' ')}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Schedule</span>
                <p className="font-bold text-white mt-1">{daysPerWeek} Days / Week</p>
                <p className="text-slate-400">{durationMins} Mins • {trainingLocation}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Equipment ({equipmentList.length})</span>
                <p className="font-bold text-white mt-1 truncate">{equipmentList.slice(0, 2).join(', ')}</p>
                <p className="text-slate-400">Strictly enforced</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Target Calories</span>
                <p className="font-bold text-white mt-1">{liveMetrics.targetCalories} kcal</p>
                <p className="text-rose-400 font-semibold">{liveMetrics.targetProteinG}g protein target</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Diet Pattern</span>
                <p className="font-bold text-white mt-1">{dietType.replace('_', ' ')}</p>
                <p className="text-amber-400">{cuisines.join(', ')}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Safety Screener</span>
                <p className="font-bold text-white mt-1">{injuries.length} injury notes</p>
                <p className="text-emerald-400">Biomechanic safeguards on</p>
              </div>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={isLoadingAI}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              <span>{isLoadingAI ? 'CRAFTING YOUR AI PLANS...' : 'GENERATE MY PERSONALIZED AI PLAN'}</span>
            </button>
          </div>
        )}

        {/* BOTTOM NAV BUTTONS */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 8 && (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
