"use client";

import { motion } from "motion/react";
import React from "react";

// ─── Direction 1: The "Linear / Vercel" Vibe (Technical Wireframe) ──────────

function TechnicalBentoCard({ 
  children, 
  className, 
  visual: VisualComponent, 
  tagText, 
  tagColor 
}: { 
  children: React.ReactNode, 
  className?: string, 
  visual: React.ElementType, 
  tagText: string, 
  tagColor: string 
}) {
  return (
    <div className={`group relative bg-white border border-stone-200 rounded-[20px] overflow-hidden hover:border-stone-300 transition-colors duration-300 flex flex-col shadow-sm ${className}`}>
      {/* Visual Canvas */}
      <div className="relative w-full h-[60%] min-h-[280px] bg-stone-50 border-b border-stone-100 overflow-hidden flex items-center justify-center">
        {/* Technical dot grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        <VisualComponent />
      </div>

      {/* Content Area */}
      <div className="relative z-20 w-full px-8 pb-10 pt-8 flex flex-col justify-end bg-white flex-1">
        <div className="mb-4 flex">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100 border border-stone-200">
            <span className={`w-1.5 h-1.5 rounded-full ${tagColor}`} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">{tagText}</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Technical Visuals ───────────────────────────────────────────────────────

const TechnicalSecurityVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-8">
    {/* Wireframe Vault/Shield */}
    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
      
      {/* Rotating dashed rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-dashed border-orange-300 rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-6 border border-orange-200 rounded-full"
      />
      <div className="absolute inset-12 border border-dashed border-stone-200 rounded-full" />

      {/* Center Shield Icon */}
      <div className="relative z-10 flex flex-col items-center justify-center bg-white w-16 h-16 rounded-full border border-stone-200 shadow-sm">
         <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
           <path strokeLinecap="square" strokeLinejoin="miter" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
         </svg>
      </div>

      {/* Micro-copy tags */}
      <div className="absolute top-2 right-2 bg-orange-50 text-orange-600 font-mono text-[9px] px-2 py-0.5 border border-orange-100 tracking-widest uppercase rounded shadow-sm">
        ISOLATED
      </div>
      <div className="absolute bottom-2 left-2 bg-white text-stone-500 font-mono text-[9px] px-2 py-0.5 border border-stone-200 tracking-widest uppercase rounded shadow-sm">
        AES-256-GCM
      </div>
    </div>
  </div>
);

const TechnicalTrustVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-8">
    {/* Node Connection Graph */}
    <div className="w-full max-w-[260px] h-[160px] relative border border-stone-200 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest">TRACE_NODE</span>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center mt-4">
         <svg className="w-full h-full" viewBox="0 0 260 140" fill="none">
           {/* Animated connection path */}
           <motion.path 
             d="M 40 70 C 100 70, 120 40, 200 40" 
             stroke="#06b6d4" 
             strokeWidth="1.5" 
             strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           />
           {/* Secondary static paths */}
           <path d="M 40 70 C 100 70, 100 100, 160 100" stroke="#e7e5e4" strokeWidth="1" />
           <path d="M 120 40 L 160 20" stroke="#e7e5e4" strokeWidth="1" />
           
           {/* Nodes */}
           <circle cx="40" cy="70" r="4" fill="#06b6d4" />
           <circle cx="200" cy="40" r="4" fill="#06b6d4" />
           <circle cx="160" cy="100" r="3" fill="#a8a29e" />
           <circle cx="160" cy="20" r="3" fill="#a8a29e" />
         </svg>
      </div>
      
      <div className="absolute bottom-3 right-3 bg-cyan-50 text-cyan-600 font-mono text-[9px] px-2 py-0.5 border border-cyan-100 tracking-widest uppercase rounded">
        SRC_0X89
      </div>
    </div>
  </div>
);

const TechnicalAudioVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    {/* Oscilloscope */}
    <div className="w-full h-full relative flex items-center">
       {/* Background grid lines */}
       <div className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none">
         <div className="w-full h-px bg-stone-200/60" />
         <div className="w-full h-px bg-stone-200/60" />
         <div className="w-full h-px bg-stone-200/60" />
         <div className="w-full h-px bg-stone-200/60" />
       </div>

       {/* Animated Sine Waves */}
       <div className="relative w-full h-[120px] px-4 flex items-center">
         <svg className="w-full h-full" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
            <motion.path 
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ d: "M 0 60 Q 20 20, 40 60 T 80 60 T 120 60 T 160 60 T 200 60 T 240 60 T 280 60 T 320 60 T 360 60 T 400 60" }}
              animate={{ d: [
                "M 0 60 Q 20 20, 40 60 T 80 60 T 120 60 T 160 60 T 200 60 T 240 60 T 280 60 T 320 60 T 360 60 T 400 60",
                "M 0 60 Q 30 100, 60 60 T 120 60 T 180 60 T 240 60 T 300 60 T 360 60 T 420 60",
                "M 0 60 Q 15 40, 30 60 T 60 60 T 90 60 T 120 60 T 150 60 T 180 60 T 210 60 T 240 60 T 270 60 T 300 60 T 330 60 T 360 60 T 390 60 T 420 60",
                "M 0 60 Q 20 20, 40 60 T 80 60 T 120 60 T 160 60 T 200 60 T 240 60 T 280 60 T 320 60 T 360 60 T 400 60"
              ]}}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            {/* Faint secondary wave */}
            <motion.path 
              stroke="#d8b4fe"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ d: "M 0 60 Q 30 100, 60 60 T 120 60 T 180 60 T 240 60 T 300 60 T 360 60 T 420 60" }}
              animate={{ d: [
                "M 0 60 Q 30 100, 60 60 T 120 60 T 180 60 T 240 60 T 300 60 T 360 60 T 420 60",
                "M 0 60 Q 20 20, 40 60 T 80 60 T 120 60 T 160 60 T 200 60 T 240 60 T 280 60 T 320 60 T 360 60 T 400 60",
                "M 0 60 Q 30 100, 60 60 T 120 60 T 180 60 T 240 60 T 300 60 T 360 60 T 420 60"
              ]}}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
         </svg>
       </div>
       
       <div className="absolute top-6 left-6 font-mono text-[9px] text-purple-500 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded shadow-sm border border-purple-100">
         FREQ_14.2kHz
       </div>
    </div>
  </div>
);

// ─── Main Section ────────────────────────────────────────────────────────────

export function PremiumBento() {
  return (
    <section id="why" className="w-full relative z-10 bg-white border-t border-stone-200">
      
      <div className="w-full max-w-[1300px] mx-auto px-6 py-[120px] flex flex-col">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20 relative z-20 max-w-[800px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-stone-100 border border-stone-200 mb-6 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Technical Architecture
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-[56px] md:text-[76px] leading-[1.05] tracking-tight text-slate-900"
          >
            Engineered for <br />
            <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-deep to-orange-400">
              absolute precision.
            </em>
          </motion.h2>
        </div>
        
        {/* Technical Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          
          {/* Card 1 - Secure (Large) */}
          <div className="lg:col-span-2 relative">
            <TechnicalBentoCard 
              tagText="Data Vault"
              tagColor="bg-orange-500"
              className="h-full min-h-[500px]"
              visual={TechnicalSecurityVisual}
            >
              <h3 className="font-serif text-[32px] md:text-[36px] font-semibold text-slate-900 leading-tight mb-4">
                Fiercely protected isolation.
              </h3>
              <p className="font-sans text-[16px] leading-[1.6] text-slate-500 max-w-[480px]">
                Every byte of your conversational data is firewalled in a single-tenant architecture. We never train public models on your proprietary memory.
              </p>
            </TechnicalBentoCard>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Card 2 - Trustworthy */}
            <TechnicalBentoCard 
              tagText="Citations"
              tagColor="bg-cyan-500"
              className="flex-1 min-h-[400px]"
              visual={TechnicalTrustVisual}
            >
              <h3 className="font-serif text-[26px] md:text-[28px] font-semibold text-slate-900 leading-tight mb-3">
                Grounded in reality.
              </h3>
              <p className="font-sans text-[15px] leading-[1.6] text-slate-500">
                Citations link every insight directly back to the exact moment in the transcript. No hallucinations, just facts.
              </p>
            </TechnicalBentoCard>

            {/* Card 3 - Reliable */}
            <TechnicalBentoCard 
              tagText="Speech Engine"
              tagColor="bg-purple-500"
              className="flex-1 min-h-[400px]"
              visual={TechnicalAudioVisual}
            >
              <h3 className="font-serif text-[26px] md:text-[28px] font-semibold text-slate-900 leading-tight mb-3">
                Never miss a detail.
              </h3>
              <p className="font-sans text-[15px] leading-[1.6] text-slate-500">
                Our custom speech models catch whispers, cross-talk, and mumbled action items with superhuman precision.
              </p>
            </TechnicalBentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
