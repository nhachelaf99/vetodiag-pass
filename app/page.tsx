import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";
import CoreServicesSection from "@/components/sections/CoreServicesSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="container mx-auto px-6">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CoreServicesSection />
      <div className="mt-20">
        <CTASection />
      </div>
    </div>
  );
}
