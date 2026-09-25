-- ============================================================================
-- CREATE PROFILE ROWS FOR AUTH USERS
-- The application tables reference public.profiles(id), so every auth user
-- needs a corresponding profile before plans or fitness data can be saved.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        NEW.raw_user_meta_data ->> 'full_name'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Backfill accounts created before the trigger was installed.
INSERT INTO public.profiles (id, email, full_name)
SELECT
    users.id,
    COALESCE(users.email, ''),
    users.raw_user_meta_data ->> 'full_name'
FROM auth.users AS users
WHERE NOT EXISTS (
    SELECT 1
    FROM public.profiles AS profiles
    WHERE profiles.id = users.id
);