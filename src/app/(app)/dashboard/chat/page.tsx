"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeInUp,
  staggerContainer,
  springCalm,
  easeSoft,
  hoverScale,
  tapScale,
} from "@/lib/animations";

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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [specificDate, setSpecificDate] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [greeting, setGreeting] = useState("Good morning.");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Derived: how many filters are active
  const activeFilterCount = [
    customerId,
    specificDate || startDate || endDate ? "date" : "",
  ].filter(Boolean).length;

  // Load sessions + customers + time on mount
  useEffect(() => {
    const token = getToken();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning.");
    else if (hour < 18) setGreeting("Good afternoon.");
    else setGreeting("Good evening.");

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

    fetchSessions();
    fetchCustomers();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
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

  const handleSend = async () => {
    if (!query.trim() || sending) return;
    const userQuery = query.trim();
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

  return (
    <div className="-m-8 md:-m-12 flex h-[calc(100vh-69px)] bg-white overflow-hidden relative">
      {/* ── SESSIONS SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 0 : 240, opacity: isSidebarCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="shrink-0 bg-black/[0.01] border-r border-black/[0.04] flex flex-col overflow-hidden whitespace-nowrap"
      >
        <div className="p-5 border-b border-black/[0.04]">
          <motion.button
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 font-anthropic-sans font-medium text-[12px] uppercase tracking-wider text-slate-dark bg-white border border-black/[0.08] px-4 py-2.5 rounded-lg hover:bg-black/[0.02] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-3" data-lenis-prevent="true">
          {sessionsLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-black/[0.03] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
              <p className="font-anthropic-sans text-[12px] text-slate-dark/40 leading-relaxed">
                No history.<br />Start a new conversation.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-1 px-3"
            >
              {sessions.map((s) => (
                <motion.div key={s.id} variants={fadeInUp} transition={springCalm}>
                  <button
                    onClick={() => loadHistory(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
                      activeSession === s.id
                        ? "bg-white border-black/[0.06] shadow-sm text-slate-dark"
                        : "bg-transparent border-transparent hover:bg-black/[0.03] text-slate-dark/60 hover:text-slate-dark"
                    }`}
                  >
                    <p className="font-anthropic-sans text-[13px] font-medium truncate">
                      {s.title || "Untitled session"}
                    </p>
                    <p className="font-anthropic-mono text-[9px] font-bold uppercase tracking-widest text-slate-dark/30 mt-1">
                      {formatDate(s.created_at)}
                    </p>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col bg-[#fdfdfc] overflow-hidden relative">
        {/* Floating Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-4 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-black/[0.08] text-slate-dark/60 hover:text-slate-dark hover:bg-black/[0.02] shadow-sm transition-colors"
          title={isSidebarCollapsed ? "Open history" : "Close history"}
        >
          {isSidebarCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          )}
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-20 md:px-16 scroll-smooth" data-lenis-prevent="true">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springCalm} className="h-full flex flex-col items-center justify-center text-center max-w-[500px] mx-auto pb-20">
              <h2 className="font-anthropic-serif text-[32px] tracking-tight text-slate-dark mb-4 leading-[1.1]">
                {greeting}
              </h2>
              <p className="font-anthropic-sans text-[15px] text-slate-dark/50 leading-relaxed max-w-[400px]">
                Search across all your recorded meetings, extract action items, or gauge customer sentiment.
              </p>
            </motion.div>
          ) : (
            <div className="max-w-[1000px] mx-auto flex flex-col gap-6 pb-8">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springCalm}
                    className={`flex gap-4 w-full ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Bubble Content */}
                    <div className={`max-w-[85%] px-5 py-4 ${
                      m.role === "user"
                        ? "bg-slate-dark text-white rounded-2xl rounded-tr-[4px] shadow-sm"
                        : "bg-white border border-black/[0.08] text-slate-dark rounded-2xl rounded-tl-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                    }`}>
                      {m.pending ? (
                        <div className="flex gap-1.5 items-center h-6">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                              className={`w-1.5 h-1.5 rounded-full ${m.role === "user" ? "bg-white/40" : "bg-slate-dark/30"}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`font-anthropic-sans text-[14px] leading-[1.6] whitespace-pre-wrap ${m.role === 'user' ? 'text-white/90' : 'text-slate-dark/90'}`}>
                          {m.content}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>
 
        {/* ── INPUT + FILTERS AREA ── */}
        <div className="px-6 py-6 md:px-12 bg-[#fdfdfc] border-t border-black/[0.04] shrink-0 z-10">
          {/* Active filter pills */}
          <AnimatePresence>
            {(customerId || startDate || endDate || specificDate) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-[1000px] mx-auto flex flex-wrap gap-2 mb-3"
              >
                {customerId && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1.5 rounded border border-clay/20">
                    {customers.find(c => c.id === parseInt(customerId))?.customer_name || "Customer"}
                    <button onClick={() => setCustomerId("")} className="hover:text-slate-dark transition-colors ml-1">×</button>
                  </span>
                )}
                {specificDate && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1.5 rounded border border-clay/20">
                    Date: {specificDate}
                    <button onClick={() => setSpecificDate("")} className="hover:text-slate-dark transition-colors ml-1">×</button>
                  </span>
                )}
                {!specificDate && (startDate || endDate) && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1.5 rounded border border-clay/20">
                    {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                    <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-slate-dark transition-colors ml-1">×</button>
                  </span>
                )}
                <button onClick={clearFilters} className="font-anthropic-sans text-[10px] font-semibold text-slate-dark/40 hover:text-slate-dark transition-colors uppercase tracking-widest ml-2">
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* Collapsible filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="max-w-[1000px] mx-auto mb-4 bg-white border border-black/[0.08] rounded-xl p-6 flex flex-col gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative z-20">
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
                    <p className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-slate-dark/60">Query Filters</p>
                    <button onClick={() => setShowFilters(false)} className="text-slate-dark/40 hover:text-slate-dark">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer filter */}
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/50">Customer</label>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-black/[0.02] border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/50 transition-colors"
                      >
                        <option value="">All customers</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.customer_name}</option>
                        ))}
                      </select>
                    </div>
  
                    {/* Specific date */}
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/50 flex items-center justify-between">
                        Specific date
                        <span className="font-normal text-[9px] text-slate-dark/30 tracking-normal">(Overrides range)</span>
                      </label>
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setStartDate(""); setEndDate(""); } }}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-black/[0.02] border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/50 transition-colors"
                      />
                    </div>
                  </div>
 
                  {/* Date range */}
                  <div className="flex flex-col gap-2">
                    <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/50 flex items-center gap-2">
                      Date window
                      {specificDate && <span className="font-normal text-[9px] tracking-normal text-slate-dark/30">(Disabled)</span>}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="date"
                        value={startDate}
                        disabled={!!specificDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-black/[0.02] border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/50 transition-colors disabled:opacity-40"
                      />
                      <span className="font-anthropic-mono text-[10px] text-slate-dark/40 shrink-0 uppercase">to</span>
                      <input
                        type="date"
                        value={endDate}
                        disabled={!!specificDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-black/[0.02] border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/50 transition-colors disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* Textarea + send + filter toggle */}
          <div className="max-w-[1000px] mx-auto bg-white border border-black/[0.08] rounded-[28px] p-1.5 flex gap-2 items-end shadow-sm focus-within:border-black/[0.15] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all relative z-30">
            {/* Filter toggle */}
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-slate-dark text-white shadow-sm"
                  : "bg-transparent text-slate-dark/40 hover:text-slate-dark hover:bg-black/[0.03]"
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-slate-dark rounded-full border-2 border-white" />
                )}
              </div>
            </motion.button>
 
            <textarea
              ref={textareaRef}
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Smriti to analyze your meetings…"
              disabled={sending}
              className="flex-1 bg-transparent border-none text-slate-dark font-anthropic-sans text-[15px] leading-[1.6] py-3 px-2 outline-none placeholder:text-slate-dark/30 resize-none max-h-[160px] disabled:opacity-50"
            />
            
            {/* Send Button */}
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={handleSend}
              disabled={!query.trim() || sending}
              className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                 query.trim() && !sending ? "bg-slate-dark text-white shadow-sm hover:scale-105" : "bg-black/[0.03] text-slate-dark/20"
              }`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-slate-dark/30 border-t-slate-dark rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </motion.button>
          </div>
 
          <p className="max-w-[1000px] mx-auto mt-4 text-center font-anthropic-sans text-[11px] text-slate-dark/40">
            Smriti can make mistakes. Please verify important information.
            {activeFilterCount > 0 && <span className="text-slate-dark ml-1 font-semibold">· {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
