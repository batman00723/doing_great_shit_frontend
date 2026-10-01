"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  hoverScale,
} from "@/lib/animations";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface Meeting {
  meeting_id: number;
  title: string;
  meeting_date: string;
  status: string;
  customer: {
    id: number;
    customer_name: string;
    industry: string;
    status: string;
  };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AllMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      try {
        const res = await fetch(`${BASE}/analyse/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setMeetings(data);
          setFilteredMeetings(data);
        } else {
          setError(data?.detail || "Failed to load meetings.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMeetings(meetings);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredMeetings(
        meetings.filter(m => 
          m.title.toLowerCase().includes(q) || 
          m.customer.customer_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, meetings]);

  if (loading) {
    return (
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-slate-dark/20 border-t-slate-dark rounded-full animate-spin" />
          <p className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Loading Archive</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-[#fef4f4] border border-[#fbdcdc] rounded-2xl p-5 inline-flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#fde8e8] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#b93232]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <p className="font-anthropic-sans font-semibold text-[14px] text-[#b93232]">Failed to load</p>
          <p className="font-anthropic-sans text-[13px] text-[#cc4a4a] mt-0.5">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-24">
      {/* ── HEADER ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-6"
      >
        <div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-slate-dark">
            Meeting <em className="italic font-normal text-slate-dark/40">Archive</em>
          </motion.h1>
          <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-slate-dark/50 mt-5 max-w-[440px] leading-[1.75]">
            Browse your entire history of recorded calls. Analyze transcripts, extract action items, and review past insights.
          </motion.p>
        </div>
        
        <motion.div variants={fadeInUp} transition={springCalm} className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-black transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Dashboard
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Link>
        </motion.div>
      </motion.div>

      {/* ── TOOLBAR (Search) ── */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#f9f9f8] p-2 rounded-[20px] border border-black/[0.06]"
      >
        <div className="relative flex-1 max-w-[400px]">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search meetings or customers…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-black/[0.06] rounded-xl pl-[44px] pr-4 py-3 font-anthropic-sans text-[15px] text-slate-dark outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all placeholder:text-slate-dark/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
          />
        </div>
      </motion.div>

      {/* ── MEETINGS LIST ── */}
      <AnimatePresence mode="wait">
        {meetings.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springCalm}
            className="w-full flex flex-col items-center justify-center py-32 bg-white border border-black/[0.06] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
          >
            <div className="w-20 h-20 bg-[#f9f9f8] border border-black/[0.05] rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <svg className="w-10 h-10 text-slate-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h3 className="font-anthropic-serif text-[32px] text-slate-dark tracking-tight mb-3">No meetings yet</h3>
            <p className="font-anthropic-sans text-[15px] text-slate-dark/50 max-w-[340px] text-center leading-[1.75]">
              Upload a transcript or deploy the bot from the dashboard to log your first meeting.
            </p>
          </motion.div>
        ) : filteredMeetings.length === 0 ? (
          <motion.div
            key="empty-search"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full py-24 text-center"
          >
            <p className="font-anthropic-sans text-[16px] text-slate-dark/40">No meetings match &quot;{searchQuery}&quot;</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-white border border-black/[0.06] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden"
          >
            <div className="w-full text-left">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/[0.04] bg-[#fafafa]">
                <div className="col-span-5 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Meeting Title</div>
                <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Customer</div>
                <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Date</div>
                <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Status</div>
              </div>
              
              <div className="flex flex-col divide-y divide-black/[0.04]">
                {filteredMeetings.map((m) => (
                  <Link 
                    key={m.meeting_id} 
                    href={`/dashboard/meeting/${m.meeting_id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#fafafa] transition-colors group"
                  >
                    <div className="col-span-5 flex items-center gap-4 min-w-0 pr-4">
                      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-b from-[#fdfaf6] to-[#f4f0ec] border border-black/[0.06] flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-5 h-5 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                      </div>
                      <span className="font-anthropic-sans text-[15px] font-semibold text-slate-dark leading-snug group-hover:text-clay-deep transition-colors truncate">
                        {m.title || "Untitled Meeting"}
                      </span>
                    </div>
                    
                    <div className="col-span-3 font-anthropic-sans text-[14px] text-slate-dark/60 truncate min-w-0 pr-4 hover:text-slate-dark transition-colors">
                      {m.customer.customer_name}
                    </div>

                    <div className="col-span-2 font-anthropic-mono text-[12px] text-slate-dark/50">
                      {formatDate(m.meeting_date)}
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${
                        m.status === "completed" ? "bg-[#f2f8f4] text-[#2c7a4b] border border-[#d0ead9]" :
                        m.status === "processing" ? "bg-clay/10 text-clay-deep border border-clay/20" :
                        m.status === "failed" ? "bg-[#fef4f4] text-[#b93232] border border-[#fbdcdc]" :
                        "bg-[#f4f4f4] text-slate-dark/50 border border-black/[0.05]"
                      }`}>
                        {m.status === "processing" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.status === "completed" ? "bg-[#429563]" :
                            m.status === "failed" ? "bg-[#b93232]" :
                            "bg-slate-dark/30"
                          }`} />
                        )}
                        {m.status}
                      </span>

                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-dark/20 group-hover:text-slate-dark group-hover:bg-black/[0.03] transition-all hidden lg:flex">
                        <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
