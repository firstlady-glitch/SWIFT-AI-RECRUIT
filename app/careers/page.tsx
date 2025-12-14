'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Code, PenTool, BarChart, Megaphone, Headphones, Database, Globe, Briefcase, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CareersPage() {
    const categories = [
        {
            icon: <Code className="w-8 h-8 text-blue-600" />,
            name: "Engineering & Development",
            count: "1,240+ jobs",
            roles: ["Frontend Developer", "Backend Engineer", "Full Stack Developer", "DevOps Engineer", "Mobile App Developer", "QA Engineer"]
        },
        {
            icon: <PenTool className="w-8 h-8 text-orange-500" />,
            name: "Design & Creative",
            count: "850+ jobs",
            roles: ["Product Designer", "UI/UX Designer", "Graphic Designer", "Art Director", "Motion Designer", "Web Designer"]
        },
        {
            icon: <Database className="w-8 h-8 text-purple-500" />,
            name: "Data Science & AI",
            count: "920+ jobs",
            roles: ["Data Scientist", "Machine Learning Engineer", "AI Researcher", "Data Analyst", "Business Intelligence", "Data Engineer"]
        },
        {
            icon: <Megaphone className="w-8 h-8 text-pink-500" />,
            name: "Marketing & Sales",
            count: "1,500+ jobs",
            roles: ["Digital Marketer", "SEO Specialist", "Content Writer", "Social Media Manager", "Sales Representative", "Growth Hacker"]
        },
        {
            icon: <BarChart className="w-8 h-8 text-green-500" />,
            name: "Product & Management",
            count: "600+ jobs",
            roles: ["Product Manager", "Project Manager", "Scrum Master", "Business Analyst", "Operations Manager", "Team Lead"]
        },
        {
            icon: <Headphones className="w-8 h-8 text-cyan-500" />,
            name: "Customer Support",
            count: "1,100+ jobs",
            roles: ["Customer Success Manager", "Support Specialist", "Technical Support", "Client Onboarding", "Call Center Agent"]
        },
        {
            icon: <Globe className="w-8 h-8 text-indigo-500" />,
            name: "Remote / Anywhere",
            count: "5,000+ jobs",
            roles: ["Virtual Assistant", "Remote Writer", "Online Tutor", "Translator", "Remote Developer", "Digital Nomad"]
        },
        {
            icon: <Briefcase className="w-8 h-8 text-gray-600" />,
            name: "Finance & Legal",
            count: "450+ jobs",
            roles: ["Financial Analyst", "Accountant", "Legal Counsel", "Paralegal", "Compliance Officer", "Risk Manager"]
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6 bg-[var(--background-secondary)] text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-15">
                    <Image
                        src="/careers.png"
                        alt="Careers Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Find Your Dream Career
                    </h1>
                    <p className="text-xl text-[var(--foreground-secondary)] mb-10">
                        Explore thousands of remote and onsite opportunities across the world's most exciting industries.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto mb-8">
                        <input
                            type="text"
                            placeholder="Search for job titles, skills, or keywords..."
                            className="w-full py-4 pl-6 pr-14 rounded-full border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] text-lg"
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-[var(--primary-blue)] text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                            <Search className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--foreground-secondary)]">
                        <span>Popular:</span>
                        <span className="bg-white px-3 py-1 rounded-full border cursor-pointer hover:border-blue-500">React.js</span>
                        <span className="bg-white px-3 py-1 rounded-full border cursor-pointer hover:border-blue-500">Python</span>
                        <span className="bg-white px-3 py-1 rounded-full border cursor-pointer hover:border-blue-500">Remote</span>
                        <span className="bg-white px-3 py-1 rounded-full border cursor-pointer hover:border-blue-500">Marketing</span>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-20 section">
                <h2 className="text-3xl font-bold mb-12 text-center">Browse by Category</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="card p-6 hover:shadow-xl transition-all hover:-translate-y-1 group border border-[var(--border)]">
                            <div className="mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                            <p className="text-sm text-[var(--primary-blue)] font-medium mb-4">{cat.count}</p>

                            <div className="space-y-2">
                                {cat.roles.slice(0, 3).map((role, rIdx) => (
                                    <Link key={rIdx} href={`/jobs?q=${role}`} className="block text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> {role}
                                    </Link>
                                ))}
                                {cat.roles.length > 3 && (
                                    <p className="text-xs text-gray-400 mt-2">and {cat.roles.length - 3} more...</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/auth?role=applicant" className="btn btn-primary px-8 py-4 text-lg">
                        View All {categories.reduce((acc, cat) => acc + parseInt(cat.count.replace(/,/g, '').replace('+', '')), 0).toLocaleString()}+ Jobs
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
