import { Target } from 'lucide-react';

export default function SolutionSection() {
    return (
        <section className="section py-20">
            <div className="max-w-4xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-blue)] mb-6">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="mb-6">
                    One Dashboard. Add Every Application.<br />Get AI-Powered Prep Tasks.
                </h2>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto">
                    SwiftAI Recruit is the smart way to land your next role. Our AI-driven platform analyzes job postings,
                    optimizes your resume for each application, generates personalized cover letters, and provides intelligent
                    interview preparation—all automatically. Stay organized, move faster, and increase your chances of success.
                </p>
            </div>
        </section>
    );
}
