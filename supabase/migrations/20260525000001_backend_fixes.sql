-- =====================================================================
-- My_Fix Database Schema Migration — v1.1 Backend Fixes
-- Target Database: PostgreSQL (Supabase Managed)
-- =====================================================================

-- 1. Add email column to profiles if it doesn't already exist
alter table public.profiles add column if not exists email text unique;

-- 2. Make phone_number column nullable to prevent crashes in email/OAuth signup flows
alter table public.profiles alter column phone_number drop not null;

-- 3. Update the handle_new_user trigger function to populate both email and phone_number
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, phone_number, email, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        new.phone, -- Maps directly to the phone number from auth.users (can be null)
        new.email, -- Maps directly to the email from auth.users (can be null)
        (coalesce(new.raw_user_meta_data->>'role', 'client'))::public.user_role
    );
    
    -- If the user is registering as an artisan, automatically create their artisan profile entry
    if coalesce(new.raw_user_meta_data->>'role', 'client') = 'artisan' then
        insert into public.artisans (id, trade_category, service_areas)
        values (
            new.id,
            array[]::text[], -- Empty array to start
            array[]::text[]  -- Empty array to start
        );
    end if;
    
    return new;
end;
$$ language plpgsql security definer;

-- 4. Create PostGIS Proximity Search Function to support client-side map searches
create or replace function public.get_nearby_artisans(
    lat double precision,
    lng double precision,
    max_distance_meters double precision,
    trade_filter text default null
)
returns table (
    id uuid,
    full_name text,
    avatar_url text,
    phone_number text,
    email text,
    trade_category text[],
    badge public.verification_badge,
    nin_verified boolean,
    bvn_verified boolean,
    background_checked boolean,
    base_callout_fee numeric,
    service_areas text[],
    location_coords geography(Point, 4326),
    about_text text,
    portfolio_urls text[],
    rating_avg numeric,
    jobs_completed integer,
    distance_meters double precision
) as $$
begin
    return query
    select 
        a.id,
        p.full_name,
        p.avatar_url,
        p.phone_number,
        p.email,
        a.trade_category,
        a.badge,
        a.nin_verified,
        a.bvn_verified,
        a.background_checked,
        a.base_callout_fee,
        a.service_areas,
        a.location_coords,
        a.about_text,
        a.portfolio_urls,
        a.rating_avg,
        a.jobs_completed,
        st_distance(a.location_coords, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
    from public.artisans a
    join public.profiles p on a.id = p.id
    where 
        (trade_filter is null or trade_filter = any(a.trade_category))
        and st_dwithin(a.location_coords, st_setsrid(st_makepoint(lng, lat), 4326)::geography, max_distance_meters)
    order by distance_meters asc;
end;
$$ language plpgsql security definer;
