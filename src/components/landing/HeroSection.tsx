"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
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
      className={`absolute hidden md:flex items-center gap-2 backdrop-blur-md bg-white/70 border border-white/50 shadow-2xl p-3 rounded-2xl z-20 ${className}`}
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
      className="absolute w-[90%] sm:w-[75%] max-w-[800px] aspect-[16/11] rounded-[24px] border border-stone/20 bg-white/95 backdrop-blur-3xl overflow-hidden flex flex-col ring-1 ring-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform-gpu"
    >
       <div className="h-8 sm:h-10 border-b border-stone/10 bg-white/40 flex items-center px-4 gap-2 shrink-0 backdrop-blur-md">
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
    <section ref={containerRef} className="relative w-full mx-auto pt-[40px] lg:pt-[60px] pb-[120px] flex flex-col items-center justify-center overflow-visible perspective-[2000px] min-h-screen">
      
      {/* 3D Liquid Orb Background */}
      <div className="absolute inset-0 w-full h-[120vh] pointer-events-none -z-10 overflow-hidden opacity-90">
        <ShaderGradientCanvas
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* @ts-ignore */}
          <ShaderGradient {...{
            animate: "on", axesHelper: "off", bgColor1: "transparent", bgColor2: "transparent", brightness: 0.8, cAzimuthAngle: 270, cDistance: 14, cPolarAngle: 180, cameraZoom: 5, color1: "#73bfc4", color2: "#ff810a", color3: "#8da0ce", destination: "onCanvas", embedMode: "off", envPreset: "city", format: "gif", fov: 45, frameRate: 10, gizmoHelper: "hide", grain: "on", lightType: "env", pixelDensity: 1, positionX: -0.1, positionY: 0, positionZ: 0, range: "disabled", rangeEnd: 40, rangeStart: 0, reflection: 0.4, rotationX: 0, rotationY: 130, rotationZ: 70, shader: "defaults", type: "sphere", uAmplitude: 3.2, uDensity: 0.8, uFrequency: 5.5, uSpeed: 0.2, uStrength: 8.5, uTime: 0, wireframe: false, zoomOut: true
          }} />
        </ShaderGradientCanvas>
      </div>      {/* Floating UI Elements */}

      <FloatingBadge delay={1.1} initialY={100} initialX={320} className="top-[30%] right-[20%] -translate-y-1/2">
        <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
          <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-anthropic-sans text-[11px] font-bold text-slate-dark uppercase tracking-wider">Sentiment</span>
          <span className="font-anthropic-serif text-[13px] text-slate-dark/70">Highly Positive</span>
        </div>
      </FloatingBadge>

      <motion.div style={{ y, opacity }} className="flex flex-col items-center text-center max-w-[900px] px-6 relative z-10">
        
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-clay/30 bg-white/40 backdrop-blur-md mb-10 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
          <span className="font-anthropic-sans text-[12px] font-bold uppercase tracking-[0.25em] text-clay-deep">
            Smriti Intelligence
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } }
          }}
          className="font-anthropic-serif text-[72px] sm:text-[88px] md:text-[110px] leading-[1] tracking-tight text-slate-dark mb-10 flex flex-col items-center"
        >
          <span className="flex overflow-hidden pb-4">
            {splitText("Perfect memory")}
          </span>
          <span className="flex overflow-hidden pb-6">
            <span className="mr-4">{splitText("for")}</span>
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
          className="font-anthropic-sans text-[18px] md:text-[22px] leading-[1.6] text-slate-dark/70 max-w-[640px] mb-14"
        >
          The AI companion that joins your calls, extracts insights, and builds an infallible, searchable memory of your entire customer history.
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
          
          <MagneticButton href="/login" className="inline-flex items-center justify-center font-anthropic-sans font-semibold text-[17px] sm:text-[18px] text-slate-dark px-12 py-5 sm:py-6 rounded-full bg-white/70 backdrop-blur-xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all duration-500">
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

  // Paper 1 (Top) flies up and fades out between 0% and 33% of scroll
  const p1Y = useTransform(scrollYProgress, [0, 0.33], [0, -1000]);
  const p1Rotate = useTransform(scrollYProgress, [0, 0.33], [0, -10]);
  const p1Opacity = useTransform(scrollYProgress, [0.2, 0.33], [1, 0]);

  // Paper 2 (Middle) flies up and fades out between 33% and 66% of scroll
  const p2Y = useTransform(scrollYProgress, [0.33, 0.66], [0, -1000]);
  const p2Rotate = useTransform(scrollYProgress, [0.33, 0.66], [0, 10]);
  const p2Opacity = useTransform(scrollYProgress, [0.5, 0.66], [1, 0]);
  
  // Paper 2 entrance scale/rotate (scales up as Paper 1 leaves)
  const p2Scale = useTransform(scrollYProgress, [0, 0.33], [0.95, 1]);
  const p2BaseRotate = useTransform(scrollYProgress, [0, 0.33], [-2, 0]);

  // Paper 3 (Bottom) entrance scale/rotate (scales up as Paper 2 leaves)
  const p3Scale = useTransform(scrollYProgress, [0.33, 0.66], [0.9, 1]);
  const p3BaseRotate = useTransform(scrollYProgress, [0.33, 0.66], [2, 0]);

  return (
    <div ref={containerRef} className="w-full h-[300vh] relative z-20 mt-12 sm:mt-24">
      <div className="sticky top-0 w-full h-screen flex justify-center items-center overflow-hidden px-6 perspective-[2000px]">
        
        <div className="relative w-full max-w-[900px] aspect-[16/11] max-h-[70vh] flex justify-center items-center">
          
          {/* Paper 3 (Bottom - Insights) */}
          <motion.div
            style={{ scale: p3Scale, rotate: p3BaseRotate, zIndex: 10 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 bg-white/95 backdrop-blur-3xl overflow-hidden flex flex-col ring-1 ring-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform-gpu"
          >
             <div className="h-8 sm:h-10 border-b border-stone/10 bg-white/40 flex items-center px-4 gap-2 shrink-0 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
             </div>
             <MockupInsights />
          </motion.div>

          {/* Paper 2 (Middle - Actions) */}
          <motion.div
            style={{ y: p2Y, opacity: p2Opacity, scale: p2Scale, zIndex: 20 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 bg-white/95 backdrop-blur-3xl overflow-hidden flex flex-col ring-1 ring-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.12)] transform-gpu origin-bottom"
          >
             {/* We combine the base entrance rotation and the exit rotation */}
             <motion.div style={{ rotate: p2BaseRotate, width: "100%", height: "100%" }}>
               <motion.div style={{ rotate: p2Rotate, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                 <div className="h-8 sm:h-10 border-b border-stone/10 bg-white/40 flex items-center px-4 gap-2 shrink-0 backdrop-blur-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                 </div>
                 <MockupActions />
               </motion.div>
             </motion.div>
          </motion.div>

          {/* Paper 1 (Top - Transcript) */}
          <motion.div
            style={{ y: p1Y, rotate: p1Rotate, opacity: p1Opacity, zIndex: 30 }}
            className="absolute w-full h-full rounded-[24px] border border-stone/20 bg-white/95 backdrop-blur-3xl overflow-hidden flex flex-col ring-1 ring-black/5 shadow-[0_40px_80px_rgba(0,0,0,0.15)] transform-gpu origin-bottom"
          >
             <div className="h-8 sm:h-10 border-b border-stone/10 bg-white/40 flex items-center px-4 gap-2 shrink-0 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone/20" />
             </div>
             <MockupTranscript />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

const MockupTranscript = () => (
  <motion.div 
    key="transcript"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="flex-1 p-6 sm:p-10 flex flex-col gap-6 bg-[#fdfaf6]/60 relative w-full h-full"
  >
    {/* Background Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

    <div className="flex items-center justify-between border-b border-stone/20 pb-5">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-green-100 border border-green-200 text-green-700 rounded text-[9px] font-bold uppercase tracking-[0.15em]">Completed</span>
          <span className="font-anthropic-sans text-[11px] text-slate-dark/50 uppercase tracking-widest">Oct 14, 2026</span>
        </div>
        <h2 className="font-anthropic-serif text-[28px] font-semibold tracking-tight text-slate-dark">Q4 Architecture Sync</h2>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <div className="px-5 py-2 bg-white border border-stone/30 rounded-full font-anthropic-sans text-[12px] font-semibold text-slate-dark shadow-sm hover:shadow-md transition-shadow cursor-default">
          Export Report
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-dark text-white flex items-center justify-center shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-2">
      <div className="sm:col-span-8 flex flex-col gap-5">
        <h3 className="font-anthropic-sans text-[11px] font-bold text-slate-dark/50 uppercase tracking-[0.15em]">Live Transcript Extract</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-dark to-slate-medium text-white flex items-center justify-center font-anthropic-sans font-bold text-[10px] shrink-0 shadow-sm">S</div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-[4px] shadow-sm border border-stone/20 font-anthropic-serif text-[14px] leading-[1.6] text-slate-dark">
              We need to ensure the new cluster can handle 10x the throughput during Black Friday. Are we aligned on upgrading the database tiers?
            </div>
          </div>
          
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-clay to-clay-deep text-white flex items-center justify-center font-anthropic-sans font-bold text-[10px] shrink-0 shadow-sm">C</div>
            <div className="bg-slate-dark p-4 rounded-2xl rounded-tr-[4px] shadow-md border border-black text-white font-anthropic-serif text-[14px] leading-[1.6]">
              Yes, completely aligned. <span className="bg-clay/40 px-1.5 py-0.5 rounded text-white font-medium">Let's set a follow-up for next Tuesday to review the stress test results.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-dark to-slate-medium text-white flex items-center justify-center font-anthropic-sans font-bold text-[10px] shrink-0 shadow-sm">S</div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-[4px] shadow-sm border border-stone/20 font-anthropic-serif text-[14px] leading-[1.6] text-slate-dark">
              Perfect. I'll have the infrastructure team send over the benchmarks before then.
            </div>
          </div>
        </div>
      </div>

      <div className="sm:col-span-4 flex flex-col gap-5">
        <div className="w-full bg-white rounded-[20px] border border-stone/30 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
          <h4 className="font-anthropic-sans text-[10px] font-bold text-slate-dark uppercase tracking-[0.15em] mb-4">Detected Action</h4>
          <div className="flex items-start gap-2.5 p-3 bg-[#fff9f9] text-[#902525] rounded-xl text-[12px] font-medium border border-[#f0d4d4] leading-snug">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
            Review stress test results with client next Tuesday
          </div>
        </div>

        <div className="w-full bg-white rounded-[20px] border border-stone/30 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
          <h4 className="font-anthropic-sans text-[10px] font-bold text-slate-dark uppercase tracking-[0.15em] mb-4">Key Sentiment</h4>
          <div className="w-full h-2 bg-stone/20 rounded-full mb-3 overflow-hidden">
            <div className="w-[85%] h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
          </div>
          <div className="flex justify-between items-end font-anthropic-sans text-[11px] font-bold uppercase tracking-wide">
            <span className="text-slate-dark/40">Negative</span>
            <div className="flex flex-col items-end gap-0.5">
               <span className="text-green-600 text-[18px] font-black leading-none">85%</span>
               <span className="text-green-700/60">Positive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const MockupInsights = () => (
  <motion.div 
    key="insights"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="flex-1 p-6 sm:p-10 flex flex-col gap-6 bg-[#fdfaf6]/60 relative w-full h-full"
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

    <div className="flex items-center justify-between border-b border-stone/20 pb-5">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-700 rounded text-[9px] font-bold uppercase tracking-[0.15em]">Global</span>
          <span className="font-anthropic-sans text-[11px] text-slate-dark/50 uppercase tracking-widest">Customer Base</span>
        </div>
        <h2 className="font-anthropic-serif text-[28px] font-semibold tracking-tight text-slate-dark">Portfolio Insights</h2>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[ 
         { label: "Total Meetings", val: "1,204", color: "text-slate-dark" },
         { label: "Avg Sentiment", val: "8.4", sub: "/ 10", color: "text-green-600" },
         { label: "Action Items Pending", val: "32", color: "text-clay-deep" }
       ].map((m, i) => (
        <div key={i} className="bg-white border border-stone/20 rounded-2xl p-5 shadow-sm">
          <h4 className="font-anthropic-sans text-[10px] font-bold text-slate-dark/50 uppercase tracking-widest mb-3">{m.label}</h4>
          <div className={`font-anthropic-serif text-[32px] leading-none ${m.color}`}>
             {m.val} {m.sub && <span className="text-[16px] text-slate-dark/40">{m.sub}</span>}
          </div>
        </div>
      ))}
    </div>

    <div className="flex-1 w-full bg-white border border-stone/20 rounded-2xl p-6 shadow-sm mt-2 flex flex-col min-h-[200px]">
       <h4 className="font-anthropic-sans text-[12px] font-bold text-slate-dark mb-6">Engagement Trends</h4>
       <div className="flex-1 flex items-end gap-2 sm:gap-4 h-full">
          {[40, 60, 45, 80, 50, 90, 75, 100, 85, 60, 95].map((h, i) => (
             <div key={i} className="flex-1 bg-gradient-to-t from-clay/20 to-clay hover:from-clay/40 transition-colors rounded-t-md relative group h-full flex flex-col justify-end">
               <div className="w-full rounded-t-md bg-clay transition-all duration-500" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-dark text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity pointer-events-none">
                   {h * 12}
                 </div>
               </div>
             </div>
          ))}
       </div>
    </div>
  </motion.div>
);

const MockupActions = () => (
  <motion.div 
    key="actions"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="flex-1 p-6 sm:p-10 flex flex-col gap-6 bg-[#fdfaf6]/60 relative w-full h-full"
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

    <div className="flex items-center justify-between border-b border-stone/20 pb-5">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-clay/20 border border-clay/30 text-clay-deep rounded text-[9px] font-bold uppercase tracking-[0.15em]">Automated</span>
          <span className="font-anthropic-sans text-[11px] text-slate-dark/50 uppercase tracking-widest">Workflow Engine</span>
        </div>
        <h2 className="font-anthropic-serif text-[28px] font-semibold tracking-tight text-slate-dark">Pending Actions</h2>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      {[
        { label: "Send follow-up email to Acme Corp", status: "Sent via Gmail", checked: true, color: "green" },
        { label: "Update Salesforce Opportunity (Stage: Negotiation)", status: "Syncing...", checked: true, color: "blue", spinner: true },
        { label: "Schedule Q4 technical review with Alex", status: "Awaiting approval", checked: false, color: "stone" },
        { label: "Draft legal summary for compliance team", status: "Draft created", checked: true, color: "green" },
      ].map((act, i) => (
        <div key={i} className="flex items-center justify-between bg-white border border-stone/20 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${act.checked ? 'bg-slate-dark border-slate-dark text-white' : 'border-stone/40 bg-stone/5'}`}>
                {act.checked && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`font-anthropic-sans text-[13px] sm:text-[14px] ${act.checked && !act.spinner ? 'text-slate-dark/50 line-through' : 'text-slate-dark font-medium'}`}>{act.label}</span>
           </div>
           <div className={`hidden sm:flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider items-center gap-2 ${
             act.color === 'green' ? 'bg-green-100 text-green-700' :
             act.color === 'blue' ? 'bg-blue-100 text-blue-700' :
             'bg-stone/20 text-slate-dark/60'
           }`}>
              {act.spinner && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              {act.status}
           </div>
        </div>
      ))}
    </div>
  </motion.div>
);
