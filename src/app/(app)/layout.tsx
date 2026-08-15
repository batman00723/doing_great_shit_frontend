"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
}

const NAV_LINKS = [
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Meetings",
    href: "/dashboard/meetings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Team",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [botMessage, setBotMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    setMounted(true);
    // Restore user from /auth/me on mount
    const restore = async () => {
      const stored = localStorage.getItem("access_token");

      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/me", {
          headers: { Authorization: `Bearer ${stored || "dev"}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (!stored) {
          // No token + backend responded → redirect to login
          router.push("/login");
        } else {
          // Token exists but invalid → redirect to login
          router.push("/login");
        }
      } catch {
        // Backend not reachable → use mock user for UI preview
        setUser({
          user_id: 0,
          salesperson_name: "Dev User",
          email: "dev@smriti.ai",
          role: "Admin",
          organisation: "Smriti (Dev)",
          organisation_id: 0,
        });
      }
    };

    const fetchCustomers = async () => {
      const stored = localStorage.getItem("access_token");
      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/customers/list", {
          headers: { Authorization: `Bearer ${stored || "dev"}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          // Mock customers for UI preview
          setCustomers([{ id: 1, customer_name: "Netflix (Mock)" }, { id: 2, customer_name: "Stripe (Mock)" }]);
        }
      } catch {
        // Backend not reachable — use mock data
        setCustomers([{ id: 1, customer_name: "Netflix (Mock)" }, { id: 2, customer_name: "Stripe (Mock)" }]);
      }
    };

    restore();
    fetchCustomers();
  }, [router]);

  const handleDeployBot = async () => {
    if (!meetingUrl || !selectedCustomer) {
      setBotMessage("Please enter a meeting URL and select a customer.");
      return;
    }
    setBotLoading(true);
    setBotMessage("");
    try {
      const res = await fetch("https://doing-great-shit.onrender.com/api_v1/bot/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meeting_url: meetingUrl, customer_id: parseInt(selectedCustomer) }),
      });
      const data = await res.json();
      if (res.ok) {
        setBotMessage("🚀 Bot deployed!");
        setMeetingUrl("");
        setSelectedCustomer("");
      } else {
        setBotMessage(data?.detail || "Failed to deploy bot.");
      }
    } catch {
      setBotMessage("Could not reach the server.");
    } finally {
      setBotLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-ivory-medium flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 bg-slate-dark flex-col justify-between py-8 px-6">
        {/* Top */}
        <div>
          <Link href="/" className="font-anthropic-sans font-bold text-[12px] uppercase tracking-wider text-white mb-10 block">
            Smriti
          </Link>

          <nav className="flex flex-col gap-1" suppressHydrationWarning>
            {NAV_LINKS.filter(link => {
              if (link.href === "/admin/dashboard") return mounted && user?.role === "Admin";
              return true;
            }).map((link) => {
              const isActive = mounted && pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-anthropic-sans text-[13px] transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                  suppressHydrationWarning
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom — User + Logout */}
        <div className="border-t border-white/10 pt-6">
          {user && (
            <div className="mb-4">
              <p className="font-anthropic-sans text-[12px] text-white font-medium truncate">{user.salesperson_name}</p>
              <p className="font-anthropic-sans text-[11px] text-white/40 truncate">{user.role} · {user.organisation}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="font-anthropic-sans text-[12px] text-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar — Quick Action */}
        <header className="w-full bg-white border-b border-stone/40 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <div ref={dropdownRef} className="flex items-center gap-3 flex-1 max-w-[600px]">
            {/* Customer selector */}
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="font-anthropic-sans text-[13px] text-slate-dark border border-stone rounded-lg px-3 py-2 bg-ivory-medium outline-none focus:border-slate-dark transition-colors min-w-[160px]"
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.customer_name}</option>
              ))}
            </select>

            {/* Zoom link input */}
            <input
              type="url"
              placeholder="Paste Zoom / Meet link…"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="flex-1 font-anthropic-sans text-[13px] text-slate-dark border border-stone rounded-lg px-3 py-2 bg-white outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
            />

            {/* Deploy button */}
            <button
              onClick={handleDeployBot}
              disabled={botLoading}
              className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-4 py-2 rounded-lg hover:bg-black transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {botLoading ? (
                <span>Deploying…</span>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Send Bot</span>
                </>
              )}
            </button>
          </div>

          {/* Bot feedback */}
          {botMessage && (
            <p className="font-anthropic-sans text-[12px] text-slate-dark/60 ml-2">{botMessage}</p>
          )}

          {/* Right side — user pill */}
          {user && (
            <div className="ml-auto font-anthropic-sans text-[12px] text-slate-dark/50">
              {user.salesperson_name}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
