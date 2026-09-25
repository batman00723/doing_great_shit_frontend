"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { MouseEvent } from "react";
import { RevealOnScroll } from "@/components/landing/AnimatedSections";

function TiltSpotlightCard({ children, className, visual, glowColor }: { children: React.ReactNode, className?: string, visual: React.ReactNode, glowColor: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 350, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 350, damping: 40 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - left;
    const my = e.clientY - top;
    mouseX.set(mx);
    mouseY.set(my);
    
    // Normalize to -0.5 to 0.5
    x.set(mx / width - 0.5);
    y.set(my / height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 2000 }}
      className={`relative group rounded-[40px] md:rounded-[48px] overflow-hidden border border-white/60 bg-white/40 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.07),inset_0_4px_10px_rgba(255,255,255,0.6)] ring-1 ring-black/5 transition-all duration-700 [transform-style:preserve-3d] ${className}`}
    >
      {/* Dynamic Colored Mesh Gradient Behind the Card */}
      <div className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br ${glowColor} opacity-40 group-hover:opacity-60 transition-opacity duration-1000 blur-[80px] pointer-events-none -z-10`} />

      {/* Tactile Noise Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>

      {/* Pure DOM Visual Background */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden transition-transform duration-1000 ease-out group-hover:scale-105">
        {visual}
        {/* Soft Fade for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#fdfaf6] via-[#fdfaf6]/90 to-transparent opacity-90 pointer-events-none" />
      </div>

      {/* Interactive Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[48px] opacity-0 transition duration-700 group-hover:opacity-100 z-30 mix-blend-overlay"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              1000px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.4),
              transparent 60%
            )
          `,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full p-10 md:p-14 lg:p-[60px] flex flex-col justify-end [transform:translateZ(40px)]">
        {children}
      </div>
    </motion.div>
  );
}

