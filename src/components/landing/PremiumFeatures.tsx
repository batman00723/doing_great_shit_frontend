"use client";

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from "motion/react";
import React, { useRef, useState } from "react";

// ─── Mac Window Wrapper (Uncropped & Fully Rounded) ─────────────────────────

const MacWindow = ({ children, title = "Smriti", dark = true }: { children: React.ReactNode, title?: string, dark?: boolean }) => (
  <div className={`w-full h-full rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border ${dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-stone-200'}`}>
    <div className={`h-[40px] flex items-center px-4 shrink-0 relative ${dark ? 'bg-[#252525] border-b border-[#111]' : 'bg-gradient-to-b from-stone-100 to-stone-200/50 border-b border-stone-300'}`}>
      <div className="flex gap-2 relative z-10">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-[12px] font-semibold font-sans tracking-wide ${dark ? 'text-white/50' : 'text-slate-600'}`}>{title}</span>
      </div>
    </div>
    <div className="flex-1 min-h-0 relative">
      {children}
    </div>
  </div>
);

// ─── Feature Visuals (Optimized for Landscape) ──────────────────────────────

const EmailVisual = () => (
  <MacWindow title="Mail" dark={true}>
    <div className="w-full h-full flex bg-[#1a1a2e] font-sans overflow-hidden">
      {/* Pane 1: Sidebar (Mailboxes) */}
      <div className="w-[140px] sm:w-[160px] bg-[#12122a] border-r border-white/5 hidden md:flex flex-col flex-shrink-0">
        <div className="px-4 pt-5 pb-3 border-b border-white/5">
          <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Mailboxes</span>
        </div>
        <div className="flex flex-col px-2 py-3 gap-0.5">
          {[
            { label: "Inbox", count: "4", active: true },
            { label: "Sent", count: null, active: false },
            { label: "Drafts", count: "2", active: false },
            { label: "Smriti Auto", count: "12", active: false },
            { label: "Trash", count: null, active: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${item.active ? "bg-clay/20 text-clay" : "hover:bg-white/5 text-white/40"}`}>
              <span className="text-[12px] sm:text-[13px] font-medium flex-1">{item.label}</span>
              {item.count && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.active ? "bg-clay/30" : "bg-white/5"}`}>{item.count}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Pane 2: Message List */}
      <div className="w-[200px] lg:w-[240px] bg-[#16162e] border-r border-white/5 hidden sm:flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-white/80 font-semibold text-[13px]">Inbox</span>
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {[
            { name: "James Mitchell", sub: "Q4 Strategy Sync", preview: "Decisions & Action Items from today...", active: true, time: "14:32" },
            { name: "Sarah Connor", sub: "Project Alpha", preview: "Here is the latest design spec for...", active: false, time: "11:15" },
            { name: "Alex Reed", sub: "Contract Review", preview: "I've attached the redlines you asked...", active: false, time: "Yesterday" },
          ].map((msg, i) => (
            <div key={i} className={`p-4 border-b border-white/5 cursor-pointer relative ${msg.active ? 'bg-clay/10' : 'hover:bg-white/5'}`}>
               {msg.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-clay" />}
               <div className="flex justify-between items-baseline mb-1">
                 <div className="text-[12px] lg:text-[13px] font-semibold text-white/90 truncate pr-2">{msg.name}</div>
                 <div className={`text-[9px] lg:text-[10px] ${msg.active ? 'text-clay font-medium' : 'text-white/30'}`}>{msg.time}</div>
               </div>
               <div className="text-[11px] lg:text-[12px] font-medium text-white/70 truncate mb-1">{msg.sub}</div>
               <div className="text-[10px] lg:text-[11px] text-white/40 truncate">{msg.preview}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pane 3: Main email view */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e38]">
        <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-white/5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center text-[13px] font-bold shadow-lg flex-shrink-0">JM</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-[14px] lg:text-[15px] font-semibold text-white">James Mitchell</span>
              <span className="text-[10px] lg:text-[11px] text-white/25 flex-shrink-0">Today at 14:32</span>
            </div>
            <div className="text-[10px] lg:text-[11px] text-white/40">james@enterprise.com</div>
          </div>
        </div>

        <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-[16px] lg:text-[18px] font-semibold text-white leading-tight">Q4 Strategy Sync — Decisions & Action Items</h2>
          <div className="flex-shrink-0 flex items-center gap-2 bg-clay/15 border border-clay/25 text-clay text-[9px] lg:text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            Auto-drafted by Smriti
          </div>
        </div>

        <div className="flex-1 px-5 py-5 lg:px-6 lg:py-6 flex flex-col gap-6 overflow-hidden bg-[#16162e]">
          <div className="flex flex-col gap-2.5">
            <div className="h-2 w-full bg-white/5 rounded-full" />
            <div className="h-2 w-10/12 bg-white/5 rounded-full" />
            <div className="h-2 w-8/12 bg-white/4 rounded-full" />
          </div>

          <div className="bg-white/5 border border-white/8 rounded-xl p-4 lg:p-5 flex flex-col gap-3 lg:gap-4">
            <div className="text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-widest">Extracted Action Items</div>
            {[
              { done: true, text: "Send updated API documentation to engineering team", owner: "Sarah K.", due: "Tomorrow" },
              { done: false, text: "Schedule Q3 security audit with compliance team", owner: "Alex M.", due: "Nov 15" },
              { done: false, text: "Review SLA terms for enterprise tier upgrade", owner: "Legal", due: "Nov 22" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-3.5 h-3.5 lg:w-4 lg:h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center ${item.done ? "bg-clay" : "border border-white/15 bg-white/4"}`}>
                  {item.done && <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12px] lg:text-[13px] leading-snug ${item.done ? "text-white/20 line-through" : "text-white/80"}`}>{item.text}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] lg:text-[10px] text-white/20">{item.owner}</span>
                    <span className="text-white/10">·</span>
                    <span className={`text-[9px] lg:text-[10px] font-semibold ${item.due === "Tomorrow" ? "text-clay" : "text-white/30"}`}>{item.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </MacWindow>
);

const MemoryVisual = () => (
  <MacWindow title="Smriti Desktop · Global Memory" dark={true}>
    <div className="w-full h-full bg-[#0f0f23] flex flex-col font-sans overflow-hidden">
      <div className="bg-[#0f0f23] border-b border-white/5 px-6 pt-5 pb-4 lg:pt-6 lg:pb-5 flex flex-col gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[13px] lg:text-[14px] text-white/70 font-serif italic flex-1 truncate">"What did we commit to Microsoft about SSO?"</span>
          <span className="text-[9px] lg:text-[10px] font-bold text-white/20 bg-white/5 px-2 py-1 rounded">⌘K</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All Sources · 12", "Meetings · 4", "Emails · 8", "This Quarter"].map((f, i) => (
            <span key={i} className={`px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-wider ${i === 0 ? "bg-violet-500/20 text-violet-400 border border-violet-500/25" : "bg-white/4 text-white/25 border border-white/8 hover:bg-white/10 cursor-pointer"}`}>{f}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-5 lg:py-6 flex flex-col gap-3 lg:gap-4 overflow-hidden relative bg-[#0a0a1a]">
        <div className="text-[10px] lg:text-[11px] font-bold text-white/30 uppercase tracking-widest mb-1">Search Results</div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-violet-500/20 rounded-xl p-4 lg:p-5 relative overflow-hidden shadow-lg shadow-violet-500/5 shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
          <div className="flex items-start justify-between mb-2 lg:mb-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 lg:w-5 lg:h-5 rounded bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-[10px] lg:text-[11px] font-bold text-violet-400 uppercase tracking-widest">Q3 Review · Oct 14</span>
            </div>
            <div className="text-[9px] lg:text-[10px] text-white/30">Match: 99%</div>
          </div>
          <p className="text-[12px] lg:text-[14px] text-white/80 leading-relaxed">
            We committed to delivering <span className="bg-violet-500/30 text-violet-200 px-1.5 py-0.5 rounded font-medium">Enterprise SSO integration</span> by end of Q4 to unblock their 50,000-seat enterprise rollout.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/3 border border-white/5 rounded-xl p-4 lg:p-5 opacity-60 shrink-0">
          <div className="flex items-center gap-2 mb-2 lg:mb-3">
            <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-widest">Follow-up Email · Sep 22</span>
          </div>
          <p className="text-[11px] lg:text-[13px] text-white/50 leading-relaxed">"Any update on the <span className="bg-white/10 px-1 rounded">SSO integration timeline</span>? We need to lock in Q1 migration window."</p>
        </motion.div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0a0a1a] to-transparent pointer-events-none" />
      </div>
    </div>
  </MacWindow>
);

const ActionsVisual = () => (
  <MacWindow title="Meeting with Alex (Live)" dark={true}>
    <div className="w-full h-full bg-[#111827] flex font-sans overflow-hidden">
      {/* Left: transcript */}
      <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[11px] lg:text-[12px] font-semibold text-white/70">Live Transcript</span>
          <span className="ml-auto text-[9px] lg:text-[10px] text-emerald-400 font-bold uppercase tracking-widest">● 14:32</span>
        </div>
        <div className="flex-1 px-5 py-5 lg:px-6 lg:py-6 flex flex-col gap-4 lg:gap-6 overflow-hidden relative">
          {[
            { speaker: "Alex (Client)", color: "bg-blue-500", text: "Yeah, if we can get the API docs by tomorrow that should unblock our entire engineering team for the Q4 sprint.", highlight: null, dim: false },
            { speaker: "Sarah (You)", color: "bg-clay", text: null, highlight: "I'll send the complete API documentation package over by EOD tomorrow, and I'll CC the tech lead.", dim: false },
            { speaker: "Alex", color: "bg-blue-500", text: "Perfect. Also flagging — the Q3 security audit needs to happen before we can go to production.", highlight: null, dim: true },
          ].map((msg, i) => (
            <div key={i} className={`flex flex-col gap-1 lg:gap-1.5 ${msg.dim ? "opacity-40" : ""}`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${msg.color}`} />
                <span className="text-[9px] lg:text-[10px] font-bold text-white/40 uppercase tracking-widest">{msg.speaker}</span>
              </div>
              <p className="text-[12px] lg:text-[13px] text-white/70 leading-relaxed ml-3.5">
                {msg.text ? msg.text : <span className="bg-clay/20 text-white/90 border-b border-clay/40 px-1 py-0.5 rounded">{msg.highlight}</span>}
              </p>
            </div>
          ))}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right: extracted tasks */}
      <div className="w-[200px] lg:w-[260px] hidden sm:flex flex-col bg-[#0d1117] flex-shrink-0">
        <div className="px-4 py-4 lg:px-5 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] lg:text-[12px] font-semibold text-white/70">Extracted Tasks</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span className="text-[8px] lg:text-[9px] text-clay font-bold uppercase tracking-widest">Detecting</span>
          </div>
        </div>
        <div className="flex-1 px-4 py-4 lg:py-5 flex flex-col gap-3 lg:gap-4 overflow-hidden">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-clay/20 rounded-xl p-3 lg:p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-clay" />
            <div className="text-[11px] lg:text-[13px] font-medium text-white/90 leading-snug mb-2 lg:mb-3">Send API documentation to engineering</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-clay text-white flex items-center justify-center text-[7px] lg:text-[8px] font-bold">SK</div>
                <span className="text-[9px] lg:text-[10px] text-white/50">Sarah K.</span>
              </div>
              <span className="text-[8px] lg:text-[9px] text-clay font-bold bg-clay/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded uppercase tracking-wider">Tomorrow</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="bg-white/3 border border-white/5 rounded-xl p-3 lg:p-4 opacity-70">
            <div className="text-[11px] lg:text-[13px] font-medium text-white/50 leading-snug">Q3 security audit — before production</div>
          </motion.div>
        </div>
      </div>
    </div>
  </MacWindow>
);

