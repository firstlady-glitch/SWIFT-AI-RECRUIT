import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export default function Version010Page() {
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
                        <h1 className="text-3xl font-bold">v0.1.0</h1>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                            Initial Release
                        </span>
                    </div>
                    <p className="text-gray-400">Foundation release of Swift AI Recruit</p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-6">
                    {/* Core Application Structure */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-blue-400">Core Application Structure</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Complete Next.js application setup with dedicated user flows, role-based dashboards, and comprehensive API routes.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Next.js 14 with App Router
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Role-based dashboards (Admin, Recruiter, Applicant)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Core component library
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Global styles and theming
                            </li>
                        </ul>
                    </div>

                    {/* Authentication */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-emerald-400">Authentication System</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Complete authentication flows for user registration, login, and organization setup.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> User login & registration
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Organization setup flow
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Role-based access control
                            </li>
                        </ul>
                    </div>

                    {/* Stripe Integration */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-purple-400">Stripe Payment Integration</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Complete payment processing integration with Stripe for seamless subscription management.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Secure payment processing
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Subscription management
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Invoice generation
                            </li>
                        </ul>
                    </div>

                    {/* AI Features */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-amber-400">AI Chatbot Integration</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Integrated AI-powered chatbot for enhanced user support and interactive assistance.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> ChatWidget component
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Real-time assistance
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> AI-powered tools
                            </li>
                        </ul>
                    </div>

                    {/* UI/UX */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-pink-400">UI/UX Foundation</h2>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Modern, responsive user interface with navigation and feature showcases.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Navigation bar
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Features page
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Jobs listing page
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mt-8 bg-[var(--background-secondary)]/50 border border-[var(--border)]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">Technical Stack</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Framework</p>
                            <p className="text-gray-300">Next.js 14</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Language</p>
                            <p className="text-gray-300">TypeScript</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Styling</p>
                            <p className="text-gray-300">Tailwind CSS</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Payments</p>
                            <p className="text-gray-300">Stripe</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
