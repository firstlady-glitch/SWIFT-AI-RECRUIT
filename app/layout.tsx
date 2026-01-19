import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SwiftAI Recruit | AI-Powered Recruitment Platform",
    template: "%s | SwiftAI Recruit"
  },
  description: "Revolutionize your hiring process with SwiftAI Recruit. Connecting top talent with opportunities using advanced AI matching technology for employers and educational institutions.",
  keywords: ["AI recruitment", "hiring platform", "job matching", "talent acquisition", "student recruitment", "HR tech", "automated hiring"],
  authors: [{ name: "SwiftAI Recruit Team", 'url': 'https://swift-ai-recruit.vercel.app' }],
  creator: "SwiftAI Recruit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swift-ai-recruit.vercel.app",
    title: "SwiftAI Recruit | The Future of Hiring",
    description: "Experience the next generation of recruitment. AI-driven matching for faster, smarter hiring decisions.",
    siteName: "SwiftAI Recruit",
    images: [
      {
        url: "https://swift-ai-recruit.vercel.app/icon.png", // Make sure to add an actual OG image later
        width: 1200,
        height: 630,
        alt: "SwiftAI Recruit Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftAI Recruit | AI-Powered Recruitment",
    description: "Streamline your hiring today with SwiftAI Recruit.",
    creator: "@this.is.dev.space"
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
