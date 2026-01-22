import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer id="contact" className="border-t border-[var(--border)] bg-[var(--background)] px-4">
            <div className="section py-12">
                <div className="grid md:grid-cols-4 gap-8 md:gap-40 mb-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/icon.png"
                                alt="SwiftAI Recruit Logo"
                                width={32}
                                height={32}
                                className="rounded-lg"
                            />
                            <span className="font-bold text-lg">SwiftAI Recruit</span>
                        </div>
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            Revolutionizing recruitment with AI-driven solutions for job seekers, recruiters, employers,
                            and educational institutions worldwide.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                            <li><Link href="/#features" className="hover:text-[var(--primary-blue)] transition-colors">Features</Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-[var(--primary-blue)] transition-colors">How It Works</Link></li>
                            {process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false' && (
                                <li><Link href="/pricing" className="hover:text-[var(--primary-blue)] transition-colors">Pricing</Link></li>
                            )}
                            <li><Link href="/api" className="hover:text-[var(--primary-blue)] transition-colors">API</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                            <li><Link href="/about" className="hover:text-[var(--primary-blue)] transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-[var(--primary-blue)] transition-colors">Blog</Link></li>
                            <li><Link href="/resources" className="hover:text-[var(--primary-blue)] transition-colors">Resources</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--primary-blue)] transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-[var(--primary-blue)] transition-colors">FAQ</Link></li>
                            <li><Link href="/api" className="hover:text-[var(--primary-blue)] transition-colors">API</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                            <li><Link href="/privacy" className="hover:text-[var(--primary-blue)] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[var(--primary-blue)] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/data-policy" className="hover:text-[var(--primary-blue)] transition-colors">Data Policy</Link></li>
                            <li><Link href="/cookies" className="hover:text-[var(--primary-blue)] transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--foreground-secondary)]">
                        © 2024 SwiftAI Recruit. All rights reserved.
                    </p>

                </div>
            </div>
        </footer>
    );
}
