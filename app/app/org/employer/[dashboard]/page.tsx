'use client';

import { useParams } from 'next/navigation';

export default function EmployerDashboard() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="section py-12">
                <h1 className="text-4xl font-bold mb-6">Employer Dashboard</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Post jobs and hire top talent for your organization
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Job Postings</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Create and manage your job listings
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Candidates</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Review AI-ranked applicants
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Team</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Collaborate with your hiring team
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
