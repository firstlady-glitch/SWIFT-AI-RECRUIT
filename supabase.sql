-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum Types
create type user_role as enum ('admin', 'employer', 'recruiter', 'applicant');
create type org_type as enum ('employer', 'recruiter');
create type job_status as enum ('draft', 'published', 'closed', 'archived');
create type application_status as enum ('applied', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected');
create type subscription_plan as enum ('free', 'starter', 'pro', 'career_plus', 'growth', 'scale', 'enterprise');
create type billing_interval as enum ('monthly', 'annual');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- 1. Profiles Table (Extends auth.users)
-- Public profiles trigger handled separately or assumed created via app logic as seen in code
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role user_role default 'applicant'::user_role,
  plan subscription_plan default 'free',
  
  -- Common Details
  phone text,
  location text,
  profile_image_url text,
  linkedin_url text,
  website text,
  
  -- Applicant Specific
  job_title text,
  experience_years integer,
  skills text[], -- Array of strings
  resume_url text,
  
  -- Organization Link (for Recruiters/Employers)
  organization_id uuid, -- FK added after organizations table creation
  
  -- System Flags
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Organizations Table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type org_type not null,
  plan subscription_plan default 'free',
  
  -- Company Details
  industry text,
  size text, -- e.g. "1-10", "11-50"
  description text,
  website text,
  phone text,
  location text,
  logo_url text,
  
  -- Employer Specific
  departments text[],
  
  -- Recruiter Specific
  specializations text[],
  years_in_business integer,
  
  -- Metadata
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Foreign Key to Profiles for Organization
alter table public.profiles 
add constraint fk_organization 
foreign key (organization_id) 
references public.organizations(id);

-- 3. Jobs Table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  posted_by uuid references public.profiles(id) not null,
  
  title text not null,
  description text not null,
  requirements text[],
  salary_range_min integer,
  salary_range_max integer,
  currency text default 'USD',
  location text,
  type text, -- Full-time, Contract, etc.
  status job_status default 'draft'::job_status,
  
  is_public boolean default true,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Applications Table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) not null,
  applicant_id uuid references public.profiles(id) not null,
  
  status application_status default 'applied'::application_status,
  cover_letter text,
  resume_version_url text, -- Snapshot of resume at time of application
  
  score numeric, -- AI Matching Score
  match_reasons text[],
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(job_id, applicant_id)
);

-- 5. Interviews Management (Expert Tracking)
-- Tracks scheduling, outcomes, and AI integration points
create type interview_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) not null,
  order_index integer default 1, -- Round 1, Round 2, etc.
  
  -- Participants
  organizer_id uuid references public.profiles(id) not null,
  interviewer_id uuid references public.profiles(id), -- Primary interviewer
  
  -- Logistics
  scheduled_at timestamp with time zone not null,
  duration_minutes integer default 60,
  meeting_link text,
  location text, -- Physical or Virtual
  
  -- Outcome
  status interview_status default 'scheduled'::interview_status,
  recording_url text, -- Link to AI processed recording
  transcript_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Interview Feedback / Scorecards
-- Detailed ratings and structured data for decision making
create table public.interview_feedback (
  id uuid default uuid_generate_v4() primary key,
  interview_id uuid references public.interviews(id) not null,
  reviewer_id uuid references public.profiles(id) not null,
  
  -- High Level
  recommendation text check (recommendation in ('hire', 'strong_hire', 'no_hire', 'mixed')),
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5),
  
  -- Detailed Feedback
  pros text[],
  cons text[],
  notes text,
  
  -- Dynamic Scorecard (e.g. { "Cultural Fit": 5, "React Skills": 4 })
  scorecard_metrics jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Advanced Pipeline Audit Log (The "Black Box")
-- Records every detailed interaction for provenance and analytics
create table public.pipeline_events (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) not null,
  actor_id uuid references public.profiles(id), -- Nullable for System/AI events
  
  -- Event Classification
  event_category text not null, -- 'stage_change', 'communication', 'interview', 'note', 'system'
  event_type text not null, -- 'moved_to_offer', 'email_opened', 'scorecard_submitted'
  
  -- Data Provenance (For "Time in Stage" analytics)
  previous_status application_status,
  new_status application_status,
  
  -- Rich Context
  payload jsonb, -- Flexible data: { "email_subject": "...", "drift_score": 0.4 }
  
  -- Metadata for Auditing
  ip_address inet,
  user_agent text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Billing Records (Persistence & Record Keeping)
create table public.billings (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id), -- Nullable if user bill
  profile_id uuid references public.profiles(id), -- Nullable if org bill
  
  amount integer not null, -- in cents
  currency text default 'usd',
  status payment_status default 'pending',
  plan_type subscription_plan,
  interval billing_interval,
  
  invoice_url text, -- Link to externally generated invoice (e.g. Stripe PDF)
  payment_method_brand text, -- e.g. "visa"
  payment_method_last4 text,
  
  billing_period_start timestamp with time zone,
  billing_period_end timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for new tables
alter table public.interviews enable row level security;
alter table public.interview_feedback enable row level security;
alter table public.pipeline_events enable row level security;
alter table public.billings enable row level security;

-- Policies for Interviews
create policy "Org members can view interviews"
  on public.interviews for select
  using (
    exists (
      select 1 from public.applications
      join public.jobs on jobs.id = applications.job_id
      join public.profiles on profiles.organization_id = jobs.organization_id
      where applications.id = interviews.application_id
      and profiles.id = auth.uid()
    )
  );
  
-- Policies for Feedback
create policy "Org members can view feedback"
  on public.interview_feedback for select
  using (
    exists (
      select 1 from public.applications
      join public.jobs on jobs.id = applications.job_id
      where applications.id = (select application_id from public.interviews where id = interview_feedback.interview_id)
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.organization_id = jobs.organization_id
      )
    )
  );

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Organizations Policies
create policy "Organizations are viewable by everyone"
  on public.organizations for select
  using ( true );

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check ( auth.role() = 'authenticated' );

create policy "Organization members can update their organization"
  on public.organizations for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = organizations.id
    )
  );

-- Jobs Policies
create policy "Published jobs are viewable by everyone"
  on public.jobs for select
  using ( status = 'published' or auth.uid() = posted_by );

create policy "Organization members can create jobs"
  on public.jobs for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = jobs.organization_id
    )
  );

create policy "Organization members can update their jobs"
  on public.jobs for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = jobs.organization_id
    )
  );

-- Applications Policies
create policy "Applicants can view their own applications"
  on public.applications for select
  using ( applicant_id = auth.uid() );

create policy "Organization members can view applications for their jobs"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs
      join public.profiles on profiles.organization_id = jobs.organization_id
      where jobs.id = applications.job_id
      and profiles.id = auth.uid()
    )
  );

create policy "Applicants can create applications"
  on public.applications for insert
  with check ( applicant_id = auth.uid() );

-- Billing Policies
create policy "Users and Org members can view their own bills"
  on public.billings for select
  using (
    profile_id = auth.uid() or 
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.organization_id = billings.organization_id
    )
  );

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
create trigger update_organizations_updated_at before update on public.organizations for each row execute procedure update_updated_at_column();
create trigger update_jobs_updated_at before update on public.jobs for each row execute procedure update_updated_at_column();
create trigger update_applications_updated_at before update on public.applications for each row execute procedure update_updated_at_column();

-- Storage Buckets (handled via UI usually, but defined here for documentation)
-- buckets: 'resumes', 'profiles', 'company-logos'
