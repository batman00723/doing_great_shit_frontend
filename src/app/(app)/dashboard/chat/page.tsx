"use client";

import { useEffect, useRef, useState } from "react";

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

    // Build filter payload — specific_date overrides range per API spec
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
    <div className="-m-8 flex h-[calc(100vh-60px)]">

      {/* ── SESSIONS SIDEBAR ── */}
      <aside className="w-[260px] shrink-0 bg-ivory-light border-r border-stone/50 flex flex-col">
        <div className="p-4 border-b border-stone/50">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 font-anthropic-sans font-semibold text-[13px] text-slate-dark bg-ivory-medium border border-stone px-4 py-2.5 rounded-lg hover:bg-oat-warm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sessionsLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-stone/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-anthropic-serif text-[14px] text-cloud-medium leading-relaxed">
                No chat sessions yet.<br />Ask your first question.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 px-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadHistory(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                    activeSession === s.id
                      ? "bg-oat-warm text-slate-dark"
                      : "hover:bg-ivory-medium text-slate-dark/70 hover:text-slate-dark"
                  }`}
                >
                  <p className="font-anthropic-sans text-[12px] font-medium truncate">
                    {s.title || "Untitled session"}
                  </p>
                  <p className="font-anthropic-sans text-[11px] text-cloud-medium mt-0.5">
                    {formatDate(s.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col bg-ivory-medium overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-[480px] mx-auto">
              <div className="w-12 h-12 rounded-full bg-ivory-light border border-stone/50 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-cloud-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="font-anthropic-serif text-[28px] text-slate-dark mb-3 leading-tight">
                Ask about your meetings
              </h2>
              <p className="font-anthropic-serif text-[16px] text-cloud-medium leading-relaxed">
                Ask anything about your past calls — action items, customer sentiment, decisions made, or patterns across meetings.
              </p>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto flex flex-col gap-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-anthropic-sans font-bold mt-0.5 ${
                    m.role === "user"
                      ? "bg-slate-dark text-white"
                      : "bg-ivory-light border border-stone/50 text-cloud-medium"
                  }`}>
                    {m.role === "user" ? "Y" : "S"}
                  </div>
                  <div className={`max-w-[80%] rounded-[16px] px-5 py-3.5 ${
                    m.role === "user"
                      ? "bg-slate-dark text-white rounded-tr-[4px]"
                      : "bg-ivory-light border border-stone/50 text-slate-dark rounded-tl-[4px]"
                  }`}>
                    {m.pending ? (
                      <div className="flex gap-1 items-center h-5">
                        <span className="w-1.5 h-1.5 bg-cloud-medium rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-cloud-medium rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-cloud-medium rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <p className={`font-anthropic-serif text-[15px] leading-[1.65] whitespace-pre-wrap ${
                        m.role === "user" ? "text-white" : "text-slate-dark"
                      }`}>
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── INPUT + FILTERS AREA ── */}
        <div className="border-t border-stone/40 px-6 py-4">

          {/* Active filter pills */}
          {(customerId || startDate || endDate || specificDate) && (
            <div className="max-w-[720px] mx-auto flex flex-wrap gap-2 mb-3">
              {customerId && (
                <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-slate-dark/10 text-slate-dark px-2.5 py-1 rounded-sm">
                  {customers.find(c => c.id === parseInt(customerId))?.customer_name || "Customer"}
                  <button onClick={() => setCustomerId("")} className="hover:text-clay transition-colors">×</button>
                </span>
              )}
              {specificDate && (
                <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-slate-dark/10 text-slate-dark px-2.5 py-1 rounded-sm">
                  Date: {specificDate}
                  <button onClick={() => setSpecificDate("")} className="hover:text-clay transition-colors">×</button>
                </span>
              )}
              {!specificDate && (startDate || endDate) && (
                <span className="inline-flex items-center gap-1.5 font-anthropic-sans text-[11px] font-semibold bg-slate-dark/10 text-slate-dark px-2.5 py-1 rounded-sm">
                  {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                  <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-clay transition-colors">×</button>
                </span>
              )}
              <button onClick={clearFilters} className="font-anthropic-sans text-[11px] text-cloud-medium hover:text-clay transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Collapsible filter panel */}
          {showFilters && (
            <div className="max-w-[720px] mx-auto mb-4 bg-ivory-medium border border-stone/60 rounded-xl p-4 flex flex-col gap-4">
              <p className="font-anthropic-sans text-[11px] uppercase tracking-widest text-slate-dark/40">Filters</p>

              {/* Customer filter */}
              <div className="flex flex-col gap-1.5">
                <label className="font-anthropic-sans text-[12px] font-medium text-slate-dark">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="font-anthropic-sans text-[13px] text-slate-dark bg-ivory-light border border-stone rounded-lg px-3 py-2 outline-none focus:border-slate-dark transition-colors"
                >
                  <option value="">All customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-stone/50" />

              {/* Specific date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-anthropic-sans text-[12px] font-medium text-slate-dark">
                  Specific date
                  <span className="font-normal text-cloud-medium ml-1">(overrides date range if set)</span>
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => { setSpecificDate(e.target.value); if (e.target.value) { setStartDate(""); setEndDate(""); } }}
                  className="font-anthropic-sans text-[13px] text-slate-dark bg-ivory-light border border-stone rounded-lg px-3 py-2 outline-none focus:border-slate-dark transition-colors"
                />
              </div>

              {/* Date range */}
              <div className="flex flex-col gap-1.5">
                <label className="font-anthropic-sans text-[12px] font-medium text-slate-dark">
                  Date window
                  {specificDate && <span className="font-normal text-cloud-medium ml-1">(disabled — specific date is set)</span>}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    disabled={!!specificDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-ivory-light border border-stone rounded-lg px-3 py-2 outline-none focus:border-slate-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="font-anthropic-sans text-[12px] text-cloud-medium shrink-0">to</span>
                  <input
                    type="date"
                    value={endDate}
                    disabled={!!specificDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 font-anthropic-sans text-[13px] text-slate-dark bg-ivory-light border border-stone rounded-lg px-3 py-2 outline-none focus:border-slate-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="font-anthropic-sans text-[12px] text-cloud-medium hover:text-slate-dark transition-colors self-end"
              >
                Done
              </button>
            </div>
          )}

          {/* Textarea + send + filter toggle */}
          <div className="max-w-[720px] mx-auto flex gap-2 items-end">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 h-10 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-slate-dark border-slate-dark text-white"
                  : "bg-ivory-medium border-stone text-cloud-medium hover:border-slate-dark hover:text-slate-dark"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <span className="font-anthropic-sans font-semibold text-[12px]">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-clay rounded-full font-anthropic-sans text-[9px] text-white flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your meetings… (Enter to send, Shift+Enter for new line)"
              disabled={sending}
              className="flex-1 bg-ivory-medium border border-stone text-slate-dark font-anthropic-serif text-[14px] leading-[1.6] px-4 py-3 rounded-xl outline-none focus:border-slate-dark transition-colors placeholder:text-cloud-medium resize-none max-h-[160px] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!query.trim() || sending}
              className="shrink-0 bg-slate-dark text-white h-10 px-4 rounded-xl flex items-center gap-1.5 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="font-anthropic-sans font-semibold text-[12px]">{sending ? "Sending…" : "Send"}</span>
            </button>
          </div>

          <p className="max-w-[720px] mx-auto mt-2 font-anthropic-sans text-[11px] text-cloud-medium">
            Smriti searches across all your recorded meetings and transcripts.
            {activeFilterCount > 0 && <span className="text-clay ml-1">· {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
