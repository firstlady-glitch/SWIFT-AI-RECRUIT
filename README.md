# SwiftAI Recruit

**SwiftAI Recruit** is an advanced, proprietary AI-powered recruitment platform designed to revolutionize the hiring process. By leveraging cutting-edge machine learning and natural language processing, we connect job seekers with their ideal roles and help employers build world-class teams with unprecedented speed and accuracy.

---

## 🚀 User Flow

### 👤 Applicant Flow
```
Entry → /app/applicant/jobs (Job Feed)
                ↓
         Browse & Filter Jobs
                ↓
         View Job Details → Apply
                ↓
         /app/applicant/applications (Track Status)
                ↓
         /app/applicant/interviews (Join Interviews)
                ↓
         AI Tools: Resume Parser, Cover Letter, Job Fit, Interview Prep
```
**Primary Goal:** Discover opportunities and apply quickly. Jobs feed is the landing page to maximize applications.

---

### 🏢 Employer Flow
```
Entry → /app/org/employer (Dashboard)
                ↓
         View Metrics & Pipeline Health
                ↓
         /app/org/employer/jobs (Manage Listings)
                ↓
         Create Job → /app/org/employer/jobs/create
                ↓
         ATS Kanban → /app/org/employer/jobs/[id]
                ↓
         Review Candidates, Schedule Interviews, Make Offers
                ↓
         AI Tools: JD Generator, Candidate Ranking, Interview Intelligence
```
**Primary Goal:** Manage hiring pipeline efficiently. Dashboard shows KPIs first for quick decision-making.

---

### 🎯 Recruiter Flow
```
Entry → /app/org/recruiter (Dashboard)
                ↓
         View Performance Metrics & Commissions
                ↓
         /app/org/recruiter/marketplace (Browse Jobs)
                ↓
         /app/org/recruiter/sourcing (Find Candidates)
                ↓
         Submit Candidates to Jobs
                ↓
         /app/org/recruiter/submissions (Track Placements)
                ↓
         AI Tools: Semantic Search, Boolean Builder, Candidate Pitch
```
**Primary Goal:** Source talent, submit to jobs, earn commissions. Metrics dashboard for performance tracking.

---

## 📂 Project Structure

```
swift-ai-recruit/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── ai/generate/        # AI Generation endpoint
│   │   ├── applications/       # Applications CRUD
│   │   ├── chat/               # Chat functionality
│   │   ├── jobs/               # Jobs CRUD + pipeline
│   │   └── profile/update/     # Profile updates
│   │
│   ├── app/                    # Protected Application Routes
│   │   ├── applicant/          # Applicant Dashboard & Pages
│   │   │   ├── jobs/           # Job feed & details
│   │   │   ├── applications/   # Application tracker
│   │   │   ├── interviews/     # Interview hub
│   │   │   └── [dashboard]/    # Dashboard + AI tools
│   │   │
│   │   └── org/                # Organization Routes
│   │       ├── employer/       # Employer Dashboard & Pages
│   │       │   ├── jobs/       # Job management + ATS
│   │       │   └── [dashboard]/# Dashboard + AI tools
│   │       │
│   │       └── recruiter/      # Recruiter Dashboard & Pages
│   │           ├── marketplace/# Job marketplace
│   │           ├── sourcing/   # Candidate search
│   │           ├── submissions/# Submission tracker
│   │           └── [dashboard]/# Dashboard + AI tools
│   │
│   ├── auth/                   # Authentication pages
│   ├── resources/              # AI Tools showcase
│   └── [static pages]/         # About, Features, Pricing, etc.
│
├── components/
│   ├── ui/                     # Reusable UI Components
│   │   ├── DataTable.tsx       # Sortable data tables
│   │   ├── KanbanBoard.tsx     # Drag-drop pipeline board
│   │   ├── Pagination.tsx      # Page navigation
│   │   ├── LoadingState.tsx    # Skeleton loaders
│   │   └── ErrorState.tsx      # Error displays
│   │
│   ├── dashboard/              # Dashboard layout components
│   ├── tools/                  # AI tool wrappers
│   └── [marketing]/            # Landing page components
│
├── hooks/                      # Custom React hooks
│   └── use-pagination.ts       # Pagination state management
│
├── lib/
│   └── supabase/               # Supabase client utilities
│       ├── client.ts           # Browser client
│       └── server.ts           # Server-side client
│
└── proxy.ts                    # Auth middleware (RBAC)
```

