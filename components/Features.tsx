import { Check, Clock, TrendingUp, Users, Zap, Shield, Cpu, FileText, LayoutDashboard, Briefcase, BarChart } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <FileText className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "AI CV Parsing",
            description: "Instantly extract and structure candidates data from resumes with 99% accuracy.",
            color: "blue-50"
        },
        {
            icon: <Cpu className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "Job Matching Engine",
            description: "Automatically match the best candidates to your job requirements in seconds.",
            color: "orange-50"
        },
        {
            icon: <LayoutDashboard className="w-8 h-8 text-[var(--success)]" />,
            title: "Applicant Tracking System",
            description: "Manage your entire hiring pipeline from a single, intuitive dashboard.",
            color: "green-50"
        },
        {
            icon: <Briefcase className="w-8 h-8 text-purple-600" />,
            title: "Recruiter Workspace",
            description: "Dedicated tools for agencies to manage multiple clients and talent pools.",
            color: "purple-50"
        },
        {
            icon: <BarChart className="w-8 h-8 text-red-500" />,
            title: "Automated Scoring",
            description: "Get unbiased, data-driven candidate scores to make faster hiring decisions.",
            color: "red-50"
        },
        {
            icon: <Shield className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Security & Compliance",
            description: "Enterprise-grade data protection with GDPR and SOC2 compliance built-in.",
            color: "blue-50"
        }
    ];

    return (
        <section id="features" className="section py-20 bg-[var(--background-secondary)]">
            <div className="text-center mb-16">
                <h2 className="mb-4">Everything You Need to Hire</h2>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    A complete suite of AI-powered tools to streamline your recruitment process
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="card p-8 group hover:border-[var(--primary-blue)] transition-all">
                        <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color} group-hover:scale-110 transition-transform duration-300`}
                        >
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
