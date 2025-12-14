'use client';

import { useParams } from 'next/navigation';

export default function ApplicantDashboard() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="section py-12">
                <h1 className="text-4xl font-bold mb-6">Welcome to Your Dashboard</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Start your job search journey with AI-powered tools
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Applications</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Track all your job applications in one place
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">AI Tools</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Generate resumes, cover letters, and more
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Job Search</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Find your perfect role with AI matching
                        </p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-[var(--background-secondary)] rounded-lg text-sm text-[var(--foreground-secondary)]">
                    Dashboard ID: {params.dashboard}
                </div>
            </div>
        </div>
    );
}
