"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface User {
  user_id: number;
  salesperson_name: string;
  email: string;
  role: string;
  organisation: string;
  organisation_id: number;
}

interface Customer {
  id: number;
  customer_name: string;
  industry: string;
  website: string;
  status: string;
}

type MeetingModalTab = "bot" | "transcript" | "audio";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalMeetings, setTotalMeetings] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Add Customer form
  const [custForm, setCustForm] = useState({ customer_name: "", industry: "", website: "", status: "Lead" });
  const [custLoading, setCustLoading] = useState(false);
  const [custSuccess, setCustSuccess] = useState("");
  const [custError, setCustError] = useState("");

  // Add Meeting modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTab, setMeetingTab] = useState<MeetingModalTab>("bot");
  // Bot tab
  const [botUrl, setBotUrl] = useState("");
  const [botCustomer, setBotCustomer] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [botMsg, setBotMsg] = useState("");
  // Transcript tab
  const [transcript, setTranscript] = useState("");
  const [transcriptCustomer, setTranscriptCustomer] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptMsg, setTranscriptMsg] = useState("");
  // Audio tab
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioCustomer, setAudioCustomer] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioMsg, setAudioMsg] = useState("");
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      try {
        const res = await fetch(`${BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser({ user_id: 0, salesperson_name: "Dev User", email: "dev@smriti.ai", role: "Salesperson", organisation: "Smriti (Dev)", organisation_id: 0 });
        }
      } catch {
        setUser({ user_id: 0, salesperson_name: "Dev User", email: "dev@smriti.ai", role: "Salesperson", organisation: "Smriti (Dev)", organisation_id: 0 });
      }

      // Fetch customers
      try {
        const res = await fetch(`${BASE}/customers/list`, {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        if (res.ok) {
          const data: Customer[] = await res.json();
          setCustomers(data);

          // Fetch meetings per customer to get total count
          let meetingCount = 0;
          await Promise.all(
            data.map(async (c) => {
              try {
                const mRes = await fetch(`${BASE}/analyse/customer/${c.id}`, {
                  headers: { Authorization: `Bearer ${token || "dev"}` },
                });
                if (mRes.ok) {
                  const meetings = await mRes.json();
                  meetingCount += meetings.length;
                }
              } catch { /* silent */ }
            })
          );
          setTotalMeetings(meetingCount);
        } else {
          setCustomers([{ id: 1, customer_name: "Netflix (Mock)", industry: "Entertainment", website: "netflix.com", status: "Active" }]);
          setTotalMeetings(3);
        }
      } catch {
        setCustomers([{ id: 1, customer_name: "Netflix (Mock)", industry: "Entertainment", website: "netflix.com", status: "Active" }]);
        setTotalMeetings(3);
      } finally {
        setStatsLoading(false);
      }
    };
    init();
  }, [router]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError(""); setCustSuccess(""); setCustLoading(true);
    const token = getToken();

    if (!token) {
      setCustError("Not logged in. Please log in again.");
      setCustLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE}/customers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(custForm),
      });
      const data = await res.json();
      console.log("Add customer response:", res.status, data);
      if (!res.ok) {
        if (typeof data?.detail === "string") setCustError(data.detail);
        else if (Array.isArray(data?.detail)) setCustError(data.detail.map((e: {msg: string}) => e.msg).join(", "));
        else setCustError(data?.message || `Error ${res.status}: ${JSON.stringify(data)}`);
        return;
      }
      setCustSuccess(`${custForm.customer_name} added successfully!`);
      setCustForm({ customer_name: "", industry: "", website: "", status: "Lead" });
      setCustomers((prev) => [...prev, data]);
    } catch (err) {
      console.error("Add customer error:", err);
      setCustError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally { setCustLoading(false); }
  };

  const handleDeployBot = async (e: React.FormEvent) => {
    e.preventDefault(); setBotMsg(""); setBotLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${BASE}/bot/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meeting_url: botUrl, customer_id: parseInt(botCustomer) }),
      });
      const data = await res.json();
      setBotMsg(res.ok ? "🚀 Bot deployed successfully!" : data?.detail || "Failed to deploy bot.");
      if (res.ok) { setBotUrl(""); setBotCustomer(""); }
    } catch { setBotMsg("Could not reach the server."); }
    finally { setBotLoading(false); }
  };

  const handleTranscript = async (e: React.FormEvent) => {
    e.preventDefault(); setTranscriptMsg(""); setTranscriptLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${BASE}/analyse/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transcript, customer_id: parseInt(transcriptCustomer) }),
      });
      const data = await res.json();
      setTranscriptMsg(res.ok ? "✅ Transcript analysed! Report is being generated." : data?.detail || "Failed to analyse transcript.");
      if (res.ok) { setTranscript(""); setTranscriptCustomer(""); }
    } catch { setTranscriptMsg("Could not reach the server."); }
    finally { setTranscriptLoading(false); }
  };

  const handleAudio = async (e: React.FormEvent) => {
    e.preventDefault(); setAudioMsg(""); setAudioLoading(true);
    const token = getToken();
    if (!audioFile || !audioCustomer) { setAudioMsg("Please select a file and a customer."); setAudioLoading(false); return; }
    try {
      const form = new FormData();
      form.append("audio_file", audioFile);
      form.append("customer_id", audioCustomer);
      const res = await fetch(`${BASE}/audio/analyse?customer_id=${audioCustomer}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      setAudioMsg(res.ok ? "✅ Audio uploaded! Report is being generated." : data?.detail || "Failed to upload audio.");
      if (res.ok) { setAudioFile(null); setAudioCustomer(""); if (audioRef.current) audioRef.current.value = ""; }
    } catch { setAudioMsg("Could not reach the server."); }
    finally { setAudioLoading(false); }
  };

  const firstName = user?.salesperson_name?.split(" ")[0] || "";

  const inputCls = "w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[13px] px-4 py-2.5 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30";
  const selectCls = "w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[13px] px-4 py-2.5 rounded-lg outline-none focus:border-slate-dark transition-colors";

  return (
    <div className="max-w-[860px] w-full">

      {/* ── HERO GREETING ── */}
      <div className="mb-12">
        <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-3">
          {user?.organisation}
        </p>
        <h1 className="font-anthropic-serif text-[64px] leading-[1.05] text-slate-dark mb-8">
          {getGreeting()},<br />{firstName}.
        </h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setShowMeetingModal(true); setBotMsg(""); setTranscriptMsg(""); setAudioMsg(""); }}
            className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all flex items-center gap-2"
          >
            <span>+</span> Add Meeting
          </button>
          <Link
            href="/dashboard/chat"
            className="font-anthropic-sans font-semibold text-[13px] border border-slate-dark text-slate-dark px-5 py-2.5 rounded-lg hover:bg-slate-dark hover:text-white transition-all"
          >
            Go to Chat
          </Link>
          <Link
            href="/dashboard/customers"
            className="font-anthropic-sans font-semibold text-[13px] border border-slate-dark text-slate-dark px-5 py-2.5 rounded-lg hover:bg-slate-dark hover:text-white transition-all"
          >
            View Customers
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="bg-white border border-stone/50 rounded-[20px] p-8">
          <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.12em] text-slate-dark/40 mb-3">Total Customers</p>
          <p className="font-anthropic-serif text-[52px] leading-none text-slate-dark">
            {statsLoading ? <span className="text-slate-dark/20">—</span> : customers.length}
          </p>
        </div>
        <div className="bg-white border border-stone/50 rounded-[20px] p-8">
          <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.12em] text-slate-dark/40 mb-3">Total Meetings</p>
          <p className="font-anthropic-serif text-[52px] leading-none text-slate-dark">
            {statsLoading ? <span className="text-slate-dark/20">—</span> : totalMeetings ?? 0}
          </p>
        </div>
      </div>

      {/* ── ADD CUSTOMER ── */}
      <div className="bg-white border border-stone/50 rounded-[20px] p-8">
        <h2 className="font-anthropic-sans font-semibold text-[18px] text-slate-dark mb-1">Add a customer</h2>
        <p className="font-anthropic-serif text-[14px] text-slate-dark/50 mb-6">Create a new lead or client in your organisation.</p>

        {custSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <p className="font-anthropic-sans text-[13px] text-green-700">{custSuccess}</p>
          </div>
        )}
        {custError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
            <p className="font-anthropic-sans text-[13px] text-red-600">{custError}</p>
          </div>
        )}

        <form onSubmit={handleAddCustomer} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Customer name *</label>
              <input required placeholder="Netflix" value={custForm.customer_name} onChange={e => setCustForm({ ...custForm, customer_name: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Industry</label>
              <input placeholder="Entertainment" value={custForm.industry} onChange={e => setCustForm({ ...custForm, industry: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Website</label>
              <input placeholder="netflix.com" value={custForm.website} onChange={e => setCustForm({ ...custForm, website: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Status</label>
              <select value={custForm.status} onChange={e => setCustForm({ ...custForm, status: e.target.value })} className={selectCls}>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <button type="submit" disabled={custLoading} className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50">
              {custLoading ? "Adding…" : "Add customer"}
            </button>
          </div>
        </form>
      </div>

      {/* ── ADD MEETING MODAL ── */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-white rounded-[24px] w-full max-w-[560px] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-anthropic-sans font-semibold text-[18px] text-slate-dark">Add a meeting</h2>
              <button onClick={() => setShowMeetingModal(false)} className="text-slate-dark/40 hover:text-slate-dark transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-ivory-medium rounded-lg p-1 mb-6">
              {([["bot", "🤖 Deploy Bot"], ["transcript", "📝 Transcript"], ["audio", "🎙️ Audio"]] as [MeetingModalTab, string][]).map(([tab, label]) => (
                <button key={tab} onClick={() => setMeetingTab(tab)}
                  className={`flex-1 font-anthropic-sans text-[12px] font-medium py-2 rounded-md transition-all ${meetingTab === tab ? "bg-white text-slate-dark shadow-sm" : "text-slate-dark/50 hover:text-slate-dark"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Bot Tab */}
            {meetingTab === "bot" && (
              <form onSubmit={handleDeployBot} className="flex flex-col gap-4">
                <p className="font-anthropic-serif text-[14px] text-slate-dark/60">Deploy an AI bot to join a live Zoom or Google Meet call and capture the transcript automatically.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Meeting URL *</label>
                  <input required type="url" placeholder="https://zoom.us/j/..." value={botUrl} onChange={e => setBotUrl(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Customer *</label>
                  <select required value={botCustomer} onChange={e => setBotCustomer(e.target.value)} className={selectCls}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
                </div>
                {botMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/70">{botMsg}</p>}
                <button type="submit" disabled={botLoading} className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50">
                  {botLoading ? "Deploying…" : "🚀 Deploy Bot"}
                </button>
              </form>
            )}

            {/* Transcript Tab */}
            {meetingTab === "transcript" && (
              <form onSubmit={handleTranscript} className="flex flex-col gap-4">
                <p className="font-anthropic-serif text-[14px] text-slate-dark/60">Paste a raw meeting transcript and our AI will generate a full report.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Customer *</label>
                  <select required value={transcriptCustomer} onChange={e => setTranscriptCustomer(e.target.value)} className={selectCls}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Transcript *</label>
                  <textarea required rows={6} placeholder="Paste your meeting transcript here…" value={transcript} onChange={e => setTranscript(e.target.value)}
                    className="w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[13px] px-4 py-3 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30 resize-none" />
                </div>
                {transcriptMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/70">{transcriptMsg}</p>}
                <button type="submit" disabled={transcriptLoading} className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50">
                  {transcriptLoading ? "Analysing…" : "Analyse Transcript"}
                </button>
              </form>
            )}

            {/* Audio Tab */}
            {meetingTab === "audio" && (
              <form onSubmit={handleAudio} className="flex flex-col gap-4">
                <p className="font-anthropic-serif text-[14px] text-slate-dark/60">Upload a meeting recording and our AI will transcribe and generate a report.</p>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Customer *</label>
                  <select required value={audioCustomer} onChange={e => setAudioCustomer(e.target.value)} className={selectCls}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-anthropic-sans text-[13px] font-medium text-slate-dark">Audio file *</label>
                  <input ref={audioRef} type="file" accept=".mp3,.wav,.m4a,.ogg" onChange={e => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full font-anthropic-sans text-[13px] text-slate-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-dark file:text-white hover:file:bg-black file:transition-all cursor-pointer" />
                </div>
                {audioMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/70">{audioMsg}</p>}
                <button type="submit" disabled={audioLoading} className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50">
                  {audioLoading ? "Uploading…" : "Upload & Analyse"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
