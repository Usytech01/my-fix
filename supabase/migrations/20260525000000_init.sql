-- =====================================================================
-- My_Fix Database Schema Migration — v1.0 Init
-- Target Database: PostgreSQL (Supabase Managed)
-- =====================================================================

-- 1. Enable Required Extensions
create extension if not exists postgis;

-- 2. Define Custom Enums
create type public.user_role as enum ('client', 'artisan', 'admin');
create type public.verification_badge as enum ('bronze', 'silver', 'gold');
create type public.booking_status as enum ('pending', 'accepted', 'rejected', 'paid', 'in_progress', 'completed', 'disputed', 'cancelled');
create type public.escrow_status as enum ('held', 'released', 'disputed', 'refunded');

-- 3. Create Profiles Table (Linked directly to Supabase Auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    avatar_url text,
    phone_number text unique not null,
    role public.user_role default 'client'::public.user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Artisans Table (Contains specialized trade details)
create table public.artisans (
    id uuid references public.profiles(id) on delete cascade primary key,
    trade_category text[] not null, -- e.g. {'Plumber', 'Electrician'}
    badge public.verification_badge default 'bronze'::public.verification_badge not null,
    nin_verified boolean default false not null,
    bvn_verified boolean default false not null,
    background_checked boolean default false not null,
    base_callout_fee numeric(10, 2) default 0.00 not null,
    service_areas text[] not null, -- Lagos LGAs e.g. {'Surulere', 'Ikeja'}
    location_coords geography(Point, 4326), -- Longitude/Latitude PostGIS point
    about_text text,
    portfolio_urls text[], -- Portfolio image URLs
    rating_avg numeric(3, 2) default 5.00 not null,
    jobs_completed integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Bookings Table (Transaction & Escrow State Engine)
create table public.bookings (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.profiles(id) on delete restrict not null,
    artisan_id uuid references public.artisans(id) on delete restrict not null,
    status public.booking_status default 'pending'::public.booking_status not null,
    escrow_status public.escrow_status default 'held'::public.escrow_status not null,
    job_description text not null,
    media_attachments text[], -- Photos uploaded by client showing repair need
    price numeric(10, 2) not null,
    scheduled_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Reviews Table (Multi-dimensional Post-Completion Rating)
create table public.reviews (
    id uuid default gen_random_uuid() primary key,
    booking_id uuid references public.bookings(id) on delete cascade unique not null,
    client_rating_quality integer check (client_rating_quality between 1 and 5),
    client_rating_punctuality integer check (client_rating_punctuality between 1 and 5),
    client_rating_professionalism integer check (client_rating_professionalism between 1 and 5),
    client_rating_value integer check (client_rating_value between 1 and 5),
    client_rating_cleanliness integer check (client_rating_cleanliness between 1 and 5),
    client_comment text,
    artisan_rating_conduct integer check (artisan_rating_conduct between 1 and 5),
    artisan_comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- Automatic Triggers & Functions
-- =====================================================================

-- Trigger function to automatically sync public.profiles with auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, phone_number, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        coalesce(new.phone, new.email), -- OTP verification fallback
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

-- Bind trigger to auth.users table
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Trigger function to auto-update update_at timestamps
create or replace function public.update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_modtime
    before update on public.profiles
    for each row execute procedure public.update_modified_column();

create trigger update_bookings_modtime
    before update on public.bookings
    for each row execute procedure public.update_modified_column();

-- =====================================================================
-- Security Policies & Row Level Security (RLS)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.artisans enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles Security Policies
create policy "Public profiles are viewable by authenticated users." on public.profiles
    for select to authenticated using (true);

create policy "Users can update their own profile." on public.profiles
    for update to authenticated using (auth.uid() = id);

-- Artisans Security Policies
create policy "Artisan listings are viewable by everyone." on public.artisans
    for select to authenticated using (true);

create policy "Artisans can update their own details." on public.artisans
    for update to authenticated using (auth.uid() = id);

-- Bookings Security Policies
create policy "Users can view bookings they participate in." on public.bookings
    for select to authenticated using (
        auth.uid() = client_id or 
        auth.uid() = artisan_id
    );

create policy "Clients can create bookings." on public.bookings
    for insert to authenticated with check (
        auth.uid() = client_id
    );

create policy "Participants can update booking states." on public.bookings
    for update to authenticated using (
        auth.uid() = client_id or 
        auth.uid() = artisan_id
    );

-- Reviews Security Policies
create policy "Reviews are viewable by all authenticated users." on public.reviews
    for select to authenticated using (true);

create policy "Booking participants can submit reviews." on public.reviews
    for insert to authenticated with check (
        exists (
            select 1 from public.bookings 
            where id = booking_id and (client_id = auth.uid() or artisan_id = auth.uid())
        )
    );
