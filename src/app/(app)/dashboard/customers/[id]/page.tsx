"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  staggerContainerSlow,
  springCalm,
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
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-slate-dark/20 border-t-slate-dark rounded-full animate-spin" />
          <p className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Loading Profile</p>
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
    <div className="w-full max-w-[1200px] mx-auto pb-24 pt-4">
      {/* ── BREADCRUMB / BACK ── */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-3 font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/40 hover:text-slate-dark transition-colors mb-10"
      >
        <div className="w-8 h-8 rounded-[8px] bg-black/[0.03] border border-black/[0.05] flex items-center justify-center group-hover:bg-white group-hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        Back to Directory
      </button>

      {/* ── HEADER PROFILE ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-12 bg-white border border-black/[0.06] rounded-[24px] p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-[18px] bg-gradient-to-b from-[#fdfaf6] to-[#f4f0ec] border border-black/[0.06] flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] mt-1">
              <span className="font-anthropic-serif text-[32px] font-medium text-slate-dark">
                {customer?.customer_name?.charAt(0) || "C"}
              </span>
            </div>
            
            <div>
              <motion.div variants={fadeInUp} transition={springCalm} className="mb-4">
                <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-md ${
                  customer?.status === "Active" ? "bg-[#f2f8f4] text-[#2c7a4b] border border-[#d0ead9]" :
                  customer?.status === "Closed" ? "bg-[#f4f4f4] text-slate-dark/50 border border-black/[0.05]" :
                  "bg-clay/10 text-clay-deep border border-clay/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    customer?.status === "Active" ? "bg-[#429563]" :
                    customer?.status === "Closed" ? "bg-slate-dark/30" :
                    "bg-clay"
                  }`} />
                  {customer?.status || "Lead"}
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[44px] md:text-[52px] leading-[1.1] tracking-tight text-slate-dark mb-5">
                {customer?.customer_name || "Unknown Customer"}
              </motion.h1>
              
              <motion.div variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-slate-dark/60 flex flex-wrap gap-8">
                {customer?.industry && (
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {customer.industry}
                  </div>
                )}
                {customer?.website && (
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="hover:text-slate-dark transition-colors hover:underline underline-offset-4 decoration-black/20">
                      {customer.website}
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          
          <motion.div variants={fadeInUp} transition={springCalm} className="md:text-right shrink-0 mt-6 md:mt-2 w-full md:w-auto">
            <div className="bg-[#fcfcfc] border border-black/[0.05] rounded-[16px] px-8 py-6 flex flex-col items-center justify-center min-w-[160px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
              <div className="font-anthropic-mono text-[48px] tracking-tighter leading-none text-slate-dark font-medium mb-3">
                {meetings.length}
              </div>
              <div className="font-anthropic-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-dark/40">
                Total Meetings
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── MEETINGS LIST ── */}
      <div>
        <div className="flex items-end justify-between mb-8 px-2">
           <h2 className="font-anthropic-serif text-[28px] tracking-tight text-slate-dark">
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
              className="w-full flex flex-col items-center justify-center py-32 bg-white border border-black/[0.06] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
            >
              <div className="w-20 h-20 bg-[#f9f9f8] border border-black/[0.05] rounded-[20px] flex items-center justify-center mb-6 shadow-sm">
                 <svg className="w-10 h-10 text-slate-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <h3 className="font-anthropic-serif text-[28px] text-slate-dark tracking-tight mb-3">No meetings recorded</h3>
              <p className="font-anthropic-sans text-[15px] text-slate-dark/50 max-w-[340px] text-center leading-[1.75]">
                Upload a transcript or deploy the bot to populate this customer&apos;s archive.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="bg-white border border-black/[0.06] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden"
            >
             {/* List Header (Desktop) */}
             <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/[0.04] bg-[#fafafa]">
               <div className="col-span-8 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Meeting Title</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Date</div>
               <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/40 font-bold">Status</div>
             </div>
             
             {/* List Items */}
             <div className="flex flex-col divide-y divide-black/[0.04]">
                {meetings.map((m) => (
                  <Link
                    key={m.id}
                    href={`/dashboard/meeting/${m.id}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#fafafa] transition-colors group block"
                  >
                    <div className="col-span-8 flex items-center gap-4 min-w-0 pr-4">
                      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-b from-[#fdfaf6] to-[#f4f0ec] border border-black/[0.06] flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] group-hover:scale-105 transition-transform duration-300">
                         <svg className="w-5 h-5 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                      </div>
                      <span className="font-anthropic-sans text-[15px] font-semibold text-slate-dark leading-snug group-hover:text-clay-deep transition-colors truncate">
                        {m.title || "Untitled Meeting"}
                      </span>
                    </div>
                    
                    <div className="col-span-2 font-anthropic-mono text-[12px] text-slate-dark/50">
                      {formatDate(m.meeting_date)}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-between">
                       <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${
                        (m.status === "completed" || m.status === "Completed") ? "bg-[#f2f8f4] text-[#2c7a4b] border border-[#d0ead9]" :
                        (m.status === "recording" || m.status === "processing") ? "bg-clay/10 text-clay-deep border border-clay/20" :
                        m.status === "failed" ? "bg-[#fef4f4] text-[#b93232] border border-[#fbdcdc]" :
                        "bg-[#f4f4f4] text-slate-dark/50 border border-black/[0.05]"
                      }`}>
                        {(m.status === "recording" || m.status === "processing") ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (m.status === "completed" || m.status === "Completed") ? "bg-[#429563]" :
                            m.status === "failed" ? "bg-[#b93232]" :
                            "bg-slate-dark/30"
                          }`} />
                        )}
                        {m.status === "recording" ? "Recording" : m.status === "processing" ? "Processing" : m.status}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
