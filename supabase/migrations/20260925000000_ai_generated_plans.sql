-- ==============================================================================
-- AI-GENERATED PLAN PERSISTENCE
-- Stores the complete, schema-validated AI plan as JSONB so users can browse
-- their plan history, re-activate an older plan, and regenerate with the same
-- settings. Existing RLS policies on workout_plans / meal_plans
-- ("auth.uid() = user_id") already cover these columns.
-- Safe to run multiple times.
-- ==============================================================================

-- Workout plans ---------------------------------------------------------------
ALTER TABLE public.workout_plans
    ADD COLUMN IF NOT EXISTS workout_type TEXT DEFAULT 'mixed',
    ADD COLUMN IF NOT EXISTS preferred_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS generation_options JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS plan_data JSONB;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'workout_plans_workout_type_check'
    ) THEN
        ALTER TABLE public.workout_plans
            ADD CONSTRAINT workout_plans_workout_type_check
            CHECK (workout_type IN ('strength', 'cardio', 'sports', 'hiit', 'mobility', 'mixed'));
    END IF;
END $$;

-- Meal plans ------------------------------------------------------------------
ALTER TABLE public.meal_plans
    ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT 7,
    ADD COLUMN IF NOT EXISTS ai_model TEXT,
    ADD COLUMN IF NOT EXISTS generation_options JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS plan_data JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Exercise categories for sports & cardio in the media reference library -------
ALTER TABLE public.exercise_library DROP CONSTRAINT IF EXISTS exercise_library_category_check;
ALTER TABLE public.exercise_library
    ADD CONSTRAINT exercise_library_category_check
    CHECK (category IN ('Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio', 'Mobility', 'Stretching', 'Strength', 'Sports', 'HIIT'));

-- History lookups ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_created ON public.workout_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_created ON public.meal_plans(user_id, created_at DESC);
