"use client";

import { motion, useScroll, useTransform } from "motion/react";
import React, { useRef } from "react";
import Image from "next/image";

export function ArjunaParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax the image slowly downwards as the user scrolls down
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  // Fade in and out the text as it reaches the center
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.9, 1, 1.1]);

  return (
    <section ref={containerRef} className="relative w-full h-[120vh] bg-black overflow-hidden flex items-center justify-center">
      
      {/* The Parallax Image */}
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[140%] -top-[20%] z-0">
        <Image
          src="/images/arjuna.png"
          alt="Arjuna's Focus"
          fill
          className="object-cover opacity-40 dark:opacity-30 grayscale mix-blend-luminosity"
          priority
        />
        {/* Subtle vignette / gradient overlays to blend the image into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      </motion.div>

      {/* The Text Content */}
      <motion.div style={{ opacity, scale }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-[800px]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-clay-light">
            Absolute Focus
          </span>
        </div>
        
        <h2 className="font-serif text-[42px] md:text-[64px] lg:text-[84px] leading-[1.05] tracking-tight text-white mb-8 drop-shadow-2xl">
          Don't look at the leaves. <br />
          <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-deep via-orange-400 to-clay-light">
            See the target.
          </em>
        </h2>
        
        <p className="font-sans text-[18px] md:text-[22px] leading-[1.6] text-white/60 drop-shadow-lg max-w-[600px]">
          Like Arjuna's legendary focus, Smriti ignores the noise of your meetings and locks onto the exact insights, buying signals, and next steps you need to win.
        </p>
      </motion.div>
      
    </section>
  );
}
