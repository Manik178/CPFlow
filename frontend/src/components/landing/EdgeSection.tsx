"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle2, Code2, Sparkles, TerminalSquare, Server, Database, Cloud } from "lucide-react";
import { CodeforcesIcon, CodeChefIcon } from "@/components/icons/PlatformIcons";
import { useRef } from "react";

export function EdgeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const features = [
    "Blazing fast performance",
    "Offline support via IndexedDB",
    "Real-time LangGraph sync",
    "Redis-powered caching",
    "Global edge network",
    "Zero-config setup"
  ];

  return (
    <section id="why-cpflow" ref={containerRef} className="relative w-full border-t border-zinc-800/50 bg-zinc-950/30 overflow-hidden">
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/30 border border-blue-900/30 text-xs font-medium text-blue-400 mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Infrastructure
          </div>
          <h2 className="text-3xl md:text-5xl font-outfit font-bold tracking-tight text-white mb-6">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">speed</span>.<br />
            Powered by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">edge</span>.
          </h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-xl">
            CPFlow is architected like a modern operating system. Everything happens instantly. Background syncing ensures you never lose a line of code.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-zinc-300 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full relative h-[500px]">
          {/* Floating Widgets with Parallax */}
          
          {/* Heatmap Widget */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute top-10 right-0 md:right-10 w-64 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-2xl z-20"
          >
            <div className="text-xs font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" /> Redis Cache
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Hit Rate</span>
                <span className="text-emerald-400">99.8%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "99.8%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-emerald-500" 
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 mt-2">
                <span>Latency</span>
                <span className="text-emerald-400">2ms</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Widget */}
          <motion.div 
            style={{ y: y2 }}
            className="absolute top-1/2 -translate-y-1/2 left-0 w-72 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-2xl z-30"
          >
            <div className="text-xs font-medium text-zinc-400 mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-500" /> Cloud Sync
            </div>
            <div className="space-y-3">
              {[
                { title: "Codeforces Round 957", time: "Just now", icon: <CodeforcesIcon className="w-4 h-4" /> },
                { title: "CodeChef Starters 80", time: "2m ago", icon: <CodeChefIcon className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900/50 transition-colors">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-zinc-200">{item.title}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Terminal Widget */}
          <motion.div 
            style={{ y: y3 }}
            className="absolute bottom-10 right-10 md:right-20 w-56 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-800/80 pb-2">
              <TerminalSquare className="w-4 h-4 text-zinc-400" />
              <div className="text-xs font-mono text-zinc-400">system_status</div>
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex gap-2">
                <span className="text-emerald-400">➜</span>
                <span className="text-zinc-300">ping edge-router</span>
              </div>
              <div className="text-zinc-500">64 bytes from cpflow.edge: time=12ms</div>
              <div className="text-zinc-500">64 bytes from cpflow.edge: time=11ms</div>
              <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="flex gap-2">
                <span className="text-emerald-400">➜</span>
                <span className="w-2 h-3 bg-zinc-400" />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
