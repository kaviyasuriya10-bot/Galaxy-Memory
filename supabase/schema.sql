create extension if not exists pgcrypto;
create table if not exists public.users (
 id uuid primary key default gen_random_uuid(), name text not null,
 email text not null unique, password_hash text not null, created_at timestamptz not null default now()
);
create table if not exists public.memories (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
 title text not null, description text not null default '', memory_date date,
 tags text[] not null default '{}', image_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists memories_user_id_idx on public.memories(user_id);
alter table public.users enable row level security;
alter table public.memories enable row level security;
