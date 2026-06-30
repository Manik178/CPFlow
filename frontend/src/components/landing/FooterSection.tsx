"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticWrapper } from "./MagneticWrapper";
import { useRef } from "react";

export function FooterSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.5]);
  const yOffset = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <footer ref={containerRef} className="relative border-t border-zinc-800/50 bg-zinc-950 overflow-hidden">
      {/* Dynamic Aurora Glow */}
      <motion.div 
        style={{ opacity: glowOpacity }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-t from-blue-600/20 via-emerald-500/10 to-transparent blur-[100px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative z-10">
        <motion.div 
          style={{ y: yOffset }}
          className="flex flex-col items-center text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800/50 text-xs font-medium text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            BETA ACCESS OPEN
          </div>
          <h2 className="text-4xl md:text-6xl font-outfit font-bold tracking-tight text-white mb-6">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">level up?</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mb-10">
            Join thousands of competitive programmers who have already made the switch. 
            Experience the ultimate coding environment today.
          </p>
          <MagneticWrapper strength={0.2}>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all">
                Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </MagneticWrapper>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-zinc-800/50">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-outfit font-bold text-xl mb-4 group cursor-pointer w-max">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Code2 className="w-6 h-6 text-emerald-400" />
              </motion.div>
              <span className="text-white">CPFlow</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              The operating system for competitive programming. Built for speed, focused on learning.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Workspace</Link></MagneticWrapper></li>
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">AI Learning</Link></MagneticWrapper></li>
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Analytics</Link></MagneticWrapper></li>
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Extension</Link></MagneticWrapper></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></MagneticWrapper></li>
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></MagneticWrapper></li>
              <li><MagneticWrapper strength={0.1} className="inline-block"><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></MagneticWrapper></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>© 2026 CPFlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <MagneticWrapper strength={0.2}><Link href="#" className="hover:text-white transition-colors">Twitter</Link></MagneticWrapper>
            <MagneticWrapper strength={0.2}><Link href="#" className="hover:text-white transition-colors">GitHub</Link></MagneticWrapper>
            <MagneticWrapper strength={0.2}><Link href="#" className="hover:text-white transition-colors">Discord</Link></MagneticWrapper>
          </div>
        </div>
      </div>
    </footer>
  );
}
