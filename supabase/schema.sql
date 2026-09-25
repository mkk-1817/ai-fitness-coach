-- ==============================================================================
-- AI FITNESS COACH - SUPABASE DATABASE SCHEMA
-- Production-ready PostgreSQL schema with RLS, triggers, indexes, and constraints
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fitness Profiles Table
CREATE TABLE IF NOT EXISTS public.fitness_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    age INT NOT NULL CHECK (age >= 10 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
    height_cm NUMERIC(5,2) NOT NULL CHECK (height_cm > 50 AND height_cm < 300),
    weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 20 AND weight_kg < 500),
    target_weight_kg NUMERIC(5,2) CHECK (target_weight_kg > 20 AND target_weight_kg < 500),
    country TEXT,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    training_years NUMERIC(4,1) DEFAULT 0,
    workout_days_per_week INT NOT NULL CHECK (workout_days_per_week >= 1 AND workout_days_per_week <= 7),
    workout_duration_mins INT NOT NULL CHECK (workout_duration_mins IN (15, 30, 45, 60, 75, 90)),
    preferred_workout_time TEXT DEFAULT 'flexible' CHECK (preferred_workout_time IN ('morning', 'afternoon', 'evening', 'flexible')),
    training_location TEXT DEFAULT 'gym' CHECK (training_location IN ('gym', 'home', 'outdoor', 'mixed')),
    health_conditions TEXT[],
    injuries TEXT[],
    avoid_exercises TEXT[],
    bmi NUMERIC(4,1),
    bmr NUMERIC(6,1),
    tdee NUMERIC(6,1),
    target_calories INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fitness Goals Table
CREATE TABLE IF NOT EXISTS public.fitness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL CHECK (primary_goal IN ('fat_loss', 'muscle_gain', 'strength', 'general_fitness', 'endurance', 'body_recomp', 'flexibility', 'sports_performance')),
    secondary_goal TEXT CHECK (secondary_goal IN ('fat_loss', 'muscle_gain', 'strength', 'general_fitness', 'endurance', 'body_recomp', 'flexibility', 'sports_performance')),
    target_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Equipment Reference Table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('no_equipment', 'home', 'gym', 'cardio', 'accessory')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Available Equipment
CREATE TABLE IF NOT EXISTS public.user_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, equipment_name)
);

-- 6. Dietary Preferences Table
CREATE TABLE IF NOT EXISTS public.dietary_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    diet_type TEXT NOT NULL CHECK (diet_type IN ('vegetarian', 'vegan', 'non_vegetarian', 'eggetarian', 'pescatarian', 'custom')),
    cuisine_preferences TEXT[] DEFAULT ARRAY['South Indian', 'Indian'],
    foods_liked TEXT[],
    foods_avoided TEXT[],
    allergies TEXT[],
    meals_per_day INT DEFAULT 4 CHECK (meals_per_day >= 2 AND meals_per_day <= 6),
    water_target_ml INT DEFAULT 3000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Exercise Library (Public Read-Only for Users, Admin writable)
-- Media reference only: AI plans are not limited to these entries; matching names get verified demo videos.
CREATE TABLE IF NOT EXISTS public.exercise_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio', 'Mobility', 'Stretching', 'Strength', 'Sports', 'HIIT')),
    target_muscle TEXT NOT NULL,
    secondary_muscles TEXT[],
    equipment_required TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    instructions TEXT[] NOT NULL,
    form_tips TEXT[],
    common_mistakes TEXT[],
    beginner_alternative TEXT,
    advanced_alternative TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Workout Plans (AI Generated)
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT NOT NULL,
    split_type TEXT NOT NULL,
    days_per_week INT NOT NULL,
    duration_weeks INT DEFAULT 4,
    ai_generated BOOLEAN DEFAULT TRUE,
    ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',
    workout_type TEXT DEFAULT 'mixed' CHECK (workout_type IN ('strength', 'cardio', 'sports', 'hiit', 'mobility', 'mixed')),
    preferred_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    generation_options JSONB DEFAULT '{}'::jsonb,
    plan_data JSONB, -- full schema-validated AI plan (days, exercises, sports & cardio blocks)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Workout Days
