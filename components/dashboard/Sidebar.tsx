'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Wrench,
    Settings,
    LogOut,
    Briefcase,
    Users,
    FileText,
    Search,
    Store,
    Send,
    PanelLeftClose,
    PanelLeft,
    Menu,
    X,
    CalendarDays
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from './SidebarContext';

interface SidebarProps {
    role: 'applicant' | 'employer' | 'recruiter';
    dashboardId: string;
}

export default function Sidebar({ role, dashboardId }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebar();

    const basePath = `/app/${role === 'applicant' ? 'applicant' : `org/${role}`}/${dashboardId}`;

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const navItems = [
        {
            label: 'Dashboard',
            href: basePath,
            icon: <LayoutDashboard className="w-5 h-5 shrink-0" />
        },
        ...(role === 'applicant' ? [
            {
                label: 'Browse Jobs',
                href: '/app/applicant/jobs',
                icon: <Briefcase className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Applications',
                href: `${basePath}/applications`,
                icon: <FileText className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Interviews',
                href: `${basePath}/interviews`,
                icon: <CalendarDays className="w-5 h-5 shrink-0" />
            },
        ] : []),
        ...(role === 'recruiter' ? [
            {
                label: 'Jobs',
                href: `${basePath}/jobs`,
                icon: <Briefcase className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Marketplace',
                href: `${basePath}/marketplace`,
                icon: <Store className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Sourcing',
                href: `${basePath}/sourcing`,
                icon: <Search className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Submissions',
                href: `${basePath}/submissions`,
                icon: <Send className="w-5 h-5 shrink-0" />
            },
        ] : []),
        ...(role === 'employer' ? [
            {
                label: 'Jobs',
                href: `${basePath}/jobs`,
                icon: <Briefcase className="w-5 h-5 shrink-0" />
            },
            {
                label: 'Team',
                href: `${basePath}/team`,
                icon: <Users className="w-5 h-5 shrink-0" />
            },
        ] : []),
        {
            label: 'AI Tools',
            href: `${basePath}/tools`,
            icon: <Wrench className="w-5 h-5 shrink-0" />
        },
        {
            label: 'Settings',
            href: `${basePath}/settings`,
            icon: <Settings className="w-5 h-5 shrink-0" />
        }
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobile}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    bg-[var(--background-secondary)] border-r border-[var(--border)] flex flex-col h-screen fixed left-0 top-0 z-40
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-16' : 'w-64'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                {/* Logo Area */}
                <div className={`p-4 border-b border-[var(--border)] flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 shrink-0">
                        <img
                            src="/icon.png"
                            alt="SwiftAI Recruit"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className={`text-[var(--foreground)] font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        SwiftAI Recruit
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobile}
                                title={isCollapsed ? item.label : undefined}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                                    ${isCollapsed ? 'justify-center' : ''}
                                    ${isActive
                                        ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] font-medium border border-[var(--primary-blue)]/20'
                                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                                    }
                                `}
                            >
                                {item.icon}
                                <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle (Desktop only) */}
                <div className="hidden md:block p-2 border-t border-[var(--border)]">
                    <button
                        onClick={toggleCollapsed}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left text-[var(--foreground-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-all ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <PanelLeft className="w-5 h-5 shrink-0" /> : <PanelLeftClose className="w-5 h-5 shrink-0" />}
                        <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            Collapse
                        </span>
                    </button>
                </div>

                {/* User/Logout Area */}
                <div className="p-2 border-t border-[var(--border)]">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left text-[var(--foreground-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sign Out' : undefined}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            Sign Out
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}
