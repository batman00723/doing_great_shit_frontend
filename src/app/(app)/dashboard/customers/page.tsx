"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE}/customers/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          setError("Failed to load customers.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading customers…</p>
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
      <div className="mb-12">
        <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-3">
          Directory
        </p>
        <h1 className="font-anthropic-serif text-[52px] leading-[1.1] text-slate-dark">
          Customers
        </h1>
        <p className="font-anthropic-serif text-[20px] text-slate-dark/60 mt-4 max-w-[600px] leading-relaxed">
          Manage your accounts and review their meeting history. 
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-24 bg-ivory-light border border-stone/50 rounded-[24px]">
          <p className="font-anthropic-serif text-[20px] text-cloud-medium">
            No customers found. Add one from the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <Link 
              key={c.id} 
              href={`/dashboard/customers/${c.id}`}
              className="group bg-ivory-light border border-stone/50 rounded-[24px] p-6 hover:border-slate-dark/30 hover:bg-[#f5f4ef] transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <span className={`font-anthropic-sans text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm ${
                  c.status === "Active" ? "bg-green-100 text-green-800" :
                  c.status === "Closed" ? "bg-stone/50 text-slate-dark/60" :
                  "bg-manilla text-clay-deep" // Lead
                }`}>
                  {c.status || "Lead"}
                </span>
              </div>
              
              <h2 className="font-anthropic-sans font-semibold text-[24px] text-slate-dark leading-tight mb-2">
                {c.customer_name}
              </h2>
              
              <div className="font-anthropic-serif text-[16px] text-cloud-medium flex flex-col gap-1 mb-8">
                <p>{c.industry || "No industry specified"}</p>
                {c.website && <p className="truncate">{c.website}</p>}
              </div>

              <div className="mt-auto pt-4 border-t border-stone/50 flex items-center justify-between text-slate-dark group-hover:text-clay transition-colors">
                <span className="font-anthropic-sans font-medium text-[13px]">
                  View meetings
                </span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
