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
    <div className="max-w-[1280px] w-full mx-auto">
      {/* Header */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16"
      >
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mb-4">
          Activity
        </motion.p>
        <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[64px] md:text-[88px] tracking-tight leading-[1.05] text-slate-dark">
          <em className="italic font-normal text-clay-deep">All</em> <br/> meetings.
        </motion.h1>
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[20px] text-slate-dark/60 mt-6 leading-relaxed">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} across all customers, sorted by most recent.
        </motion.p>
      </motion.div>

      {/* Meetings List */}
      <AnimatePresence mode="wait">
        {meetings.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springCalm}
            className="text-center py-24 bg-[#fdfaf6] border border-stone/40 rounded-[32px]"
          >
            <p className="font-anthropic-serif text-[20px] text-slate-dark/40 leading-relaxed">
              No meetings recorded yet.<br />Deploy the bot or upload a transcript to get started.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-4"
          >
            {meetings.map((m) => (
              <motion.div
                variants={fadeInUp}
                transition={springCalm}
                whileHover={hoverLift}
                key={m.meeting_id}
                onClick={() => router.push(`/dashboard/meeting/${m.meeting_id}`)}
                className="group bg-[#fdfaf6] border border-stone/40 rounded-[32px] p-6 px-8 hover:border-slate-dark/20 hover:bg-white hover:shadow-xl hover:shadow-stone/10 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-6 min-w-0">
                  {/* Status dot with Framer pulse for processing */}
                  {m.status === "processing" ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="shrink-0 w-2.5 h-2.5 rounded-full bg-clay"
                    />
                  ) : (
                    <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${
                      m.status === "completed" ? "bg-green-500" :
                      m.status === "failed" ? "bg-red-400" :
                      "bg-stone"
                    }`} />
                  )}

                  <div className="min-w-0">
                    <h3 className="font-anthropic-serif text-[24px] tracking-tight text-slate-dark group-hover:text-clay-deep transition-colors truncate mb-1">
                      {m.title || "Untitled Meeting"}
                    </h3>
                    <div className="flex items-center gap-3 font-anthropic-sans text-[14px] text-slate-dark/50">
                      <Link
                        href={`/dashboard/customers/${m.customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-slate-dark hover:underline transition-colors"
                      >
                        {m.customer.customer_name}
                      </Link>
                      {m.customer.industry && (
                        <>
                          <span className="w-1 h-1 bg-stone/60 rounded-full shrink-0" />
                          <span>{m.customer.industry}</span>
                        </>
                      )}
                      <span className="w-1 h-1 bg-stone/60 rounded-full shrink-0" />
                      <span>{formatDate(m.meeting_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 ml-4">
                  {/* Status label */}
                  <span className={`font-anthropic-sans text-[10px] font-bold uppercase tracking-[0.15em] ${
                    m.status === "completed" ? "text-green-700" :
                    m.status === "processing" ? "text-clay-deep" :
                    m.status === "failed" ? "text-red-600" :
                    "text-slate-dark/40"
                  }`}>
                    {m.status}
                  </span>

                  <svg className="w-5 h-5 text-slate-dark/30 group-hover:text-clay-deep transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
