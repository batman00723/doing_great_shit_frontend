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

  // Ultra-premium input classes
  const inputCls = "w-full bg-black/[0.02] border border-black/[0.06] text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:bg-white focus:border-clay/50 focus:ring-4 focus:ring-clay/10 transition-all placeholder:text-slate-dark/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const selectCls = "w-full bg-black/[0.02] border border-black/[0.06] text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:bg-white focus:border-clay/50 focus:ring-4 focus:ring-clay/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";

  return (
    <div className="w-full max-w-[1080px] mx-auto pb-24">
      
      {/* ── HEADER & GREETING ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4"
      >
        <div>
          <motion.div variants={fadeInUp} transition={springCalm} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-clay/10 border border-clay/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span className="font-anthropic-mono text-[10px] uppercase tracking-widest text-clay-deep font-bold">
              {user?.organisation || "Workspace"}
            </span>
          </motion.div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-slate-dark">
            {getGreeting()},<br /><em className="italic font-normal text-slate-dark/50">{firstName}.</em>
          </motion.h1>
        </div>

        <motion.div variants={fadeInUp} transition={springCalm} className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/chat"
            className="font-anthropic-sans font-medium text-[13px] border border-black/10 bg-white text-slate-dark px-5 py-2.5 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
          >
            Ask AI
          </Link>
          <button
            onClick={() => { setShowMeetingModal(true); setBotMsg(""); setTranscriptMsg(""); setAudioMsg(""); }}
            className="group relative inline-flex items-center justify-center font-anthropic-sans font-medium text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-black transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              New Meeting
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </motion.div>
      </motion.div>

      {/* ── BENTO GRID ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      >
        {/* Stat Card 1 */}
        <motion.div variants={fadeInUp} transition={springCalm} className="relative overflow-hidden bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,87,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="font-anthropic-sans font-bold text-[10px] uppercase tracking-widest text-slate-dark/50 mb-16 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Total Customers
            </p>
            <div className="flex items-end gap-3">
              <span className="font-anthropic-mono text-[48px] leading-none tracking-tighter text-slate-dark">
                <AnimatedCounter value={customers.length} loading={statsLoading} />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div variants={fadeInUp} transition={springCalm} className="relative overflow-hidden bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(115,191,196,0.1),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="font-anthropic-sans font-bold text-[10px] uppercase tracking-widest text-slate-dark/50 mb-16 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              Analyzed Meetings
            </p>
            <div className="flex items-end gap-3">
              <span className="font-anthropic-mono text-[48px] leading-none tracking-tighter text-slate-dark">
                <AnimatedCounter value={totalMeetings ?? 0} loading={statsLoading} />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={fadeInUp} transition={springCalm} className="flex flex-col gap-4">
          <Link href="/dashboard/meetings" className="flex-1 bg-white border border-black/[0.06] rounded-2xl p-5 flex flex-col justify-between hover:border-black/[0.15] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group">
            <svg className="w-6 h-6 text-slate-dark/70 group-hover:text-slate-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">All Meetings</span>
          </Link>
          <Link href="/dashboard/customers" className="flex-1 bg-white border border-black/[0.06] rounded-2xl p-5 flex flex-col justify-between hover:border-black/[0.15] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group">
            <svg className="w-6 h-6 text-slate-dark/70 group-hover:text-slate-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">Customers</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── LOWER SECTION: FORMS & ACTIVITY ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springCalm, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Add Customer Form */}
        <div className="lg:col-span-2 bg-white border border-black/[0.06] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10 pb-8 border-b border-black/[0.04]">
            <div>
              <h2 className="font-anthropic-serif text-[24px] tracking-tight text-slate-dark">Add New Customer</h2>
              <p className="font-anthropic-sans text-[14px] text-slate-dark/50 mt-2 leading-[1.75]">Create a profile to associate meetings and generate insights.</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-clay/10 border border-clay/20 flex items-center justify-center text-clay-deep shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            </div>
          </div>

          <AnimatePresence>
            {custSuccess && (
              <motion.div variants={fadeInDown} initial="initial" animate="animate" exit="exit" transition={easeSoft} className="bg-green-50/50 border border-green-200/60 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <p className="font-anthropic-sans text-[14px] font-medium text-green-700">{custSuccess}</p>
              </motion.div>
            )}
            {custError && (
              <motion.div variants={fadeInDown} initial="initial" animate="animate" exit="exit" transition={easeSoft} className="bg-red-50/50 border border-red-200/60 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="font-anthropic-sans text-[14px] font-medium text-red-600">{custError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAddCustomer} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
              <div className="flex flex-col gap-2.5">
                <label className="font-anthropic-mono text-[11px] uppercase tracking-widest text-slate-dark/50">Company Name</label>
                <input required placeholder="e.g. Acme Corp" value={custForm.customer_name} onChange={e => setCustForm({ ...custForm, customer_name: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="font-anthropic-mono text-[11px] uppercase tracking-widest text-slate-dark/50">Contact Email</label>
                <input required type="email" placeholder="contact@acme.com" value={custForm.email} onChange={e => setCustForm({ ...custForm, email: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="font-anthropic-mono text-[11px] uppercase tracking-widest text-slate-dark/50">Industry</label>
                <input placeholder="e.g. Software" value={custForm.industry} onChange={e => setCustForm({ ...custForm, industry: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="font-anthropic-mono text-[11px] uppercase tracking-widest text-slate-dark/50">Status</label>
                <select value={custForm.status} onChange={e => setCustForm({ ...custForm, status: e.target.value })} className={selectCls}>
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-black/[0.04] flex justify-end">
              <button type="submit" disabled={custLoading} className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3 rounded-[10px] hover:bg-black transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-50">
                {custLoading ? "Adding..." : "Add Customer"}
              </button>
            </div>
          </form>
        </div>

        {/* System Status */}
        <div className="lg:col-span-1 bg-white border border-black/[0.06] rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="font-anthropic-mono text-[11px] uppercase tracking-widest text-slate-dark/50 mb-10">System Status</h3>
          
          <div className="flex flex-col gap-8 flex-1">
            <div className="flex gap-5 items-start">
              <div className="mt-1 relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <div>
                <p className="font-anthropic-sans font-medium text-[14px] text-slate-dark leading-snug">Meeting Analysis Engine</p>
                <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1.5">Online • Processing 0 items</p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="mt-1 relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-dark/20"></span>
              </div>
              <div>
                <p className="font-anthropic-sans font-medium text-[14px] text-slate-dark leading-snug">Zoom Bot Fleet</p>
                <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1.5">Idle • Ready for deployment</p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="mt-1 relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-dark/20"></span>
              </div>
              <div>
                <p className="font-anthropic-sans font-medium text-[14px] text-slate-dark leading-snug">Global Memory Vector DB</p>
                <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1.5">Synced • 12ms latency</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-black/[0.04]">
            <p className="font-anthropic-mono text-[10px] text-slate-dark/30 flex justify-between">
              <span>v2.0.4</span>
              <span>us-east-1</span>
            </p>
          </div>
        </div>
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
            className="fixed inset-0 bg-slate-dark/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowMeetingModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springCalm}
              className="bg-white rounded-3xl w-full max-w-[520px] p-8 shadow-2xl border border-black/[0.08]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.04]">
                <div>
                  <h2 className="font-anthropic-serif text-[22px] tracking-tight text-slate-dark">New Meeting</h2>
                  <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1">Import a meeting for analysis.</p>
                </div>
                <button onClick={() => setShowMeetingModal(false)} className="w-8 h-8 rounded-full bg-black/[0.03] hover:bg-black/[0.08] flex items-center justify-center text-slate-dark/50 hover:text-slate-dark transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex gap-1 bg-black/[0.03] border border-black/[0.04] rounded-xl p-1 mb-8">
                {([["bot", "🤖 Bot"], ["transcript", "📝 Text"], ["audio", "🎙️ Audio"]] as [MeetingModalTab, string][]).map(([tab, label]) => (
                  <button key={tab} onClick={() => setMeetingTab(tab)}
                    className={`relative flex-1 font-anthropic-sans text-[13px] font-medium py-2 rounded-lg transition-colors ${meetingTab === tab ? "text-slate-dark" : "text-slate-dark/50 hover:text-slate-dark"}`}>
                    {meetingTab === tab && (
                      <motion.div
                        layoutId="modal-tab"
                        className="absolute inset-0 bg-white shadow-sm border border-black/[0.04] rounded-lg"
                        transition={springCalm}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {meetingTab === "bot" && (
                  <motion.form key="bot" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleDeployBot} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Meeting URL *</label>
                      <input required type="url" placeholder="https://zoom.us/j/..." value={botUrl} onChange={e => setBotUrl(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Customer *</label>
                      <select required value={botCustomer} onChange={e => setBotCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    {botMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/80">{botMsg}</p>}
                    <button type="button" disabled className="w-full mt-2 font-anthropic-sans font-medium text-[13px] bg-slate-dark text-white px-6 py-3 rounded-xl opacity-50 cursor-not-allowed">
                      Bot Deployment (Coming Soon)
                    </button>
                  </motion.form>
                )}

                {meetingTab === "transcript" && (
                  <motion.form key="transcript" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleTranscript} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Customer *</label>
                      <select required value={transcriptCustomer} onChange={e => setTranscriptCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Raw Transcript *</label>
                      <textarea required rows={5} placeholder="Paste your meeting transcript here…" value={transcript} onChange={e => setTranscript(e.target.value)}
                        className="w-full bg-black/[0.02] border border-black/[0.06] text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:bg-white focus:border-clay/50 focus:ring-4 focus:ring-clay/10 transition-all placeholder:text-slate-dark/30 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                    </div>
                    {transcriptMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/80">{transcriptMsg}</p>}
                    <button type="submit" disabled={transcriptLoading} className="w-full mt-2 font-anthropic-sans font-medium text-[13px] bg-slate-dark text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-50">
                      {transcriptLoading ? "Analysing…" : "Analyse Transcript"}
                    </button>
                  </motion.form>
                )}

                {meetingTab === "audio" && (
                  <motion.form key="audio" variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={easeSoft} onSubmit={handleAudio} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Customer *</label>
                      <select required value={audioCustomer} onChange={e => setAudioCustomer(e.target.value)} className={selectCls}>
                        <option value="">Select customer…</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/50">Audio File *</label>
                      <input ref={audioRef} type="file" accept=".mp3,.wav,.m4a,.ogg" onChange={e => setAudioFile(e.target.files?.[0] || null)}
                        className="w-full font-anthropic-sans text-[13px] text-slate-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-black/[0.04] hover:file:bg-black/[0.08] file:text-slate-dark file:cursor-pointer file:transition-colors cursor-pointer border border-black/[0.06] rounded-xl bg-black/[0.02] p-1.5" />
                    </div>
                    {audioMsg && <p className="font-anthropic-sans text-[13px] text-slate-dark/80">{audioMsg}</p>}
                    <button type="submit" disabled={audioLoading} className="w-full mt-2 font-anthropic-sans font-medium text-[13px] bg-slate-dark text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-50">
                      {audioLoading ? "Uploading…" : "Upload & Analyse"}
                    </button>
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
