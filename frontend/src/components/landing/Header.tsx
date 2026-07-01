"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticWrapper } from "./MagneticWrapper";

const GithubIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export function Header({ session }: { session: any }) {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(9,9,11,0.6)"]);
  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);
  const border = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.05)"]);
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ background, backdropFilter: backdropBlur, borderBottomColor: border, borderBottomWidth: "1px" }}
      className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-6 md:px-12 py-4"
    >
      <div className="flex items-center gap-2 font-outfit font-bold text-xl group cursor-pointer">
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
          <Code2 className="w-6 h-6 text-emerald-400" />
        </motion.div>
        <span className="text-white">CPFlow</span>
      </div>
      
      <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        <Link href="#how-to-setup" className="hover:text-white transition-colors">Setup</Link>
        <Link href="#metrics" className="hover:text-white transition-colors">Metrics</Link>
        <Link href="#why-cpflow" className="hover:text-white transition-colors">Why CPFlow</Link>
        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
      </nav>

      <div className="flex items-center gap-4">
        <MagneticWrapper strength={0.1}>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Star on GitHub</span>
            <span className="text-zinc-500">1.2k</span>
          </a>
        </MagneticWrapper>
        {session?.user ? (
          <MagneticWrapper>
            <Link href="/dashboard">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </MagneticWrapper>
        ) : (
          <div className="flex items-center gap-4">
            <MagneticWrapper strength={0.1}>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Log in
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link href="/login">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                  Sign Up <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </MagneticWrapper>
          </div>
        )}
      </div>
    </motion.header>
  );
}
