-- =====================================================================
-- My_Fix Database Schema Migration — v1.2 Portfolios Bucket
-- Target Database: PostgreSQL (Supabase Managed)
-- =====================================================================

-- Create the portfolios storage bucket
insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
-- Anyone can view portfolio images
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'portfolios' );

-- Artisans can upload their own portfolio images
-- The folder structure should be artisan_id/image_name.ext
create policy "Artisans can upload portfolios"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'portfolios' and
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Artisans can update their own portfolio images
create policy "Artisans can update portfolios"
on storage.objects for update
to authenticated
using (
    bucket_id = 'portfolios' and
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Artisans can delete their own portfolio images
create policy "Artisans can delete portfolios"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'portfolios' and
    (storage.foldername(name))[1] = auth.uid()::text
);
