"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  status: string;
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
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
        // Fetch meetings and customers list in parallel
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
        
        // Find the specific customer
        const foundCustomer = customersData.find(c => c.id === parseInt(customerId));
        if (foundCustomer) {
          setCustomer(foundCustomer);
        }

        setMeetings(meetingsData);
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
      <div className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading customer profile…</p>
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
    <div className="max-w-[1280px] mx-auto">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 font-anthropic-sans text-[13px] text-slate-dark/50 hover:text-slate-dark transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Customers
      </button>

      {/* Header */}
      <div className="mb-16 border-b border-stone/50 pb-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-3 flex items-center gap-2">
              Customer Profile
              {customer?.status && (
                <>
                  <span>·</span>
                  <span className={`${
                    customer.status === "Active" ? "text-green-700" :
                    customer.status === "Closed" ? "text-slate-dark/50" :
                    "text-clay-deep"
                  }`}>
                    {customer.status}
                  </span>
                </>
              )}
            </p>
            <h1 className="font-anthropic-serif text-[52px] leading-[1.1] text-slate-dark">
              {customer?.customer_name || "Unknown Customer"}
            </h1>
            
            <div className="font-anthropic-sans text-[14px] text-cloud-medium flex gap-4 mt-6">
              {customer?.industry && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.industry}
                </div>
              )}
              {customer?.website && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {customer.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-anthropic-sans text-[32px] font-medium text-slate-dark leading-none">
              {meetings.length}
            </div>
            <div className="font-anthropic-serif text-[14px] text-cloud-medium mt-2">
              Total Meetings
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div>
        <h2 className="font-anthropic-sans font-semibold text-[18px] text-slate-dark mb-6">
          Meeting History
        </h2>
        
        {meetings.length === 0 ? (
          <div className="text-center py-20 bg-ivory-light border border-stone/50 rounded-[24px]">
            <p className="font-anthropic-serif text-[18px] text-cloud-medium">
              No meetings recorded yet.<br/>Deploy the bot or upload a transcript from the top navigation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/meeting/${m.id}`}
                className="group flex items-center justify-between bg-ivory-light border border-stone/50 rounded-[16px] p-5 hover:border-slate-dark/30 hover:bg-[#f5f4ef] transition-all"
              >
                <div>
                  <h3 className="font-anthropic-sans font-semibold text-[16px] text-slate-dark group-hover:text-clay transition-colors mb-1.5">
                    {m.title || "Untitled Meeting"}
                  </h3>
                  <div className="flex items-center gap-3 font-anthropic-serif text-[14px] text-cloud-medium">
                    <span>{formatDate(m.meeting_date)}</span>
                    <span className="w-1 h-1 bg-stone rounded-full"></span>
                    <span className="flex items-center gap-1.5">
                      {m.status === "completed" || m.status === "Completed" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Completed
                        </>
                      ) : m.status === "recording" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          Recording in progress…
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-clay"></span>
                          {m.status}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="shrink-0 text-slate-dark/30 group-hover:text-clay transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
