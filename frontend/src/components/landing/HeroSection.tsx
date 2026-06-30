"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Sparkles, CheckCircle2 } from "lucide-react";
import { CodeforcesIcon, CodeChefIcon, CsesIcon, ChromeIcon } from "@/components/icons/PlatformIcons";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { HeroMockup } from "./HeroMockup";

export function HeroSection({ session }: { session?: any }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightColor = "rgba(56, 189, 248, 0.08)";

  const words = "The Operating System for Competitive Programming".split(" ");
  
  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-900/50 text-xs font-medium text-blue-200 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            BETA <span className="text-blue-500/50">|</span> Built for Competitive Programmers
          </motion.div>
          
          <motion.div 
            className="font-outfit font-bold text-5xl md:text-7xl tracking-tight mb-6 text-white leading-[1.1] flex flex-wrap justify-center lg:justify-start gap-x-4"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.4 }}
                className={i >= 4 ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400" : ""}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Solve problems. Track progress. Learn faster. <br className="hidden sm:block" />
            All in one intelligent workspace.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10"
          >
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2">
              <CodeforcesIcon className="w-5 h-5" />
              <span className="text-sm text-zinc-300 font-medium">Codeforces</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2">
              <CodeChefIcon className="w-5 h-5" />
              <span className="text-sm text-zinc-300 font-medium">CodeChef</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2">
              <CsesIcon className="w-5 h-5" />
              <span className="text-sm text-zinc-300 font-medium">CSES</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-6"
          >
            {session?.user ? (
              <Link href="/workspace">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white gap-2 rounded-full font-medium shadow-[0_0_30px_rgba(56,189,248,0.3)] border-0 transition-all">
                  Enter Workspace <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white gap-2 rounded-full font-medium shadow-[0_0_30px_rgba(56,189,248,0.3)] border-0 transition-all">
                  Sign Up Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full font-medium border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2">
              Install Extension
              <ChromeIcon className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xs text-zinc-500 flex items-center justify-center lg:justify-start gap-2"
          >
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> No credit card</span>
            <span>•</span>
            <span>Free forever</span>
            <span>•</span>
            <span>Open source</span>
          </motion.p>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
