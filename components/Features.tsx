import { Check, Clock, TrendingUp, Users, Zap, Shield, Cpu, FileText, LayoutDashboard, Briefcase, BarChart, Share2, Globe, MessageSquare } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <LayoutDashboard className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Centralized Hiring Hub",
            description: "Manage resumes, interviews, feedback, and hiring decisions from one unified dashboard.",
            color: "blue-50"
        },
        {
            icon: <BarChart className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "Structured & Fair Hiring",
            description: "Define clear job requirements, utilize consistent interviews, and reduce unconscious bias.",
            color: "orange-50"
        },
        {
            icon: <Globe className="w-8 h-8 text-[var(--success)]" />,
            title: "Multi-Channel Distribution",
            description: "Automatically publish jobs to your careers page, LinkedIn, Indeed, and referral programs.",
            color: "green-50"
        },
        {
            icon: <Users className="w-8 h-8 text-purple-600" />,
            title: "Seamless Team Collaboration",
            description: "Real-time collaboration between recruiters and hiring managers with centralized feedback.",
            color: "purple-50"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-red-500" />,
            title: "Data-Driven Insights",
            description: "Track time-to-hire, source quality, and pipeline health with advanced reporting.",
            color: "red-50"
        },
        {
            icon: <Shield className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Compliance & Security",
            description: "GDPR-compliant data handling with enterprise-grade encryption and audit trails.",
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
