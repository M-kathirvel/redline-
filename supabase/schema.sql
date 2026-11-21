create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Branding', 'Digital Marketing', 'Ads', 'Promotion Shoots', 'Social Media', 'SEO', 'Content')),
  description text not null,
  client_name text,
  media_url text not null,
  video_url text,
  skills_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists video_url text;

create table if not exists public.site_stats (
  id int primary key default 1 check (id = 1),
  completed_projects_count int not null default 50 check (completed_projects_count >= 0),
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, completed_projects_count)
values (1, 150)
on conflict (id) do nothing;

alter table public.projects enable row level security;
alter table public.site_stats enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select to anon, authenticated using (true);

drop policy if exists "Public can read site stats" on public.site_stats;
create policy "Public can read site stats"
  on public.site_stats for select to anon, authenticated using (true);

-- No client-role write policies are created. All writes go through the
-- server-only service role after validating the signed Redline admin cookie.

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio-media');

-- Do not grant storage INSERT/UPDATE/DELETE to anon or authenticated clients.
-- Server API routes use the service-role key only after admin cookie validation.