const SecurityVisual = () => (
  <MacWindow title="Smriti Admin Console" dark={true}>
    <div className="w-full h-full bg-[#080818] flex flex-col items-center justify-center p-6 lg:p-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="relative z-10 w-full max-w-[360px] lg:max-w-[420px] flex flex-col gap-4 lg:gap-6">
        <div className="flex justify-between items-end px-4">
          {[
            { name: "Acme Corp", active: true },
            { name: "TechFlow", active: false },
            { name: "Enterprise", active: false },
          ].map((t, i) => (
            <div key={i} className={`flex flex-col items-center gap-2 ${t.active ? "" : "opacity-30"}`}>
              <div className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg text-[10px] lg:text-[11px] font-bold border ${t.active ? "bg-slate-800 border-slate-600 text-white shadow-[0_0_15px_rgba(100,120,255,0.2)]" : "bg-white/5 border-white/10 text-white/40"}`}>{t.name}</div>
              <div className="w-px h-6 lg:h-8 border-l border-dashed border-white/20" />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 lg:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-4 lg:mb-5">
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[11px] lg:text-[12px] font-bold text-white uppercase tracking-[0.15em]">Isolated Tenant Vault</span>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            {[
              { label: "AES-256", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { label: "TLS 1.3", icon: "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" },
              { label: "Zero-Log", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-2 lg:p-3 flex flex-col items-center gap-1.5 text-center bg-white/5 border border-white/10">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                <div className="text-[9px] lg:text-[11px] font-bold text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </MacWindow>
);

// ─── Feature Data ────────────────────────────────────────────────────────────

const features = [
  {
    num: "01",
    title: "Email Automation",
    desc: "Meeting reports sent directly to your clients' mailboxes the moment you hang up. Smriti handles the formatting, tone, and delivery automatically.",
    accent: "#c86450",
    visual: <EmailVisual />,
  },
  {
    num: "02",
    title: "Global Memory",
    desc: "Query and chat with all your past meetings instantly. Ask broad questions across your entire customer base or drill down into specific commitments.",
    accent: "#7c6af5",
    visual: <MemoryVisual />,
  },
  {
    num: "03",
    title: "Action Items",
    desc: "Instantly extract next steps and commitments from every call. Our models are fine-tuned to distinguish passing remarks from concrete promises.",
    accent: "#2da882",
    visual: <ActionsVisual />,
  },
  {
    num: "04",
    title: "Enterprise Security",
    desc: "Multi-tenant architecture ensuring your data is completely isolated. We never use your customer data to train our foundational models.",
    accent: "#6366f1",
    visual: <SecurityVisual />,
  },
];

// ─── Sidebar Item (Polished Accordion) ────────────────────────────────────────

function SidebarItem({ feature, isActive }: { feature: typeof features[0], isActive: boolean }) {
  return (
    <div 
      className={`flex flex-col p-5 rounded-2xl transition-all duration-500 ${
        isActive 
          ? 'bg-white border border-stone-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] scale-100' 
          : 'border border-transparent opacity-40 hover:opacity-70 scale-95 origin-left'
      }`}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-1.5 h-6 rounded-full transition-colors duration-500" 
          style={{ backgroundColor: isActive ? feature.accent : '#d6d3d1' }} 
        />
        <h3 className={`font-serif text-[24px] lg:text-[28px] font-semibold transition-colors duration-500 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
          {feature.title}
        </h3>
      </div>
      
      <motion.div
        initial={false}
        animate={{ 
          height: isActive ? 'auto' : 0, 
          opacity: isActive ? 1 : 0,
          marginTop: isActive ? 12 : 0
        }}
        className="overflow-hidden"
      >
        <p className="text-[14px] lg:text-[15px] leading-[1.6] text-slate-500 max-w-[320px] pl-5 border-l border-stone-100 ml-[3px]">
          {feature.desc}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Newspaper Image Stack ───────────────────────────────────────────────────

function ImageStack({ features, scrollYProgress }: { features: any[], scrollYProgress: MotionValue<number> }) {
  // PERFECT SYNC MAPPING:
  // Transition 1: 0.10 to 0.25
  // Transition 2: 0.35 to 0.50
  // Transition 3: 0.60 to 0.75

  // Card 1 (Top) leaves first
  const y1 = useTransform(scrollYProgress, [0.10, 0.25], [0, -1000]);
  const rotate1 = useTransform(scrollYProgress, [0.10, 0.25], [0, -4]);
  const opacity1 = useTransform(scrollYProgress, [0.15, 0.25], [1, 0]);

  // Card 2 enters and leaves second
  const scale2 = useTransform(scrollYProgress, [0.10, 0.25], [0.92, 1]);
  const baseRotate2 = useTransform(scrollYProgress, [0.10, 0.25], [2, 0]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.50], [0, -1000]);
  const exitRotate2 = useTransform(scrollYProgress, [0.35, 0.50], [0, 4]);
  const opacity2 = useTransform(scrollYProgress, [0.40, 0.50], [1, 0]);

  // Card 3 enters and leaves third
  const scale3 = useTransform(scrollYProgress, [0.35, 0.50], [0.92, 1]);
  const baseRotate3 = useTransform(scrollYProgress, [0.35, 0.50], [-2, 0]);
  const y3 = useTransform(scrollYProgress, [0.60, 0.75], [0, -1000]);
  const exitRotate3 = useTransform(scrollYProgress, [0.60, 0.75], [0, -4]);
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.75], [1, 0]);

  // Card 4 (Bottom) just enters
  const scale4 = useTransform(scrollYProgress, [0.60, 0.75], [0.92, 1]);
  const baseRotate4 = useTransform(scrollYProgress, [0.60, 0.75], [2, 0]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 lg:p-8">
      
      {/* Card 4 (Bottom-most) */}
      <motion.div style={{ scale: scale4, rotate: baseRotate4, zIndex: 10 }} className="absolute w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] aspect-[16/11] max-h-full">
        {features[3].visual}
      </motion.div>

      {/* Card 3 */}
      <motion.div style={{ y: y3, opacity: opacity3, scale: scale3, zIndex: 20 }} className="absolute w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] aspect-[16/11] max-h-full origin-bottom">
        <motion.div style={{ rotate: baseRotate3, width: '100%', height: '100%' }}>
           <motion.div style={{ rotate: exitRotate3, width: '100%', height: '100%' }}>
              {features[2].visual}
           </motion.div>
        </motion.div>
      </motion.div>

      {/* Card 2 */}
      <motion.div style={{ y: y2, opacity: opacity2, scale: scale2, zIndex: 30 }} className="absolute w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] aspect-[16/11] max-h-full origin-bottom">
        <motion.div style={{ rotate: baseRotate2, width: '100%', height: '100%' }}>
           <motion.div style={{ rotate: exitRotate2, width: '100%', height: '100%' }}>
              {features[1].visual}
           </motion.div>
        </motion.div>
      </motion.div>

      {/* Card 1 (Top-most) */}
      <motion.div style={{ y: y1, rotate: rotate1, opacity: opacity1, zIndex: 40 }} className="absolute w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] aspect-[16/11] max-h-full origin-bottom">
        {features[0].visual}
      </motion.div>

    </div>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

export function PremiumFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Sync active text index exactly with the midpoint of image transitions
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.175) setActiveIndex(0);
    else if (latest < 0.425) setActiveIndex(1);
    else if (latest < 0.675) setActiveIndex(2);
    else setActiveIndex(3);
  });

  return (
    <section id="capabilities" className="w-full relative z-10 bg-white">
      {/* Section Header */}
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[120px] pb-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-xl mb-8 shadow-sm border border-stone-200/60"
        >
          <span className="w-2 h-2 rounded-full bg-clay animate-pulse shadow-[0_0_8px_rgba(200,100,80,0.6)]" />
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
            Platform Capabilities
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-[56px] md:text-[72px] lg:text-[84px] leading-[1.05] tracking-tight text-slate-900"
        >
          Intelligence that <br />
          <em className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-clay-deep via-orange-400 to-clay-deep animate-[shimmer_4s_infinite] bg-[length:200%_auto]">
            works for you.
          </em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-[18px] md:text-[20px] text-slate-500 leading-relaxed max-w-[560px]"
        >
          Four powerful capabilities working silently behind every call you take.
        </motion.p>
      </div>

      {/* The Scroll-Spy Layout Area (400vh tall to allow scrolling) */}
      <div ref={containerRef} className="relative w-full h-[400vh] mt-8">
        
        {/* The sticky viewport frame */}
        <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden px-6 lg:px-12 py-12 lg:py-24">
          
          {/* Max width container for split view */}
          <div className="w-full max-w-[1300px] h-full flex flex-col lg:flex-row gap-10 lg:gap-20 items-center lg:items-center">
            
            {/* Left: Text Sidebar (Accordion style) */}
            <div className="w-full lg:w-[380px] shrink-0 flex flex-col justify-center gap-4 h-auto">
               {features.map((feature, i) => (
                 <SidebarItem key={i} feature={feature} isActive={activeIndex === i} />
               ))}
            </div>

            {/* Right: The Newspaper Image Stack in Landscape */}
            <div className="flex-1 w-full h-[50vh] lg:h-full max-h-[700px] relative perspective-[2000px] flex items-center justify-center">
               {/* The actual stacked images */}
               <ImageStack features={features} scrollYProgress={scrollYProgress} />
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
