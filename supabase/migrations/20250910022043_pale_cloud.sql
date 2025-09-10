/*
  # Multi-School Support Migration

  1. New Tables
    - `schools` - Store school information with unique names
    - `user_profiles` - Link auth users to specific schools
  
  2. Schema Updates
    - Add `school_id` to `parents`, `students`, and `parent_student` tables
    - Add foreign key constraints to maintain data integrity
  
  3. Security
    - Enable RLS on all tables
    - Add policies to ensure users only access their school's data
    - Allow all users to read school names for display purposes
*/

-- 1. Create schools table
create table if not exists public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- 2. Create user_profiles table (link auth.users → school)
create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null unique,
  school_id uuid references public.schools(id) not null,
  created_at timestamptz default now()
);

-- 3. Add school_id to parents
alter table public.parents
add column if not exists school_id uuid references public.schools(id);

-- 4. Add school_id to students
alter table public.students
add column if not exists school_id uuid references public.schools(id);

-- 5. Add school_id to parent_student
alter table public.parent_student
add column if not exists school_id uuid references public.schools(id);

-- 6. Enable RLS (Row Level Security)
alter table public.parents enable row level security;
alter table public.students enable row level security;
alter table public.parent_student enable row level security;
alter table public.schools enable row level security;
alter table public.user_profiles enable row level security;

-- 7. RLS Policies

-- Parents
create policy "Parents are school-specific"
on public.parents
for select using (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

create policy "Insert parents for own school"
on public.parents
for insert with check (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

-- Students
create policy "Students are school-specific"
on public.students
for select using (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

create policy "Insert students for own school"
on public.students
for insert with check (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

-- Parent_Student
create policy "Parent_student is school-specific"
on public.parent_student
for select using (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

create policy "Insert parent_student for own school"
on public.parent_student
for insert with check (
  school_id = (
    select school_id from public.user_profiles
    where user_id = auth.uid()
  )
);

-- Schools (everyone can read names)
create policy "All users can read school names"
on public.schools
for select using (true);

-- Only admins (optional) can insert/update/delete schools
-- For now, allow all authenticated users
create policy "Authenticated users can manage schools"
on public.schools
for all using (auth.role() = 'authenticated');

-- User profiles
create policy "Users can read their own profile"
on public.user_profiles
for select using (user_id = auth.uid());

create policy "Users can insert their own profile"
on public.user_profiles
for insert with check (user_id = auth.uid());

-- Insert a default school for testing
insert into public.schools (name) values ('Demo School') on conflict (name) do nothing;