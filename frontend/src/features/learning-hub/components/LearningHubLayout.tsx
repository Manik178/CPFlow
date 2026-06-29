"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningHubData } from "../types";
import { BookOpen, FileText, SplitSquareHorizontal, Link as LinkIcon, Library, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';

export function LearningHubLayout({ data, pid }: { data: LearningHubData; pid: string }) {
  // Extract sections
  const { overview, editorial, alternatives, similarProblems, resources } = data;

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-8">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <BookOpen className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="editorial" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <FileText className="w-4 h-4" /> Editorial
          </TabsTrigger>
          <TabsTrigger value="alternatives" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <SplitSquareHorizontal className="w-4 h-4" /> Alternatives
          </TabsTrigger>
          <TabsTrigger value="similar" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <LinkIcon className="w-4 h-4" /> Similar Problems
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
            <Library className="w-4 h-4" /> Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <p className="text-zinc-300 leading-relaxed">{overview.summary}</p>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3 text-emerald-400">Key Insight</h2>
                <p className="text-zinc-300 leading-relaxed">{overview.key_insight}</p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-medium text-zinc-400 mb-2 uppercase text-xs tracking-wider">Difficulty</h3>
                <div className="font-semibold text-lg">{overview.difficulty}</div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-medium text-zinc-400 mb-2 uppercase text-xs tracking-wider">Complexity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Time:</span>
                    <span className="font-mono text-blue-400">{overview.expected_time_complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Space:</span>
                    <span className="font-mono text-emerald-400">{overview.expected_space_complexity}</span>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-medium text-zinc-400 mb-3 uppercase text-xs tracking-wider">Concepts & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {overview.concepts.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                      {c}
                    </span>
                  ))}
                  {overview.tags.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editorial" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 prose prose-invert max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 selection:bg-yellow-400/30">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {editorial.markdown_content}
            </ReactMarkdown>
          </div>
        </TabsContent>

        <TabsContent value="alternatives" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            {alternatives.approaches.map((approach, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-400">{approach.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800/50">
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Complexity</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-zinc-400">Time:</span> <span className="font-mono text-zinc-200">{approach.time_complexity}</span></p>
                      <p><span className="text-zinc-400">Space:</span> <span className="font-mono text-zinc-200">{approach.space_complexity}</span></p>
                    </div>
                  </div>
                  <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800/50">
                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">When to use</h3>
                    <p className="text-sm text-zinc-300">{approach.when_to_use}</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2 text-zinc-200">Algorithm</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{approach.algorithm}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-4">
                    <h4 className="text-emerald-400 font-medium text-sm mb-2">Advantages</h4>
                    <p className="text-zinc-400 text-sm">{approach.advantages}</p>
                  </div>
                  <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium text-sm mb-2">Disadvantages</h4>
                    <p className="text-zinc-400 text-sm">{approach.disadvantages}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="similar" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarProblems.problems.map((prob, index) => (
              <a key={index} href={prob.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all rounded-xl p-5 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                        {prob.name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{prob.reasoning}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      {prob.platform}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${
                      prob.relation.toLowerCase() === 'easier' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      prob.relation.toLowerCase() === 'harder' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {prob.relation}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-4">
            {resources.resources.map((res, index) => (
              <a key={index} href={res.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                      {res.type.toLowerCase().includes("video") ? <Play className="w-4 h-4 text-rose-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors">{res.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{res.type}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Just an inline import for Play icon since I forgot it at the top
import { Play } from "lucide-react";
