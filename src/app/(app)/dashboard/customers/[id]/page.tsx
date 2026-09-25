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
    <div className="max-w-[1280px] w-full mx-auto">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/40 hover:text-slate-dark transition-colors mb-12"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Directory
      </button>

      {/* Header */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16 border-b border-stone/40 pb-12"
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mb-4 flex items-center gap-2">
              Customer Profile
              {customer?.status && (
                <>
                  <span className="text-stone/60">·</span>
                  <span className={`${
                    customer.status === "Active" ? "text-green-700" :
                    customer.status === "Closed" ? "text-slate-dark/50" :
                    "text-clay-deep"
                  }`}>
                    {customer.status}
                  </span>
                </>
              )}
            </motion.p>
            <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[64px] leading-[1.05] tracking-tight text-slate-dark">
              {customer?.customer_name || "Unknown Customer"}
            </motion.h1>
            
            <motion.div variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-slate-dark/60 flex flex-wrap gap-6 mt-6">
              {customer?.industry && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.industry}
                </div>
              )}
              {customer?.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="hover:text-clay-deep transition-colors hover:underline">
                    {customer.website}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
          
          <motion.div variants={fadeInUp} transition={springCalm} className="md:text-right">
            <div className="font-anthropic-serif text-[64px] tracking-tight leading-none text-slate-dark">
              {meetings.length}
            </div>
            <div className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mt-3">
              Total Meetings
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Meetings List */}
      <div>
        <h2 className="font-anthropic-serif text-[32px] tracking-tight text-slate-dark mb-8">
          Meeting <em className="italic font-normal text-clay-deep">history.</em>
        </h2>
        
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
              <p className="font-anthropic-serif text-[20px] text-slate-dark/40">
                No meetings recorded yet.<br/>Deploy the bot or upload a transcript from the top navigation.
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
                  key={m.id}
                  variants={fadeInUp}
                  transition={springCalm}
                  whileHover={hoverLift}
                >
                  <Link
                    href={`/dashboard/meeting/${m.id}`}
                    className="group flex items-center justify-between bg-[#fdfaf6] border border-stone/40 rounded-3xl p-6 hover:border-slate-dark/20 hover:bg-white hover:shadow-xl hover:shadow-stone/10 transition-all block"
                  >
                    <div>
                      <h3 className="font-anthropic-serif text-[24px] tracking-tight text-slate-dark group-hover:text-clay-deep transition-colors mb-2">
                        {m.title || "Untitled Meeting"}
                      </h3>
                      <div className="flex items-center gap-3 font-anthropic-sans text-[14px] text-slate-dark/50">
                        <span>{formatDate(m.meeting_date)}</span>
                        <span className="w-1 h-1 bg-stone/60 rounded-full"></span>
                        <span className="flex items-center gap-2">
                          {m.status === "completed" || m.status === "Completed" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Completed
                            </>
                          ) : m.status === "recording" || m.status === "processing" ? (
                            <>
                              <motion.span
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className={`w-1.5 h-1.5 rounded-full ${m.status === "recording" ? "bg-red-500" : "bg-clay"}`}
                              />
                              {m.status === "recording" ? "Recording in progress…" : "Processing…"}
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-stone"></span>
                              {m.status}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 text-slate-dark/30 group-hover:text-clay-deep transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
