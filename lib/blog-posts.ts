/**
 * Canonical blog content — index and post pages import from here so slugs stay in sync.
 */

export type BlogPost = {
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    role: string;
    date: string;
    readTime: string;
    category: string;
    imageClass: string;
    content: string;
};

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'future-of-ai-recruitment',
        title: 'The Future of AI in Recruitment: Trends to Watch',
        excerpt:
            'How AI is reshaping hiring—from semantic matching to structured interview intelligence—and what teams should prepare for.',
        author: 'Sarah Johnson',
        role: 'Head of Product',
        date: 'Dec 12, 2024',
        readTime: '6 min read',
        category: 'Industry Trends',
        imageClass: 'bg-gradient-to-br from-blue-600/30 to-indigo-800/40',
        content: `
            <p class="mb-6">The recruitment landscape is shifting from keyword gates to context-aware matching. Teams that treat AI as an assistant—not a replacement—for judgment are seeing faster cycles and fairer first screens.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">1. Beyond keyword matching</h2>
            <p class="mb-6">Legacy ATS filters often discard qualified people over wording. Modern stacks combine embeddings and careful prompting so "led platform migrations" and "owned technical delivery" surface in the same shortlist when they describe the same work.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">2. Bias reduction needs process, not slogans</h2>
            <p class="mb-6">Blind screening and structured rubrics help, but only when hiring managers agree on criteria up front. AI summaries should cite evidence from the resume or interview notes so reviewers can disagree with the model without guessing.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">3. Soft skills at scale</h2>
            <p class="mb-6">As technical screens standardize, empathy, clarity, and stakeholder management differentiate senior hires. Interview intelligence features work best when transcripts are optional and candidates know how their data is used.</p>
            <div class="bg-[var(--background-secondary)] p-6 rounded-xl border-l-4 border-[var(--primary-blue)] mb-8">
                <p class="font-medium text-[var(--foreground)] italic">"The goal is to remove scheduling drag and first-pass noise—not to automate the hire decision."</p>
            </div>
            <p class="mb-6">At SwiftAI Recruit we ship workflows employers and recruiters can audit: drafts you edit, rankings you override, and messaging you own end to end.</p>
        `,
    },
    {
        slug: 'beat-the-ats',
        title: '5 Tips to Beat the ATS and Get Seen',
        excerpt:
            'Practical formatting and keyword discipline so your resume reaches a human reviewer without gaming the system.',
        author: 'Mike Chen',
        role: 'Senior Recruiter',
        date: 'Dec 10, 2024',
        readTime: '5 min read',
        category: 'Job Seeker Tips',
        imageClass: 'bg-gradient-to-br from-orange-500/25 to-amber-700/35',
        content: `
            <p class="mb-6">Most large employers run resumes through parsers before a recruiter opens the file. These tips maximize parse accuracy without stuffing keywords.</p>
            <h3 class="text-xl font-bold mb-3 text-[var(--foreground)]">1. Use a linear layout</h3>
            <p class="mb-6">Avoid multi-column designs, text boxes, and icons that replace words. Headings such as Experience, Education, and Skills should be plain text.</p>
            <h3 class="text-xl font-bold mb-3 text-[var(--foreground)]">2. Mirror the job language</h3>
            <p class="mb-6">If the posting says "customer success," use that phrase where truthful instead of only "account management." Match seniority signals ("Staff," "Lead") when they reflect your role.</p>
            <h3 class="text-xl font-bold mb-3 text-[var(--foreground)]">3. Ship PDF or DOCX intentionally</h3>
            <p class="mb-6">PDF is widely supported; DOCX can parse more cleanly on older stacks. When the application specifies a format, follow it.</p>
            <h3 class="text-xl font-bold mb-3 text-[var(--foreground)]">4. Quantify outcomes</h3>
            <p class="mb-6">Numbers give parsers and humans anchors: revenue influenced, latency reduced, tickets cleared, or team size led.</p>
            <h3 class="text-xl font-bold mb-3 text-[var(--foreground)]">5. Proofread for OCR noise</h3>
            <p class="mb-6">Broken bullets, special glyphs, or ultra-light fonts can become garbage characters. SwiftAI's resume tools flag these issues before you submit.</p>
        `,
    },
    {
        slug: 'soft-skills-matter',
        title: 'Why Soft Skills Still Decide Senior Hires in the AI Era',
        excerpt:
            'Automation handles the repetitive screen; judgment, narrative, and collaboration are what close executive-level searches.',
        author: 'Jessica Williams',
        role: 'VP Talent',
        date: 'Dec 05, 2024',
        readTime: '5 min read',
        category: 'Career Advice',
        imageClass: 'bg-gradient-to-br from-emerald-500/25 to-teal-800/35',
        content: `
            <p class="mb-6">When technical tests commoditize, hiring managers look for operators who can align teams, explain tradeoffs, and recover when plans change. That signal rarely lives in a keyword field.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Signal, don't perform</h2>
            <p class="mb-6">Stories beat adjectives. Instead of "great communicator," describe how you resolved a conflict between product and infra with a written decision log.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Pair AI prep with real rehearsal</h2>
            <p class="mb-6">Use AI-generated question banks to practice, then record yourself or run a mock with a peer. Fluency comes from repetition, not from reading perfect bullet lists.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Remote fluency is a skill</h2>
            <p class="mb-6">Async updates, timezone empathy, and crisp written status are evaluated in every round. Treat them as part of your portfolio, not as hygiene.</p>
        `,
    },
    {
        slug: 'techcorp-case-study',
        title: 'Case Study: Cutting Time-to-Offer Without Sacrificing Quality',
        excerpt:
            'How a product-led org tightened intake, structured interviews, and used AI drafting to keep recruiters in the loop.',
        author: 'David Miller',
        role: 'Customer Strategy',
        date: 'Nov 28, 2024',
        readTime: '7 min read',
        category: 'Case Studies',
        imageClass: 'bg-gradient-to-br from-violet-500/25 to-fuchsia-800/35',
        content: `
            <p class="mb-6">This composite case reflects patterns from SwiftAI Recruit deployments: high engineering bar, thin recruiter bandwidth, and pressure to move fast without skipping calibration.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Problem</h2>
            <p class="mb-6">Hiring managers rewrote job posts from scratch each time. Phone screens varied by interviewer, and feedback notes rarely matched the scorecard—slowing debriefs.</p>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Approach</h2>
            <ul class="list-disc pl-6 mb-6 space-y-2 text-[var(--foreground-secondary)]">
                <li>Templated intake: role level, must-have vs nice-to-have, compensation band.</li>
                <li>AI-generated first drafts of postings and interview plans, always edited by the HM.</li>
                <li>Shared rubric in-tool; recruiters nudged stalled steps automatically.</li>
            </ul>
            <h2 class="text-2xl font-bold mb-4 text-[var(--foreground)]">Outcomes</h2>
            <p class="mb-6">Median time from approved req to offer dropped sharply when debriefs had consistent notes. Candidate experience scores rose once expectations were repeated clearly at each stage.</p>
            <p class="mb-6">The lesson: AI accelerates paperwork and pattern-finding; humans still own criteria and the final decision.</p>
        `,
    },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogListItems() {
    return BLOG_POSTS.map(
        ({
            slug,
            title,
            excerpt,
            author,
            date,
            category,
            imageClass,
            readTime,
        }) => ({
            slug,
            title,
            excerpt,
            author,
            date,
            category,
            imageClass,
            readTime,
        })
    );
}
