import { Upload, Target, Sparkles, BarChart3, GraduationCap } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: Upload,
            title: 'Upload Your Resume',
            description: 'Start by uploading your existing resume. Our AI instantly parses and analyzes your experience, skills, education, and achievements, creating a comprehensive profile that serves as the foundation for all future applications.'
        },
        {
            icon: Target,
            title: 'Get Smart Job Matches',
            description: 'Receive AI-powered job recommendations tailored to your profile. Our algorithm considers your experience level, preferred industry, location preferences, salary expectations, and career goals to present opportunities with the highest success probability.'
        },
        {
            icon: Sparkles,
            title: 'AI Tailors Your Application',
            description: 'For each job you select, our AI automatically customizes your resume and generates a compelling cover letter. The system optimizes keyword placement for ATS compatibility while maintaining natural, engaging language that appeals to human reviewers.'
        },
        {
            icon: BarChart3,
            title: 'Track Everything in One Dashboard',
            description: 'Monitor all your applications from a unified dashboard. See which applications are under review, track interview schedules, set reminders for follow-ups, and analyze your success metrics. Complete visibility means you never lose track of opportunities.'
        },
        {
            icon: GraduationCap,
            title: 'Ace Your Interviews with AI Prep',
            description: 'Prepare for interviews with AI-generated practice questions specific to the role and company. Get feedback on your answers, refine your pitch, and build confidence. Our interview simulator helps you practice until you\'re ready to impress.'
        }
    ];

    return (
        <section id="how-it-works" className="section py-20">
            <div className="text-center mb-16">
                <h2 className="mb-4">From Application to Offer in 5 Simple Steps</h2>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    Our streamlined process guides you from start to finish
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={index} className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary-blue)] text-white flex items-center justify-center font-bold text-xl">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className="w-6 h-6 text-[var(--primary-blue)]" />
                                    <h3 className="text-2xl">{step.title}</h3>
                                </div>
                                <p className="text-lg text-[var(--foreground-secondary)]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
