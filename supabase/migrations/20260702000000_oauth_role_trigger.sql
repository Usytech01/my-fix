-- =====================================================================
-- My_Fix Database Schema Migration — v1.3 OAuth Role Trigger
-- Target Database: PostgreSQL (Supabase Managed)
-- =====================================================================

-- Trigger function to automatically create an artisan profile when their role is updated to 'artisan'
CREATE OR REPLACE FUNCTION public.handle_profile_role_update()
RETURNS trigger AS $$
BEGIN
    -- Check if role has changed from 'client' to 'artisan'
    IF OLD.role = 'client' AND NEW.role = 'artisan' THEN
        INSERT INTO public.artisans (id, trade_category, service_areas)
        VALUES (
            NEW.id,
            ARRAY[]::text[], -- Empty array to start
            ARRAY[]::text[]  -- Empty array to start
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to public.profiles table
DROP TRIGGER IF EXISTS on_profile_role_updated ON public.profiles;
CREATE TRIGGER on_profile_role_updated
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_role_update();
