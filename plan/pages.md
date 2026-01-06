Here is the refined plan detailing exactly what happens on **entry (mount)** and the **navigation flow** for each role.

### **1. Applicant Flow**

**Root Path: `/applicant**`

* **On Mount / Entry:** **Redirects immediately to `/applicant/jobs**`.
* *Why?* As you suggested, an applicant's primary goal is discovery. Placing them on the "Job Feed" first maximizes the chance of them applying to a role. The Dashboard is secondary (checking status).


* **Navigation Bar:** Top Navigation (Logo, Jobs, Dashboard, My Applications, Profile).

**Detailed Page Plan:**

* **`/applicant/jobs` (The Landing Page)**
* **Action:** This is the default view. It fetches `published` jobs from the `jobs` table.
* **User Flow:** User scrolls -> filters by location -> clicks "View Details".


* **`/applicant/dashboard`**
* **Action:** User navigates here manually to check status.
* **Content:** High-level summary: "3 Active Applications," "1 Interview Scheduled."


* **`/applicant/applications`**
* **Action:** Detailed list view of the `applications` table.
* **Content:** Status tracking (Applied -> Interview -> Offer).


* **`/applicant/interviews`**
* **Action:** Dedicated view for the `interviews` table.
* **Content:** Upcoming video links and schedules.



---

### **2. Employer Flow**

**Root Path: `/employer**`

* **On Mount / Entry:** **Redirects immediately to `/employer/dashboard**`.
* *Why?* Employers are "Task/Management" users. They log in to check the health of their hiring pipeline ("Do I have new candidates?"). Sending them to the job list first adds friction; they need the high-level metrics first.


* **Navigation Bar:** Side Sidebar (Dashboard, Manage Jobs, Create Job, Organization, Settings).

**Detailed Page Plan:**

* **`/employer/dashboard` (The Landing Page)**
* **Action:** Default view. Aggregates data from `jobs` and `applications`.
* **Content:** Metrics ("5 New Applicants"), Alert Feed ("Interview scheduled with John Doe"), and Pipeline Health.


* **`/employer/jobs`**
* **Action:** User goes here to manage listings.
* **Content:** List of own jobs. Toggles for `status` (Draft/Published).


* **`/employer/jobs/create`**
* **Action:** A dedicated full-page form or modal to insert into the `jobs` table.
* **Content:** Input fields for Title, Salary, Requirements + AI Description Generator.


* **`/employer/jobs/[id]` (The ATS View)**
* **Action:** The deep-dive workspace.
* **Content:** Kanban board of candidates for *one specific job*.



---

### **3. Recruiter Flow**

**Root Path: `/recruiter**`

* **On Mount / Entry:** **Redirects immediately to `/recruiter/dashboard**`.
* *Why?* Recruiters are performance-driven. They need to see their numbers (Commissions/Submissions) immediately to know if they are hitting targets.


* **Navigation Bar:** Side Sidebar (Dashboard, Marketplace, My Candidates, Sourcing).

**Detailed Page Plan:**

* **`/recruiter/dashboard` (The Landing Page)**
* **Action:** Default view.
* **Content:** "Placement Success Rate," "Pending Feedback," and "New Marketplace Jobs" widgets.


* **`/recruiter/marketplace`**
* **Action:** Discovery zone for recruiters.
* **Content:** List of public `jobs` from *other* employers available for sourcing.


* **`/recruiter/sourcing`**
* **Action:** The "Search Engine" mode.
* **Content:** Interface to query the `profiles` table to find candidates to tag.


* **`/recruiter/submissions`**
* **Action:** Management view.
* **Content:** A table of all `applications` where they are the source, tracked across multiple clients.


### Explanations
### **1. Applicant Pages**

**A. `applicant/dashboard` (Home)**
*Upon login, this is the first thing they see.*
This page serves as the central command center for the job seeker, aggregating their most critical status updates into a single view. It queries the `applications` table to display a "Current Status" widget showing counts of jobs in `applied`, `interview`, or `offer` stages, alongside a "Recommended Jobs" section that uses the user's `skills` from the `profiles` table to fetch matching `published` records from the `jobs` table. This immediate visibility reduces anxiety by showing progress at a glance and encourages engagement by suggesting relevant new opportunities without requiring a search.

**B. `applicant/jobs` (Job Feed)**
This is the primary browsing interface where applicants explore opportunities, querying the `jobs` table for records where `status = 'published'`. The page features an advanced filtering sidebar that leverages specific columns like `salary_range_min`, `salary_range_max`, `location`, and `type` (e.g., Remote/Contract), allowing users to narrow down the global list. Each job card displays the `title`, `organization_id` (joined with the `organizations` table to show the company name and logo), and a "Quick Apply" or "View Details" button, acting as the entry point for the application funnel.

**C. `applicant/jobs/[id]` (Job Details)**
When a user clicks a job, they land here to view the full `description`, `requirements`, and `benefits` stored in the `jobs` table. This page is critical for conversion; it checks the `applications` table to see if the `auth.uid()` has already applied (disabling the button if so) or presents an "Apply Now" modal. The modal allows the user to review their current `resume_url` from their `profile`, optionally write a `cover_letter`, and submit, which triggers the database insert into `applications` and kicks off the AI scoring function.

