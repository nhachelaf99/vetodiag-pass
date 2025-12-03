import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";
import CoreServicesSection from "@/components/sections/CoreServicesSection";
import CTASection from "@/components/sections/CTASection";
import InlineHeader from "@/components/InlineHeader";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CoreServicesSection />
      <div className="mt-20">
        <InlineHeader />
        <CTASection />
      </div>
    </>
  );
}
