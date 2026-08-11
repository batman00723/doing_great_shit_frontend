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
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      const token = getToken();
      try {
        const res = await fetch(`${BASE}/chat/sessions`, {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        if (res.ok) setSessions(await res.json());
      } catch { /* silent */ }
      finally { setSessionsLoading(false); }
    };
    fetchSessions();
  }, []);

  // Scroll to bottom whenever messages change
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

  const handleSend = async () => {
    if (!query.trim() || sending) return;
    const userQuery = query.trim();
    setQuery("");
    setSending(true);

    // Optimistically add user bubble + pending AI bubble
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuery },
      { role: "ai", content: "", pending: true },
    ]);

    const token = getToken();
    try {
      const res = await fetch(`${BASE}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: userQuery,
          session_id: activeSession,
          start_date: null,
          end_date: null,
          specific_date: null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Replace pending bubble with real answer
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "ai", content: data.answer },
        ]);

        // If new session, prepend to sessions list
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
        {/* New Chat */}
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

        {/* Sessions List */}
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
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
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
                  {/* Avatar */}
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-anthropic-sans font-bold mt-0.5 ${
                    m.role === "user"
                      ? "bg-slate-dark text-white"
                      : "bg-ivory-light border border-stone/50 text-cloud-medium"
                  }`}>
                    {m.role === "user" ? "Y" : "S"}
                  </div>

                  {/* Bubble */}
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

        {/* Input area */}
        <div className="border-t border-stone/40 bg-ivory-light px-6 py-4">
          <div className="max-w-[720px] mx-auto flex gap-3 items-end">
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
              className="shrink-0 bg-slate-dark text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="max-w-[720px] mx-auto mt-2 font-anthropic-sans text-[11px] text-cloud-medium">
            Smriti searches across all your recorded meetings and transcripts.
          </p>
        </div>
      </div>
    </div>
  );
}
