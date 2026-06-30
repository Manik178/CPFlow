"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is CPFlow completely free?",
    answer: "Yes! CPFlow is completely free and open-source. There are no paywalls or premium tiers for standard competitive programming features."
  },
  {
    question: "Which platforms are supported?",
    answer: "Currently, CPFlow officially supports Codeforces and CSES. We are actively working on adding support for CodeChef, LeetCode, and AtCoder in future updates."
  },
  {
    question: "How does the browser extension work?",
    answer: "The Chrome extension acts as a bridge. When you open a problem on a supported platform, the extension extracts the problem statement, test cases, and time limits, and securely syncs them to your CPFlow dashboard."
  },
  {
    question: "Can I use CPFlow offline?",
    answer: "Yes. Once a problem is loaded into your workspace, all your code is saved locally using IndexedDB. You can continue writing and testing code even if you lose internet connection, and it will sync once you are back online."
  },
  {
    question: "What languages are supported in the editor?",
    answer: "The built-in Monaco editor currently supports C++, Python, Java, and JavaScript/TypeScript. We provide syntax highlighting and auto-completion for all supported languages."
  }
];

function FAQItem({ faq, isOpen, onClick }: { faq: typeof faqs[0], isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-zinc-800/50 last:border-b-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-white"
      >
        <span className="text-base font-medium text-zinc-200">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-zinc-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-zinc-400">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative w-full py-24 border-t border-zinc-800/50 bg-zinc-950/30">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400">Everything you need to know about the platform.</p>
        </div>
        
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 px-6 py-2">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              faq={faq} 
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
