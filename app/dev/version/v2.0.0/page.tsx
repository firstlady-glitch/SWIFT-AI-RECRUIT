import Link from "next/link";
import { ArrowLeft, Shield, Database, Wrench, Settings, Users, CreditCard, Bell, Lock, RefreshCw } from "lucide-react";

export default function Version2_0_0() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/dev/version"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to History
                </Link>

                <div className="mb-8">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full mb-4">
                        Major Release
                    </span>
                    <h1 className="text-4xl font-bold mb-4">v2.0.0</h1>
                    <p className="text-[var(--foreground-secondary)]">Released January 24, 2026</p>
                </div>

                <div className="space-y-10">
                    {/* Summary */}
                    <section className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Summary</h2>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            Version 2.0.0 introduces a comprehensive <strong>Admin Control Center</strong> with database-driven site settings,
                            dedicated admin authentication, and a site-wide maintenance mode. This major release moves away from
                            environment variables for configuration, enabling real-time control over platform features directly from the admin dashboard.
                        </p>
                    </section>

                    {/* Admin Authentication */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Admin Authentication System</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Created dedicated admin login page at <code className="text-[var(--primary-blue)]">/admin/login</code> with admin-specific red theme and Shield icon branding.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Implemented role verification - only users with <code className="text-[var(--primary-blue)]">role: 'admin'</code> can access the admin dashboard.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Added temporary signup toggle for creating admin accounts (can be disabled after setup).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Updated admin layout to skip auth check for login page, preventing infinite loading.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Database Settings */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Database className="w-6 h-6 text-purple-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Database-Driven Site Settings</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <p className="text-[var(--foreground-secondary)] mb-4">
                                Replaced <code className="text-[var(--primary-blue)]">NEXT_PUBLIC_ACCEPT_PAYMENTS</code> environment variable with database-driven settings.
                            </p>
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Created <code className="text-[var(--primary-blue)]">site_settings</code> table in Supabase with RLS policies (admin-only write access).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Built <code className="text-[var(--primary-blue)]">/api/settings</code> REST endpoint for reading/updating settings.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Created <code className="text-[var(--primary-blue)]">useSettings()</code> React hook for client-side access to settings.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Updated admin settings page with live fetch/save functionality.</span>
                                </li>
                            </ul>
                            <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                <h4 className="font-medium mb-2">Configurable Settings:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500" /> Payments Enabled</div>
                                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Allow Registration</div>
                                    <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-purple-500" /> Require Approval</div>
                                    <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-500" /> Email Notifications</div>
                                    <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-500" /> Maintenance Mode</div>
                                    <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-gray-500" /> Custom Message</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Maintenance Mode */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Wrench className="w-6 h-6 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Maintenance Mode</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Created styled <code className="text-[var(--primary-blue)]">/maintenance</code> page with dynamic message from database.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Added auto-refresh countdown (60s) and manual refresh button.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Implemented proxy middleware to redirect all non-admin users when maintenance is enabled.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Admin users can still access the full site during maintenance.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Page auto-redirects to home when maintenance mode is disabled.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Proxy Improvements */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <RefreshCw className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Proxy & Routing Improvements</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Fixed redirect loop for admin users accessing <code className="text-[var(--primary-blue)]">/admin</code> routes.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>API routes now bypass all redirects - prevents JSON parsing errors.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Added <code className="text-[var(--primary-blue)]">/maintenance</code> to public paths list.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Proxy now fetches site settings from database for real-time configuration.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Files Changed */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Files Changed</h2>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <div className="grid gap-2 text-sm font-mono text-[var(--foreground-secondary)]">
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> app/admin/login/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> app/maintenance/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> app/api/settings/route.ts</div>
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> hooks/use-site-settings.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> site-settings-migration.sql</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/admin/layout.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/admin/settings/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> proxy.ts</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> components/Footer.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/features/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/app/org/employer/[dashboard]/settings/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/app/org/recruiter/[dashboard]/settings/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> lib/stripe.ts</div>
                            </div>
                        </div>
                    </section>

                    {/* Migration */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Migration Notes</h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                            <p className="text-yellow-400 font-medium mb-2">⚠️ Required Database Migration</p>
                            <p className="text-[var(--foreground-secondary)]">
                                Run <code className="text-[var(--primary-blue)]">site-settings-migration.sql</code> in Supabase SQL Editor to create the
                                <code className="text-[var(--primary-blue)]"> site_settings</code> table before using admin settings.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
