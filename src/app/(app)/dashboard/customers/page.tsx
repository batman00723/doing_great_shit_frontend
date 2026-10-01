"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  hoverLiftCard,
} from "@/lib/animations";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE}/customers/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          setError("Failed to load customers.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading customers…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 inline-block">
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
              Directory
            </span>
          </motion.div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-slate-dark">
            Customers
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

      <AnimatePresence mode="wait">
        {customers.length === 0 ? (
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
              <svg className="w-8 h-8 text-slate-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 className="font-anthropic-serif text-[24px] text-slate-dark tracking-tight mb-2">No customers found</h3>
            <p className="font-anthropic-sans text-[14px] text-slate-dark/50 max-w-[300px] text-center">
              Add your first customer from the main dashboard to start analyzing meetings.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {customers.map((c) => (
              <motion.div
                variants={fadeInUp}
                transition={springCalm}
                key={c.id}
              >
                <Link 
                  href={`/dashboard/customers/${c.id}`}
                  className="group relative block h-full bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-black/[0.12] transition-all overflow-hidden flex flex-col"
                >
                  {/* Subtle top gradient based on status */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    c.status === "Active" ? "bg-green-500" :
                    c.status === "Closed" ? "bg-slate-dark/20" :
                    "bg-clay"
                  }`} />

                  <div className="flex items-start justify-between mb-6 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center shrink-0">
                       <svg className="w-5 h-5 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-black/[0.03] ${
                      c.status === "Active" ? "text-green-700" :
                      c.status === "Closed" ? "text-slate-dark/50" :
                      "text-clay-deep"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "Active" ? "bg-green-500" :
                        c.status === "Closed" ? "bg-slate-dark/30" :
                        "bg-clay"
                      }`} />
                      {c.status || "Lead"}
                    </span>
                  </div>
                  
                  <h2 className="font-anthropic-serif text-[24px] tracking-tight text-slate-dark leading-[1.1] mb-2 truncate group-hover:text-clay-deep transition-colors">
                    {c.customer_name}
                  </h2>
                  
                  <div className="font-anthropic-sans text-[13px] text-slate-dark/60 flex flex-col gap-1.5 mb-10">
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      {c.industry || "No industry"}
                    </p>
                    {c.website && (
                      <p className="flex items-center gap-2 truncate">
                        <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        {c.website}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-black/[0.04] flex items-center justify-between text-slate-dark/40 group-hover:text-slate-dark transition-colors">
                    <span className="font-anthropic-sans font-medium text-[12px]">
                      View Profile
                    </span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
