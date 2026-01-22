import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import AcceptedSection from '@/components/AcceptedSection';
import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import HowItWorks from '@/components/HowItWorks';
import UserTypes from '@/components/UserTypes';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="px-4">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <AcceptedSection />
      <Features />
      <Statistics />
      <HowItWorks />
      <UserTypes />
      <FinalCTA />
      </div>
      <Footer />
    </div>
  );
}
