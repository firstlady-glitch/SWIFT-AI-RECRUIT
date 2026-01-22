import { Frown } from 'lucide-react';

export default function ProblemSection() {
    return (
        <section className="section py-20">
            <div className="max-w-3xl">
                <div className="flex mb-6 animate-float">
                    <Frown className="w-16 h-16 text-[var(--accent-orange)]" />
                </div>
                <h2 className="mb-6">
                    3 AM. 17 Browser Tabs.<br />Which Jobs Did You Even Apply To?
                </h2>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    The old way of job hunting is pure chaos. Scattered applications across multiple platforms,
                    generic resumes that don't stand out, missed deadlines, and zero visibility into your progress.
                    You're working harder, not smarter—and opportunities are slipping through the cracks.
                </p>
            </div>
        </section>
    );
}
