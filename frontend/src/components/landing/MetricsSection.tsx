"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

export function MetricsSection() {
  return (
    <section id="metrics" className="relative w-full border-y border-zinc-800/50 bg-zinc-950/30">
      <div className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left"
        >
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Trusted By</p>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Programmers Everywhere</p>
        </motion.div>
        
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center group"
          >
            <div className="text-4xl md:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-400 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-700">
              <AnimatedCounter value={10000} suffix="+" />
            </div>
            <div className="text-sm font-medium text-zinc-400">Active Users</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center group"
          >
            <div className="text-4xl md:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all duration-700">
              <AnimatedCounter value={250000} suffix="+" />
            </div>
            <div className="text-sm font-medium text-zinc-400">Problems Solved</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center hidden md:block"
          >
            <div className="text-4xl md:text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400 mb-2">99.9%</div>
            <div className="text-sm font-medium text-zinc-400">Uptime</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
