import { Briefcase, Target, Building2, GraduationCap, Check } from 'lucide-react';

export default function UserTypes() {
    const userTypes = [
        {
            icon: Briefcase,
            title: 'For Job Seekers',
            description: 'Find your dream role faster with AI-powered tools',
            color: 'var(--primary-blue)',
            benefits: [
                'Browse global jobs with intelligent filtering and recommendations',
                'Auto-generate tailored resumes and cover letters for each application',
                'Track application progress from submission to offer',
                'Get AI-powered interview preparation and career coaching'
            ]
        },
        {
            icon: Target,
            title: 'For Recruiters',
            description: 'Source top talent efficiently and close positions faster',
            color: 'var(--accent-orange)',
            benefits: [
                'Access global talent database with AI-powered candidate matching',
                'Submit candidates directly to client jobs with full pipeline tracking',
                'Automated outreach campaigns with email and SMS integration',
                'Performance analytics and commission tracking'
            ]
        },
        {
            icon: Building2,
            title: 'For Employers',
            description: 'Hire the best candidates quickly with intelligent recruitment tools',
            color: 'var(--cyan)',
            benefits: [
                'AI-generated job descriptions optimized for maximum reach',
                'Review AI-ranked candidates with matching scores and insights',
                'Collaborate with team members and recruiters in real-time',
                'Seamless ATS integrations (Greenhouse, Workday, BambooHR)'
            ]
        },
        {
            icon: GraduationCap,
            title: 'For Educational Institutions',
            description: 'Recruit students seamlessly with data-driven insights',
            color: 'var(--purple)',
            benefits: [
                'AI tools to identify prospective students aligned with your programs',
                'Automated enrollment workflows and application tracking',
                'Analytics on recruitment campaigns and conversion rates',
                'Connect students with career opportunities post-graduation'
            ]
        }
    ];

    return (
        <section id="users" className="section py-20">
            <div className="text-center mb-16">
                <h2 className="mb-4">Built For Everyone in the Recruitment Ecosystem</h2>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    Whether you're seeking opportunities or providing them, we have the tools you need
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {userTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                        <div key={index} className="card-glass p-8">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4"
                                style={{ backgroundColor: type.color }}
                            >
                                <Icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl mb-3">{type.title}</h3>
                            <p className="text-lg text-[var(--foreground-secondary)] mb-4">
                                {type.description}
                            </p>
                            <ul className="space-y-2 text-[var(--foreground-secondary)]">
                                {type.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-1" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