---

## 🤖 AI Tools (15 Total)

### Applicant Tools (5)
| Tool | Description |
|------|-------------|
| **Resume Parser** | Extract structured data from resumes |
| **Resume Optimizer** | ATS-friendly resume improvements |
| **Cover Letter Generator** | Personalized cover letters |
| **Job Fit Predictor** | Match score & gap analysis |
| **Interview Prep** | Role-specific question practice |

### Employer Tools (5)
| Tool | Description |
|------|-------------|
| **JD Generator** | AI-powered job descriptions |
| **Candidate Ranking** | AI scoring for applicants |
| **Interview Script** | Structured interview guides |
| **Interview Intelligence** | Transcript analysis & feedback |
| **Offer Letter Generator** | Professional offer drafting |

### Recruiter Tools (5)
| Tool | Description |
|------|-------------|
| **Semantic Search** | Natural language candidate search |
| **Boolean Builder** | Platform-specific search strings |
| **Outreach Email** | Personalized recruitment emails |
| **Candidate Pitch** | Professional candidate presentations |
| **Pipeline Analytics** | Performance insights & predictions |

---

### 🔐 Admin Flow
```
Entry → /admin/login (Secure Admin Auth)
                ↓
         /admin (Dashboard)
                ↓
         Site Settings → Toggle payments, registration, maintenance mode
                ↓
         User Management → View and manage all users
                ↓
         System Health → Monitor platform metrics
```
**Primary Goal:** Control platform-wide settings without code deployments.

---

## Key Features

- **AI-Driven Matching:** Semantic analysis of resumes and job descriptions for precise candidate ranking
- **AI Cover Letter Generation:** Applicants can generate tailored cover letters with strict plain-text formatting
- **AI Applicant Ranking:** Employers/Recruiters can analyze candidates with AI scoring (0-100) and match reasons
- **Smart Auto-Fill:** AI tools automatically populate fields from user profiles and organization data
- **Intelligent Automation:** Automated scheduling, email workflows, and candidate pipeline management
- **ATS Kanban Board:** Visual drag-drop candidate pipeline management
- **Role-Based Access Control:** Secure middleware protecting routes per user role
- **Database-Driven Settings:** Admin control center for payments, registration, and maintenance mode
- **Maintenance Mode:** Site-wide lockdown with custom messages and admin bypass
- **Modern UX:** Responsive interface built with Next.js 16 and Tailwind CSS
- **Real-time Updates:** Supabase backend with live data synchronization

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS, CSS Variables |
| **Icons** | Lucide React |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage |
| **AI/ML** | Google Gemini API |
| **State Management** | React Hooks, Context API |
| **Data Fetching** | Supabase Client SDK |
| **Deployment** | Vercel |
| **Package Manager** | pnpm |

---

## Database Schema

```sql
-- Core Tables
profiles        → User accounts (applicant, employer, recruiter, admin)
organizations   → Companies (employer or recruiter type)
jobs            → Job postings (draft, published, closed, archived)
applications    → Job applications with cover_letter and AI score
interviews      → Interview scheduling & outcomes
interview_feedback → Structured interview ratings
site_settings   → Database-driven platform configuration
```

---

## Proprietary Software Notice

**Copyright © 2024 SwiftAI Recruit. All Rights Reserved.**

This software is **proprietary and confidential**. Unauthorized copying, distribution, modification, reverse engineering, or use of this file, via any medium, is strictly prohibited.

---

## Setup & Development (Authorized Personnel Only)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/swift-ai-recruit/platform.git
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Run development server:**
   ```bash
   pnpm dev
   ```

5. **Build for production:**
   ```bash
   pnpm build
   ```

---

## Contact

- **Legal Team:** legal@swiftairecruit.com
- **Support:** support@swiftairecruit.com
