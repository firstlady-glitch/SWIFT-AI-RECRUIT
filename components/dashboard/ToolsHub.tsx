'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

export type ToolHubItem = {
    slug: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
};

type ToolsHubProps = {
    eyebrow?: string;
    title: string;
    subtitle: string;
    tools: ToolHubItem[];
    resolveHref: (slug: string) => string;
};

export default function ToolsHub({
    eyebrow = 'Powered by Groq',
    title,
    subtitle,
    tools,
    resolveHref,
}: ToolsHubProps) {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)] font-semibold mb-2">
                    {eyebrow}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
                <p className="text-[var(--foreground-secondary)] text-lg max-w-2xl mb-10">
                    {subtitle}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tools.map((tool) => (
                        <Link
                            key={tool.slug}
                            href={resolveHref(tool.slug)}
                            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 shadow-sm transition-all hover:border-[var(--primary-blue)]/40 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.35)]"
                        >
                            <div
                                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${tool.bgColor} ${tool.color} transition-transform group-hover:scale-105`}
                            >
                                <tool.icon className="h-6 w-6" aria-hidden />
                            </div>
                            <h3 className="text-lg font-bold mb-2 pr-8">{tool.name}</h3>
                            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed flex-1 mb-6">
                                {tool.description}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary-blue)]">
                                Open tool
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
