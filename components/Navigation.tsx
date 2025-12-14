'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] bg-[var(--background)]/80">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between py-3 sm:py-4">
                <Link href="/" className="flex items-center gap-2 sm:gap-3">
                    <Image
                        src="/icon.png"
                        alt="SwiftAI Recruit Logo"
                        width={53}
                        height={40}
                        className="rounded-lg"
                    />
                    <span className="text-lg sm:text-xl font-bold">SwiftAI Recruit</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link href="/features" className="text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors">
                        Features
                    </Link>
                    <Link href="/#how-it-works" className="text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors">
                        How It Works
                    </Link>
                    <Link href="/careers" className="text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors">
                        Careers
                    </Link>
                    <Link href="/jobs" className="text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors">
                        Jobs
                    </Link>
                    <Link href="/auth" className="btn btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 cursor-pointer">
                        Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center">
                    <button
                        onClick={toggleMenu}
                        className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] hover:bg-gray-100/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-xl animate-in slide-in-from-top-5">
                    <div className="flex flex-col p-6 space-y-4">
                        <Link
                            href="/features"
                            className="text-lg font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors py-2 border-b border-gray-100/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="text-lg font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors py-2 border-b border-gray-100/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            How It Works
                        </Link>
                        <Link
                            href="/careers"
                            className="text-lg font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors py-2 border-b border-gray-100/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Careers
                        </Link>
                        <Link
                            href="/jobs"
                            className="text-lg font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors py-2 border-b border-gray-100/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Jobs
                        </Link>
                        <Link
                            href="/auth"
                            className="btn btn-primary text-center justify-center py-3 mt-4"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Started <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
