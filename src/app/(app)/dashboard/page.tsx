"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import {
  fadeInUp,
  fadeInDown,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  easeSoft,
  overlayVariants,
  modalVariants,
  hoverScale,
  tapScale,
} from "@/lib/animations";

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
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function AnimatedCounter({ value, loading }: { value: number; loading: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading) return;
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsubscribe(); };
  }, [value, loading, count, rounded]);

  if (loading) return <span className="text-slate-dark/20">—</span>;
  return <>{display}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalMeetings, setTotalMeetings] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Add Customer form
  const [custForm, setCustForm] = useState({ customer_name: "", email: "", industry: "", website: "", status: "Lead" });
  const [custLoading, setCustLoading] = useState(false);
  const [custSuccess, setCustSuccess] = useState("");
  const [custError, setCustError] = useState("");

  // Add Meeting modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTab, setMeetingTab] = useState<MeetingModalTab>("bot");
  const [botUrl, setBotUrl] = useState("");
  const [botCustomer, setBotCustomer] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [botMsg, setBotMsg] = useState("");
  const [transcript, setTranscript] = useState("");
  const [transcriptCustomer, setTranscriptCustomer] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptMsg, setTranscriptMsg] = useState("");
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

      try {
        const res = await fetch(`${BASE}/customers/list`, {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        if (res.ok) {
          const data: Customer[] = await res.json();
          setCustomers(data);
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
              } catch {}
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
      if (!res.ok) {
        if (typeof data?.detail === "string") setCustError(data.detail);
        else if (Array.isArray(data?.detail)) setCustError(data.detail.map((e: {msg: string}) => e.msg).join(", "));
        else setCustError(data?.message || `Error ${res.status}`);
        return;
      }
      setCustSuccess(`${custForm.customer_name} added successfully!`);
      setCustForm({ customer_name: "", email: "", industry: "", website: "", status: "Lead" });
      setCustomers((prev) => [...prev, data]);
    } catch (err) {
      setCustError("Network error.");
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

  const inputCls = "w-full bg-[#fdfaf6] border border-stone/60 text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30";
  const selectCls = "w-full bg-[#fdfaf6] border border-stone/60 text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:border-clay/50 transition-colors";

  return (
    <div className="max-w-[860px] w-full">

      {/* ── HERO GREETING ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16"
      >
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mb-4">
          {user?.organisation} workspace
        </motion.p>
        <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[64px] md:text-[88px] tracking-tight leading-[1.05] text-slate-dark mb-10">
          {getGreeting()},<br /><em className="italic font-normal text-clay-deep">{firstName}.</em>
        </motion.h1>
        <motion.div variants={fadeInUp} transition={springCalm} className="flex flex-wrap gap-4">
          <motion.button
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={() => { setShowMeetingModal(true); setBotMsg(""); setTranscriptMsg(""); setAudioMsg(""); }}
            className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-6 py-3 rounded-full hover:bg-black transition-colors shadow-sm"
          >
            + Add Meeting
          </motion.button>
          <Link
            href="/dashboard/chat"
            className="font-anthropic-sans font-medium text-[14px] border border-stone/60 text-slate-dark px-6 py-3 rounded-full hover:bg-[#fdfaf6] transition-all"
          >
            Go to Chat
          </Link>
          <Link
            href="/dashboard/customers"
            className="font-anthropic-sans font-medium text-[14px] border border-stone/60 text-slate-dark px-6 py-3 rounded-full hover:bg-[#fdfaf6] transition-all"
          >
            View Customers
          </Link>
          <Link
            href="/dashboard/meetings"
            className="font-anthropic-sans font-medium text-[14px] border border-stone/60 text-slate-dark px-6 py-3 rounded-full hover:bg-[#fdfaf6] transition-all"
          >
            All Meetings
          </Link>
        </motion.div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
      >
        <motion.div variants={fadeInUp} transition={springCalm} className="bg-[#fdfaf6] border border-stone/40 rounded-[32px] p-10 flex flex-col justify-between group hover:shadow-xl hover:shadow-stone/10 transition-shadow">
          <p className="font-anthropic-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-slate-dark/50 mb-12">Total Customers</p>
          <p className="font-anthropic-serif text-[64px] leading-none tracking-tight text-slate-dark">
            <AnimatedCounter value={customers.length} loading={statsLoading} />
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} transition={springCalm} className="bg-[#fdfaf6] border border-stone/40 rounded-[32px] p-10 flex flex-col justify-between group hover:shadow-xl hover:shadow-stone/10 transition-shadow">
          <p className="font-anthropic-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-slate-dark/50 mb-12">Total Meetings</p>
          <p className="font-anthropic-serif text-[64px] leading-none tracking-tight text-slate-dark">
            <AnimatedCounter value={totalMeetings ?? 0} loading={statsLoading} />
          </p>
        </motion.div>
      </motion.div>

      {/* ── ADD CUSTOMER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springCalm, delay: 0.3 }}
        className="bg-white border border-stone/40 rounded-[32px] p-10 shadow-sm"
      >
        <h2 className="font-anthropic-serif text-[32px] tracking-tight text-slate-dark mb-2">
          Add a <em className="italic font-normal text-clay-deep">customer.</em>
        </h2>
        <p className="font-anthropic-sans text-[15px] text-slate-dark/50 mb-8">Create a new lead or client in your organisation.</p>

        <AnimatePresence>
          {custSuccess && (
            <motion.div variants={fadeInDown} initial="initial" animate="animate" exit="exit" transition={easeSoft} className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <p className="font-anthropic-sans text-[14px] text-green-700">{custSuccess}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {custError && (
            <motion.div variants={fadeInDown} initial="initial" animate="animate" exit="exit" transition={easeSoft} className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
              <p className="font-anthropic-sans text-[14px] text-red-600">{custError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAddCustomer} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Customer name *</label>
              <input required placeholder="Netflix" value={custForm.customer_name} onChange={e => setCustForm({ ...custForm, customer_name: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Email *</label>
              <input required type="email" placeholder="contact@netflix.com" value={custForm.email} onChange={e => setCustForm({ ...custForm, email: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Industry</label>
              <input placeholder="Entertainment" value={custForm.industry} onChange={e => setCustForm({ ...custForm, industry: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Website</label>
              <input placeholder="netflix.com" value={custForm.website} onChange={e => setCustForm({ ...custForm, website: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Status</label>
              <select value={custForm.status} onChange={e => setCustForm({ ...custForm, status: e.target.value })} className={selectCls}>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="pt-2">
            <motion.button whileHover={hoverScale} whileTap={tapScale} type="submit" disabled={custLoading} className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-full hover:bg-black transition-colors shadow-sm disabled:opacity-50">
              {custLoading ? "Adding…" : "Add customer"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* ── ADD MEETING MODAL ── */}
      <AnimatePresence>
        {showMeetingModal && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={easeSoft}
            className="fixed inset-0 bg-slate-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMeetingModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springCalm}
              className="bg-white rounded-[32px] w-full max-w-[560px] p-10 shadow-2xl border border-stone/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-anthropic-serif text-[28px] tracking-tight text-slate-dark">Add a <em className="italic font-normal text-clay-deep">meeting.</em></h2>
                <button onClick={() => setShowMeetingModal(false)} className="text-slate-dark/40 hover:text-slate-dark transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-[#fdfaf6] border border-stone/40 rounded-xl p-1.5 mb-8">
                {([["bot", "🤖 Deploy Bot"], ["transcript", "📝 Transcript"], ["audio", "🎙️ Audio"]] as [MeetingModalTab, string][]).map(([tab, label]) => (
                  <button key={tab} onClick={() => setMeetingTab(tab)}
                    className={`relative flex-1 font-anthropic-sans text-[13px] font-medium py-2.5 rounded-lg transition-colors ${meetingTab === tab ? "text-slate-dark" : "text-slate-dark/50 hover:text-slate-dark"}`}>
                    {meetingTab === tab && (
                      <motion.div
                        layoutId="modal-tab-indicator"
                        className="absolute inset-0 bg-white shadow-sm rounded-lg"
                        transition={springCalm}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content with cross-fade */}
              <AnimatePresence mode="wait">
                {/* Bot Tab */}
                {meetingTab === "bot" && (
                  <motion.form key="bot" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleDeployBot} className="flex flex-col gap-6">
                    <p className="font-anthropic-sans text-[15px] leading-relaxed text-slate-dark/70">Deploy an AI bot to join a live Zoom or Google Meet call and capture the transcript automatically.</p>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Meeting URL *</label>
                      <input required type="url" placeholder="https://zoom.us/j/..." value={botUrl} onChange={e => setBotUrl(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Customer *</label>
                      <select required value={botCustomer} onChange={e => setBotCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    {botMsg && <p className="font-anthropic-sans text-[14px] text-slate-dark/80">{botMsg}</p>}
                    <button type="button" disabled className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-full opacity-50 cursor-not-allowed w-max mt-2">
                      Coming Soon
                    </button>
                  </motion.form>
                )}

                {/* Transcript Tab */}
                {meetingTab === "transcript" && (
                  <motion.form key="transcript" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleTranscript} className="flex flex-col gap-6">
                    <p className="font-anthropic-sans text-[15px] leading-relaxed text-slate-dark/70">Paste a raw meeting transcript and our AI will generate a full report.</p>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Customer *</label>
                      <select required value={transcriptCustomer} onChange={e => setTranscriptCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Transcript *</label>
                      <textarea required rows={6} placeholder="Paste your meeting transcript here…" value={transcript} onChange={e => setTranscript(e.target.value)}
                        className="w-full bg-[#fdfaf6] border border-stone/60 text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30 resize-none" />
                    </div>
                    {transcriptMsg && <p className="font-anthropic-sans text-[14px] text-slate-dark/80">{transcriptMsg}</p>}
                    <motion.button whileHover={hoverScale} whileTap={tapScale} type="submit" disabled={transcriptLoading} className="w-max font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-full hover:bg-black transition-colors disabled:opacity-50 mt-2">
                      {transcriptLoading ? "Analysing…" : "Analyse Transcript"}
                    </motion.button>
                  </motion.form>
                )}

                {/* Audio Tab */}
                {meetingTab === "audio" && (
                  <motion.form key="audio" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleAudio} className="flex flex-col gap-6">
                    <p className="font-anthropic-sans text-[15px] leading-relaxed text-slate-dark/70">Upload a meeting recording and our AI will transcribe and generate a report.</p>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Customer *</label>
                      <select required value={audioCustomer} onChange={e => setAudioCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">Audio file *</label>
                      <input ref={audioRef} type="file" accept=".mp3,.wav,.m4a,.ogg" onChange={e => setAudioFile(e.target.files?.[0] || null)}
                        className="w-full font-anthropic-sans text-[14px] text-slate-dark file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:font-medium file:bg-slate-dark file:text-white hover:file:bg-black file:transition-all cursor-pointer" />
                    </div>
                    {audioMsg && <p className="font-anthropic-sans text-[14px] text-slate-dark/80">{audioMsg}</p>}
                    <motion.button whileHover={hoverScale} whileTap={tapScale} type="submit" disabled={audioLoading} className="w-max font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-full hover:bg-black transition-colors disabled:opacity-50 mt-2">
                      {audioLoading ? "Uploading…" : "Upload & Analyse"}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
