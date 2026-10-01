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
  hoverLift,
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

  if (loading) {
    return (
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading meetings…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 inline-block">
        <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-[1080px] mx-auto pb-24">
      {/* ── HEADER ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4"
      >
        <div>
          <motion.div variants={fadeInUp} transition={springCalm} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/[0.03] border border-black/[0.05] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-dark animate-pulse" />
            <span className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/70 font-bold">
              Activity Archive
            </span>
          </motion.div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-slate-dark">
            All Meetings
          </motion.h1>
        </div>
        
        <motion.div variants={fadeInUp} transition={springCalm} className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center font-anthropic-sans font-medium text-[13px] bg-white border border-black/10 text-slate-dark px-5 py-2.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-stone-50 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Dashboard
            </span>
          </Link>
        </motion.div>
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
            className="w-full flex flex-col items-center justify-center py-32 bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
          >
            <div className="w-16 h-16 bg-black/[0.03] border border-black/[0.05] rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-slate-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h3 className="font-anthropic-serif text-[24px] text-slate-dark tracking-tight mb-2">No meetings yet</h3>
            <p className="font-anthropic-sans text-[14px] text-slate-dark/50 max-w-[300px] text-center">
              Deploy the bot or upload a transcript from the dashboard to get started.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden"
          >
             {/* List Header (Desktop) */}
             <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/[0.06] bg-black/[0.01]">
               <div className="col-span-5 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Meeting Title</div>
               <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Customer</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Date</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Status</div>
             </div>
             
             {/* List Items */}
             <div className="divide-y divide-black/[0.04]">
               {meetings.map((m) => (
                 <motion.div
                    key={m.meeting_id}
                    onClick={() => router.push(`/dashboard/meeting/${m.meeting_id}`)}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-y-3 gap-x-4 px-6 py-4 md:items-center hover:bg-black/[0.02] cursor-pointer transition-colors"
                  >
                     <div className="col-span-5 flex items-center min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center shrink-0 mr-4 group-hover:bg-white group-hover:border-black/[0.1] transition-colors shadow-sm">
                           <svg className="w-5 h-5 text-slate-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                        <h3 className="font-anthropic-sans font-medium text-[14px] text-slate-dark truncate group-hover:text-clay-deep transition-colors">
                          {m.title || "Untitled Meeting"}
                        </h3>
                     </div>

                     <div className="col-span-3 flex items-center min-w-0 pr-4">
                        <Link
                          href={`/dashboard/customers/${m.customer.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-anthropic-sans text-[13px] text-slate-dark/70 hover:text-slate-dark transition-colors truncate"
                        >
                          {m.customer.customer_name}
                        </Link>
                     </div>

                     <div className="col-span-2 flex items-center">
                        <span className="font-anthropic-mono text-[11px] text-slate-dark/50">
                          {formatDate(m.meeting_date)}
                        </span>
                     </div>

                     <div className="col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {m.status === "processing" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              m.status === "completed" ? "bg-green-500" :
                              m.status === "failed" ? "bg-red-500" :
                              "bg-slate-dark/20"
                            }`} />
                          )}
                          <span className={`font-anthropic-mono text-[10px] uppercase tracking-widest font-bold ${
                            m.status === "completed" ? "text-green-700" :
                            m.status === "processing" ? "text-clay-deep" :
                            m.status === "failed" ? "text-red-600" :
                            "text-slate-dark/50"
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-slate-dark/20 group-hover:text-slate-dark/60 transition-colors hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                     </div>
                 </motion.div>
               ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