CREATE TABLE IF NOT EXISTS public.workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    day_name TEXT NOT NULL, -- e.g. "Monday", "Day 1"
    day_order INT NOT NULL,
    focus TEXT NOT NULL,    -- e.g. "Chest & Triceps", "Push Day", "Rest / Active Recovery"
    is_rest_day BOOLEAN DEFAULT FALSE,
    estimated_duration_mins INT DEFAULT 45,
    warmup_notes TEXT[],
    cooldown_notes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Workout Exercises (in a Day)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercise_library(id) ON DELETE SET NULL,
    exercise_name TEXT NOT NULL,
    target_muscle TEXT,
    equipment TEXT,
    order_index INT NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10-12',
    rest_seconds INT NOT NULL DEFAULT 60,
    tempo TEXT,
    form_notes TEXT,
    alternatives TEXT[],
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Workout Sessions (Execution Tracking)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    total_volume_kg NUMERIC(8,2) DEFAULT 0,
    calories_burned INT DEFAULT 0,
    completion_percentage INT DEFAULT 100,
    rpe_score INT CHECK (rpe_score >= 1 AND rpe_score <= 10),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5),
    muscle_soreness INT CHECK (muscle_soreness >= 1 AND muscle_soreness <= 5),
    pain_reported BOOLEAN DEFAULT FALSE,
    pain_notes TEXT,
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Exercise Sets Logged
CREATE TABLE IF NOT EXISTS public.exercise_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercise_library(id) ON DELETE SET NULL,
    exercise_name TEXT NOT NULL,
    set_number INT NOT NULL,
    target_reps INT,
    completed_reps INT NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT TRUE,
    rpe INT CHECK (rpe >= 1 AND rpe <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Meal Plans (AI Generated)
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_calories INT NOT NULL,
    target_protein_g INT NOT NULL,
    target_carbs_g INT NOT NULL,
    target_fat_g INT NOT NULL,
    target_fiber_g INT DEFAULT 30,
    diet_type TEXT NOT NULL,
    cuisine TEXT,
    duration_days INT DEFAULT 7,
    ai_generated BOOLEAN DEFAULT TRUE,
    ai_model TEXT,
    generation_options JSONB DEFAULT '{}'::jsonb,
    plan_data JSONB, -- full schema-validated 7-day AI meal plan
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Meals
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner', 'post_workout')),
    title TEXT NOT NULL,
    portion_description TEXT NOT NULL,
    calories INT NOT NULL,
    protein_g NUMERIC(5,1) NOT NULL,
    carbs_g NUMERIC(5,1) NOT NULL,
    fat_g NUMERIC(5,1) NOT NULL,
    fiber_g NUMERIC(5,1) DEFAULT 0,
    alternatives JSONB DEFAULT '[]'::jsonb,
    order_index INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Daily Nutrition Logs
CREATE TABLE IF NOT EXISTS public.meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner', 'post_workout', 'snack')),
    food_name TEXT NOT NULL,
    portion TEXT,
    calories INT NOT NULL,
    protein_g NUMERIC(5,1) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(5,1) NOT NULL DEFAULT 0,
    fat_g NUMERIC(5,1) NOT NULL DEFAULT 0,
    fiber_g NUMERIC(5,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Water Logs
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml INT NOT NULL DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Weight & Body Measurement Logs
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.body_measurement_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    waist_cm NUMERIC(5,1),
    chest_cm NUMERIC(5,1),
    arms_cm NUMERIC(5,1),
    thighs_cm NUMERIC(5,1),
    hips_cm NUMERIC(5,1),
    body_fat_pct NUMERIC(4,1),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AI Conversations & Messages
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Fitness Coach Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Weekly AI Reviews
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    workouts_completed INT NOT NULL,
    workouts_target INT NOT NULL,
    completion_rate INT NOT NULL,
    avg_rpe NUMERIC(3,1),
    weight_start NUMERIC(5,2),
    weight_end NUMERIC(5,2),
    protein_adherence_pct INT,
    ai_insights TEXT[] NOT NULL,
    next_week_recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Gamification Badges & Streaks
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('workout', 'meal', 'water', 'review', 'streak', 'milestone', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_fitness_profiles_user ON public.fitness_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_created ON public.workout_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_created ON public.meal_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_days_plan ON public.workout_days(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_day ON public.workout_exercises(workout_day_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session ON public.exercise_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan ON public.meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Fitness Profiles
CREATE POLICY "Users can view own fitness profile" ON public.fitness_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fitness profile" ON public.fitness_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fitness profile" ON public.fitness_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. Fitness Goals
CREATE POLICY "Users can view own goals" ON public.fitness_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.fitness_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.fitness_goals FOR UPDATE USING (auth.uid() = user_id);

-- 4. Equipment (Public Read)
CREATE POLICY "Anyone can view equipment reference" ON public.equipment FOR SELECT USING (true);

-- 5. User Equipment
CREATE POLICY "Users can view own equipment" ON public.user_equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own equipment" ON public.user_equipment FOR ALL USING (auth.uid() = user_id);

-- 6. Dietary Preferences
CREATE POLICY "Users can view own dietary preferences" ON public.dietary_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dietary preferences" ON public.dietary_preferences FOR ALL USING (auth.uid() = user_id);

-- 7. Exercise Library (Public Read)
CREATE POLICY "Public read on exercise library" ON public.exercise_library FOR SELECT USING (true);

-- 8. Workout Plans
CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout plans" ON public.workout_plans FOR ALL USING (auth.uid() = user_id);

-- 9. Workout Days
CREATE POLICY "Users can view own workout days" ON public.workout_days FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workout_plans wp WHERE wp.id = workout_plan_id AND wp.user_id = auth.uid())
);
CREATE POLICY "Users can manage own workout days" ON public.workout_days FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_plans wp WHERE wp.id = workout_plan_id AND wp.user_id = auth.uid())
);

-- 10. Workout Exercises
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.workout_days wd
        JOIN public.workout_plans wp ON wd.workout_plan_id = wp.id
        WHERE wd.id = workout_day_id AND wp.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.workout_days wd
        JOIN public.workout_plans wp ON wd.workout_plan_id = wp.id
        WHERE wd.id = workout_day_id AND wp.user_id = auth.uid()
    )
);

-- 11. Workout Sessions
CREATE POLICY "Users can manage own sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);

-- 12. Exercise Sets
CREATE POLICY "Users can manage own sets" ON public.exercise_sets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid())
);

-- 13. Meal Plans & Meals
CREATE POLICY "Users can manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meal_plans mp WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid())
);

-- 14. Nutrition & Water Logs
CREATE POLICY "Users can manage own meal logs" ON public.meal_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id);

-- 15. Weight & Measurements
CREATE POLICY "Users can manage own weight logs" ON public.weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own measurement logs" ON public.body_measurement_logs FOR ALL USING (auth.uid() = user_id);

-- 16. AI Conversations & Messages
CREATE POLICY "Users can manage own AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI messages" ON public.ai_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = auth.uid())
);

-- 17. Reviews, Badges, Notifications
CREATE POLICY "Users can manage own weekly reviews" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own badges" ON public.gamification_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
