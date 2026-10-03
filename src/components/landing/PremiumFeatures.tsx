"use client";

import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import Image from "next/image";
import React, { useRef } from "react";

// Helper component for individual horizontal stacking cards
function HorizontalStackCard({ 
  feature, 
  index, 
  scrollYProgress 
}: { 
  feature: any, 
  index: number, 
  scrollYProgress: MotionValue<number> 
}) {
  // Each card has a specific scroll range where it slides in from the right.
  // Card 0 is always there.
  // Card 1 slides in from 0.0 to 0.25
  // Card 2 slides in from 0.25 to 0.50
  // Card 3 slides in from 0.50 to 0.75
  // Card 4 slides in from 0.75 to 1.00
  
  const start = (index - 1) * 0.25;
  const end = index * 0.25;
  
  // If index is 0, it stays at 0vw forever.
  // Otherwise, it starts at 100vw (offscreen right) and slides to 0vw.
  const x = useTransform(
    scrollYProgress,
    [start, end],
    index === 0 ? ["0vw", "0vw"] : ["100vw", "0vw"]
  );

  return (
    <motion.div 
      style={{ x, zIndex: index }} 
      className="absolute inset-0 w-full h-full flex items-center justify-center px-4 sm:px-8 lg:px-12"
    >
      <div className="relative w-full max-w-[1000px] flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 lg:p-10 rounded-[32px] sm:rounded-[48px] bg-ivory-medium dark:bg-[#0a0a0a] transform-gpu">
        
        {/* The Centered Dynamic Heading */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 px-2 w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] sm:text-[13px] font-bold text-slate-400 dark:text-white/40">{feature.num}</span>
            <span className="w-6 sm:w-8 h-px bg-slate-300 dark:bg-white/20 hidden sm:block" />
          </div>
          <span className="px-2.5 py-1 rounded bg-clay/10 text-clay text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{feature.category}</span>
          <h3 className="font-serif text-[18px] sm:text-[24px] font-medium text-slate-900 dark:text-white">{feature.title}</h3>
        </div>

        {/* The Image */}
        <div className="relative w-full aspect-video rounded-xl sm:rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/5">
          <Image 
            src={feature.src} 
            alt={feature.title} 
            fill 
            className="object-contain sm:object-cover scale-[1.01]" 
            priority={index === 0} 
          />
        </div>
      </div>
    </motion.div>
  );
}

export function PremiumFeatures() {
  const features = [
    { src: "/images/feature-1.png", num: "01", category: "Workflow", title: "Email Automation" },
    { src: "/images/feature-2.png", num: "02", category: "Security", title: "Enterprise Grade" },
    { src: "/images/feature-3.png", num: "03", category: "Ingestion", title: "Bring Your Own Data" },
    { src: "/images/feature-4.png", num: "04", category: "Intelligence", title: "Beyond Transcripts" },
    { src: "/images/feature-5.png", num: "05", category: "Memory", title: "Global Knowledge Base" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section id="capabilities" className="w-full relative z-10 bg-transparent">
      {/* Section Header */}
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[120px] pb-[40px] flex flex-col items-center text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/50 dark:bg-white/5 border border-stone-200 dark:border-white/10 mb-8 w-fit shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-white/60">
            Sorcery Included
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-[56px] md:text-[72px] lg:text-[84px] leading-[1.05] tracking-tight text-slate-900 dark:text-white"
        >
          Intelligence that <br />
          <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-deep via-orange-400 to-clay-deep animate-[shimmer_4s_infinite] bg-[length:200%_auto]">
            works for you.
          </em>
        </motion.h2>
      </div>

      {/* HORIZONTAL STACKING WIPE */}
      <div ref={containerRef} className="relative h-[500vh] w-full">
        {/* Sticky viewport frame */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center pt-12">
          
          <div className="relative w-full h-full max-h-[900px]">
            {features.map((feature, index) => (
              <HorizontalStackCard 
                key={index} 
                feature={feature} 
                index={index} 
                scrollYProgress={scrollYProgress} 
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

