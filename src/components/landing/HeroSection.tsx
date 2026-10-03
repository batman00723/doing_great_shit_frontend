"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { springCalm, hoverScale, tapScale } from "@/lib/animations";

// Split text into words/characters for staggered animation
const splitText = (text: string) => {
  return text.split("").map((char, index) => (
    <motion.span
      key={index}
      className="inline-block"
      variants={{
        hidden: { opacity: 0, y: 50, rotateX: -40, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" },
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 1 }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));
};

// Magnetic button
function MagneticButton({ children, className, href }: { children: React.ReactNode, className: string, href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative z-10"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

// Floating Badge
function FloatingBadge({ delay, className, children, initialY, initialX }: { delay: number, className: string, children: React.ReactNode, initialY: number, initialX: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: initialY + 40, x: initialX }}
      animate={{ opacity: 1, scale: 1, y: initialY, x: initialX }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute hidden md:flex items-center gap-2 backdrop-blur-md bg-white/70 dark:bg-white/10 border border-white/50 dark:border-white/20 shadow-2xl p-3 rounded-2xl z-20 transition-colors duration-500 ${className}`}
    >
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
        className="flex items-center gap-3 w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function DeckPaper({ children, rest, hover }: { children: React.ReactNode, rest: any, hover: any }) {
  return (
    <motion.div
      variants={{
        rest: { ...rest, boxShadow: "0 20px 40px rgba(0,0,0,0.05)", transition: { type: "spring", stiffness: 350, damping: 30 } },
        hover: { ...hover, boxShadow: "0 40px 80px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 350, damping: 30 } }
      }}
      className="absolute w-[90%] sm:w-[75%] max-w-[800px] aspect-[16/9.9] rounded-[24px] border border-stone/20 dark:border-white/10 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-3xl overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform-gpu transition-colors duration-500"
    >
       <div className="h-8 sm:h-10 border-b border-stone/10 dark:border-white/10 bg-white/40 dark:bg-white/5 flex items-center px-4 gap-2 shrink-0 backdrop-blur-md transition-colors duration-500">
          <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
       </div>
       {children}
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section ref={containerRef} className="relative z-10 w-full mx-auto pt-[40px] lg:pt-[60px] pb-[120px] flex flex-col items-center justify-center overflow-visible perspective-[2000px] min-h-screen">
      
      {/* Floating UI Elements */}

      <motion.div style={{ y, opacity }} className="flex flex-col items-center text-center max-w-[900px] px-6 relative z-10">
        
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 mb-10 w-fit transition-colors duration-500"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white transition-colors duration-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-white/60 transition-colors duration-500">
            Smriti
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } }
          }}
          className="font-anthropic-serif text-[72px] sm:text-[88px] md:text-[110px] leading-[1] tracking-tight text-slate-dark dark:text-white transition-colors duration-500 mb-10 flex flex-col items-center"
        >
          <span className="flex overflow-hidden pb-4">
            {splitText("Unfair advantage")}
          </span>
          <span className="flex overflow-hidden pb-6">
            <span className="mr-4">{splitText("on")}</span>
            <em className="italic font-normal relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-clay-deep via-clay to-clay-deep bg-300% animate-gradient">
                {splitText("every call.")}
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 w-full h-[2px] bg-clay/30 origin-left"
              />
            </em>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-anthropic-sans text-[18px] md:text-[22px] leading-[1.6] text-slate-dark/70 dark:text-white/70 transition-colors duration-500 max-w-[640px] mb-14"
        >
          We listen to your meetings so you don't have to. Never drop the ball on a client promise again.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-5 items-center mt-2"
        >
          <MagneticButton href="/register" className="relative group overflow-hidden inline-flex items-center justify-center font-anthropic-sans font-semibold text-[17px] sm:text-[18px] text-white px-12 py-5 sm:py-6 rounded-full bg-gradient-to-b from-[#2e2e2d] to-[#1a1a19] shadow-[0_8px_30px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#3e3e3c] hover:shadow-[0_12px_40px_rgba(200,100,80,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-clay transition-all duration-500 hover:-translate-y-0.5">
            <span className="relative z-10 flex items-center tracking-wide">
              Give it a spin
              <motion.svg
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-5 h-5 ml-3 text-white/50 group-hover:text-clay-light transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </MagneticButton>
          
          <MagneticButton href="/login" className="inline-flex items-center justify-center font-anthropic-sans font-semibold text-[17px] sm:text-[18px] text-slate-dark dark:text-white transition-colors duration-500 px-12 py-5 sm:py-6 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white dark:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white dark:hover:bg-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-500">
            Hop back in
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll-Driven Newspaper Stack */}
      <StickyNewspaperStack />

    </section>
  );
}

function StickyNewspaperStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Paper 1 (Top) leaves
  const p1Y = useTransform(scrollYProgress, [0, 0.25], [0, -1000]);
  const p1Rotate = useTransform(scrollYProgress, [0, 0.25], [0, -10]);
  const p1Opacity = useTransform(scrollYProgress, [0.15, 0.25], [1, 0]);

  // Paper 2 entrance & leave
  const p2Scale = useTransform(scrollYProgress, [0, 0.25], [0.95, 1]);
  const p2BaseRotate = useTransform(scrollYProgress, [0, 0.25], [-2, 0]);
  const p2Y = useTransform(scrollYProgress, [0.33, 0.58], [0, -1000]);
  const p2Rotate = useTransform(scrollYProgress, [0.33, 0.58], [0, 10]);
  const p2Opacity = useTransform(scrollYProgress, [0.48, 0.58], [1, 0]);
  
  // Paper 3 entrance & leave
  const p3Scale = useTransform(scrollYProgress, [0.33, 0.58], [0.9, 1]);
  const p3BaseRotate = useTransform(scrollYProgress, [0.33, 0.58], [2, 0]);
  const p3Y = useTransform(scrollYProgress, [0.66, 0.91], [0, -1000]);
  const p3Rotate = useTransform(scrollYProgress, [0.66, 0.91], [0, -10]);
  const p3Opacity = useTransform(scrollYProgress, [0.81, 0.91], [1, 0]);

  // Paper 4 (Bottom) entrance
  const p4Scale = useTransform(scrollYProgress, [0.66, 0.91], [0.85, 1]);
  const p4BaseRotate = useTransform(scrollYProgress, [0.66, 0.91], [-2, 0]);

  return (
    <div ref={containerRef} className="w-full h-[400vh] relative z-20 mt-12 sm:mt-24">
      <div className="sticky top-0 w-full h-screen flex justify-center items-center overflow-hidden px-6 perspective-[2000px]">
        
        <div className="relative w-full max-w-[1000px] aspect-[16/9.9] max-h-[80vh] flex justify-center items-center">
          
          {/* Paper 4 (Bottom) */}
          <motion.div
            style={{ scale: p4Scale, rotate: p4BaseRotate, zIndex: 10 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform-gpu overflow-hidden bg-black"
          >
            <Image src="/images/hero-img-4.png" alt="Dashboard 4" fill className="object-cover" />
          </motion.div>

          {/* Paper 3 */}
          <motion.div
            style={{ y: p3Y, opacity: p3Opacity, scale: p3Scale, zIndex: 20 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] transform-gpu origin-bottom overflow-hidden bg-black"
          >
             <motion.div style={{ rotate: p3BaseRotate, width: "100%", height: "100%" }}>
               <motion.div style={{ rotate: p3Rotate, width: "100%", height: "100%" }}>
                 <Image src="/images/hero-img-3.png" alt="Dashboard 3" fill className="object-cover" />
               </motion.div>
             </motion.div>
          </motion.div>

          {/* Paper 2 */}
          <motion.div
            style={{ y: p2Y, opacity: p2Opacity, scale: p2Scale, zIndex: 30 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] transform-gpu origin-bottom overflow-hidden bg-black"
          >
             <motion.div style={{ rotate: p2BaseRotate, width: "100%", height: "100%" }}>
               <motion.div style={{ rotate: p2Rotate, width: "100%", height: "100%" }}>
                 <Image src="/images/hero-img-1.png" alt="Dashboard 2" fill className="object-cover" />
               </motion.div>
             </motion.div>
          </motion.div>

          {/* Paper 1 (Top) */}
          <motion.div
            style={{ y: p1Y, rotate: p1Rotate, opacity: p1Opacity, zIndex: 40 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 dark:border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] transform-gpu origin-bottom overflow-hidden bg-black"
          >
             <Image src="/images/hero-img-2.png" alt="Dashboard 1" fill className="object-cover" />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
