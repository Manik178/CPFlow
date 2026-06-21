import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Brain, BarChart3, Trophy } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Nav */}
      <header className="z-20 flex justify-between items-center p-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-outfit font-bold text-xl">
          <Code2 className="w-6 h-6 text-emerald-400" />
          <span>CPFlow</span>
        </div>
        <div>
          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="z-10 flex flex-col items-center justify-center text-center max-w-4xl px-6 mx-auto flex-1 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          CPFlow Beta is live
        </div>
        
        <h1 className="font-outfit font-bold text-5xl md:text-7xl tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
          The Ultimate <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Competitive Programming</span> Workspace
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Solve problems seamlessly from Codeforces, CodeChef, and CSES. 
          Analyze your performance, learn with AI-generated editorials, and level up your skills.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/workspace">
            <Button size="lg" className="h-12 px-8 text-base bg-white text-zinc-950 hover:bg-zinc-200 gap-2 rounded-full font-medium transition-all">
              Enter Workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full font-medium border-zinc-700 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800">
            Install Browser Extension
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full max-w-5xl">
          <FeatureCard 
            icon={<Code2 className="w-6 h-6 text-blue-400" />}
            title="Unified Editor"
            description="Write, test, and submit code in a world-class Monaco environment."
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-purple-400" />}
            title="AI Learning Hub"
            description="Post-solve summaries and alternative approaches powered by Gemini."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-emerald-400" />}
            title="Smart Analytics"
            description="Visualize your rating history, strengths, and weakness areas."
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6 text-orange-400" />}
            title="Recommendations"
            description="Targeted problem suggestions to stretch your capabilities."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm text-left">
      <div className="p-3 bg-zinc-800/50 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 font-outfit mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
