"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { VHSTape } from "@/components/dashboard/VHSBox";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface Meeting {
  id: number;
  meeting_id: number;
  title: string;
  meeting_date: string;
  status: string;
  customer?: any; // The backend sometimes nests customer under customer
}

interface Customer {
  id: number;
  customer_name: string;
  industry: string;
  website: string;
  status: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatDate(iso: string) {
  if (!iso) return "Unknown Date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function CustomerMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: customerId } = use(params);
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const [meetingsRes, customersRes] = await Promise.all([
          fetch(`${BASE}/analyse/customer/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE}/customers/list`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!meetingsRes.ok || !customersRes.ok) {
          throw new Error("Failed to load data");
        }

        const meetingsData = await meetingsRes.json();
        const customersData: Customer[] = await customersRes.json();
        
        const foundCustomer = customersData.find(c => c.id === parseInt(customerId));
        if (foundCustomer) {
          setCustomer(foundCustomer);
        }

        // Map the meeting IDs properly
        const mappedMeetings = meetingsData.map((m: any) => ({
          ...m,
          meeting_id: m.meeting_id || m.id, // Handle backend inconsistency
        }));

        setMeetings(mappedMeetings);
      } catch (err) {
        setError("Could not reach the server or data not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <p className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400">Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <p className="font-anthropic-sans text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 bg-transparent">
      <button 
        onClick={() => router.back()}
        className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#1a1a1a] transition-colors mb-16 block"
      >
        [ Return to Directory ]
      </button>

      {/* HEADER PROFILE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-24 flex flex-col items-center text-center"
      >

        <div className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-center gap-3">
          <span>Client Dossier</span>
          <span className="text-slate-300">•</span>
          <span className={`px-2 py-0.5 rounded-sm ${
            customer?.status === "Active" ? "bg-green-100 text-green-800" :
            customer?.status === "Closed" ? "bg-slate-200 text-slate-600" :
            "bg-orange-100 text-orange-800"
          }`}>
            {customer?.status || "Lead"}
          </span>
        </div>

        <h1 className="font-anthropic-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-[#1a1a1a] mb-8">
          {customer?.customer_name || "Unknown Customer"}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 font-anthropic-sans text-sm text-slate-600">
          {customer?.industry && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Industry:</span>
              <span className="text-slate-800 font-medium">{customer.industry}</span>
            </div>
          )}
          {customer?.website && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Website:</span>
              <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="text-slate-800 font-medium hover:underline underline-offset-4">
                {customer.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Recordings:</span>
            <span className="text-slate-800 font-medium">{meetings.length} tapes</span>
          </div>
        </div>
      </motion.div>

      {/* MEETINGS LIST */}
      <div>
        <div className="flex items-center justify-between mb-16 border-b border-slate-200 pb-4">
          <h2 className="font-anthropic-serif text-2xl tracking-tight text-[#1a1a1a]">
            Archive
          </h2>
          <span className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-400">
            Chronological Order
          </span>
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="flex flex-col gap-12"
        >
          <AnimatePresence>
            {meetings.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center justify-center py-24"
              >
                <h3 className="font-anthropic-serif text-3xl text-slate-400 tracking-tight mb-4">Blank Tape</h3>
                <p className="font-anthropic-sans text-slate-500 max-w-sm text-center leading-relaxed">
                  There are no recorded meetings for this client yet. Deploy the bot to your next meeting to populate this archive.
                </p>
              </motion.div>
            ) : (
              meetings.map((m, i) => (
                <motion.div
                  key={m.id || i}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/dashboard/meeting/${m.meeting_id}`} className="block">
                    <VHSTape
                      title={m.title || "Untitled Meeting"}
                      date={formatDate(m.meeting_date)}
                      customer={customer?.customer_name || "Unknown"}
                      index={i}
                    />
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
