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
 <div className="flex items-center justify-center h-[60vh] bg-transparent">
 <p className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400">Loading Directory...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center justify-center h-[60vh] bg-transparent">
 <p className="font-anthropic-sans text-red-500">{error}</p>
 </div>
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto pb-32 pt-16 px-4 sm:px-6 lg:px-8 bg-transparent">
 {/* HEADER */}
 <motion.div
 variants={staggerContainerSlow}
 initial="initial"
 animate="animate"
 className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-32"
 >
 <div>
 <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-5xl md:text-7xl tracking-tight leading-[1.1] text-[#1a1a1a]">
 Customer <em className="italic font-normal text-slate-500">Directory</em>
 </motion.h1>
 <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-sm md:text-lg text-slate-500 mt-8 max-w-lg leading-relaxed">
 Manage your accounts, track meeting history, and analyze revenue-driving insights across your entire customer base.
 </motion.p>
 </div>

 <motion.div variants={fadeInUp} transition={springCalm} className="flex items-center">
 <Link
 href="/dashboard"
 className="group inline-flex items-center justify-center font-anthropic-sans text-base font-medium bg-[#1a1a1a] text-[#FDFCF8] px-7 py-3.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
 >
 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
 New Customer
 </Link>
 </motion.div>
 </motion.div>

 {/* TOOLBAR */}
 <motion.div 
 variants={fadeInUp}
 initial="initial"
 animate="animate"
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-24"
 >
 <div className="relative flex-1 max-w-3xl">
 <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input 
 type="text" 
 placeholder="Search customers by name, company, or industry..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[#fdfdfc] border border-slate-200 rounded-2xl pl-14 pr-4 py-3.5 font-anthropic-sans text-base text-slate-800 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400 shadow-sm"
 />
 </div>
 
 <div className="flex items-center gap-3">
 {/* View Toggle */}
 <div className="flex items-center gap-1 bg-[#fdfdfc] border border-slate-200 p-1.5 rounded-xl shadow-sm">
 <button 
 onClick={() => setViewMode("grid")}
 className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
 </button>
 <button 
 onClick={() => setViewMode("list")}
 className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
 </button>
 </div>
 </div>
 </motion.div>

 {/* CUSTOMERS CONTENT */}
 <AnimatePresence mode="wait">
 {customers.length === 0 ? (
 <motion.div
 key="empty-no-data"
 variants={fadeInUp}
 initial="initial"
 animate="animate"
 exit="exit"
 transition={springCalm}
 className="w-full flex flex-col items-center justify-center py-32"
 >
 <h3 className="font-anthropic-serif text-3xl text-slate-400 tracking-tight mb-3">No customers found</h3>
 <p className="font-anthropic-sans text-[15px] text-slate-500 max-w-[340px] text-center leading-[1.75]">
 Add your first customer from the main dashboard to start tracking their meeting history.
 </p>
 </motion.div>
 ) : filteredCustomers.length === 0 ? (
 <motion.div
 key="empty-search"
 variants={fadeIn}
 initial="initial"
 animate="animate"
 exit="exit"
 className="w-full py-24 text-center"
 >
 <p className="font-anthropic-sans text-[16px] text-slate-400">No customers match &quot;{searchQuery}&quot;</p>
 </motion.div>
 ) : viewMode === "grid" ? (
 /* GRID VIEW */
 <motion.div
 key="grid"
 variants={staggerContainer}
 initial="initial"
 animate="animate"
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {filteredCustomers.map((c) => (
 <motion.div variants={fadeInUp} transition={springCalm} key={c.id}>
 <Link 
 href={`/dashboard/customers/${c.id}`}
 className="group relative block bg-[#fdfdfc] border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
 >
 <div className="flex items-start justify-between mb-8">
 <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
 <span className="font-anthropic-serif text-2xl font-medium text-slate-800">
 {c.customer_name.charAt(0)}
 </span>
 </div>
 
 <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
 c.status === "Active" ? "bg-green-50 text-green-700" :
 c.status === "Closed" ? "bg-slate-100 text-slate-600" :
 "bg-orange-50 text-orange-700"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 c.status === "Active" ? "bg-green-500" :
 c.status === "Closed" ? "bg-slate-400" :
 "bg-orange-500"
 }`} />
 {c.status || "LEAD"}
 </span>
 </div>
 
 <h2 className="font-anthropic-serif text-3xl tracking-tight text-slate-900 leading-[1.2] mb-3 truncate group-hover:text-black transition-colors">
 {c.customer_name}
 </h2>
 
 <div className="font-anthropic-sans text-base text-slate-500 flex items-center gap-3 mb-10">
 <svg className="w-5 h-5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 <span className="truncate">{c.industry || "General"}</span>
 </div>

 <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-slate-900 font-medium group-hover:text-black transition-colors mt-auto">
 <span className="font-anthropic-sans text-base">
 Open Profile
 </span>
 <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
 className="bg-[#fdfdfc] border border-slate-200 rounded-[24px] shadow-sm overflow-hidden"
 >
 <div className="w-full text-left">
 <div className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50">
 <div className="col-span-5 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Customer Name</div>
 <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Industry</div>
 <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</div>
 <div className="col-span-1 text-right font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Action</div>
 </div>
 
 <div className="flex flex-col divide-y divide-slate-100">
 {filteredCustomers.map((c) => (
 <Link 
 key={c.id} 
 href={`/dashboard/customers/${c.id}`}
 className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors group"
 >
 <div className="col-span-5 flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
 <span className="font-anthropic-serif text-lg text-slate-800">{c.customer_name.charAt(0)}</span>
 </div>
 <span className="font-anthropic-sans text-[15px] font-medium text-slate-900 group-hover:text-black transition-colors">
 {c.customer_name}
 </span>
 </div>
 
 <div className="col-span-3 font-anthropic-sans text-sm text-slate-500 truncate">
 {c.industry || "—"}
 </div>

 <div className="col-span-3">
 <span className={`inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
 c.status === "Active" ? "bg-green-50 text-green-700" :
 c.status === "Closed" ? "bg-slate-100 text-slate-600" :
 "bg-orange-50 text-orange-700"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 c.status === "Active" ? "bg-green-500" :
 c.status === "Closed" ? "bg-slate-400" :
 "bg-orange-500"
 }`} />
 {c.status || "Lead"}
 </span>
 </div>

 <div className="col-span-1 flex justify-end">
 <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-all">
 <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
