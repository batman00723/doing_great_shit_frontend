"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { VHSTape } from "@/components/dashboard/VHSBox";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface Meeting {
  meeting_id: number;
  title: string;
  meeting_date: string;
  status: string;
  customer: {
    id: number;
    customer_name: string;
    industry: string;
    status: string;
  };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AllMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      try {
        const res = await fetch(`${BASE}/analyse/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setMeetings(data);
          setFilteredMeetings(data);
        } else {
          setError(data?.detail || "Failed to load meetings.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMeetings(meetings);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredMeetings(
        meetings.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.customer.customer_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, meetings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400 animate-pulse">Loading Archive...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-anthropic-sans text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1080px] mx-auto">
      {/* HEADER */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-anthropic-mono text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4"
          >
            Archive
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-anthropic-serif text-5xl md:text-7xl tracking-tight leading-[0.95]"
          >
            Meetings
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center gap-6"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-transparent border-b border-slate-300 pb-2 font-anthropic-sans text-sm text-slate-900 outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400"
          />
          <Link
            href="/dashboard"
            className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Dashboard
          </Link>
        </motion.div>
      </header>

      {/* STACKED VHS TAPES */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="flex flex-col gap-6"
      >
        <AnimatePresence>
          {filteredMeetings.map((m, i) => (
            <motion.div
              key={m.meeting_id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/dashboard/meeting/${m.meeting_id}`} className="block">
                <VHSTape
                  title={m.title || "Untitled Meeting"}
                  date={formatDate(m.meeting_date)}
                  customer={m.customer.customer_name}
                  index={i}
                />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredMeetings.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="font-anthropic-sans text-slate-400">No meetings found.</p>
        </div>
      )}
    </div>
  );
}

