"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Code2, Sparkles, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.3 }}
      className="flex-1 w-full max-w-lg lg:max-w-none relative z-10 perspective-[1000px] group"
    >
      <motion.div 
        animate={{ y: [0, -10, 0], rotateX: [2, 4, 2], rotateY: [-4, -2, -4] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="relative w-full aspect-[4/3] rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 shadow-[0_0_100px_rgba(59,130,246,0.15)]"
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col">
          {/* Mockup Header */}
          <div className="h-10 border-b border-zinc-800/80 flex items-center px-4 gap-2 bg-zinc-900/50">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
            <div className="mx-auto bg-zinc-800/50 text-[10px] text-zinc-400 px-3 py-1 rounded-md flex items-center gap-2">
              <Code2 className="w-3 h-3 text-blue-400" /> Two Sum
            </div>
          </div>
          
          {/* Mockup Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 p-6 relative bg-[#1e1e1e] font-mono text-[10px] leading-relaxed">
              <div className="text-blue-400">class <span className="text-emerald-400">Solution</span> {'{'}</div>
              <div className="text-blue-400 ml-4">public:</div>
              <div className="text-emerald-400 ml-8">vector&lt;int&gt; <span className="text-yellow-200">twoSum</span>(vector&lt;int&gt;& nums, int target) {'{'}</div>
              
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: step >= 1 ? 1 : 0, height: step >= 1 ? "auto" : 0 }}
                className="text-zinc-500 ml-12"
              >
                // Optimal solution using hash map
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: step >= 2 ? 1 : 0, height: step >= 2 ? "auto" : 0 }}
              >
                <div className="text-zinc-300 ml-12">unordered_map&lt;int, int&gt; mp;</div>
                <div className="text-zinc-300 ml-12"><span className="text-purple-400">for</span>(int i = 0; i &lt; nums.size(); i++) {'{'}</div>
                <div className="text-zinc-300 ml-16">int comp = target - nums[i];</div>
                <div className="text-zinc-300 ml-16"><span className="text-purple-400">if</span>(mp.count(comp)) <span className="text-purple-400">return</span> {'{'}mp[comp], i{'}'};</div>
                <div className="text-zinc-300 ml-16">mp[nums[i]] = i;</div>
                <div className="text-zinc-300 ml-12">{'}'}</div>
              </motion.div>
  
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 1 ? 1 : 0 }}
                className="text-purple-400 ml-12 mt-1"
              >
                {step >= 1 && step < 2 && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>}
              </motion.div>
  
              <div className="text-emerald-400 ml-8">{'}'}</div>
              <div className="text-blue-400">{'}'};</div>
            </div>
            
            {/* Output Panel Right */}
            <div className="w-2/5 border-l border-zinc-800/80 bg-zinc-900/50 p-4 flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                  {step >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-zinc-700" />}
                  {step >= 3 ? "Accepted" : "Testing..."}
                </span>
              </div>
              
              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {step >= 3 && (
                    <>
                      {[1, 2, 3].map((tc) => (
                        <motion.div
                          key={tc}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: tc * 0.1 }}
                          className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-lg"
                        >
                          <span className="text-[10px] text-zinc-400 font-medium">Testcase {tc}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]">Passed</span>
                        </motion.div>
                      ))}
                    </>
                  )}
                  
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[10px] text-zinc-400 mt-10 justify-center"
                    >
                      <div className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                      Running code...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${step >= 4 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
              >
                {step >= 4 ? "Submit to Codeforces" : "Run Code"}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Floating badges on mockup - outside of overflow-hidden */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
          className="absolute -left-12 top-1/3 bg-blue-950/80 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col items-center gap-2 z-20"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[10px] font-medium text-blue-200">AI Powered</span>
        </motion.div>

        <motion.div 
          animate={{ x: [0, 10, 0], rotate: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
          className="absolute -right-8 top-12 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 px-4 py-2 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-2 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-200">Realtime Sync</span>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
          className="absolute left-1/4 -bottom-6 bg-purple-950/80 backdrop-blur-md border border-purple-500/30 px-4 py-2 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center gap-2 z-20"
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-medium text-purple-200">Auto Save</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