export function PremiumBento() {
  return (
    <section id="why" className="w-full max-w-[1400px] mx-auto px-6 py-[120px] flex flex-col relative z-10 perspective-[2000px]">
      
      <div className="flex flex-col items-center text-center mb-16 md:mb-[120px] relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-stone/30 bg-white/40 backdrop-blur-xl mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <span className="w-2 h-2 rounded-full bg-clay animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(200,100,80,0.8)]" />
          <span className="font-anthropic-sans text-[11px] font-bold uppercase tracking-[0.25em] text-slate-dark/70">
            Unfair Advantage
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-anthropic-serif text-[64px] md:text-[84px] leading-[1.05] tracking-tight text-slate-dark"
        >
          The Smriti <br />
          <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-deep via-orange-400 to-clay-deep animate-[shimmer_4s_infinite] bg-[length:200%_auto]">
            difference.
          </em>
        </motion.h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Massive Ambient background glow for the grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* Card 1 - Secure (Large) */}
        <div className="lg:col-span-2 relative">
          <TiltSpotlightCard 
            glowColor="from-orange-300 via-amber-100 to-transparent"
            className="h-full min-h-[500px] lg:min-h-[600px]"
            visual={
              <div className="w-full h-full flex items-center justify-center opacity-90">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_10%,transparent_100%)]" />
                
                <div className="relative w-64 h-64 flex items-center justify-center -mt-20">
                  {/* Heavy 3D Glowing Core */}
                  <div className="absolute inset-8 bg-gradient-to-tr from-orange-400 to-amber-200 rounded-full blur-[40px] animate-pulse opacity-80" />
                  <div className="absolute inset-16 bg-white rounded-full blur-[20px] opacity-90" />
                  
                  {/* Glass Orb Shell */}
                  <div className="absolute inset-12 rounded-full border border-white/80 bg-white/40 backdrop-blur-3xl shadow-[0_10px_40px_rgba(251,146,60,0.3),inset_0_4px_10px_rgba(255,255,255,1)] flex items-center justify-center">
                    <svg className="w-10 h-10 text-orange-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  
                  {/* Rotating SVG Rings */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-orange-500/20 border-dashed drop-shadow-sm" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-stone-300/30" />
                </div>
              </div>
            }
          >
            <div className="relative z-10 max-w-[500px]">
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-anthropic-sans font-bold text-[14px] tracking-[0.25em] uppercase text-orange-600 flex items-center gap-4 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.5)]" /> 
                Secure by Design
              </motion.h3>
              
              <motion.h4 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-anthropic-serif text-[48px] md:text-[56px] leading-[1.05] tracking-tight text-slate-dark mb-6"
              >
                Fiercely protected <br /> isolation.
              </motion.h4>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-anthropic-sans text-[18px] leading-[1.65] text-slate-dark/70"
              >
                Every byte of your conversational data is firewalled in a single-tenant architecture. We never train public models on your proprietary memory.
              </motion.p>
            </div>
          </TiltSpotlightCard>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Card 2 - Trustworthy */}
          <TiltSpotlightCard 
            glowColor="from-cyan-300 via-sky-100 to-transparent"
            className="flex-1 min-h-[400px]"
            visual={
              <div className="w-full h-full pt-16 pr-8 flex items-start justify-end opacity-100 transform rotate-[-4deg] translate-x-4">
                <div className="relative w-[280px] bg-white/80 border border-white/60 rounded-[24px] p-6 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.1),inset_0_2px_10px_rgba(255,255,255,1)]">
                  {/* Subtle shining sheen overlay */}
                  <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] pointer-events-none rounded-[24px]" />
                  
                  {/* Fake UI text lines */}
                  <div className="w-full h-2.5 bg-stone-200/50 rounded-full mb-4" />
                  <div className="w-5/6 h-2.5 bg-stone-200/50 rounded-full mb-4" />
                  <div className="w-full h-2.5 bg-stone-200/50 rounded-full mb-4" />
                  
                  {/* Highlighted exact citation line */}
                  <div className="flex gap-2 mb-4 items-center relative">
                     <div className="absolute -inset-2 bg-cyan-300/40 rounded-lg blur-[12px] animate-pulse" />
                     <div className="relative w-2/3 h-3 bg-cyan-100 rounded-full border border-cyan-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]" />
                     <motion.div 
                       initial={{ opacity: 0.3 }}
                       animate={{ opacity: 1 }}
                       transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                       className="w-4 h-4 rounded-full bg-cyan-400 blur-[1px] shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                     />
                  </div>
                  <div className="w-3/4 h-2.5 bg-stone-200/50 rounded-full" />
                  
                  {/* Floating verification badge */}
                  <motion.div 
                     animate={{ y: [0, -6, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute -left-10 -bottom-8 bg-white border border-cyan-200 text-cyan-700 text-[11px] font-black tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_12px_40px_rgba(34,211,238,0.3),inset_0_2px_4px_rgba(255,255,255,1)]"
                  >
                     <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                     VERIFIED
                  </motion.div>
                </div>
              </div>
            }
          >
            <div className="relative z-10">
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-anthropic-sans font-bold text-[13px] tracking-[0.25em] uppercase text-cyan-600 flex items-center gap-3 mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> 
                Trustworthy
              </motion.h3>
              
              <motion.h4 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-anthropic-serif text-[36px] leading-[1.1] tracking-tight text-slate-dark mb-4"
              >
                Grounded in reality.
              </motion.h4>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-anthropic-sans text-[16px] leading-[1.6] text-slate-dark/70"
              >
                Citations link every insight directly back to the exact moment in the transcript. No hallucinations.
              </motion.p>
            </div>
          </TiltSpotlightCard>

          {/* Card 3 - Reliable */}
          <TiltSpotlightCard 
            glowColor="from-fuchsia-300 via-purple-100 to-transparent"
            className="flex-1 min-h-[400px]"
            visual={
              <div className="w-full h-full flex items-start justify-center pt-16 opacity-100">
                <div className="relative w-[280px] h-[160px] bg-white/80 border border-white/60 rounded-[24px] flex flex-col justify-end p-5 overflow-hidden backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.1),inset_0_2px_10px_rgba(255,255,255,1)]">
                  
                  {/* Subtle grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px]" />
                  
                  {/* Top left text "Audio Analysis" */}
                  <div className="absolute top-4 left-5 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-[pulse_1s_infinite] shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                     <span className="text-[10px] font-bold text-slate-dark/50 uppercase tracking-[0.2em]">Speech Model</span>
                  </div>

                  {/* High-end Gradient Audio Waveform */}
                  <div className="flex items-end gap-1.5 w-full h-16 relative z-10">
                    {[...Array(24)].map((_, i) => {
                      const isCenter = i === 11 || i === 12 || i === 13;
                      const isSpike = i === 12;
                      
                      let h = Math.abs(Math.sin(i * 0.8)) * 25 + 10; 
                      if (isCenter) h = 50;
                      if (isSpike) h = 85;
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-full transition-all duration-300 ${isSpike ? 'bg-gradient-to-t from-fuchsia-400 to-purple-600 shadow-[0_4px_15px_rgba(168,85,247,0.6)]' : isCenter ? 'bg-gradient-to-t from-fuchsia-300/80 to-purple-400/80' : 'bg-purple-200/50'}`} 
                          style={{ height: `${h}%` }} 
                        />
                      )
                    })}
                  </div>
                  
                  {/* Connection line from spike to tooltip */}
                  <div className="absolute bottom-[80px] left-[52%] w-px h-8 bg-gradient-to-t from-purple-500/80 to-transparent" />
                  
                  {/* Tooltip highlighting the caught detail */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[112px] left-[52%] -translate-x-1/2 bg-white border border-purple-200 text-purple-700 text-[10px] font-black tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-[0_12px_30px_rgba(168,85,247,0.25),inset_0_2px_4px_rgba(255,255,255,1)] whitespace-nowrap z-20"
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    MUMBLED ACTION
                  </motion.div>

                </div>
              </div>
            }
          >
            <div className="relative z-10">
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-anthropic-sans font-bold text-[13px] tracking-[0.25em] uppercase text-purple-600 flex items-center gap-3 mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" /> 
                Reliable
              </motion.h3>
              
              <motion.h4 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-anthropic-serif text-[36px] leading-[1.1] tracking-tight text-slate-dark mb-4"
              >
                Never miss a detail.
              </motion.h4>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-anthropic-sans text-[16px] leading-[1.6] text-slate-dark/70"
              >
                Our custom speech models catch whispers, cross-talk, and mumbled action items with superhuman precision.
              </motion.p>
            </div>
          </TiltSpotlightCard>
        </div>
      </div>
    </section>
  );
}
