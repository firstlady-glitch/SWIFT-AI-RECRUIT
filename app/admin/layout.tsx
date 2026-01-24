'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    BarChart3,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/organizations', icon: Building2, label: 'Organizations' },
    { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/billing', icon: CreditCard, label: 'Billing' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminName, setAdminName] = useState('');

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            return;
        }

        const checkAdmin = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/admin/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                console.log('[AdminLayout] Access denied - not admin');
                router.push('/app');
                return;
            }

            setIsAdmin(true);
            setAdminName(profile.full_name || 'Admin');
            console.log('[AdminLayout] Admin access granted');
        };

        checkAdmin();
    }, [router, isLoginPage]);

    // For login page, render children directly without layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--background-secondary)] border-r border-[var(--border)] transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-[var(--border)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                {/* <h1 className="text-xs font-bold text-[var(--foreground)]">SwiftAI Admin</h1> */}
                                <p className="text-xs text-[var(--foreground-secondary)]">Control Center</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)] text-sm">{adminName}</p>
                                <p className="text-xs text-red-400">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)] rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)] lg:hidden">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-500" />
                            <span className="font-bold text-[var(--foreground)]">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
