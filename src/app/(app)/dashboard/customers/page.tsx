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
 hoverScale,
 tapScale,
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
 const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 
 const [searchQuery, setSearchQuery] = useState("");
 const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
 setFilteredCustomers(data);
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

 // Handle Search
 useEffect(() => {
 if (!searchQuery.trim()) {
 setFilteredCustomers(customers);
 } else {
 const q = searchQuery.toLowerCase();
 setFilteredCustomers(
 customers.filter(c => 
 c.customer_name.toLowerCase().includes(q) || 
 (c.industry && c.industry.toLowerCase().includes(q))
 )
 );
 }
 }, [searchQuery, customers]);

 if (loading) {
 return (
 <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-[60vh]">
 <div className="flex flex-col items-center gap-4">
 <div className="w-6 h-6 border-2 border-slate-dark/20 border-t-slate-dark rounded-full animate-spin" />
 <p className="font-anthropic-mono text-[10px] uppercase tracking-widest text-teal-100/40 font-bold">Loading Directory</p>
 </div>
 </motion.div>
 );
 }

 if (error) {
 return (
 <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5 inline-flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
 <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
 </div>
 <div>
 <p className="font-anthropic-sans font-semibold text-[14px] text-red-400">Failed to load</p>
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
 <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-white">
 Customer <em className="italic font-normal text-teal-100/40">Directory</em>
 </motion.h1>
 <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-teal-100/50 mt-5 max-w-[440px] leading-[1.75]">
 Manage your accounts, track meeting history, and analyze revenue-driving insights across your entire customer base.
 </motion.p>
 </div>

 <motion.div variants={fadeInUp} transition={springCalm} className="flex items-center gap-3">
 <Link
 href="/dashboard"
 className="group relative inline-flex items-center justify-center font-anthropic-sans font-medium text-[14px] bg-teal-600 text-white px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-teal-500 transition-all overflow-hidden"
 >
 <span className="relative z-10 flex items-center gap-2">
 <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
 New Customer
 </span>
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
 </Link>
 </motion.div>
 </motion.div>

 {/* ── TOOLBAR (Search & View Toggle) ── */}
 <motion.div 
 variants={fadeInUp}
 initial="initial"
 animate="animate"
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#0a1317] p-2 rounded-[20px] border border-teal-900/30"
 >
 <div className="relative flex-1 max-w-[400px]">
 <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input 
 type="text" 
 placeholder="Search by name or industry…" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[#091114] border border-teal-900/30 rounded-xl pl-[44px] pr-4 py-3 font-anthropic-sans text-[15px] text-white outline-none focus:border-clay/40 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-teal-100/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
 />
 </div>
 
 <div className="flex items-center gap-1 bg-[#091114] border border-teal-900/30 p-1.5 rounded-xl shadow-sm">
 <button 
 onClick={() => setViewMode("grid")}
 className={`w-10 h-9 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === 'grid' ? 'bg-[#0b161b] text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]' : 'text-teal-100/40 hover:text-white hover:bg-teal-900/10'}`}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
 </button>
 <button 
 onClick={() => setViewMode("list")}
 className={`w-10 h-9 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === 'list' ? 'bg-[#0b161b] text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]' : 'text-teal-100/40 hover:text-white hover:bg-teal-900/10'}`}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
 </button>
 </div>
 </motion.div>

 {/* ── CUSTOMERS CONTENT ── */}
 <AnimatePresence mode="wait">
 {customers.length === 0 ? (
 /* EMPTY STATE */
 <motion.div
 key="empty-no-data"
 variants={fadeInUp}
 initial="initial"
 animate="animate"
 exit="exit"
 transition={springCalm}
 className="w-full flex flex-col items-center justify-center py-32 bg-[#091114] border border-teal-900/30 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
 >
 <div className="w-20 h-20 bg-[#0a1317] border border-teal-900/25 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
 <svg className="w-10 h-10 text-teal-100/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
 </div>
 <h3 className="font-anthropic-serif text-[32px] text-white tracking-tight mb-3">No customers found</h3>
 <p className="font-anthropic-sans text-[15px] text-teal-100/50 max-w-[340px] text-center leading-[1.75]">
 Add your first customer from the main dashboard to start tracking their meeting history.
 </p>
 </motion.div>
 ) : filteredCustomers.length === 0 ? (
 /* EMPTY STATE (Search) */
 <motion.div
 key="empty-search"
 variants={fadeIn}
 initial="initial"
 animate="animate"
 exit="exit"
 className="w-full py-24 text-center"
 >
 <p className="font-anthropic-sans text-[16px] text-teal-100/40">No customers match &quot;{searchQuery}&quot;</p>
 </motion.div>
 ) : viewMode === "grid" ? (
 /* GRID VIEW */
 <motion.div
 key="grid"
 variants={staggerContainer}
 initial="initial"
 animate="animate"
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
 >
 {filteredCustomers.map((c) => (
 <motion.div variants={fadeInUp} transition={springCalm} key={c.id}>
 <Link 
 href={`/dashboard/customers/${c.id}`}
 className="group relative block h-full bg-[#091114] border border-teal-900/30 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-black/[0.12] transition-all overflow-hidden flex flex-col"
 >
 <div className="flex items-start justify-between mb-8">
 <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-[#0a1317] to-[#050a0c] border border-teal-900/30 flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-transform duration-500">
 <span className="font-anthropic-serif text-[20px] font-medium text-white">{c.customer_name.charAt(0)}</span>
 </div>
 
 <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-md ${
 c.status === "Active" ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" :
 c.status === "Closed" ? "bg-[#0b161b] text-teal-100/50 border border-teal-900/25" :
 "bg-teal-500/10 text-teal-400 border border-teal-500/20"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 c.status === "Active" ? "bg-[#429563]" :
 c.status === "Closed" ? "bg-slate-dark/30" :
 "bg-clay"
 }`} />
 {c.status || "Lead"}
 </span>
 </div>
 
 <h2 className="font-anthropic-serif text-[26px] tracking-tight text-white leading-[1.2] mb-4 truncate group-hover:text-teal-400 transition-colors">
 {c.customer_name}
 </h2>
 
 <div className="font-anthropic-sans text-[14px] text-teal-100/50 flex flex-col gap-3.5 mb-12">
 <p className="flex items-center gap-3">
 <svg className="w-[18px] h-[18px] opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
 {c.industry || "No industry"}
 </p>
 {c.website && (
 <p className="flex items-center gap-3 truncate">
 <svg className="w-[18px] h-[18px] opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
 {c.website}
 </p>
 )}
 </div>

 <div className="mt-auto pt-4 border-t border-teal-900/20 flex items-center justify-between text-teal-100/30 group-hover:text-white/80 transition-colors">
 <span className="font-anthropic-mono text-[10px] font-bold tracking-widest uppercase">
 Open Profile
 </span>
 <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </div>
 </Link>
 </motion.div>
 ))}
 </motion.div>
 ) : (
 /* LIST VIEW */
 <motion.div
 key="list"
 variants={fadeInUp}
 initial="initial"
 animate="animate"
 className="bg-[#091114] border border-teal-900/30 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
 >
 <div className="w-full text-left">
 <div className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-teal-900/20 bg-[#0a1317]">
 <div className="col-span-5 font-anthropic-mono text-[10px] uppercase tracking-widest text-teal-100/40 font-bold">Customer Name</div>
 <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-teal-100/40 font-bold">Industry</div>
 <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-teal-100/40 font-bold">Status</div>
 <div className="col-span-1 text-right font-anthropic-mono text-[10px] uppercase tracking-widest text-teal-100/40 font-bold">Action</div>
 </div>
 
 <div className="flex flex-col divide-y divide-black/[0.04]">
 {filteredCustomers.map((c) => (
 <Link 
 key={c.id} 
 href={`/dashboard/customers/${c.id}`}
 className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#0a1317] transition-colors group"
 >
 <div className="col-span-5 flex items-center gap-4">
 <div className="w-10 h-10 rounded-[10px] bg-gradient-to-b from-[#0a1317] to-[#050a0c] border border-teal-900/30 flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-transform duration-300">
 <span className="font-anthropic-serif text-[16px] font-medium text-white">{c.customer_name.charAt(0)}</span>
 </div>
 <span className="font-anthropic-sans text-[15px] font-semibold text-white leading-snug group-hover:text-teal-400 transition-colors">
 {c.customer_name}
 </span>
 </div>
 
 <div className="col-span-3 font-anthropic-sans text-[14px] text-white/60 truncate">
 {c.industry || "—"}
 </div>

 <div className="col-span-3">
 <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${
 c.status === "Active" ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/30" :
 c.status === "Closed" ? "bg-[#0b161b] text-teal-100/50 border border-teal-900/25" :
 "bg-teal-500/10 text-teal-400 border border-teal-500/20"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 c.status === "Active" ? "bg-[#429563]" :
 c.status === "Closed" ? "bg-slate-dark/30" :
 "bg-clay"
 }`} />
 {c.status || "Lead"}
 </span>
 </div>

 <div className="col-span-1 flex justify-end">
 <div className="w-8 h-8 rounded-full flex items-center justify-center text-teal-100/20 group-hover:text-white group-hover:bg-teal-900/10 transition-all">
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
