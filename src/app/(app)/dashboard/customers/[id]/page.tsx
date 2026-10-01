"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  id: number;
  title: string;
  meeting_date: string;
  status: string;
}

interface Customer {
  id: number;
  customer_name: string;
  industry: string;
  website: string;
  status: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatDate(iso: string) {
  if (!iso) return "Unknown Date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CustomerMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: customerId } = use(params);
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const [meetingsRes, customersRes] = await Promise.all([
          fetch(`${BASE}/analyse/customer/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE}/customers/list`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!meetingsRes.ok || !customersRes.ok) {
          throw new Error("Failed to load data");
        }

        const meetingsData = await meetingsRes.json();
        const customersData: Customer[] = await customersRes.json();
        
        const foundCustomer = customersData.find(c => c.id === parseInt(customerId));
        if (foundCustomer) {
          setCustomer(foundCustomer);
        }

        setMeetings(meetingsData);
      } catch (err) {
        setError("Could not reach the server or data not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading customer profile…</p>
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
      {/* ── BREADCRUMB / BACK ── */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-2 font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/40 hover:text-slate-dark transition-colors mb-10"
      >
        <div className="w-6 h-6 rounded-md bg-black/[0.03] border border-black/[0.05] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        Directory
      </button>

      {/* ── HEADER PROFILE ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16 bg-white border border-black/[0.06] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden"
      >
        {/* Subtle top gradient based on status */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          customer?.status === "Active" ? "bg-green-500" :
          customer?.status === "Closed" ? "bg-slate-dark/20" :
          "bg-clay"
        }`} />

        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mt-2">
          <div>
            <motion.div variants={fadeInUp} transition={springCalm} className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-black/[0.03] border border-black/[0.05] flex items-center justify-center shadow-sm">
                 <svg className="w-6 h-6 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-md bg-black/[0.03] border border-black/[0.03] ${
                customer?.status === "Active" ? "text-green-700" :
                customer?.status === "Closed" ? "text-slate-dark/50" :
                "text-clay-deep"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  customer?.status === "Active" ? "bg-green-500" :
                  customer?.status === "Closed" ? "bg-slate-dark/30" :
                  "bg-clay"
                }`} />
                {customer?.status || "Lead"}
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[40px] md:text-[48px] leading-[1] tracking-tight text-slate-dark mb-4">
              {customer?.customer_name || "Unknown Customer"}
            </motion.h1>
            
            <motion.div variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[14px] text-slate-dark/60 flex flex-wrap gap-6 mt-6">
              {customer?.industry && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.industry}
                </div>
              )}
              {customer?.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="hover:text-slate-dark transition-colors hover:underline">
                    {customer.website}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
          
          <motion.div variants={fadeInUp} transition={springCalm} className="md:text-right shrink-0 mt-2 md:mt-0">
            <div className="font-anthropic-mono text-[48px] tracking-tighter leading-none text-slate-dark font-medium bg-black/[0.02] border border-black/[0.05] rounded-xl px-6 py-4 flex items-center justify-center min-w-[120px] shadow-inner shadow-black/[0.02]">
              {meetings.length}
            </div>
            <div className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-slate-dark/40 mt-3 text-center md:text-right px-2">
              Total Meetings
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── MEETINGS LIST ── */}
      <div>
        <div className="flex items-end justify-between mb-6 px-2">
           <h2 className="font-anthropic-serif text-[24px] tracking-tight text-slate-dark">
             Meeting Archive
           </h2>
           <span className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold hidden md:block">
             Sorted by newest
           </span>
        </div>
        
        <AnimatePresence mode="wait">
          {meetings.length === 0 ? (
            <motion.div
              key="empty"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springCalm}
              className="w-full flex flex-col items-center justify-center py-24 bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
            >
              <div className="w-16 h-16 bg-black/[0.03] border border-black/[0.05] rounded-2xl flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-slate-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <p className="font-anthropic-serif text-[20px] text-slate-dark tracking-tight text-center mb-2">
                No meetings recorded yet.
              </p>
              <p className="font-anthropic-sans text-[14px] text-slate-dark/50 text-center">
                Analyze a new meeting to populate this archive.
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
               <div className="col-span-8 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Meeting Title</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Date</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Status</div>
             </div>
             
             {/* List Items */}
             <div className="divide-y divide-black/[0.04]">
                {meetings.map((m) => (
                  <motion.div key={m.id} variants={fadeInUp} transition={springCalm}>
                    <Link
                      href={`/dashboard/meeting/${m.id}`}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-y-3 gap-x-4 px-6 py-4 md:items-center hover:bg-black/[0.02] transition-colors block"
                    >
                      <div className="col-span-8 flex items-center min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center shrink-0 mr-4 group-hover:bg-white group-hover:border-black/[0.1] transition-colors shadow-sm">
                           <svg className="w-5 h-5 text-slate-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                        <h3 className="font-anthropic-sans font-medium text-[14px] text-slate-dark truncate group-hover:text-clay-deep transition-colors">
                          {m.title || "Untitled Meeting"}
                        </h3>
                      </div>
                      
                      <div className="col-span-2 flex items-center">
                        <span className="font-anthropic-mono text-[11px] text-slate-dark/50">
                          {formatDate(m.meeting_date)}
                        </span>
                      </div>
                      
                      <div className="col-span-2 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            {m.status === "completed" || m.status === "Completed" ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            ) : m.status === "recording" || m.status === "processing" ? (
                              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${m.status === "recording" ? "bg-red-500" : "bg-clay"}`} />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-dark/20"></span>
                            )}
                            <span className={`font-anthropic-mono text-[10px] uppercase tracking-widest font-bold ${
                              m.status === "completed" || m.status === "Completed" ? "text-green-700" :
                              m.status === "recording" || m.status === "processing" ? "text-clay-deep" :
                              "text-slate-dark/50"
                            }`}>
                              {m.status === "recording" ? "Recording" : m.status === "processing" ? "Processing" : m.status}
                            </span>
                         </div>
                         <svg className="w-5 h-5 text-slate-dark/20 group-hover:text-slate-dark/60 transition-colors hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
             </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
