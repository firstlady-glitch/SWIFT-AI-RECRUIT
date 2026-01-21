import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export default function Version1110Page() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/dev/version" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Versions
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">v1.11.0</h1>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                            Latest
                        </span>
                    </div>
                    <p className="text-gray-400">January 2026</p>
                </div>

                {/* Changes */}
                <div className="space-y-6">
                    {/* EmptyState Component Update */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-cyan-400">Enhanced EmptyState Component</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Updated the EmptyState component with improved functionality and styling for better user experience across empty data views.
                        </p>

                        <div className="bg-[#0d0f14] rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-500 mb-2">File Updated</p>
                            <code className="text-cyan-300 text-sm">components/ui/EmptyState.tsx</code>
                        </div>

                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Customizable icon support via LucideIcon
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Flexible action button (Link or onClick)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Improved styling with consistent theming
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Debug logging for development
                            </li>
                        </ul>
                    </div>

                    {/* Strategic Platform Alignment */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-400">Strategic Platform Alignment</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Aligned platform messaging with the 10-point centralized hiring platform value proposition for improved user clarity and feature communication.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#0d0f14] rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-2">Features Component</p>
                                <code className="text-green-300 text-sm">components/Features.tsx</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Centralized Hiring Hub - unified dashboard messaging
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Structured & Fair Hiring - bias reduction emphasis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Multi-Channel Distribution - job board integration
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Team Collaboration - real-time feedback workflows
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Data-Driven Insights - analytics dashboard
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Compliance & Security - GDPR and audit trails
                                </li>
                            </ul>

                            <div className="bg-[#0d0f14] rounded-lg p-4 mt-4">
                                <p className="text-sm text-gray-500 mb-2">Org Role Selection</p>
                                <code className="text-green-300 text-sm">app/app/org/page.tsx</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Recruiter benefits: collaboration, insights, feedback
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span> Employer benefits: structured hiring, distribution, analytics
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* External Application Links */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-orange-400">External Application Links</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Jobs now support two application flows: <strong>Internal</strong> (full AI analysis & management) or <strong>External</strong> (redirect to company career page with click analytics).
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#0d0f14] rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-2">Database Migration</p>
                                <code className="text-orange-300 text-sm">external-link-migration.sql</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> jobs.application_type (internal/external)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> jobs.external_apply_url for redirect links
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> job_click_analytics table for tracking
                                </li>
                            </ul>

                            <div className="bg-[#0d0f14] rounded-lg p-4 mt-4">
                                <p className="text-sm text-gray-500 mb-2">UI Updates</p>
                                <code className="text-orange-300 text-sm">app/app/org/employer + recruiter/jobs/create</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> Application Method toggle in job creation (Employer + Recruiter)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> Apply button with ExternalLink icon for external jobs
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> Click tracking API at /api/jobs/[id]/click
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-400">✓</span> Recruiter job creation page at /app/org/recruiter/jobs/create
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Responsive Collapsible Sidebar */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-purple-400">Responsive Collapsible Sidebar</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Complete overhaul of the dashboard sidebar with collapsible functionality for desktop and mobile hamburger menu support.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#0d0f14] rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-2">New Component</p>
                                <code className="text-purple-300 text-sm">components/dashboard/SidebarContext.tsx</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> React Context for shared sidebar collapse state
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Desktop: toggle button to collapse (icons-only, 64px width)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Mobile: hamburger menu with overlay backdrop
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Smooth 300ms width transitions
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Dynamic main content padding based on sidebar state
                                </li>
                            </ul>

                            <div className="bg-[#0d0f14] rounded-lg p-4 mt-4">
                                <p className="text-sm text-gray-500 mb-2">Updated Layouts</p>
                                <code className="text-purple-300 text-sm">app/app/*/[dashboard]/layout.tsx</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Recruiter dashboard layout
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Employer dashboard layout
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">✓</span> Applicant dashboard layout
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Dashboard Route Restructuring */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-blue-400">Dashboard Route Restructuring</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Moved routes inside dashboard folders for proper sidebar access and navigation consistency.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#0d0f14] rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-2">Applicant Routes Moved</p>
                                <code className="text-blue-300 text-sm">app/app/applicant/[dashboard]/</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span> applications/ (from /applicant/applications)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span> interviews/ (from /applicant/interviews)
                                </li>
                            </ul>

                            <div className="bg-[#0d0f14] rounded-lg p-4 mt-4">
                                <p className="text-sm text-gray-500 mb-2">Employer Routes Moved</p>
                                <code className="text-blue-300 text-sm">app/app/org/employer/[dashboard]/</code>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span> jobs/ (from /org/employer/jobs)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span> jobs/[id]/ job detail page
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span> jobs/create/ job creation
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar Navigation Updates */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-yellow-400">Sidebar Navigation Updates</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Added role-specific navigation items to the sidebar for improved user experience.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#0d0f14] rounded-lg p-4">
                                <p className="text-sm text-gray-500 mb-2">Applicant Sidebar</p>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-400">✓</span> Browse Jobs (links to /app/applicant/jobs)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-400">✓</span> Applications (FileText icon)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-400">✓</span> Interviews (CalendarDays icon)
                                </li>
                            </ul>

                            <div className="bg-[#0d0f14] rounded-lg p-4 mt-4">
                                <p className="text-sm text-gray-500 mb-2">Employer Sidebar</p>
                            </div>

                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-400">✓</span> Jobs (Briefcase icon)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-400">✓</span> Team (Users icon)
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Logo Branding Update */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-pink-400">Logo Branding Update</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Replaced placeholder "S" letter with the official SwiftAI Recruit logo across all components.
                        </p>

                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-pink-400">✓</span> Sidebar logo (components/dashboard/Sidebar.tsx)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-pink-400">✓</span> Jobs page navbar (app/app/applicant/jobs/page.tsx)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-pink-400">✓</span> Uses /icon.png with object-contain for aspect ratio
                            </li>
                        </ul>
                    </div>

                    {/* Applicant Jobs Page Navbar */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-teal-400">Applicant Jobs Page Navbar</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Added comprehensive sticky navbar to the applicant Browse Jobs page for better navigation.
                        </p>

                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> SwiftAI Recruit logo and branding
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Navigation links: Browse Jobs, My Applications, Interviews
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Dashboard button (highlighted with blue accent)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> User dropdown menu with Settings and Sign Out
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Glassmorphism styling with backdrop blur
                            </li>
                        </ul>
                    </div>

                    {/* Responsive UI Improvements */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-indigo-400">Responsive UI Improvements</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Various mobile-first responsive improvements across the application.
                        </p>

                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-400">✓</span> Employer Jobs page header: stacks vertically on mobile
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-400">✓</span> Mobile hamburger menu for all dashboard layouts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-indigo-400">✓</span> Top padding on mobile for hamburger button clearance
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Component Preview */}
                <div className="mt-8 bg-[var(--background-secondary)]/50 border border-[var(--border)]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">Component Props</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-800">
                                    <th className="pb-2 pr-4">Prop</th>
                                    <th className="pb-2 pr-4">Type</th>
                                    <th className="pb-2">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-400">
                                <tr className="border-b border-gray-800/50">
                                    <td className="py-2 pr-4 text-cyan-400">icon</td>
                                    <td className="py-2 pr-4">LucideIcon</td>
                                    <td className="py-2">Custom icon (default: Inbox)</td>
                                </tr>
                                <tr className="border-b border-gray-800/50">
                                    <td className="py-2 pr-4 text-cyan-400">title</td>
                                    <td className="py-2 pr-4">string</td>
                                    <td className="py-2">Main heading text</td>
                                </tr>
                                <tr className="border-b border-gray-800/50">
                                    <td className="py-2 pr-4 text-cyan-400">description</td>
                                    <td className="py-2 pr-4">string?</td>
                                    <td className="py-2">Optional description text</td>
                                </tr>
                                <tr className="border-b border-gray-800/50">
                                    <td className="py-2 pr-4 text-cyan-400">actionLabel</td>
                                    <td className="py-2 pr-4">string?</td>
                                    <td className="py-2">Button text</td>
                                </tr>
                                <tr className="border-b border-gray-800/50">
                                    <td className="py-2 pr-4 text-cyan-400">actionHref</td>
                                    <td className="py-2 pr-4">string?</td>
                                    <td className="py-2">Link destination</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-cyan-400">onAction</td>
                                    <td className="py-2 pr-4">function?</td>
                                    <td className="py-2">Click handler</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}