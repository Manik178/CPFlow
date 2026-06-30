import { auth } from "@/auth";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { JourneySection } from "@/components/landing/JourneySection";
import { EdgeSection } from "@/components/landing/EdgeSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { BackgroundEffects } from "@/components/landing/BackgroundEffects";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen text-zinc-50 font-sans overflow-x-hidden selection:bg-blue-500/30">
      <BackgroundEffects />
      <Header session={session} />
      
      <main>
        <HeroSection session={session} />
        <MetricsSection />
        <FeaturesSection />
        <JourneySection />
        <EdgeSection />
        <FAQSection />
      </main>

      <FooterSection />
    </div>
  );
}
