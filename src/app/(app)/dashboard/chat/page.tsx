"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
 fadeInUp,
 staggerContainer,
 springCalm,
 hoverScale,
 tapScale,
} from "@/lib/animations";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface Session {
 id: string;
 title: string;
 created_at: string;
}

interface Message {
 id: number;
 query: string;
 answer: string;
 created_at: string;
}

interface ChatBubble {
 role: "user" | "ai";
 content: string;
 pending?: boolean;
}

interface Customer {
 id: number;
 customer_name: string;
}

function getToken() {
 if (typeof window === "undefined") return null;
 return localStorage.getItem("access_token");
}

function formatDate(iso: string) {
 const d = new Date(iso);
 return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function getGreeting() {
 const hour = new Date().getHours();
 if (hour < 12) return "Good morning";
 if (hour < 17) return "Good afternoon";
 return "Good evening";
}

export default function ChatPage() {
 const [sessions, setSessions] = useState<Session[]>([]);
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [activeSession, setActiveSession] = useState<string | null>(null);
 const [messages, setMessages] = useState<ChatBubble[]>([]);
 const [query, setQuery] = useState("");
 const [sending, setSending] = useState(false);
 const [sessionsLoading, setSessionsLoading] = useState(true);
 const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

 const [user, setUser] = useState<{ salesperson_name: string } | null>(null);

 // Filters
 const [showFilters, setShowFilters] = useState(false);
 const [customerId, setCustomerId] = useState<string>("");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [specificDate, setSpecificDate] = useState("");

 const activeFilterCount = [
 customerId,
 specificDate || startDate || endDate ? "date" : "",
 ].filter(Boolean).length;

 const bottomRef = useRef<HTMLDivElement>(null);
 const textareaRef = useRef<HTMLTextAreaElement>(null);

 useEffect(() => {
 const token = getToken();

 const fetchUser = async () => {
 try {
 const res = await fetch(`${BASE}/auth/me`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 if (res.ok) setUser(await res.json());
 } catch { /* silent */ }
 };

 const fetchSessions = async () => {
 try {
 const res = await fetch(`${BASE}/chat/sessions`, {
 headers: { Authorization: `Bearer ${token || "dev"}` },
 });
 if (res.ok) setSessions(await res.json());
 } catch { /* silent */ }
 finally { setSessionsLoading(false); }
 };

 const fetchCustomers = async () => {
 try {
 const res = await fetch(`${BASE}/customers/list`, {
 headers: { Authorization: `Bearer ${token || "dev"}` },
 });
 if (res.ok) setCustomers(await res.json());
 } catch { /* silent */ }
 };

 fetchUser();
 fetchSessions();
 fetchCustomers();
 }, []);

 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 useEffect(() => {
 if (textareaRef.current) {
 textareaRef.current.style.height = "auto";
 textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
 }
 }, [query]);

 const loadHistory = async (sessionId: string) => {
 setActiveSession(sessionId);
 setMessages([]);
 const token = getToken();
 try {
 const res = await fetch(`${BASE}/chat/history/${sessionId}`, {
 headers: { Authorization: `Bearer ${token || "dev"}` },
 });
 if (res.ok) {
 const history: Message[] = await res.json();
 const bubbles: ChatBubble[] = [];
 history.forEach((m) => {
 bubbles.push({ role: "user", content: m.query });
 bubbles.push({ role: "ai", content: m.answer });
 });
 setMessages(bubbles);
 }
 } catch { /* silent */ }
 };

 const startNewChat = () => {
 setActiveSession(null);
 setMessages([]);
 setQuery("");
 };

 const clearFilters = () => {
 setCustomerId("");
 setStartDate("");
 setEndDate("");
 setSpecificDate("");
 };

 const handleSend = async (overrideQuery?: string) => {
 const userQuery = (overrideQuery || query).trim();
 if (!userQuery || sending) return;
 setQuery("");
 setSending(true);

 setMessages((prev) => [
 ...prev,
 { role: "user", content: userQuery },
 { role: "ai", content: "", pending: true },
 ]);

 const token = getToken();

 const filterPayload = {
 customer_id: customerId ? parseInt(customerId) : null,
 specific_date: specificDate || null,
 start_date: specificDate ? null : (startDate || null),
 end_date: specificDate ? null : (endDate || null),
 };

 try {
 const res = await fetch(`${BASE}/chat/ask`, {
 method: "POST",
 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
 body: JSON.stringify({
 query: userQuery,
 session_id: activeSession,
 ...filterPayload,
 }),
 });

 const data = await res.json();

 if (res.ok) {
 setMessages((prev) => [
 ...prev.slice(0, -1),
 { role: "ai", content: data.answer },
 ]);

 if (!activeSession && data.session_id) {
 setActiveSession(data.session_id);
 setSessions((prev) => [
 { id: data.session_id, title: userQuery.slice(0, 60), created_at: new Date().toISOString() },
 ...prev,
 ]);
 }
 } else {
 setMessages((prev) => [
 ...prev.slice(0, -1),
 { role: "ai", content: data?.detail || "Something went wrong. Please try again." },
 ]);
 }
 } catch {
 setMessages((prev) => [
 ...prev.slice(0, -1),
 { role: "ai", content: "Could not reach the server. Please check your connection." },
 ]);
 } finally {
 setSending(false);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 };

 // Parse markdown-like syntax for the AI response to match the screenshot structured cards
 const renderStructuredContent = (content: string) => {
 if (!content.includes("---")) {
 return (
 <div className="bg-[#f0f4f8] rounded-[24px] rounded-tl-md px-6 py-4">
 <div className="font-anthropic-sans text-[16px] text-slate-800 leading-relaxed whitespace-pre-wrap">
 <ReactMarkdown 
 remarkPlugins={[remarkGfm]}
 components={{
 strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
 p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
 }}
 >
 {content}
 </ReactMarkdown>
 </div>
 </div>
 );
 }

 const parts = content.split("---");
 const preamble = parts[0].trim();
 const cardsText = parts[1].trim();
 const postamble = parts[2]?.trim();

 const cardLines = cardsText.split(/\d+\.\s\*\*/).filter(Boolean);

 return (
 <div className="flex flex-col gap-4">
 {preamble && (
 <div className="bg-[#f0f4f8] rounded-[24px] rounded-tl-md px-6 py-4">
 <div className="font-anthropic-sans text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
 <ReactMarkdown 
 remarkPlugins={[remarkGfm]}
 components={{
 strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
 p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
 }}
 >
 {preamble}
 </ReactMarkdown>
 </div>
 </div>
 )}
 
 <div className="flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden ml-2">
 {cardLines.map((card, i) => {
 const titleMatch = card.split("**");
 const title = titleMatch[0]?.trim();
 const desc = titleMatch[1]?.trim();
 
 const icons = [
 { bg: "bg-orange-50", text: "text-orange-500", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
 { bg: "bg-purple-50", text: "text-purple-500", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
 { bg: "bg-blue-50", text: "text-blue-500", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
 { bg: "bg-red-50", text: "text-red-500", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> }
 ];
 const icon = icons[i % icons.length];

 return (
 <div key={i} className={`p-4 flex gap-4 ${i !== cardLines.length - 1 ? 'border-b border-slate-100' : ''}`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${icon.bg} ${icon.text}`}>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 {icon.svg}
 </svg>
 </div>
 <div>
 <h4 className="font-anthropic-sans font-medium text-[15px] text-slate-900 mb-1">{title}</h4>
 <p className="font-anthropic-sans text-[14px] text-slate-500 leading-relaxed">{desc}</p>
 </div>
 </div>
 );
 })}
 </div>

 {postamble && (
 <div className="bg-[#f0f4f8] rounded-[24px] px-6 py-4">
 <div className="font-anthropic-sans text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
 <ReactMarkdown 
 remarkPlugins={[remarkGfm]}
 components={{
 strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
 p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
 }}
 >
 {postamble}
 </ReactMarkdown>
 </div>
 </div>
 )}
 
 {/* Action Buttons below AI structured content */}
 <div className="flex items-center gap-3 pt-2 ml-4">
 <button className="text-slate-400 hover:text-slate-700 transition-colors">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
 </button>
 <button className="text-slate-400 hover:text-slate-700 transition-colors">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
 </button>
 <button className="text-slate-400 hover:text-slate-700 transition-colors transform rotate-180">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
 </button>
 </div>
 </div>
 );
 };

 return (
 <div className="-m-4 md:-m-8 flex h-[calc(100vh-66px)] overflow-hidden bg-[#fdfcfc]">
 {/* HISTORY SIDEBAR */}
 <motion.aside
 initial={false}
 animate={{ width: isHistoryCollapsed ? 0 : 360, opacity: isHistoryCollapsed ? 0 : 1 }}
 transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
 className="shrink-0 border-r border-slate-100 flex flex-col bg-[#fdfcfc] whitespace-nowrap overflow-hidden"
 >
 {/* Sidebar Header */}
 <div className="p-6 flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <h2 className="font-anthropic-serif text-[22px] font-medium text-slate-800 tracking-tight ml-2">Conversations</h2>
 <button 
 onClick={() => setIsHistoryCollapsed(true)}
 className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
 title="Collapse history"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
 </svg>
 </button>
 </div>
 <button
 onClick={startNewChat}
 className="w-full flex items-center justify-center gap-2.5 font-anthropic-sans text-[15px] font-medium text-slate-700 bg-white border border-slate-200 px-4 py-3.5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-sm transition-all mb-4"
 >
 <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 New conversation
 </button>
 </div>

 {/* Sessions List */}
 <div className="flex-1 overflow-y-auto px-6 pb-6" data-lenis-prevent="true">
 <p className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">
 Recent
 </p>

 <motion.div
 variants={staggerContainer}
 initial="initial"
 animate="animate"
 className="flex flex-col gap-2"
 >
 {sessions.length === 0 && !sessionsLoading ? (
 <p className="font-anthropic-sans text-[13px] text-slate-500 px-4 mt-4 text-center">No conversations yet.</p>
 ) : (
 sessions.map((s) => {
 const isActive = activeSession === s.id;
 return (
 <motion.div key={s.id} variants={fadeInUp} transition={springCalm}>
 <button
 onClick={() => loadHistory(s.id)}
 className={`group w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-200 flex flex-col gap-1 ${
 isActive
 ? "bg-[#f4eae1]"
 : "hover:bg-slate-50"
 }`}
 >
 <div className="flex items-center justify-between w-full">
 <p className={`font-anthropic-sans text-[14px] font-medium truncate ${isActive ? "text-slate-900" : "text-slate-700"}`}>
 {s.title || "Untitled"}
 </p>
 <span className="font-anthropic-sans text-[11px] text-slate-400 shrink-0 ml-3">{formatDate(s.created_at)}</span>
 </div>
 <p className={`font-anthropic-sans text-[12px] truncate ${isActive ? "text-slate-600" : "text-slate-400"}`}>
 {s.title}
 </p>
 </button>
 </motion.div>
 );
 })
 )}
 </motion.div>
 </div>
 </motion.aside>

 {/* MAIN CHAT AREA */}
 <div className="flex-1 flex flex-col bg-white overflow-hidden relative">

 {/* Floating sidebar toggle (when collapsed) */}
 <AnimatePresence>
 {isHistoryCollapsed && (
 <motion.button
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 onClick={() => setIsHistoryCollapsed(false)}
 className="absolute top-6 left-6 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
 title="Open history"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
 </svg>
 </motion.button>
 )}
 </AnimatePresence>

 {/* Message Thread */}
 <div className="flex-1 overflow-y-auto px-8 py-10 relative flex flex-col" data-lenis-prevent="true">
 {messages.length === 0 && !sessionsLoading ? (
 <div className="flex-1 flex flex-col items-center justify-center -mt-10">
 <motion.h1 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className="font-anthropic-serif text-3xl md:text-4xl font-medium text-slate-400 text-center tracking-tight"
 >
 {getGreeting()}, {user?.salesperson_name ? user.salesperson_name.split(' ')[0] : 'there'}.
 </motion.h1>
 </div>
 ) : (
 <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
 <AnimatePresence initial={false}>
 {messages.map((m, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}
 >
 {m.role === "user" ? (
 <div className="flex gap-4 max-w-[85%] flex-row-reverse">
 <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[14px] font-bold shrink-0 shadow-sm">
 A
 </div>
 <div className="flex flex-col items-end w-full mt-2">
 <div className="bg-[#f4eae1] rounded-[24px] rounded-tr-md px-6 py-4">
 <div className="font-anthropic-sans text-[16px] text-slate-900 leading-relaxed">
 {m.content}
 </div>
 </div>
 <span className="font-anthropic-sans text-[11px] text-slate-400 mt-2 mr-2">9:38 AM</span>
 </div>
 </div>
 ) : (
 <div className="flex gap-4 max-w-[95%]">
 <div className="w-9 h-9 rounded-full shrink-0 shadow-md border border-slate-200 overflow-hidden relative">
 <Image src="/chatbot.webp" alt="AI Avatar" fill className="object-cover" />
 </div>
 <div className="flex flex-col items-start w-full mt-2">
 {m.pending ? (
 <div className="bg-[#f0f4f8] rounded-[24px] rounded-tl-md px-6 py-4 flex gap-1 items-center h-[56px]">
 {[0, 1, 2].map((dot) => (
 <motion.span
 key={dot}
 animate={{ opacity: [0.3, 1, 0.3] }}
 transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2, ease: "easeInOut" }}
 className="w-1.5 h-1.5 rounded-full bg-slate-400"
 />
 ))}
 </div>
 ) : (
 <div className="w-full">
 {renderStructuredContent(m.content)}
 </div>
 )}
 <span className="font-anthropic-sans text-[11px] text-slate-400 mt-2 ml-2">9:38 AM</span>
 </div>
 </div>
 )}
 </motion.div>
 ))}
 </AnimatePresence>
 <div ref={bottomRef} />
 </div>
 )}
 </div>

 {/* INPUT DOCK WITH FILTERS */}
 <div className="px-8 pb-4 pt-2 shrink-0 bg-white relative z-10">
 <div className="max-w-4xl mx-auto flex flex-col gap-4">
 
 {/* Filter Panel (Collapsible) */}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ height: 0, opacity: 0, y: 10 }}
 animate={{ height: "auto", opacity: 1, y: 0 }}
 exit={{ height: 0, opacity: 0, y: 10 }}
 transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
 className="overflow-hidden"
 >
 <div className="bg-[#fdfcfc] border border-slate-200 rounded-[20px] p-5 flex flex-col gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
 <div className="flex items-center justify-between">
 <p className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Filters</p>
 <button onClick={() => setShowFilters(false)} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="flex flex-col gap-2">
 <label className="font-anthropic-sans text-[12px] font-medium text-slate-600">Customer</label>
 <select
 value={customerId}
 onChange={(e) => setCustomerId(e.target.value)}
 className="font-anthropic-sans text-[14px] text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm"
 >
 <option value="">All customers</option>
 {customers.map((c) => (
 <option key={c.id} value={c.id}>{c.customer_name}</option>
 ))}
 </select>
 </div>

 <div className="flex flex-col gap-2">
 <label className="font-anthropic-sans text-[12px] font-medium text-slate-600">
 Specific Date
 </label>
 <input
 type="date"
 value={specificDate}
 onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setStartDate(""); setEndDate(""); } }}
 className="font-anthropic-sans text-[14px] text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm"
 />
 </div>
 </div>

 <div className="flex flex-col gap-2">
 <label className="font-anthropic-sans text-[12px] font-medium text-slate-600 flex items-center gap-2">
 Date Range
 {specificDate && <span className="font-normal text-[11px] text-slate-400">(Disabled ?" using specific date)</span>}
 </label>
 <div className="flex gap-3 items-center">
 <input
 type="date"
 value={startDate}
 disabled={!!specificDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="flex-1 font-anthropic-sans text-[14px] text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm disabled:opacity-50"
 />
 <span className="font-anthropic-sans text-[12px] text-slate-400 font-medium">to</span>
 <input
 type="date"
 value={endDate}
 disabled={!!specificDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="flex-1 font-anthropic-sans text-[14px] text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm disabled:opacity-50"
 />
 </div>
 </div>
 
 <div className="flex justify-end mt-1">
 <button onClick={clearFilters} className="font-anthropic-sans text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest px-3 py-1">
 Clear All
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Input Field */}
 <div className="bg-[#fdfcfc] border border-slate-200 rounded-[28px] pl-1.5 pr-1.5 py-1.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-slate-300 focus-within:shadow-md transition-all duration-300">
 
 <button 
 onClick={() => setShowFilters(!showFilters)}
 className={`shrink-0 w-14 h-11 rounded-full flex items-center justify-center transition-colors relative ${showFilters || activeFilterCount > 0 ? "bg-slate-200 text-slate-900 shadow-inner" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
 title="Search Filters"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
 </svg>
 {activeFilterCount > 0 && (
 <span className="absolute top-2.5 right-3.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
 )}
 </button>

 <textarea
 ref={textareaRef}
 rows={1}
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Ask anything about your meetings..."
 disabled={sending}
 className="flex-1 bg-transparent border-none text-slate-900 font-anthropic-sans text-[15px] py-2.5 px-2 outline-none placeholder:text-slate-400 resize-none max-h-[160px] disabled:opacity-50"
 />

 <div className="shrink-0 flex items-center pr-1">
 <motion.button
 whileHover={!sending && query.trim() ? hoverScale : undefined}
 whileTap={!sending && query.trim() ? tapScale : undefined}
 onClick={() => handleSend()}
 disabled={!query.trim() || sending}
 className={`shrink-0 h-11 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${
 query.trim() && !sending
 ? "bg-[#1a1a1a] text-white shadow-sm"
 : "bg-slate-100 text-slate-400"
 }`}
 >
 {sending ? (
 <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
 ) : (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
 <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 )}
 </motion.button>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
}
