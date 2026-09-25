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

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Derived: how many filters are active
  const activeFilterCount = [
    customerId,
    specificDate || startDate || endDate ? "date" : "",
  ].filter(Boolean).length;

  // Load sessions + customers on mount
  useEffect(() => {
    const token = getToken();

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
    <div className="-m-8 md:-m-12 flex h-[calc(100vh-69px)] bg-white">
      {/* ── SESSIONS SIDEBAR ── */}
      <aside className="w-[280px] shrink-0 bg-[#fdfaf6] border-r border-stone/30 flex flex-col">
        <div className="p-6 border-b border-stone/30">
          <motion.button
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 font-anthropic-sans font-medium text-[13px] text-slate-dark bg-white border border-stone/60 px-4 py-3 rounded-full hover:bg-stone/10 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {sessionsLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-stone/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
              <p className="font-anthropic-serif text-[15px] text-slate-dark/50 leading-relaxed">
                No chat sessions yet.<br />Ask your first question.
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
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      activeSession === s.id
                        ? "bg-white shadow-sm border border-stone/30 text-slate-dark"
                        : "hover:bg-white/50 text-slate-dark/60 hover:text-slate-dark border border-transparent"
                    }`}
                  >
                    <p className="font-anthropic-sans text-[13px] font-medium truncate">
                      {s.title || "Untitled session"}
                    </p>
                    <p className="font-anthropic-sans text-[11px] text-slate-dark/40 mt-1 uppercase tracking-widest">
                      {formatDate(s.created_at)}
                    </p>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springCalm} className="h-full flex flex-col items-center justify-center text-center max-w-[560px] mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#fdfaf6] border border-stone/40 flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-6 h-6 text-clay-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="font-anthropic-serif text-[40px] tracking-tight text-slate-dark mb-4 leading-tight">
                Ask about your <em className="italic font-normal text-clay-deep">meetings.</em>
              </h2>
              <p className="font-anthropic-sans text-[15px] text-slate-dark/60 leading-relaxed max-w-[480px]">
                Ask anything about your past calls — action items, customer sentiment, decisions made, or patterns across meetings.
              </p>
            </motion.div>
          ) : (
            <div className="max-w-[760px] mx-auto flex flex-col gap-8 pb-10">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springCalm}
                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[12px] font-anthropic-sans font-bold mt-1 shadow-sm ${
                      m.role === "user"
                        ? "bg-slate-dark text-white"
                        : "bg-[#fdfaf6] border border-stone/40 text-clay-deep"
                    }`}>
                      {m.role === "user" ? "Y" : "S"}
                    </div>
                    <div className={`max-w-[85%] rounded-[24px] px-6 py-4 ${
                      m.role === "user"
                        ? "bg-[#fdfaf6] border border-stone/30 text-slate-dark rounded-tr-[8px] shadow-sm"
                        : "bg-white text-slate-dark border border-transparent"
                    }`}>
                      {m.pending ? (
                        <div className="flex gap-1.5 items-center h-6">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                              className="w-1.5 h-1.5 bg-clay/60 rounded-full"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`font-anthropic-serif text-[16px] leading-[1.7] whitespace-pre-wrap ${m.role === 'user' ? 'text-slate-dark' : 'text-slate-dark/90'}`}>
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
        <div className="px-6 py-6 md:px-12 bg-white/80 backdrop-blur-sm border-t border-stone/30">
          {/* Active filter pills */}
          <AnimatePresence>
            {(customerId || startDate || endDate || specificDate) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-[800px] mx-auto flex flex-wrap gap-2 mb-4"
              >
                {customerId && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-clay/10 text-clay-deep px-3 py-1.5 rounded-full border border-clay/20">
                    {customers.find(c => c.id === parseInt(customerId))?.customer_name || "Customer"}
                    <button onClick={() => setCustomerId("")} className="hover:text-slate-dark transition-colors">×</button>
                  </span>
                )}
                {specificDate && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-clay/10 text-clay-deep px-3 py-1.5 rounded-full border border-clay/20">
                    Date: {specificDate}
                    <button onClick={() => setSpecificDate("")} className="hover:text-slate-dark transition-colors">×</button>
                  </span>
                )}
                {!specificDate && (startDate || endDate) && (
                  <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-clay/10 text-clay-deep px-3 py-1.5 rounded-full border border-clay/20">
                    {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                    <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-slate-dark transition-colors">×</button>
                  </span>
                )}
                <button onClick={clearFilters} className="font-anthropic-sans text-[11px] font-semibold text-slate-dark/40 hover:text-slate-dark transition-colors uppercase tracking-widest ml-2">
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
                <div className="max-w-[800px] mx-auto mb-6 bg-[#fdfaf6] border border-stone/40 rounded-[24px] p-6 flex flex-col gap-5 shadow-sm">
                  <p className="font-anthropic-sans text-[11px] font-bold uppercase tracking-[0.2em] text-slate-dark/40">Query Filters</p>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer filter */}
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Customer</label>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-white border border-stone/60 rounded-xl px-4 py-2.5 outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-colors"
                      >
                        <option value="">All customers</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.customer_name}</option>
                        ))}
                      </select>
                    </div>
  
                    {/* Specific date */}
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70 flex items-center justify-between">
                        Specific date
                        <span className="font-normal text-[10px] text-slate-dark/40 tracking-normal">(Overrides range)</span>
                      </label>
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setStartDate(""); setEndDate(""); } }}
                        className="font-anthropic-sans text-[13px] text-slate-dark bg-white border border-stone/60 rounded-xl px-4 py-2.5 outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-colors"
                      />
                    </div>
                  </div>
 
                  {/* Date range */}
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70 flex items-center gap-2">
                      Date window
                      {specificDate && <span className="font-normal text-[10px] tracking-normal text-slate-dark/40">(Disabled)</span>}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="date"
                        value={startDate}
                        disabled={!!specificDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-white border border-stone/60 rounded-xl px-4 py-2.5 outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <span className="font-anthropic-sans text-[12px] font-medium text-slate-dark/40 shrink-0">to</span>
                      <input
                        type="date"
                        value={endDate}
                        disabled={!!specificDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-white border border-stone/60 rounded-xl px-4 py-2.5 outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
 
                  <button
                    onClick={() => setShowFilters(false)}
                    className="font-anthropic-sans text-[12px] font-semibold bg-slate-dark text-white px-6 py-2.5 rounded-full hover:bg-black transition-colors self-end mt-2"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* Textarea + send + filter toggle */}
          <div className="max-w-[800px] mx-auto bg-[#fdfaf6] border border-stone/60 rounded-[28px] p-2 flex gap-2 items-end shadow-sm focus-within:border-clay/50 focus-within:ring-1 focus-within:ring-clay/20 transition-all">
            {/* Filter toggle */}
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-slate-dark text-white"
                  : "bg-white border border-stone/40 text-slate-dark/60 hover:text-slate-dark hover:bg-stone/10"
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-clay rounded-full border-2 border-[#fdfaf6]" />
                )}
              </div>
            </motion.button>
 
            <textarea
              ref={textareaRef}
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Smriti about your meetings…"
              disabled={sending}
              className="flex-1 bg-transparent border-none text-slate-dark font-anthropic-serif text-[16px] leading-[1.5] py-3.5 px-2 outline-none placeholder:text-slate-dark/40 resize-none max-h-[160px] disabled:opacity-50"
            />
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={handleSend}
              disabled={!query.trim() || sending}
              className="shrink-0 bg-clay text-white h-12 px-6 rounded-full flex items-center gap-2 hover:bg-clay-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-clay shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="font-anthropic-sans font-semibold text-[13px]">{sending ? "Thinking…" : "Send"}</span>
            </motion.button>
          </div>
 
          <p className="max-w-[800px] mx-auto mt-4 text-center font-anthropic-sans text-[11px] text-slate-dark/40">
            Smriti searches across all your recorded meetings and transcripts.
            {activeFilterCount > 0 && <span className="text-clay-deep ml-1 font-semibold">· {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
