"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  suffix = "" 
}: { 
  value: number; 
  duration?: number; 
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, {
    damping: 60,
    stiffness: 100,
  });
  
  const display = useTransform(spring, (current) => {
    if (current >= 1000) {
      return (current / 1000).toFixed(0) + "K" + suffix;
    }
    return Math.floor(current) + suffix;
  });

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}
