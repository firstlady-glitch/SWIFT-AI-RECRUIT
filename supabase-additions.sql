-- ================================================================
-- Additional Tables for SwiftAI Recruit Complete Features
-- Run this after the main supabase.sql file
-- ================================================================

-- =============================================
-- 1. Conversations Table (for Chat/Messaging)
-- =============================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_ids uuid[] not null,
  job_id uuid references public.jobs(id),
  last_message_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- 2. Messages Table
-- =============================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- 3. Team Members Table
-- =============================================
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid references public.profiles(id),
  invite_email text,
  invite_token text unique,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(organization_id, profile_id)
);

-- =============================================
-- 4. Notifications Table
-- =============================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text,
  link text,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- 5. Recruiter Submissions Table
-- =============================================
create table if not exists public.recruiter_submissions (
  id uuid default uuid_generate_v4() primary key,
  recruiter_id uuid references public.profiles(id) not null,
  job_id uuid references public.jobs(id) not null,
  candidate_id uuid references public.profiles(id) not null,
  notes text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  commission_amount integer, -- in cents
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(recruiter_id, job_id, candidate_id)
);

-- =============================================
-- 6. Stripe Customer Mapping
-- =============================================
create table if not exists public.stripe_customers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) unique,
  organization_id uuid references public.organizations(id) unique,
  stripe_customer_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- Enable RLS on New Tables
-- =============================================
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.team_members enable row level security;
alter table public.notifications enable row level security;
alter table public.recruiter_submissions enable row level security;
alter table public.stripe_customers enable row level security;

-- =============================================
-- RLS Policies: Conversations
-- =============================================
create policy "Users can view their conversations"
  on public.conversations for select
  using (auth.uid() = any(participant_ids));

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = any(participant_ids));

-- =============================================
-- RLS Policies: Messages
-- =============================================
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and auth.uid() = any(conversations.participant_ids)
    )
  );

-- =============================================
-- RLS Policies: Team Members
-- =============================================
create policy "Team members can view their team"
  on public.team_members for select
  using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
      and tm.profile_id = auth.uid()
    )
  );

create policy "Org admins can manage team"
  on public.team_members for all
  using (
    exists (
      select 1 from public.team_members tm
      where tm.organization_id = team_members.organization_id
      and tm.profile_id = auth.uid()
      and tm.role in ('owner', 'admin')
    )
  );

-- =============================================
-- RLS Policies: Notifications
-- =============================================
create policy "Users can view their notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- =============================================
-- RLS Policies: Recruiter Submissions
-- =============================================
create policy "Recruiters can view their submissions"
  on public.recruiter_submissions for select
  using (recruiter_id = auth.uid());

create policy "Employers can view submissions for their jobs"
  on public.recruiter_submissions for select
  using (
    exists (
      select 1 from public.jobs
      join public.profiles on profiles.organization_id = jobs.organization_id
      where jobs.id = recruiter_submissions.job_id
      and profiles.id = auth.uid()
    )
  );

create policy "Recruiters can create submissions"
  on public.recruiter_submissions for insert
  with check (recruiter_id = auth.uid());

-- =============================================
-- RLS Policies: Stripe Customers
-- =============================================
create policy "Users can view their stripe customer"
  on public.stripe_customers for select
  using (
    profile_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = stripe_customers.organization_id
    )
  );

-- =============================================
-- Indexes for Performance
-- =============================================
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read_at is null;
create index if not exists idx_team_members_org on public.team_members(organization_id);
create index if not exists idx_recruiter_submissions_job on public.recruiter_submissions(job_id);

-- =============================================
-- Admin Role Policy
-- =============================================
-- Allow admins to bypass RLS (add after enabling admin role)
create policy "Admins have full access to profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins have full access to organizations"
  on public.organizations for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins have full access to jobs"
  on public.jobs for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins have full access to applications"
  on public.applications for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
