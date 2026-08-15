"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading meetings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 inline-block">
        <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-3">
          Activity
        </p>
        <h1 className="font-anthropic-serif text-[52px] leading-[1.1] text-slate-dark">
          All Meetings
        </h1>
        <p className="font-anthropic-serif text-[18px] text-slate-dark/60 mt-4 leading-relaxed">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} across all customers, sorted by most recent.
        </p>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-20 bg-ivory-light border border-stone/50 rounded-[24px]">
          <p className="font-anthropic-serif text-[18px] text-cloud-medium leading-relaxed">
            No meetings recorded yet.<br />Deploy the bot or upload a transcript to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((m) => (
            <Link
              key={m.meeting_id}
              href={`/dashboard/meeting/${m.meeting_id}`}
              className="group bg-ivory-light border border-stone/50 rounded-[16px] p-5 hover:border-slate-dark/30 hover:bg-[#f5f4ef] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5 min-w-0">
                {/* Status dot */}
                <div className={`shrink-0 w-2.5 h-2.5 rounded-full mt-0.5 ${
                  m.status === "completed" ? "bg-green-500" :
                  m.status === "processing" ? "bg-clay animate-pulse" :
                  m.status === "failed" ? "bg-red-400" :
                  "bg-stone"
                }`} />

                <div className="min-w-0">
                  <h3 className="font-anthropic-sans font-semibold text-[15px] text-slate-dark group-hover:text-clay transition-colors truncate mb-1">
                    {m.title || "Untitled Meeting"}
                  </h3>
                  <div className="flex items-center gap-3 font-anthropic-serif text-[13px] text-cloud-medium">
                    <Link
                      href={`/dashboard/customers/${m.customer.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-slate-dark hover:underline transition-colors"
                    >
                      {m.customer.customer_name}
                    </Link>
                    {m.customer.industry && (
                      <>
                        <span className="w-1 h-1 bg-stone rounded-full shrink-0" />
                        <span>{m.customer.industry}</span>
                      </>
                    )}
                    <span className="w-1 h-1 bg-stone rounded-full shrink-0" />
                    <span>{formatDate(m.meeting_date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-4">
                {/* Status label */}
                <span className={`font-anthropic-sans text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
                  m.status === "completed" ? "bg-green-100 text-green-800" :
                  m.status === "processing" ? "bg-manilla text-clay-deep" :
                  m.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-stone/40 text-slate-dark/60"
                }`}>
                  {m.status}
                </span>

                <svg className="w-4 h-4 text-slate-dark/30 group-hover:text-clay transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
