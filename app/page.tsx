/**
 * app/page.tsx
 *
 * Landing page — server component.
 * Composes all landing sections in sequence.
 */

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CtaBanner from "@/components/landing/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaBanner />
      </main>

      <Footer />
    </>
  );
}
