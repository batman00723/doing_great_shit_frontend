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
 website?: string | null;
 status: string;
 email?: string | null;
 customer_image?: string | null;
}

function getCustomerImageUrl(path?: string | null) {
 if (!path) return null;
 if (path.startsWith("http://") || path.startsWith("https://")) return path;
 const cleanPath = path.startsWith("/") ? path : `/${path}`;
 if (cleanPath.startsWith("/media/")) {
 return `https://doing-great-shit.onrender.com${cleanPath}`;
 }
 return `https://doing-great-shit.onrender.com/media${cleanPath}`;
}

function CustomerAvatar({ 
  name, 
  image, 
  size = "card" 
}: { 
  name: string; 
  image?: string | null; 
  size?: "card" | "list";
}) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getCustomerImageUrl(image);
  const showImage = Boolean(imageUrl && !imgError);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  if (size === "list") {
    return (
      <div className="w-[52px] h-[52px] rounded-xl bg-white border border-slate-200/90 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
        {showImage ? (
          <img
            src={imageUrl!}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="font-anthropic-serif text-2xl font-semibold text-slate-800">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Card view size: prominent, beautifully proportioned, crisp
  return (
    <div className="w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
      {showImage ? (
        <img
          src={imageUrl!}
          alt={name}
          className="w-full h-full object-cover rounded-xl"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center">
          <span className="font-anthropic-serif text-3xl sm:text-4xl font-semibold text-slate-800">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
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
 const [copiedId, setCopiedId] = useState<number | null>(null);

 const handleCopyEmail = (e: React.MouseEvent, email: string, id: number) => {
 e.preventDefault();
 e.stopPropagation();
 navigator.clipboard.writeText(email);
 setCopiedId(id);
 setTimeout(() => setCopiedId(null), 2000);
 };

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
 (c.industry && c.industry.toLowerCase().includes(q)) ||
 (c.email && c.email.toLowerCase().includes(q)) ||
 (c.website && c.website.toLowerCase().includes(q))
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
 <div className="flex items-start justify-between mb-[48px] sm:mb-[56px]">
 <CustomerAvatar name={c.customer_name} image={c.customer_image} size="card" />
 
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
 
 <div className="flex flex-col gap-3 mb-8">
 <div className="font-anthropic-sans text-[15px] text-slate-600 flex items-center gap-3">
 <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 <span className="truncate">{c.industry || "General"}</span>
 </div>

 {c.email && (
 <button
 type="button"
 onClick={(e) => handleCopyEmail(e, c.email!, c.id)}
 title="Click to copy email address"
 className="font-anthropic-sans text-[15px] text-slate-600 hover:text-slate-950 flex items-center justify-between gap-3 group/email text-left transition-colors py-0.5 rounded-lg"
 >
 <div className="flex items-center gap-3 min-w-0">
 <svg className="w-5 h-5 text-slate-500 group-hover/email:text-slate-900 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 <span className="truncate group-hover/email:underline">{c.email}</span>
 </div>
 <span className="shrink-0 font-anthropic-mono text-[10px] uppercase tracking-wider text-slate-400 group-hover/email:text-slate-800 bg-slate-100 px-2 py-0.5 rounded transition-all">
 {copiedId === c.id ? "✓ Copied" : "Copy"}
 </span>
 </button>
 )}

 {c.website && (
 <a
 href={c.website.startsWith("http://") || c.website.startsWith("https://") ? c.website : `https://${c.website}`}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 title={`Open ${c.website} in new tab`}
 className="font-anthropic-sans text-[15px] text-slate-600 hover:text-slate-950 flex items-center justify-between gap-3 group/web transition-colors py-0.5 rounded-lg"
 >
 <div className="flex items-center gap-3 min-w-0">
 <svg className="w-5 h-5 text-slate-500 group-hover/web:text-slate-900 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
 </svg>
 <span className="truncate group-hover/web:underline">
 {c.website.replace(/^https?:\/\//i, "")}
 </span>
 </div>
 <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover/web:bg-slate-200/90 flex items-center justify-center shrink-0 transition-colors">
 <svg className="w-5 h-5 text-slate-600 group-hover/web:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </div>
 </a>
 )}
 </div>

 <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-slate-900 font-medium group-hover:text-black transition-colors mt-auto">
 <span className="font-anthropic-sans text-base">
 Open Profile
 </span>
 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
 <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </div>
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
 <div className="col-span-4 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Customer</div>
 <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Industry</div>
 <div className="col-span-3 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Contact Email</div>
 <div className="col-span-2 font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Website</div>
 <div className="col-span-1 text-right font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</div>
 </div>
 
 <div className="flex flex-col divide-y divide-slate-100">
 {filteredCustomers.map((c) => (
 <Link 
 key={c.id} 
 href={`/dashboard/customers/${c.id}`}
 className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors group"
 >
 <div className="col-span-4 flex items-center gap-6 sm:gap-7 min-w-0">
 <CustomerAvatar name={c.customer_name} image={c.customer_image} size="list" />
 <span className="font-anthropic-sans text-[15px] font-medium text-slate-900 group-hover:text-black transition-colors truncate">
 {c.customer_name}
 </span>
 </div>
 
 <div className="col-span-2 font-anthropic-sans text-sm text-slate-500 truncate">
 {c.industry || "—"}
 </div>

 <div className="col-span-3 font-anthropic-sans text-sm text-slate-600 truncate">
 {c.email ? (
 <button
 type="button"
 onClick={(e) => handleCopyEmail(e, c.email!, c.id)}
 title="Click to copy email"
 className="hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 group/listemail text-left truncate max-w-full"
 >
 <span className="truncate group-hover/listemail:underline">{c.email}</span>
 {copiedId === c.id ? (
 <span className="font-anthropic-mono text-[9px] uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
 ✓ Copied
 </span>
 ) : (
 <span className="opacity-0 group-hover/listemail:opacity-100 font-anthropic-mono text-[9px] uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 transition-opacity">
 Copy
 </span>
 )}
 </button>
 ) : "—"}
 </div>

 <div className="col-span-2 font-anthropic-sans text-sm text-slate-600 truncate">
 {c.website ? (
 <a
 href={c.website.startsWith("http://") || c.website.startsWith("https://") ? c.website : `https://${c.website}`}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 title={`Open ${c.website}`}
 className="hover:text-slate-900 hover:underline transition-colors inline-flex items-center gap-1.5 truncate max-w-full"
 >
 <span className="truncate">{c.website.replace(/^https?:\/\//i, "")}</span>
 <svg className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-900 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </a>
 ) : "—"}
 </div>

 <div className="col-span-1 flex justify-end">
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
