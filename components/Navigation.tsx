import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Navigation() {
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
                </div>
                <Link href="/auth" className="btn btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                    Get Started <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </nav>
    );
}
