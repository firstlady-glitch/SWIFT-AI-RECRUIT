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
    FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface SidebarProps {
    role: 'applicant' | 'employer' | 'recruiter';
    dashboardId: string;
}

export default function Sidebar({ role, dashboardId }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

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
            icon: <LayoutDashboard className="w-5 h-5" />
        },
        {
            label: 'AI Tools',
            href: `${basePath}/tools`,
            icon: <Wrench className="w-5 h-5" />
        },
        {
            label: 'Settings',
            href: `${basePath}/settings`,
            icon: <Settings className="w-5 h-5" />
        }
    ];

    // Role specific items could be added here
    if (role === 'applicant') {
        // e.g. My Applications?
    }

    return (
        <aside className="w-64 bg-[#15171e] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40">
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--primary-blue)] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">SwiftAI Recruit</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] font-medium border border-[var(--primary-blue)]/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User/Logout Area */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
