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

// ── Suggestion chips for the empty state ──
const SUGGESTIONS = [
  { label: "Summarize last week", query: "Summarize all meetings from last week" },
  { label: "Key action items", query: "What are the open action items across all customers?" },
  { label: "Customer sentiment", query: "How is customer sentiment trending this month?" },
  { label: "Revenue insights", query: "What revenue-related insights have come up recently?" },
];

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
  const [greeting, setGreeting] = useState("Good morning");

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
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

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

  return (
    <div className="-m-8 md:-m-12 flex h-[calc(100vh-69px)] overflow-hidden relative">
      {/* ── SESSIONS SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 0 : 260, opacity: isSidebarCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="shrink-0 bg-[#f9f9f8] border-r border-black/[0.06] flex flex-col overflow-hidden whitespace-nowrap"
      >
        {/* Sidebar Header */}
        <div className="p-4 pb-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2.5 font-anthropic-sans text-[13px] font-medium text-slate-dark/80 hover:text-slate-dark bg-white border border-black/[0.08] px-4 py-3 rounded-xl hover:border-black/[0.12] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
          >
            <svg className="w-4 h-4 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent="true">
          <p className="font-anthropic-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-dark/30 px-2 pt-3 pb-2">
            History
          </p>

          {sessionsLoading ? (
            <div className="flex flex-col gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-black/[0.03] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2 py-8 text-center">
              <p className="font-anthropic-sans text-[12px] text-slate-dark/30 leading-relaxed">
                No conversations yet.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-0.5"
            >
              {sessions.map((s) => (
                <motion.div key={s.id} variants={fadeInUp} transition={springCalm}>
                  <button
                    onClick={() => loadHistory(s.id)}
                    className={`group w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      activeSession === s.id
                        ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-slate-dark"
                        : "text-slate-dark/50 hover:bg-white/60 hover:text-slate-dark/80"
                    }`}
                  >
                    <p className="font-anthropic-sans text-[13px] font-medium truncate leading-tight">
                      {s.title || "Untitled"}
                    </p>
                    <p className="font-anthropic-mono text-[9px] uppercase tracking-widest text-slate-dark/25 mt-0.5">
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
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">

        {/* Floating sidebar toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-4 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-[10px] bg-white/80 backdrop-blur-sm border border-black/[0.06] text-slate-dark/40 hover:text-slate-dark hover:bg-white hover:border-black/[0.1] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          title={isSidebarCollapsed ? "Open history" : "Close history"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isSidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h16M4 18h7"} />
          </svg>
        </button>

        {/* ── Message Thread ── */}
        <div className="flex-1 overflow-y-auto scroll-smooth" data-lenis-prevent="true">
          {messages.length === 0 ? (
            /* ── EMPTY STATE: Big greeting + suggestion chips ── */
            <div className="h-full flex flex-col items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-[560px] mx-auto -mt-16"
              >
                {/* Gradient greeting */}
                <h1 className="font-anthropic-serif text-[52px] md:text-[64px] tracking-tight leading-[1] mb-4">
                  <span className="bg-gradient-to-br from-slate-dark via-slate-dark/70 to-slate-dark/40 bg-clip-text text-transparent">
                    {greeting}
                  </span>
                </h1>
                <p className="font-anthropic-sans text-[16px] text-slate-dark/40 leading-relaxed max-w-[400px] mx-auto mb-10">
                  Search across all your meetings. I can find action items, sentiment, or anything you&apos;ve discussed.
                </p>

                {/* Suggestion chips */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.query)}
                      className="font-anthropic-sans text-[13px] text-slate-dark/50 hover:text-slate-dark bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.06] hover:border-black/[0.1] px-4 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            /* ── MESSAGE THREAD ── */
            <div className="max-w-[720px] mx-auto px-6 py-12 flex flex-col gap-0">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`py-6 ${i > 0 ? "border-t border-black/[0.04]" : ""}`}
                  >
                    {/* Role label */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        m.role === "user"
                          ? "bg-slate-dark text-white"
                          : "bg-gradient-to-br from-clay/80 to-clay-deep text-white"
                      }`}>
                        {m.role === "user" ? "Y" : "S"}
                      </div>
                      <span className="font-anthropic-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-dark/40">
                        {m.role === "user" ? "You" : "Smriti"}
                      </span>
                    </div>

                    {/* Content */}
                    {m.pending ? (
                      <div className="flex gap-1 items-center h-6 pl-[34px]">
                        {[0, 1, 2].map((dot) => (
                          <motion.span
                            key={dot}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2, ease: "easeInOut" }}
                            className="w-1.5 h-1.5 rounded-full bg-slate-dark/30"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={`font-anthropic-sans text-[15px] leading-[1.7] pl-[34px] ${
                        m.role === "user" ? "text-slate-dark" : "text-slate-dark/80"
                      }`}>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── INPUT DOCK ── */}
        <div className="px-4 pb-6 pt-2 shrink-0">
          {/* Active filter pills */}
          <AnimatePresence>
            {(customerId || startDate || endDate || specificDate) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="max-w-[720px] mx-auto flex flex-wrap gap-1.5 mb-2"
              >
                {customerId && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1 rounded-md border border-clay/15">
                    {customers.find(c => c.id === parseInt(customerId))?.customer_name || "Customer"}
                    <button onClick={() => setCustomerId("")} className="hover:text-slate-dark transition-colors ml-0.5 opacity-60 hover:opacity-100">×</button>
                  </span>
                )}
                {specificDate && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1 rounded-md border border-clay/15">
                    {specificDate}
                    <button onClick={() => setSpecificDate("")} className="hover:text-slate-dark transition-colors ml-0.5 opacity-60 hover:opacity-100">×</button>
                  </span>
                )}
                {!specificDate && (startDate || endDate) && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-mono text-[9px] font-bold uppercase tracking-widest bg-clay/10 text-clay-deep px-2.5 py-1 rounded-md border border-clay/15">
                    {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                    <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-slate-dark transition-colors ml-0.5 opacity-60 hover:opacity-100">×</button>
                  </span>
                )}
                <button onClick={clearFilters} className="font-anthropic-sans text-[10px] font-semibold text-slate-dark/30 hover:text-slate-dark/60 transition-colors uppercase tracking-widest ml-1">
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Collapsible filter panel ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="max-w-[720px] mx-auto mb-3 bg-[#f9f9f8] border border-black/[0.06] rounded-2xl p-5 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <p className="font-anthropic-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-dark/40">Filters</p>
                    <button onClick={() => setShowFilters(false)} className="text-slate-dark/30 hover:text-slate-dark/60 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/40">Customer</label>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-white border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all"
                      >
                        <option value="">All customers</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.customer_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/40">
                        Specific date
                      </label>
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setStartDate(""); setEndDate(""); } }}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-white border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-widest text-slate-dark/40 flex items-center gap-2">
                      Date range
                      {specificDate && <span className="font-normal text-[9px] tracking-normal text-slate-dark/20">(Disabled — using specific date)</span>}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={startDate}
                        disabled={!!specificDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-white border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all disabled:opacity-30"
                      />
                      <span className="font-anthropic-mono text-[9px] text-slate-dark/25 uppercase tracking-widest">to</span>
                      <input
                        type="date"
                        value={endDate}
                        disabled={!!specificDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-white border border-black/[0.06] rounded-lg px-3 py-2 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all disabled:opacity-30"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Composer Bar ── */}
          <div className="max-w-[720px] mx-auto">
            <div className="bg-[#f9f9f8] border border-black/[0.08] rounded-2xl px-2 py-1.5 flex gap-1 items-end focus-within:border-black/[0.14] focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:bg-white transition-all duration-300">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  showFilters || activeFilterCount > 0
                    ? "bg-slate-dark text-white"
                    : "bg-black/[0.04] text-slate-dark/80 hover:bg-black/[0.08]"
                }`}
              >
                <div className="relative">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-clay rounded-full" />
                  )}
                </div>
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your meetings."
                disabled={sending}
                className="flex-1 bg-transparent border-none text-slate-dark font-anthropic-sans text-[15px] leading-[1.5] py-2.5 px-2 outline-none placeholder:text-slate-dark/40 resize-none max-h-[160px] disabled:opacity-50"
              />

              {/* Send Button */}
              <motion.button
                whileHover={!sending && query.trim() ? hoverScale : undefined}
                whileTap={!sending && query.trim() ? tapScale : undefined}
                onClick={() => handleSend()}
                disabled={!query.trim() || sending}
                className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  query.trim() && !sending
                    ? "bg-slate-dark text-white shadow-sm"
                    : "bg-black/[0.04] text-slate-dark/50"
                }`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-slate-dark/20 border-t-slate-dark rounded-full animate-spin" />
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                    <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </motion.button>
            </div>

            <p className="mt-3 text-center font-anthropic-sans text-[11px] text-slate-dark/25">
              Smriti can make mistakes. Verify important information.
              {activeFilterCount > 0 && <span className="text-slate-dark/50 ml-1 font-medium">· {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
