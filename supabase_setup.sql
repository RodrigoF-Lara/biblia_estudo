-- Execute este SQL no Supabase SQL Editor.
-- Objetivo: criar base de perfil de usuario com RLS e trilha para acesso admin.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  birth_date date,
  phone text,
  address_line text,
  city text,
  state text,
  postal_code text,
  country text default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_marketing_consent (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  accepted_terms_at timestamptz,
  accepted_privacy_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_marketing_consent_updated_at on public.user_marketing_consent;
create trigger trg_user_marketing_consent_updated_at
before update on public.user_marketing_consent
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_marketing_consent (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_marketing_consent enable row level security;
alter table public.admin_users enable row level security;

-- Profiles: usuario ve e atualiza o proprio perfil.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  auth.uid() = id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
)
with check (
  auth.uid() = id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
with check (
  auth.uid() = id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
);

-- Consentimento: usuario ve e atualiza os proprios dados.
drop policy if exists "consent_select_own_or_admin" on public.user_marketing_consent;
create policy "consent_select_own_or_admin"
on public.user_marketing_consent
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "consent_update_own_or_admin" on public.user_marketing_consent;
create policy "consent_update_own_or_admin"
on public.user_marketing_consent
for update
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  )
);

-- Admin users: apenas leitura para o proprio usuario; escrita somente via SQL admin/service role.
drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users
for select
using (auth.uid() = user_id);

comment on table public.admin_users is 'Lista de usuarios administradores. Inserir manualmente no SQL Editor ou backend com service role.';
