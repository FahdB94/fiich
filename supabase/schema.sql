-- Schema for Fiich application
-- Run these queries in your Supabase SQL editor to set up the database.

-- Table for companies created by users
create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  siren char(9) not null,
  siret char(14) not null,
  tva_number char(13) not null,
  address_number text,
  address_street text,
  address_postal_code text,
  address_city text,
  address_country text,
  admin_email text,
  phone text,
  payment_terms text,
  kbis_url text,
  rib_url text,
  cgv_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable row-level security on companies to restrict access based on auth.uid(). Without
-- policies, inserts/updates/deletes will be blocked for authenticated users.
alter table public.companies enable row level security;

-- Remove existing policy if it exists then create new one to allow authenticated users to insert a company with their own user_id
drop policy if exists "company_insert_self" on public.companies;
create policy "company_insert_self" on public.companies
  for insert
  with check (auth.uid() = user_id);

-- Drop and recreate policy to allow users to select, update and delete only their own companies
drop policy if exists "company_select_update_delete_self" on public.companies;
create policy "company_select_update_delete_self" on public.companies
  for select, update, delete
  using (auth.uid() = user_id);

-- Share table representing accepted shares of company profiles to users
create table if not exists public.shares (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies (id) on delete cascade,
  recipient_user_id uuid references auth.users (id) on delete cascade,
  accepted boolean default true,
  created_at timestamp with time zone default now()
);

-- Column storing optional fields to share (JSON array of field keys)
alter table public.shares
  add column if not exists shared_fields jsonb;

alter table public.shares enable row level security;

drop policy if exists "shares_select_for_recipient" on public.shares;
create policy "shares_select_for_recipient" on public.shares
  for select
  using (recipient_user_id = auth.uid());

drop policy if exists "shares_insert_by_owner" on public.shares;
create policy "shares_insert_by_owner" on public.shares
  for insert
  with check (true);

-- Invites table representing invitations sent to other companies/users
create table if not exists public.invites (
  id uuid default uuid_generate_v4() primary key,
  inviter_company_id uuid references public.companies (id) on delete cascade,
  inviter_user_id uuid references auth.users (id) on delete cascade,
  invitee_email text not null,
  invitee_user_id uuid references auth.users (id),
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Column storing selected fields to share (JSON array of field keys). If null, all optional fields will be shared.
alter table public.invites
  add column if not exists fields jsonb;

alter table public.invites enable row level security;

-- Inviter must be the owner of the company they are inviting from
drop policy if exists "invites_insert_by_owner" on public.invites;
create policy "invites_insert_by_owner" on public.invites
  for insert
  with check (
    (select user_id from public.companies where id = inviter_company_id) = auth.uid()
  );

drop policy if exists "invites_select_for_user" on public.invites;
create policy "invites_select_for_user" on public.invites
  for select
  using (
    invitee_user_id = auth.uid() or invitee_email = auth.email()
  );

-- Indexes for faster lookups
create index if not exists idx_companies_user on public.companies (user_id);
create index if not exists idx_shares_recipient on public.shares (recipient_user_id);
create index if not exists idx_invites_invitee_user on public.invites (invitee_user_id);
create index if not exists idx_invites_invitee_email on public.invites (invitee_email);