**D. `applicant/applications` (My Applications)**
This page replaces the traditional email black hole by providing a transparent, tabular view of every record in the `applications` table linked to the user. It organizes applications by `status` (e.g., `reviewed`, `shortlisted`, `rejected`) and includes a "Timeline" view pulling data from `pipeline_events` to show when their application was last touched. This transparency builds trust and allows applicants to withdraw applications or follow up on those that have been stagnant in the `applied` stage for too long.

**E. `applicant/interviews` (Interview Hub)**
This dedicated space manages the `interviews` table, listing all upcoming meetings where the `status` is `scheduled`. It displays the `scheduled_at` time, `duration_minutes`, and the `meeting_link` (e.g., Zoom/Meet). After an interview occurs, this page can update to show the `status` as `completed`, and if you decide to share feedback with candidates, it could display a sanitized summary. This ensures the applicant never misses a meeting and has a centralized place to find joining instructions.

---

### **2. Employer Pages**

**A. `employer/dashboard` (Home)**
*Upon login, this is the first thing they see.*
This high-level operational view summarizes the health of the company's hiring pipeline by aggregating data from the `jobs` and `applications` tables. It displays metrics such as "Total Active Jobs," "New Applicants (Unreviewed)," and "Upcoming Interviews" for the current week. The page also features a "Recent Activity" feed powered by the `pipeline_events` table, showing actions like "Recruiter X submitted Candidate Y" or "Candidate Z accepted offer," allowing the employer to instantly gauge velocity and identify bottlenecks.

**B. `employer/jobs` (Job Management)**
This page lists all records from the `jobs` table associated with the employer’s `organization_id`. It allows the employer to toggle the `status` of a job (e.g., from `draft` to `published` or `closed`) and see quick stats like "35 Applicants" for each row. It includes a "Create Job" button that opens a form to input `title`, `salary_range`, and `requirements`, with an integrated AI tool to auto-generate the `description`. This is the control room for opening and closing the hiring gates.

**C. `employer/jobs/[id]` (Pipeline/ATS View)**
This is the most complex and heavily used tool, visualizing the `applications` table for a specific job as a Kanban board or list. Columns correspond to the `application_status` enum (`applied`, `reviewed`, `interview`, etc.). Employers can drag and drop candidates between columns, which updates the database and triggers `pipeline_events`. The view filters candidates based on their AI `score` stored in the `applications` table, allowing hiring managers to focus immediately on the top-ranked talent rather than sifting through every submission.

**D. `employer/candidates/[id]` (Candidate Profile)**
Clicking a candidate in the pipeline opens this detailed view, combining data from `profiles` (resume, skills), `applications` (cover letter, AI match reasons), and `interview_feedback`. It allows the employer to view the parsed resume side-by-side with the job requirements. Crucially, this page contains the "Scorecard" form, where interviewers write to the `interview_feedback` table, inputting `pros`, `cons`, and `recommendation` (Hire/No Hire), transforming subjective opinions into structured data for decision-making.

**E. `employer/organization` (Settings)**
This administrative page manages the `organizations` table, allowing the employer to update their `logo_url`, `description`, and `website`. It also manages team access and billing details. It links to the `billings` table to show "Current Plan" status and past invoices, ensuring the company details that appear on public job posts are accurate and attractive to applicants.

---

### **3. Recruiter Pages**

**A. `recruiter/dashboard` (Home)**
*Upon login, this is the first thing they see.*
Focused on performance and revenue, this dashboard tracks metrics like "Candidates Submitted," "Interviews Secured," and "Offers Accepted." It queries the `applications` table where the recruiter is the "source" (implied via logic or `pipeline_events`) to calculate success rates. It also alerts the recruiter to new `published` jobs from Employers that are open to agency help, ensuring they know exactly where to focus their sourcing efforts for the day.

**B. `recruiter/marketplace` (Open Jobs)**
This page allows recruiters to browse the `jobs` table for roles where `is_public` is true and the employer accepts external submissions. It functions similarly to the Applicant Job Feed but includes data critical for headhunters, such as "Placement Fee" (if you add that field) or detailed `salary_range` data. Recruiters use this page to "Claim" or "Follow" jobs they want to work on, effectively building their personal portfolio of open requisitions.

**C. `recruiter/sourcing` (Talent Pool)**
This tool interfaces with the `profiles` table to search the global database of candidates. It provides powerful semantic search capabilities (using the `skills` array and `job_title`) to find passive candidates who match open requisitions. Recruiters can save these profiles to a "Watchlist" or directly invite them to apply, effectively bridging the gap between the static database and active job openings.

**D. `recruiter/submissions` (Submission Tracker)**
Since recruiters manage candidates across multiple companies, this page offers a cross-client view of the `applications` table. Instead of seeing one job's pipeline, they see *their* candidates status across *all* jobs (e.g., "John Doe at Company A: Interviewing", "Jane Smith at Company B: Rejected"). This consolidated view allows them to manage candidate relationships proactively, updating candidates on their status without needing to log into separate client portals.