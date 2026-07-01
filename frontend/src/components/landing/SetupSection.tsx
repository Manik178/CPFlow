"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Download, Chrome, Server, Terminal, Rocket } from "lucide-react";
import { useRef } from "react";

export function SetupSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), { stiffness: 50, damping: 20 });

  const steps = [
    { num: 1, title: "Download Extension", desc: "Download the cpflow-extension.zip from our public directory and extract it.", icon: <Download className="w-5 h-5 text-zinc-900" />, color: "bg-emerald-400" },
    { num: 2, title: "Load in Chrome", desc: "Go to chrome://extensions, enable Developer Mode, and click 'Load unpacked'. Select the extracted folder.", icon: <Chrome className="w-5 h-5 text-zinc-900" />, color: "bg-blue-400" },
    { num: 3, title: "Deploy Backend", desc: "Host the FastAPI backend on Render or Railway, connected to a PostgreSQL database.", icon: <Server className="w-5 h-5 text-zinc-900" />, color: "bg-indigo-400" },
    { num: 4, title: "Start Execution Node", desc: "Run the Piston code execution engine via Docker on an AWS EC2 instance.", icon: <Terminal className="w-5 h-5 text-zinc-900" />, color: "bg-purple-400" },
    { num: 5, title: "Ready to Code", desc: "Visit any supported platform, authenticate, and you're good to go!", icon: <Rocket className="w-5 h-5 text-zinc-900" />, color: "bg-teal-400" }
  ];

  return (
    <section ref={containerRef} id="how-to-setup" className="relative w-full py-24 bg-zinc-950">
      <div className="px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight text-white mb-4">
          How to Setup
        </h2>
        <p className="text-zinc-400">Deploy your own self-hosted competitive programming environment in 5 simple steps.</p>
      </div>

      <div className="relative">
        {/* Background Dashed Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2 md:translate-x-0 hidden md:block" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-8 md:left-1/2 top-0 w-px bg-gradient-to-b from-emerald-400 via-blue-500 to-purple-500 -translate-x-1/2 md:translate-x-0 hidden md:block" 
          style={{ height: lineHeight }} 
        />

        <div className="space-y-12 md:space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const threshold = (index + 0.5) / steps.length;
            // When scrollYProgress crosses the threshold, the node lights up
            const opacity = useTransform(scrollYProgress, [threshold - 0.1, threshold], [0.3, 1]);
            const scale = useTransform(scrollYProgress, [threshold - 0.1, threshold], [0.8, 1]);

            return (
              <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Connecting Node */}
                <motion.div 
                  style={{ opacity, scale }}
                  className="absolute left-8 md:left-1/2 -translate-x-1/2 md:translate-x-0 w-12 h-12 rounded-full border-[4px] border-zinc-950 flex items-center justify-center z-10 bg-zinc-900 hidden md:flex"
                >
                  <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                    {step.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className={`flex-1 w-full text-left ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 bg-zinc-900 border border-zinc-800 text-lg font-bold text-white md:hidden`}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-zinc-400">{step.desc}</p>
                </motion.div>
                
                <div className="flex-1 hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
