// SwiftAI Recruit - Centralized TypeScript Types

// ============ ENUMS ============

export type UserRole = 'admin' | 'employer' | 'recruiter' | 'applicant';
export type OrgType = 'employer' | 'recruiter';
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'career_plus' | 'growth' | 'scale' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

// ============ CORE ENTITIES ============

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    plan: SubscriptionPlan;
    phone: string | null;
    location: string | null;
    profile_image_url: string | null;
    linkedin_url: string | null;
    website: string | null;
    job_title: string | null;
    experience_years: number | null;
    skills: string[] | null;
    resume_url: string | null;
    organization_id: string | null;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Organization {
    id: string;
    name: string;
    type: OrgType;
    plan: SubscriptionPlan;
    industry: string | null;
    size: string | null;
    description: string | null;
    website: string | null;
    phone: string | null;
    location: string | null;
    logo_url: string | null;
    departments: string[] | null;
    specializations: string[] | null;
    years_in_business: number | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Job {
    id: string;
    organization_id: string;
    posted_by: string;
    title: string;
    description: string;
    requirements: string[] | null;
    salary_range_min: number | null;
    salary_range_max: number | null;
    currency: string;
    location: string | null;
    type: string | null;
    status: JobStatus;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    organization?: Organization;
}

export interface Application {
    id: string;
    job_id: string;
    applicant_id: string;
    status: ApplicationStatus;
    cover_letter: string | null;
    resume_version_url: string | null;
    score: number | null;
    match_reasons: string[] | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    job?: Job;
    applicant?: Profile;
}

// ============ INTERVIEWS ============

export interface Interview {
    id: string;
    application_id: string;
    order_index: number;
    organizer_id: string;
    interviewer_id: string | null;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string | null;
    location: string | null;
    status: InterviewStatus;
    recording_url: string | null;
    transcript_url: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    application?: Application;
    organizer?: Profile;
    interviewer?: Profile;
}

export interface InterviewFeedback {
    id: string;
    interview_id: string;
    reviewer_id: string;
    recommendation: 'hire' | 'strong_hire' | 'no_hire' | 'mixed';
    overall_rating: number;
    pros: string[] | null;
    cons: string[] | null;
    notes: string | null;
    scorecard_metrics: Record<string, number> | null;
    created_at: string;
}

// ============ TEAM ============

export interface TeamMember {
    id: string;
    organization_id: string;
    profile_id: string;
    role: TeamRole;
    invited_by: string | null;
    invite_email: string | null;
    invite_token: string | null;
    accepted_at: string | null;
    created_at: string;
    // Joined fields
    profile?: Profile;
}

// ============ MESSAGING ============

export interface Conversation {
    id: string;
    participant_ids: string[];
    job_id: string | null;
    last_message_at: string | null;
    created_at: string;
    // Joined fields
    participants?: Profile[];
    last_message?: Message;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read_at: string | null;
    created_at: string;
    // Joined fields
    sender?: Profile;
}

// ============ NOTIFICATIONS ============

export type NotificationType =
    | 'application_received'
    | 'application_status_changed'
    | 'interview_scheduled'
    | 'interview_reminder'
    | 'message_received'
    | 'team_invite'
    | 'payment_succeeded'
    | 'payment_failed';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string;
}

// ============ BILLING ============

export interface Billing {
    id: string;
    organization_id: string | null;
    profile_id: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    plan_type: SubscriptionPlan | null;
    interval: BillingInterval | null;
    invoice_url: string | null;
    payment_method_brand: string | null;
    payment_method_last4: string | null;
    billing_period_start: string | null;
    billing_period_end: string | null;
    created_at: string;
}

// ============ RECRUITER MARKETPLACE ============

export interface RecruiterSubmission {
    id: string;
    recruiter_id: string;
    job_id: string;
    candidate_id: string;
    notes: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    commission_amount: number | null;
    created_at: string;
    // Joined fields
    recruiter?: Profile;
    job?: Job;
    candidate?: Profile;
}

// ============ PIPELINE EVENTS ============

export interface PipelineEvent {
    id: string;
    application_id: string;
    actor_id: string | null;
    event_category: string;
    event_type: string;
    previous_status: ApplicationStatus | null;
    new_status: ApplicationStatus | null;
    payload: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
