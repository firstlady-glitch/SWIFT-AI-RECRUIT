export default function Statistics() {
    const stats = [
        {
            value: '85%',
            label: 'Faster Application Process',
            description: 'Complete applications in minutes, not hours, with AI automation'
        },
        {
            value: '3.2x',
            label: 'More Interview Invites',
            description: 'Optimized applications that get noticed by hiring managers'
        },
        {
            value: '92%',
            label: 'Less Time Wasted',
            description: 'Focus on the right opportunities with intelligent matching'
        }
    ];

    return (
        <section className="section py-20">
            <div className="grid md:grid-cols-3 gap-12 text-center">
                {stats.map((stat, index) => (
                    <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="text-6xl font-bold text-gradient mb-3">{stat.value}</div>
                        <p className="text-xl text-[var(--foreground-secondary)]">{stat.label}</p>
                        <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                            {stat.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
