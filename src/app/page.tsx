import Image from "next/image";
import Link from "next/link";
import {
  NavReveal,
  RevealOnScroll,
  ScaleOnScroll,
  StaggerOnScroll,
  StaggerChild,
  AnimatedButton,
  FadeOnScroll,
} from "@/components/landing/AnimatedSections";

import { HeroSection } from "@/components/landing/HeroSection";
import { PremiumBento } from "@/components/landing/PremiumBento";
import { PremiumFeatures } from "@/components/landing/PremiumFeatures";
import { ShaderBackground } from "@/components/landing/ShaderBackground";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative bg-ivory-medium dark:bg-[#0a0a0a] overflow-clip z-0 transition-colors duration-500">
      
      {/* 1. Top Navbar */}
      <NavReveal className="w-full sticky top-0 z-50 bg-ivory-medium/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-stone/30 dark:border-white/10 transition-colors duration-500">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-anthropic-sans font-bold text-[13px] uppercase tracking-[0.2em] text-slate-dark dark:text-white">
            Smriti
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Link href="#capabilities" className="font-anthropic-sans font-medium text-[13px] text-slate-dark/70 dark:text-white/70 hover:text-slate-dark dark:hover:text-white transition-colors">Features</Link>
            <Link href="#why" className="font-anthropic-sans font-medium text-[13px] text-slate-dark/70 dark:text-white/70 hover:text-slate-dark dark:hover:text-white transition-colors">Why Smriti</Link>
            <Link href="/login" className="font-anthropic-sans font-medium text-[13px] text-slate-dark/70 dark:text-white/70 hover:text-slate-dark dark:hover:text-white transition-colors">Sign in</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AnimatedButton>
              <Link
                href="/register"
                className="inline-flex items-center justify-center font-anthropic-sans font-medium text-[13px] bg-slate-dark dark:bg-white text-white dark:text-slate-dark px-6 py-2.5 rounded-full hover:bg-black dark:hover:bg-slate-200 transition-all"
              >
                Try Smriti
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </NavReveal>

      {/* Wrapper for continuous Shader Background */}
      <div className="w-full relative">
        <ShaderBackground />
        
        {/* 2. Hero Section - Anthropic Editorial */}
        <HeroSection />

        {/* 3. Capabilities Section - Sticky Scroll Deck */}
        <PremiumFeatures />
      </div>

      {/* 4. "Why Smriti?" Section (Refined Bento) */}
      <PremiumBento />

      {/* 5. Footer Section - Million Bucks Tier */}
      <footer className="w-full bg-[#0a0a09] pt-[160px] pb-0 mt-12 relative z-10 overflow-hidden rounded-t-[40px] md:rounded-t-[80px]">
        {/* Ambient Underglow & Light beams */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(230,120,90,0.15)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_bottom,rgba(200,200,200,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none" />

        <FadeOnScroll className="w-full max-w-[1280px] mx-auto relative z-10 flex flex-col items-center text-center mb-[160px] px-6">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
            <span className="font-anthropic-sans text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              Get Started
            </span>
          </div>
          <h2 className="font-anthropic-serif text-[60px] md:text-[120px] leading-[1.1] tracking-tighter text-white mb-12">
            Ready to win <br/> 
            <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-light to-manilla pr-2">every deal?</em>
          </h2>
          <p className="font-anthropic-sans text-[18px] md:text-[22px] text-white/50 max-w-[600px] mb-20">
            Stop writing things down on sticky notes. Let the robots do the administrative heavy lifting.
          </p>
          <AnimatedButton>
            <Link
              href="/register"
              className="relative group overflow-hidden inline-flex items-center justify-center font-anthropic-sans font-semibold text-[18px] bg-white text-slate-dark px-14 py-6 rounded-full transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:shadow-[0_0_120px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:scale-105"
            >
              <span className="relative z-10 flex items-center tracking-wide">
                Start building for free
                <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-dark/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </Link>
          </AnimatedButton>
        </FadeOnScroll>

        {/* Links Grid */}
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10 px-6 border-t border-white/10 pt-20">
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                   <div className="w-4 h-4 rounded-full bg-slate-dark" />
                 </div>
                 <div className="font-anthropic-sans font-black text-[24px] uppercase tracking-[0.2em] text-white">
                   SMRITI
                 </div>
              </div>
              <p className="font-anthropic-sans text-[16px] leading-[1.6] text-white/40 max-w-[340px]">
                The AI platform that finally makes taking meeting notes a thing of the past.
              </p>
            </div>
            <div className="flex gap-4 mt-12 md:mt-16">
              <a href="https://x.com/batmanmishra007" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/amanmishra232005/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-anthropic-sans font-bold text-[12px] tracking-[0.15em] text-white/60 mb-4 uppercase">
              Platform
            </h4>
            <Link href="#" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Meeting Analysis</Link>
            <Link href="#" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Global Memory</Link>
            <Link href="#" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Action Engine</Link>
            <Link href="/pricing" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Pricing</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-anthropic-sans font-bold text-[12px] tracking-[0.15em] text-white/60 mb-4 uppercase">
              Company
            </h4>
            <Link href="/about" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">About Us</Link>
            <Link href="/careers" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Careers</Link>
            <Link href="/security" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Security</Link>
            <Link href="#" className="font-anthropic-sans text-[15px] text-white/40 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
        
        {/* Massive Typography & Bottom Bar */}
        <div className="w-full mt-24 relative flex flex-col items-center pb-[80px] md:pb-[100px]">
          <div className="font-anthropic-sans font-black text-[22vw] leading-none tracking-tighter text-white/[0.03] select-none pointer-events-none w-full text-center">
            SMRITI
          </div>
          
          <div className="absolute bottom-0 w-full px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1280px] text-white/30 font-anthropic-sans text-[13px] font-medium border-t border-white/10 backdrop-blur-md">
            <div>© 2026 Smriti Inc. All rights reserved.</div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
