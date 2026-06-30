"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Code2, Brain, BarChart3, Target, Send, Layers, CheckCircle2 } from "lucide-react";
import { CodeforcesIcon, CodeChefIcon, CsesIcon } from "@/components/icons/PlatformIcons";
import { useState, useEffect } from "react";

function FeatureCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      className={`group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center text-center overflow-hidden ${className}`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  const [typingStep, setTypingStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTypingStep(p => (p + 1) % 4);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section id="features" className="relative w-full py-24">
      <div className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-900/30 text-xs font-medium text-emerald-400 mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Powerful Features
        </div>
        <h2 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-white mb-4">
          Everything <span className="text-emerald-400">you need</span>.<br />
          Nothing <span className="text-blue-400">you don't</span>.
        </h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Unified Workspace */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Unified Workspace</h3>
            <p className="text-sm text-zinc-400 mb-6">A distraction-free IDE built for speed and focus.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 overflow-hidden relative text-left">
              <div className="w-full h-full opacity-30 bg-[linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:10px_10px] absolute inset-0" />
              <div className="relative font-mono text-[10px] text-zinc-400">
                <span className="text-purple-400">void</span> <span className="text-blue-400">solve</span>() {'{'}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingStep >= 1 ? 1 : 0 }} className="ml-4 text-emerald-400">int n;</motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingStep >= 2 ? 1 : 0 }} className="ml-4 text-emerald-400">cin &gt;&gt; n;</motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingStep >= 3 ? 1 : 0 }} className="ml-4 text-zinc-500">// optimal approach</motion.div>
                {'}'}
              </div>
            </div>
          </motion.div>
        </FeatureCard>

        {/* AI Learning Hub */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Learning Hub</h3>
            <p className="text-sm text-zinc-400 mb-6">AI-generated editorials, hints, and explanations that actually teach.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-4 relative">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-medium text-purple-300">AI Explanation</span>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-auto" />
              </div>
              <div className="space-y-2">
                <motion.div animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-1.5 bg-zinc-700 rounded-full" />
                <motion.div animate={{ width: ["0%", "80%"] }} transition={{ duration: 2, delay: 0.2, repeat: Infinity, ease: "linear" }} className="h-1.5 bg-zinc-700 rounded-full" />
                <motion.div animate={{ width: ["0%", "60%"] }} transition={{ duration: 2, delay: 0.4, repeat: Infinity, ease: "linear" }} className="h-1.5 bg-zinc-700 rounded-full" />
              </div>
            </div>
          </motion.div>
        </FeatureCard>

        {/* Smart Analytics */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-sm text-zinc-400 mb-6">Track your progress across platforms with beautiful insights.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-4 relative flex items-end overflow-hidden">
              <motion.svg viewBox="0 0 100 40" className="w-full h-16 fill-none stroke-emerald-500 stroke-2">
                <motion.path 
                  d="M0,30 C20,30 30,10 50,20 C70,30 80,5 100,10" 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.svg>
              <div className="absolute inset-x-4 bottom-4 h-16 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-50" />
            </div>
          </motion.div>
        </FeatureCard>

        {/* Problem Capture */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Problem Capture</h3>
            <p className="text-sm text-zinc-400 mb-6">One click from any platform. We fetch everything.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-4 relative flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(56,189,248,0)", "0 0 20px rgba(56,189,248,0.3)", "0 0 0px rgba(56,189,248,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-3"
              >
                <CodeforcesIcon className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-zinc-500">Codeforces</span>
                  <span className="text-xs font-medium text-zinc-300">Two Sum</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </FeatureCard>

        {/* Seamless Submissions */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/50 border border-indigo-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Seamless Submissions</h3>
            <p className="text-sm text-zinc-400 mb-6">Submit directly from CPFlow. Fast. Reliable. Effortless.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-4 flex flex-col gap-3 justify-center pl-10">
              <motion.div animate={{ opacity: typingStep >= 1 ? 1 : 0.2 }} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
                <span className="text-[10px] text-zinc-400">Compiling...</span>
              </motion.div>
              <motion.div animate={{ opacity: typingStep >= 2 ? 1 : 0.2 }} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                <span className="text-[10px] text-zinc-400">Running Tests...</span>
              </motion.div>
              <motion.div animate={{ opacity: typingStep >= 3 ? 1 : 0.2, scale: typingStep >= 3 ? [0.9, 1.1, 1] : 1 }} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-400 font-medium drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Accepted</span>
              </motion.div>
            </div>
          </motion.div>
        </FeatureCard>

        {/* Cross Platform */}
        <FeatureCard>
          <motion.div variants={item} className="flex flex-col items-center h-full w-full relative z-10">
            <div className="w-12 h-12 rounded-xl bg-pink-950/50 border border-pink-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Cross Platform</h3>
            <p className="text-sm text-zinc-400 mb-6">Works across Codeforces, CodeChef, and CSES.</p>
            <div className="mt-auto w-full h-32 rounded-lg bg-zinc-950 border border-zinc-800/80 p-4 flex flex-col justify-center gap-3">
               <motion.div animate={{ x: typingStep === 1 ? 5 : 0 }} className="h-6 w-full bg-zinc-900 rounded border border-zinc-800/50 flex items-center px-3 gap-2">
                  <CodeforcesIcon className="w-3.5 h-3.5" /> <span className="text-[10px] text-zinc-500 font-medium uppercase">Codeforces</span>
               </motion.div>
               <motion.div animate={{ x: typingStep === 2 ? 5 : 0 }} className="h-6 w-full bg-zinc-900 rounded border border-zinc-800/50 flex items-center px-3 gap-2">
                  <CodeChefIcon className="w-3.5 h-3.5" /> <span className="text-[10px] text-zinc-500 font-medium uppercase">CodeChef</span>
               </motion.div>
               <motion.div animate={{ x: typingStep === 3 ? 5 : 0 }} className="h-6 w-full bg-zinc-900 rounded border border-zinc-800/50 flex items-center px-3 gap-2">
                  <CsesIcon className="w-3.5 h-3.5" /> <span className="text-[10px] text-zinc-500 font-medium uppercase">CSES</span>
               </motion.div>
            </div>
          </motion.div>
        </FeatureCard>

      </motion.div>
      </div>
    </section>
  );
}
