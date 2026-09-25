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
    <div className="max-w-[1280px] w-full mx-auto">
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16"
      >
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mb-4">
          Directory
        </motion.p>
        <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[64px] md:text-[88px] leading-[1.05] tracking-tight text-slate-dark">
          <em className="italic font-normal text-clay-deep">Our</em> <br/> customers.
        </motion.h1>
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[20px] text-slate-dark/60 mt-6 max-w-[600px] leading-relaxed">
          Manage your accounts and review their meeting history. 
        </motion.p>
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
            className="text-center py-24 bg-[#fdfaf6] border border-stone/40 rounded-[32px]"
          >
            <p className="font-anthropic-serif text-[20px] text-slate-dark/40">
              No customers found. Add one from the dashboard.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {customers.map((c) => (
              <motion.div
                variants={fadeInUp}
                transition={springCalm}
                whileHover={hoverLiftCard}
                key={c.id}
              >
                <Link 
                  href={`/dashboard/customers/${c.id}`}
                  className="group block h-full bg-[#fdfaf6] border border-stone/40 rounded-[32px] p-8 hover:border-slate-dark/20 hover:bg-white hover:shadow-xl hover:shadow-stone/10 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className={`inline-flex items-center gap-2 font-anthropic-sans text-[10px] font-bold tracking-[0.15em] uppercase ${
                      c.status === "Active" ? "text-green-700" :
                      c.status === "Closed" ? "text-slate-dark/40" :
                      "text-clay-deep" // Lead
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "Active" ? "bg-green-500" :
                        c.status === "Closed" ? "bg-stone" :
                        "bg-clay"
                      }`} />
                      {c.status || "Lead"}
                    </span>
                  </div>
                  
                  <h2 className="font-anthropic-serif text-[32px] tracking-tight text-slate-dark leading-[1.1] mb-2">
                    {c.customer_name}
                  </h2>
                  
                  <div className="font-anthropic-sans text-[14px] text-slate-dark/60 flex flex-col gap-1 mb-10">
                    <p>{c.industry || "No industry specified"}</p>
                    {c.website && <p className="truncate">{c.website}</p>}
                  </div>

                  <div className="mt-auto pt-5 border-t border-stone/40 flex items-center justify-between text-slate-dark/50 group-hover:text-slate-dark transition-colors">
                    <span className="font-anthropic-sans font-medium text-[13px] tracking-wide">
                      View profile & meetings
                    </span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
