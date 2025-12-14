import { Rocket } from 'lucide-react';

export default function AcceptedSection() {
    return (
        <section className="accepted-section py-20 px-[48px] bg-[var(--background-secondary)]">
            <div className="max-w-4xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--success)] mb-6">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h2 className="mb-6">
                    From "Application Sent" to "Offer Accepted"
                </h2>
                <p className="text-lg text-[var(--foreground-secondary)] max-w-3xl">
                    Generate cover letters. Tailor your CV to each application. Track your progress from
                    submission to final offer. Our AI guides you through every stage, ensuring you're always
                    prepared and one step ahead of the competition.
                </p>
            </div>
        </section>
    );
}
